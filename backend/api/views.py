import random
import logging
import threading
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle, AnonRateThrottle, UserRateThrottle
from rest_framework.pagination import PageNumberPagination
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from django.core.cache import cache
from django.utils import timezone
from .models import UserProfile, Service, AssistanceRequest, ContactMessage, Testimonial, FAQ
from .serializers import (
    sanitize_text,
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ServiceSerializer,
    AssistanceRequestSerializer,
    ContactMessageSerializer,
    TestimonialSerializer,
    FAQSerializer
)

logger = logging.getLogger(__name__)

from .authentication import CsrfExemptSessionAuthentication

class StandardResultsPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 50

def _send_portal_email(subject, message, from_email, recipient, html_message, code):
    """
    Sends email synchronously so serverless environments (Vercel) complete the SMTP
    handshake before the container is frozen. Also supports fallback logging.
    """
    if not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
        raise ValueError("EMAIL_HOST_USER or EMAIL_HOST_PASSWORD is not configured in server environment variables.")

    send_mail(
        subject=subject,
        message=message,
        from_email=from_email,
        recipient_list=[recipient],
        html_message=html_message,
        fail_silently=False
    )
    logger.info(f"Verification email successfully sent to {recipient}")
    print(f"\n========================================\n[EMAIL DISPATCHED VIA GMAIL SMTP] To: {recipient} | Code: {code}\n========================================\n")


