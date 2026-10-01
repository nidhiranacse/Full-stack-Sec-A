from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),               # Task 7.1
    path('sort/', views.students_sorted, name='sort'), # Task 7.2
    path('search/', views.search, name='search'),      # Task 7.3
]
