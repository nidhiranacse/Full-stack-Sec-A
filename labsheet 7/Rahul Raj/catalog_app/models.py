from django.db import models

class Fruit(models.Model):
    """Model mapping item collections out to unordered item matrices."""
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, default='Citrus')
    origin = models.CharField(max_length=100, default='Domestic')
    color = models.CharField(max_length=50, default='#f59e0b')
    in_stock = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class EventStudent(models.Model):
    """Model representing ordered indices of Selected Event Students."""
    rank = models.PositiveIntegerField(default=1)
    name = models.CharField(max_length=120)
    roll_no = models.CharField(max_length=50, unique=True)
    event_category = models.CharField(max_length=120)
    score = models.FloatField(default=0.0)

    class Meta:
        ordering = ['rank']

    def __str__(self):
        return f"{self.rank}. {self.name} ({self.roll_no})"
