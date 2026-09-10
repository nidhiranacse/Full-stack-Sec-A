from django.contrib import admin
from django.urls import path, include
from students import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path("students/", views.student_list, name="student_list"),
    path("search/", views.student_search, name="student_search"),
    
    path("", include("students.urls")),
]
