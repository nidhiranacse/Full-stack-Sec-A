from django.urls import path

from . import views


urlpatterns = [path("", views.collection_index, name="collection_index")]