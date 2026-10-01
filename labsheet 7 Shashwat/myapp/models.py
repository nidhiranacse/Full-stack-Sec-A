from django.db import models


class Fruit(models.Model):
    """Model representing a fruit (Task 7.1 - unordered list)."""
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=50)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Student(models.Model):
    """Model representing a selected event student (Task 7.1 - ordered list)."""
    name = models.CharField(max_length=100)
    event = models.CharField(max_length=100)
    roll_number = models.IntegerField(unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['roll_number']
