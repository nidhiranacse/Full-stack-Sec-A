from django.db import models


class Fruit(models.Model):
    """
    Represents an UNORDERED item collection.
    """
    name = models.CharField(max_length=100)
    stock_count = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name


class Student(models.Model):
    """
    Represents the ORDERED Selected Event Students collection.
    """
    name = models.CharField(max_length=100)
    roll_no = models.CharField(max_length=20)
    event_name = models.CharField(max_length=100)
    registration_order = models.PositiveIntegerField(
        help_text="Explicit index used to keep the list ordered"
    )

    class Meta:
        ordering = ["registration_order"]

    def __str__(self):
        return f"{self.registration_order}. {self.name} ({self.event_name})"