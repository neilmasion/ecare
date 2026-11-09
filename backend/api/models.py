import os
import uuid
import random
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import FileExtensionValidator
from django.core.exceptions import ValidationError

def generate_reference_number():
    year = timezone.now().year
    random_id = f"{random.randint(1000, 9999)}"
    return f"CC-{year}-{random_id}"

def validate_file_size(file):
    max_size_mb = 5
    if file.size > max_size_mb * 1024 * 1024:
        raise ValidationError(f"Maximum allowed file size is {max_size_mb}MB.")

def secure_document_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    return os.path.join('assistance_docs', timezone.now().strftime('%Y/%m'), safe_filename)

def secure_avatar_upload_path(instance, filename):
    ext = os.path.splitext(filename)[1].lower()
    safe_filename = f"avatar_{instance.user.id}_{uuid.uuid4().hex[:8]}{ext}"
    return os.path.join('avatars', safe_filename)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    barangay = models.CharField(max_length=100, blank=True)
    avatar = models.ImageField(upload_to=secure_avatar_upload_path, blank=True, null=True)
    avatar_updated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Service(models.Model):
    CATEGORY_CHOICES = [
        ('all', 'All Services'),
        ('clearance', 'Clearance & Certificates'),
        ('appointment', 'Appointments & Meetings'),
        ('incident', 'Incident & Reports'),
        ('community', 'Community Programs'),
        ('health', 'Health & Wellness'),
        ('financial', 'Financial & Aid'),
    ]

    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=150, unique=True, db_index=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='clearance', db_index=True)
    short_description = models.TextField()
    description = models.TextField()
    features = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    stats = models.JSONField(default=dict, blank=True)
    fee = models.CharField(max_length=50, default='Free')
    processing_time = models.CharField(max_length=50, default='24-48 hours')
    rating = models.CharField(max_length=20, default='4.9/5')
    image_url = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    order = models.IntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'title']
        indexes = [
            models.Index(fields=['is_active', 'category']),
        ]

    def __str__(self):
        return self.title


class AssistanceRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('reviewing', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'),
    ]

    ASSISTANCE_TYPES = [
        ('medical', 'Medical Assistance'),
        ('financial', 'Financial Assistance'),
        ('educational', 'Educational Support'),
        ('disaster', 'Disaster Relief'),
        ('housing', 'Housing Assistance'),
        ('food', 'Food Assistance'),
        ('legal', 'Legal Aid'),
        ('other', 'Other'),
    ]

    URGENCY_LEVELS = [
        ('emergency', 'Emergency (Immediate attention needed)'),
        ('urgent', 'Urgent (Within 24 hours)'),
        ('high', 'High (Within 3 days)'),
        ('normal', 'Normal (Within a week)'),
    ]

    reference_number = models.CharField(max_length=30, unique=True, db_index=True, default=generate_reference_number)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assistance_requests', db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=30)
    address = models.TextField()
    assistance_type = models.CharField(max_length=50, choices=ASSISTANCE_TYPES, db_index=True)
    urgency = models.CharField(max_length=50, choices=URGENCY_LEVELS, db_index=True)
    description = models.TextField()
    previous_assistance = models.BooleanField(default=False)
    family_members = models.PositiveIntegerField(default=1)
    income = models.CharField(max_length=50, blank=True)
    additional_notes = models.TextField(blank=True)
    documents = models.FileField(
        upload_to=secure_document_upload_path,
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'jpg', 'jpeg', 'png']),
            validate_file_size
        ]
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending', db_index=True)
    admin_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.reference_number} - {self.first_name} {self.last_name} ({self.get_assistance_type_display()})"


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(db_index=True)
    phone = models.CharField(max_length=30, blank=True)
    subject = models.CharField(max_length=150, blank=True)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message from {self.name} ({self.email})"


class Testimonial(models.Model):
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, default='Community Member')
    rating = models.IntegerField(default=5)
    comment = models.TextField()
    avatar = models.CharField(max_length=255, blank=True)
    is_featured = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.rating} stars"


class FAQ(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    category = models.CharField(max_length=50, default='General', db_index=True)
    order = models.IntegerField(default=0, db_index=True)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.question
