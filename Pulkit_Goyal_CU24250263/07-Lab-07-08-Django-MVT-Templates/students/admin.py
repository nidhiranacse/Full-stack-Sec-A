from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('roll_number', 'full_name', 'cuid', 'section', 'department', 'gpa', 'email')
    list_filter = ('section', 'department')
    search_fields = ('first_name', 'last_name', 'cuid', 'email')
    ordering = ('roll_number',)
