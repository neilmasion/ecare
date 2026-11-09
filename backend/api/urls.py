from django.urls import path
from .views import (
    RegisterView,
    SendVerificationCodeView,
    ForgotPasswordView,
    ResetPasswordView,
    LoginView,
    LogoutView,
    CurrentUserView,
    ProfileView,
    ProfileAvatarUploadView,
    VerifyResidentView,
    ServiceListView,
    ServiceDetailView,
    AssistanceCreateView,
    AssistanceTrackView,
    MyAssistanceRequestsView,
    ContactCreateView,
    TestimonialListView,
    FAQListView,
    StatsView
)

urlpatterns = [
    # Auth
    path('auth/send-verification/', SendVerificationCodeView.as_view(), name='send-verification'),
    path('auth/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('auth/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', CurrentUserView.as_view(), name='me'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/profile/avatar/', ProfileAvatarUploadView.as_view(), name='profile-avatar'),
    path('auth/verify-resident/', VerifyResidentView.as_view(), name='verify-resident'),

    # Services
    path('services/', ServiceListView.as_view(), name='service-list'),
    path('services/<str:identifier>/', ServiceDetailView.as_view(), name='service-detail'),

    # Assistance Requests
    path('assistance/', AssistanceCreateView.as_view(), name='assistance-create'),
    path('assistance/track/', AssistanceTrackView.as_view(), name='assistance-track'),
    path('assistance/my-requests/', MyAssistanceRequestsView.as_view(), name='my-assistance'),

    # Contact & Feedback
    path('contact/', ContactCreateView.as_view(), name='contact-create'),

    # Informational
    path('testimonials/', TestimonialListView.as_view(), name='testimonials'),
    path('faqs/', FAQListView.as_view(), name='faqs'),
    path('stats/', StatsView.as_view(), name='stats'),
]
