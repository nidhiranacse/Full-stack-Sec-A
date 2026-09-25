from django.db import models


class Fruit(models.Model):
    name = models.CharField(max_length=100)
    colour = models.CharField(max_length=50, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Student(models.Model):
    name = models.CharField(max_length=100)
    event = models.CharField(max_length=100)
    position = models.PositiveIntegerField()

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.position}. {self.name} ({self.event})"