from django.urls import path
from . import views

urlpatterns = [
    path("fruits/", views.fruits, name="fruits"),
    path("students/", views.students, name="students"),
]
