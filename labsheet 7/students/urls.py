from django.urls import path
from . import views

urlpatterns = [
    path("", views.fruits_view, name="fruits"),
    path("students/", views.students_view, name="students"),
]