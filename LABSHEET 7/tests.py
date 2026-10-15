from django.test import TestCase
from django.urls import reverse

from .models import EventStudent, Fruit


class CollectionIndexTests(TestCase):
    def setUp(self):
        Fruit.objects.create(name="Mango", color="Yellow", season="Summer")
        Fruit.objects.create(name="Blueberry", color="Blue", season="Summer")
        EventStudent.objects.create(
            name="Zara Khan", event="Science Fair", roll_number="S-12"
        )
        EventStudent.objects.create(
            name="Aarav Shah", event="Art Day", roll_number="A-04"
        )

    def test_search_filters_both_collections(self):
        response = self.client.get(reverse("collection_index"), {"q": "summer"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            list(response.context["fruits"].values_list("name", flat=True)),
            ["Mango", "Blueberry"],
        )
        self.assertEqual(response.context["students"].count(), 0)

    def test_students_are_sorted_by_requested_field(self):
        response = self.client.get(
            reverse("collection_index"), {"sort": "name", "direction": "desc"}
        )

        self.assertEqual(
            list(response.context["students"].values_list("name", flat=True)),
            ["Zara Khan", "Aarav Shah"],
        )

    def test_collection_counts_use_correct_plural_labels(self):
        response = self.client.get(reverse("collection_index"))

        self.assertContains(response, "2 FRUITS")
        self.assertContains(response, "2 STUDENTS")

    def test_invalid_sort_parameters_fall_back_safely(self):
        response = self.client.get(
            reverse("collection_index"),
            {"sort": "not_a_field", "direction": "sideways"},
        )

        self.assertEqual(response.context["sort_by"], "name")
        self.assertEqual(response.context["direction"], "asc")
        self.assertEqual(response.status_code, 200)

    def test_empty_collections_render_alerts(self):
        Fruit.objects.all().delete()
        EventStudent.objects.all().delete()

        response = self.client.get(reverse("collection_index"))

        self.assertContains(response, "No fruits match this search.")
        self.assertContains(response, "No selected students match this search.")