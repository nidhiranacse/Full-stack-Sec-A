from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('students/', views.student_list, name='student_list'),
    path('search/', views.search_students, name='search_students'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
]
