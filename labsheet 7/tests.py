from django.test import TestCase
from django.urls import reverse


class DashboardViewTests(TestCase):
	def test_dashboard_renders_both_collections(self):
		response = self.client.get(reverse('fruits:dashboard'))

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'Apple')
		self.assertContains(response, 'Aarav Mehta')

	def test_search_filters_both_collections(self):
		response = self.client.get(reverse('fruits:dashboard'), {'q': 'mango'})

		self.assertContains(response, 'Mango')
		self.assertNotContains(response, 'Apple')
		self.assertContains(response, 'No selected students found')

	def test_student_sorting_uses_requested_field(self):
		response = self.client.get(reverse('fruits:dashboard'), {'sort': 'year'})
		names = [student['name'] for student in response.context['students']]

		self.assertEqual(names, ['Kabir Rao', 'Rohan Das', 'Aarav Mehta', 'Diya Sharma', 'Meera Iyer'])

	def test_unknown_sort_falls_back_to_name(self):
		response = self.client.get(reverse('fruits:dashboard'), {'sort': 'not-a-field'})

		self.assertEqual(response.context['sort_label'], 'Name')
		self.assertEqual(response.context['students'][0]['name'], 'Aarav Mehta')
