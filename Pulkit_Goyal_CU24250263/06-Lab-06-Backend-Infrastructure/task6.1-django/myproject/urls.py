"""
URL configuration for myproject.
Student: Pulkit Goyal (CUID: CU24250263 | Roll: 40 | Section: A)
"""
from django.contrib import admin
from django.urls import path
from django.http import JsonResponse, HttpResponse

def home_view(request):
    """Simple root health and student info response."""
    return JsonResponse({
        "status": "online",
        "message": "Full Stack Development - Django Backend Infrastructure",
        "student": {
            "name": "Pulkit Goyal",
            "cuid": "CU24250263",
            "roll": 40,
            "section": "A"
        },
        "version": "1.0.0"
    })

def health_check(request):
    """Automated health check endpoint for deployment verifier."""
    return HttpResponse("OK - System Healthy", content_type="text/plain")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),
    path('health/', health_check, name='health_check'),
]
