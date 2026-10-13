from django.db import models

class Student(models.Model):
    """
    Student entity for academic directory management.
    Author: Pulkit Goyal (CUID: CU24250263 | Roll: 40 | Section: A)
    """
    first_name = models.CharField(max_length=60)
    last_name = models.CharField(max_length=60)
    cuid = models.CharField(max_length=20, unique=True, help_text="College University ID")
    roll_number = models.PositiveIntegerField(help_text="Class Roll Number")
    section = models.CharField(max_length=5, default="A")
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=100, default="Computer Science & Engineering")
    gpa = models.DecimalField(max_digits=4, decimal_places=2, default=8.50)
    enrollment_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['roll_number', 'last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.cuid} - Roll {self.roll_number})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
