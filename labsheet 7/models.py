from django.db import models


class Fruit(models.Model):
    name = models.CharField(max_length=100)
    quantity = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class Student(models.Model):
    name = models.CharField(max_length=100)
    event = models.CharField(max_length=100)
    roll_no = models.IntegerField()

    def __str__(self):
        return self.name