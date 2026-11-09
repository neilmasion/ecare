import html
import re
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile, Service, AssistanceRequest, ContactMessage, Testimonial, FAQ

def sanitize_text(text):
    if not isinstance(text, str):
        return text
    # Strip dangerous HTML/scripts and escape
    clean = re.sub(r'<script.*?>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    clean = re.sub(r'<.*?javascript:.*?>', '', clean, flags=re.IGNORECASE)
    return html.escape(clean.strip())

class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    avatar_cooldown_days_left = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ['phone', 'address', 'barangay', 'avatar', 'avatar_url', 'avatar_updated_at', 'avatar_cooldown_days_left']

    def get_avatar_url(self, obj):
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None

    def get_avatar_cooldown_days_left(self, obj):
        if not obj.avatar_updated_at:
            return 0
        from datetime import timedelta
        from django.utils import timezone
        diff = timezone.now() - obj.avatar_updated_at
        cooldown_seconds = 3 * 86400  # 3 days
        if diff.total_seconds() < cooldown_seconds:
            remaining = cooldown_seconds - diff.total_seconds()
            hours_left = int(remaining // 3600)
            return max(1, int(remaining // 86400) if remaining >= 86400 else 1)
        return 0

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
        read_only_fields = ['id', 'username']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=30)
    address = serializers.CharField(required=False, allow_blank=True, max_length=255)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'address']

    def validate_first_name(self, value):
        return sanitize_text(value)

    def validate_last_name(self, value):
        return sanitize_text(value)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("This email address is already registered. Please sign in instead.")
        return email

    def create(self, validated_data):
        phone = sanitize_text(validated_data.pop('phone', ''))
        address = sanitize_text(validated_data.pop('address', ''))
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        UserProfile.objects.create(user=user, phone=phone, address=address)
        return user

class LoginSerializer(serializers.Serializer):
    email_or_username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        identifier = data.get('email_or_username', '').strip()
        password = data.get('password')

        user = None
        if '@' in identifier:
            try:
                user_obj = User.objects.get(email__iexact=identifier)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        
        if not user:
            user = authenticate(username=identifier, password=password)

        if not user:
            raise serializers.ValidationError('Invalid email/username or password.')
        
        if not user.is_active:
            raise serializers.ValidationError('This account has been deactivated.')
        
        data['user'] = user
        return data

class ServiceSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Service
        fields = '__all__'

class AssistanceRequestSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assistance_type_display = serializers.CharField(source='get_assistance_type_display', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_display', read_only=True)

    class Meta:
        model = AssistanceRequest
        fields = [
            'id', 'reference_number', 'first_name', 'last_name', 'email', 'phone',
            'address', 'assistance_type', 'urgency', 'description', 'previous_assistance',
            'family_members', 'income', 'additional_notes', 'documents', 'status',
            'status_display', 'assistance_type_display', 'urgency_display',
            'admin_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reference_number', 'status', 'admin_notes', 'created_at', 'updated_at']

    def validate_first_name(self, value):
        return sanitize_text(value)

    def validate_last_name(self, value):
        return sanitize_text(value)

    def validate_description(self, value):
        return sanitize_text(value)

    def validate_address(self, value):
        return sanitize_text(value)

    def validate_additional_notes(self, value):
        return sanitize_text(value)

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        return sanitize_text(value)

    def validate_subject(self, value):
        return sanitize_text(value)

    def validate_message(self, value):
        return sanitize_text(value)

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'

class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = '__all__'
