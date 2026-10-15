"""
URL Configuration for core project.
"""

from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
import sys
import os

def api_health_check(request):
    """
    Health check API endpoint returning backend diagnostics.
    """
    return JsonResponse({
        "status": "online",
        "service": "Django REST Backend",
        "developer": "Rahul Raj",
        "student_id": "cu24250116",
        "course": "Full Stack Web Development (Sec-A)",
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "environment": "development" if os.environ.get("DEBUG", "True").lower() == "true" else "production"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', api_health_check, name='api_health_check'),
]
