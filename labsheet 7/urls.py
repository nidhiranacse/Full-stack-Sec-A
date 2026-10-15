from django.urls import path

from . import views


app_name = 'fruits'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
]