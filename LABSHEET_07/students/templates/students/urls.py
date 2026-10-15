from django.urls import path
from . import views

app_name = "students"

urlpatterns = [
    path("fruits/", views.fruit_list, name="fruit_list"),
    path("students/", views.student_list, name="student_list"),
    path("search/", views.search_students, name="search_students"),
]