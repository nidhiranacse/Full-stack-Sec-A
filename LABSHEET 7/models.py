from django.db import models


class Fruit(models.Model):
    name = models.CharField(max_length=80)
    color = models.CharField(max_length=40)
    season = models.CharField(max_length=40)

    class Meta:
        verbose_name_plural = "fruits"

    def __str__(self):
        return self.name


class EventStudent(models.Model):
    name = models.CharField(max_length=100)
    event = models.CharField(max_length=120)
    roll_number = models.CharField(max_length=30, unique=True)

    class Meta:
        ordering = ["name", "pk"]
        verbose_name = "selected event student"
        verbose_name_plural = "selected event students"

    def __str__(self):
        return f"{self.name} - {self.event}"