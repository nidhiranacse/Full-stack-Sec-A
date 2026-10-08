from django.db import models


class Student(models.Model):
    name = models.CharField(max_length=100)
    event = models.CharField(max_length=100)
    email = models.EmailField()
    roll_number = models.IntegerField()

    def __str__(self):
        return self.name