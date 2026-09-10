from django.contrib import admin
from django.urls import path
from students import views

urlpatterns = [
    path("admin/", admin.site.urls),

    # Lab 7.1
    path("", views.home, name="home"),

    # Lab 7.2
    path("students/", views.student_list, name="student_list"),

    # Lab 7.3
    path("search/", views.student_search, name="student_search"),

    # Lab 8
    path("about/", views.about, name="about"),
    path("contact/", views.contact, name="contact"),
]