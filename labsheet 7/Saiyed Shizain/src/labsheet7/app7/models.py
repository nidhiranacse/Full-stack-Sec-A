from django.db import models


class Fruit(models.Model):
    """Unordered item matrix entry — no ordering field on purpose."""

    name = models.CharField(max_length=100)
    colour = models.CharField(max_length=50, blank=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Student(models.Model):
    """Ordered index-list entry — position gives the guaranteed order."""

    name = models.CharField(max_length=100)
    event = models.CharField(max_length=100)
    position = models.PositiveIntegerField(
        help_text="Ordered index / rank of the student for the event")

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.position}. {self.name} ({self.event})"
