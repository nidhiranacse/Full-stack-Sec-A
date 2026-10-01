from django.db import migrations


def seed_data(apps, schema_editor):
    Fruit = apps.get_model('myapp', 'Fruit')
    Student = apps.get_model('myapp', 'Student')

    fruits = [
        ('Apple', 'Red'),
        ('Banana', 'Yellow'),
        ('Mango', 'Orange'),
        ('Grape', 'Purple'),
        ('Watermelon', 'Green'),
        ('Kiwi', 'Brown'),
    ]
    for name, color in fruits:
        Fruit.objects.create(name=name, color=color)

    students = [
        ('Aarav Sharma', 'Cricket', 101),
        ('Bhavna Patel', 'Badminton', 102),
        ('Chirag Mehta', 'Basketball', 103),
        ('Divya Rao', 'Athletics', 104),
        ('Eshan Gupta', 'Football', 105),
        ('Fatima Khan', 'Swimming', 106),
        ('Gaurav Singh', 'Tennis', 107),
        ('Harini Nair', 'Volleyball', 108),
    ]
    for name, event, roll in students:
        Student.objects.create(name=name, event=event, roll_number=roll)


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_data),
    ]
