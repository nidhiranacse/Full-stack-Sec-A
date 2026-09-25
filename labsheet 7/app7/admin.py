from django.contrib import admin

from .models import Fruit, Student


@admin.register(Fruit)
class FruitAdmin(admin.ModelAdmin):

    list_display = [
        'name',
        'colour',
        'is_available',
    ]


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):

    list_display = [
        'position',
        'name',
        'event',
    ]

    ordering = [
        'position'
    ]