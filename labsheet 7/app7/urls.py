from django.urls import path
from . import views


urlpatterns = [
    path(
        'fruits/',
        views.fruit_list,
        name='fruit_list'
    ),

    path(
        'students/',
        views.student_list,
        name='student_list'
    ),

    path(
        'students/search/',
        views.student_search,
        name='student_search'
    ),
]