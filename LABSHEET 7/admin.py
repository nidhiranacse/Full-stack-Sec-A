from django.contrib import admin

from .models import EventStudent, Fruit


@admin.register(Fruit)
class FruitAdmin(admin.ModelAdmin):
    list_display = ("name", "color", "season")
    search_fields = ("name", "color", "season")


@admin.register(EventStudent)
class EventStudentAdmin(admin.ModelAdmin):
    list_display = ("name", "event", "roll_number")
    search_fields = ("name", "event", "roll_number")