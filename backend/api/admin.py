from django.contrib import admin
from .models import UserProfile, Service, AssistanceRequest, ContactMessage, Testimonial, FAQ

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'barangay', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone')

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'fee', 'processing_time', 'rating', 'is_active', 'order')
    list_filter = ('category', 'is_active')
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(AssistanceRequest)
class AssistanceRequestAdmin(admin.ModelAdmin):
    list_display = ('reference_number', 'first_name', 'last_name', 'assistance_type', 'urgency', 'status', 'created_at')
    list_filter = ('status', 'assistance_type', 'urgency')
    search_fields = ('reference_number', 'first_name', 'last_name', 'email', 'phone')
    readonly_fields = ('reference_number', 'created_at', 'updated_at')

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'is_resolved', 'created_at')
    list_filter = ('is_resolved', 'created_at')
    search_fields = ('name', 'email', 'message')

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'rating', 'is_featured')
    list_filter = ('is_featured', 'rating')

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'order')
    list_filter = ('category',)
    search_fields = ('question', 'answer')
