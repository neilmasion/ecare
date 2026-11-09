from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Configurable admin URL from settings
admin_path = getattr(settings, 'DJANGO_ADMIN_URL', 'admin/')

urlpatterns = [
    path(admin_path, admin.site.urls),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