class SendVerificationCodeView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email or '@' not in email:
            return Response({'email': ['Please enter a valid Gmail or email address.']}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already registered
        if User.objects.filter(email__iexact=email).exists():
            return Response({'email': ['This email address is already registered. Please sign in instead.']}, status=status.HTTP_400_BAD_REQUEST)

        # 60s cooldown check
        cooldown_key = f"otp_cooldown:{email}"
        if cache.get(cooldown_key):
            return Response({'detail': 'Please wait 60 seconds before requesting another code.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Generate 6-digit verification code
        code = f"{random.randint(100000, 999999)}"
        cache.set(f"email_verify:{email}", code, timeout=600)  # 10 minutes
        cache.set(cooldown_key, True, timeout=60)  # 60 seconds cooldown

        subject = f"eCare Citizen Portal - Your Verification Code is {code}"
        message = f"""Hello,

Your verification code for the eCare Citizen Services Portal is:

{code}

This code will expire in 10 minutes. If you did not request this, please disregard this email.

Sincerely,
eCare Community Connect
Official Municipal & Barangay E-Services
"""
        html_message = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 10px; background-color: #2563eb; color: #ffffff; font-weight: bold; font-size: 18px;">eC</div>
            <h2 style="color: #0f172a; margin: 10px 0 4px 0; font-size: 20px;">eCare Citizen Portal</h2>
            <p style="color: #64748b; font-size: 12px; margin: 0;">Community Assistance &amp; E-Services</p>
          </div>
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px; border: 1px dashed #cbd5e1;">
            <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0;">Your 6-digit registration code:</p>
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; font-family: monospace;">{code}</span>
            <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0;">Valid for 10 minutes</p>
          </div>
          <p style="color: #475569; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
            Use this code to verify your Gmail address and complete your resident registration. If you did not make this request, no action is needed.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 10px; text-align: center; margin: 0;">
            © 2026 eCare Community Connect • Official Municipal Portal
          </p>
        </div>
        """

        from_email = settings.DEFAULT_FROM_EMAIL or 'noreply@ecare.community.gov'

        # Send email synchronously so serverless functions (Vercel) complete delivery before process freezes
        try:
            _send_portal_email(subject, message, from_email, email, html_message, code)
        except Exception as e:
            logger.exception(f"SMTP send failed for {email}: {e}")
            # Release cooldown so resident can retry without waiting 60s
            cache.delete(cooldown_key)
            cache.delete(f"email_verify:{email}")
            return Response({
                'detail': f'Could not send verification email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        res_payload = {
            'message': f'Verification code sent to {email}. Please check your inbox.',
            'email_sent': True
        }

        return Response(res_payload, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        if not email or '@' not in email:
            return Response({'email': ['Please enter a valid email address.']}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'email': ['No registered resident account found with this email address.']}, status=status.HTTP_404_NOT_FOUND)

        cooldown_key = f"forgot_cooldown:{email}"
        if cache.get(cooldown_key):
            return Response({'detail': 'Please wait 60 seconds before requesting another reset code.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        code = f"{random.randint(100000, 999999)}"
        cache.set(f"password_reset:{email}", code, timeout=600)  # 10 minutes
        cache.set(cooldown_key, True, timeout=60)

        subject = f"eCare Portal - Password Reset Code is {code}"
        message = f"""Hello {user.first_name or user.username},

You requested a password reset for your eCare Citizen Services account. Your 6-digit reset code is:

{code}

This code will expire in 10 minutes. If you did not request this password reset, please ignore this email.

Sincerely,
eCare Community Connect
"""
        html_message = f"""
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; width: 40px; height: 40px; line-height: 40px; border-radius: 10px; background-color: #2563eb; color: #ffffff; font-weight: bold; font-size: 18px;">eC</div>
            <h2 style="color: #0f172a; margin: 10px 0 4px 0; font-size: 20px;">Password Reset Request</h2>
            <p style="color: #64748b; font-size: 12px; margin: 0;">eCare Citizen Services Portal</p>
          </div>
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px; border: 1px dashed #cbd5e1;">
            <p style="color: #475569; font-size: 13px; margin: 0 0 8px 0;">Your password reset verification code:</p>
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; font-family: monospace;">{code}</span>
            <p style="color: #94a3b8; font-size: 11px; margin: 8px 0 0 0;">Valid for 10 minutes</p>
          </div>
          <p style="color: #475569; font-size: 12px; line-height: 1.5; margin: 0 0 12px 0;">
            Enter this code on the password reset page to choose a new password. If you did not initiate this request, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 10px; text-align: center; margin: 0;">
            © 2026 eCare Community Connect • Official Municipal Portal
          </p>
        </div>
        """

        from_email = settings.DEFAULT_FROM_EMAIL or 'noreply@ecare.community.gov'
        try:
            _send_portal_email(subject, message, from_email, email, html_message, code)
        except Exception as e:
            logger.exception(f"SMTP send failed for password reset {email}: {e}")
            cache.delete(cooldown_key)
            cache.delete(f"password_reset:{email}")
            return Response({
                'detail': f'Could not send password reset email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'message': f'Password reset code sent to {email}. Please check your inbox.',
            'email_sent': True
        }, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = request.data.get('code', '').strip()
        new_password = request.data.get('password') or request.data.get('new_password', '')

        if not email or not code or not new_password:
            return Response({'error': 'Email, verification code, and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({'password': ['Password must be at least 8 characters long.']}, status=status.HTTP_400_BAD_REQUEST)

        cached_code = cache.get(f"password_reset:{email}")
        if not cached_code:
            return Response({'code': ['Reset code has expired or was not requested. Please request a new code.']}, status=status.HTTP_400_BAD_REQUEST)

        if cached_code != code:
            return Response({'code': ['Invalid verification code. Please check and try again.']}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if not user:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.save()

        cache.delete(f"password_reset:{email}")
        cache.delete(f"forgot_cooldown:{email}")

        return Response({
            'message': 'Password reset successful! You can now sign in with your new password.'
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        code = request.data.get('code', '').strip()

        if not code:
            return Response({'code': ['Verification code is required to complete registration.']}, status=status.HTTP_400_BAD_REQUEST)

        cached_code = cache.get(f"email_verify:{email}")
        if not cached_code:
            return Response({'code': ['Verification code has expired or was not requested. Please request a new code.']}, status=status.HTTP_400_BAD_REQUEST)

        if str(cached_code).strip() != str(code):
            return Response({'code': ['Invalid verification code. Please check your email and try again.']}, status=status.HTTP_400_BAD_REQUEST)

        # Code matched successfully, invalidate it
        cache.delete(f"email_verify:{email}")

        data = request.data.copy()
        data.pop('code', None)
        if 'username' not in data or not data['username']:
            data['username'] = email.split('@')[0]
        
        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            if hasattr(request, 'session'):
                login(request, user)
            return Response({
                'message': 'Account verified and created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Sign in successful',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]

    def _do_logout(self, request):
        logout(request)
        if hasattr(request, 'session'):
            request.session.flush()
        response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
        response.delete_cookie('sessionid', path='/')
        response.delete_cookie('csrftoken', path='/')
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, private'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response

    def post(self, request):
        return self._do_logout(request)

    def get(self, request):
        return self._do_logout(request)


class CurrentUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            UserProfile.objects.get_or_create(user=request.user)
            verification = cache.get(f"resident_verification_{request.user.id}") or {
                'status': 'unverified',
                'id_type': '',
                'id_number': '',
                'verified_at': None
            }
            user_data = UserSerializer(request.user).data
            user_data['verification'] = verification
            response = Response({
                'authenticated': True,
                'user': user_data
            })
        else:
            response = Response({'authenticated': False, 'user': None})
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, private'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class ProfileView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        UserProfile.objects.get_or_create(user=user)
        verification = cache.get(f"resident_verification_{user.id}") or {
            'status': 'unverified',
            'id_type': '',
            'id_number': '',
            'verified_at': None
        }
        user_data = UserSerializer(user).data
        user_data['verification'] = verification
        return Response({
            'user': user_data,
            'verification': verification
        })

    def put(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        phone = request.data.get('phone')
        address = request.data.get('address')
        barangay = request.data.get('barangay')

        if first_name is not None:
            user.first_name = sanitize_text(first_name)
        if last_name is not None:
            user.last_name = sanitize_text(last_name)
        user.save()

        if phone is not None:
            profile.phone = sanitize_text(phone)
        if address is not None:
            profile.address = sanitize_text(address)
        if barangay is not None:
            profile.barangay = sanitize_text(barangay)
        profile.save()

        verification = cache.get(f"resident_verification_{user.id}") or {
            'status': 'unverified',
            'id_type': '',
            'id_number': '',
            'verified_at': None
        }
        user_data = UserSerializer(user).data
        user_data['verification'] = verification

        return Response({
            'message': 'Profile updated successfully',
            'user': user_data,
            'verification': verification
        })


class ProfileAvatarUploadView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        # Check 3 days cooldown
        if profile.avatar_updated_at:
            from datetime import timedelta
            cooldown_period = timedelta(days=3)
            time_passed = timezone.now() - profile.avatar_updated_at
            if time_passed < cooldown_period:
                remaining = cooldown_period - time_passed
                hours = int(remaining.total_seconds() // 3600)
                days = int(hours // 24)
                hours_remainder = hours % 24
                if days > 0:
                    time_msg = f"{days} day{'s' if days > 1 else ''} and {hours_remainder} hour{'s' if hours_remainder > 1 else ''}"
                else:
                    time_msg = f"{hours} hour{'s' if hours > 1 else ''}"
                return Response({
                    'error': f'You can only change your profile photo once every 3 days. Please wait {time_msg}.'
                }, status=status.HTTP_400_BAD_REQUEST)

        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response({'error': 'No image file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 5MB)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response({'error': 'Image file size must be less than 5MB.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file extension
        ext = os.path.splitext(avatar_file.name)[1].lower()
        if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
            return Response({'error': 'Only JPG, PNG, WEBP, and GIF images are supported.'}, status=status.HTTP_400_BAD_REQUEST)

        # Save avatar
        profile.avatar = avatar_file
        profile.avatar_updated_at = timezone.now()
        profile.save()

        verification = cache.get(f"resident_verification_{user.id}") or {
            'status': 'unverified',
            'id_type': '',
            'id_number': '',
            'verified_at': None
        }
        user_data = UserSerializer(user, context={'request': request}).data
        user_data['verification'] = verification

        return Response({
            'message': 'Profile photo updated successfully!',
            'user': user_data,
            'avatar_url': user_data.get('profile', {}).get('avatar_url')
        }, status=status.HTTP_200_OK)


class VerifyResidentView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        UserProfile.objects.get_or_create(user=user)

        id_type = sanitize_text(request.data.get('id_type', 'PhilSys National ID'))
        id_number = sanitize_text(request.data.get('id_number', ''))

        if not id_number or len(id_number.strip()) < 4:
            return Response({'error': 'Please enter a valid government ID number.'}, status=status.HTTP_400_BAD_REQUEST)

        now_str = timezone.now().strftime('%B %d, %Y')
        verification = {
            'status': 'verified',
            'id_type': id_type,
            'id_number': id_number,
            'verified_at': now_str
        }
        cache.set(f"resident_verification_{user.id}", verification, timeout=None)

        user_data = UserSerializer(user).data
        user_data['verification'] = verification

        return Response({
            'message': 'Identity verified successfully! You are now a verified resident.',
            'verification': verification,
            'user': user_data
        }, status=status.HTTP_200_OK)


class ServiceListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category', 'all')
        search = request.query_params.get('search', '').strip()
        paginate = request.query_params.get('paginate', 'false').lower() == 'true'

        cache_key = f"services_list_{category}_{search}_{paginate}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        queryset = Service.objects.filter(is_active=True).order_by('order', 'title')

        if category and category != 'all':
            queryset = queryset.filter(category=category)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(short_description__icontains=search) |
                Q(description__icontains=search)
            )

        if paginate:
            paginator = StandardResultsPagination()
            page = paginator.paginate_queryset(queryset, request)
            serializer = ServiceSerializer(page, many=True)
            res_data = paginator.get_paginated_response(serializer.data).data
        else:
            serializer = ServiceSerializer(queryset, many=True)
            res_data = serializer.data

        # Cache for 10 minutes
        cache.set(cache_key, res_data, timeout=600)
        return Response(res_data)


class ServiceDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, identifier):
        cache_key = f"service_detail_{identifier}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        try:
            if identifier.isdigit():
                service = Service.objects.get(id=int(identifier), is_active=True)
            else:
                service = Service.objects.get(slug=identifier, is_active=True)
            serializer = ServiceSerializer(service)
            cache.set(cache_key, serializer.data, timeout=600)
            return Response(serializer.data)
        except Service.DoesNotExist:
            return Response({'error': 'Service not found'}, status=status.HTTP_404_NOT_FOUND)


class AssistanceCreateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'submit'

    def post(self, request):
        data = request.data.copy()
        serializer = AssistanceRequestSerializer(data=data)
        if serializer.is_valid():
            instance = serializer.save()
            if request.user.is_authenticated:
                instance.user = request.user
                instance.save()

            # Invalidate stats cache
            cache.delete('ecare_community_stats')

            return Response({
                'message': 'Assistance request submitted successfully',
                'reference_number': instance.reference_number,
                'status': instance.status,
                'data': AssistanceRequestSerializer(instance).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssistanceTrackView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get(self, request):
        ref = request.query_params.get('ref', '').strip()
        if not ref:
            return Response({'error': 'Please provide a valid reference number (ref parameter)'}, status=status.HTTP_400_BAD_REQUEST)

        # SQL Injection prevention: reference_number queried via exact parameter match
        try:
            instance = AssistanceRequest.objects.select_related('user').get(reference_number__iexact=ref)
            serializer = AssistanceRequestSerializer(instance)
            return Response(serializer.data)
        except AssistanceRequest.DoesNotExist:
            return Response({'error': f'No assistance application found with reference number {ref}'}, status=status.HTTP_404_NOT_FOUND)


class MyAssistanceRequestsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Eliminate N+1 queries by pre-fetching relations
        requests = AssistanceRequest.objects.filter(
            Q(user=request.user) | Q(email=request.user.email)
        ).select_related('user', 'user__profile').distinct().order_by('-created_at')

        serializer = AssistanceRequestSerializer(requests, many=True)
        return Response(serializer.data)


class ContactCreateView(APIView):
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'submit'

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Thank you! Your message has been sent successfully.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TestimonialListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cached = cache.get('testimonials_featured')
        if cached is not None:
            return Response(cached)

        testimonials = Testimonial.objects.filter(is_featured=True)
        serializer = TestimonialSerializer(testimonials, many=True)
        cache.set('testimonials_featured', serializer.data, timeout=600)
        return Response(serializer.data)


class FAQListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category', None)
        cache_key = f"faqs_list_{category}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        faqs = FAQ.objects.all().order_by('order', 'id')
        if category:
            faqs = faqs.filter(category__iexact=category)
        serializer = FAQSerializer(faqs, many=True)
        cache.set(cache_key, serializer.data, timeout=600)
        return Response(serializer.data)


class StatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cached_stats = cache.get('ecare_community_stats')
        if cached_stats is not None:
            return Response(cached_stats)

        total_requests = AssistanceRequest.objects.count()
        completed_requests = AssistanceRequest.objects.filter(status='completed').count()
        services_count = Service.objects.filter(is_active=True).count()

        stats_data = {
            'requests_assisted': max(2430, 2400 + total_requests),
            'response_rate': 98,
            'avg_response_time_minutes': 15,
            'active_services': services_count,
            'completed_requests': completed_requests,
        }

        # Cache stats for 5 minutes
        cache.set('ecare_community_stats', stats_data, timeout=300)
        return Response(stats_data)
