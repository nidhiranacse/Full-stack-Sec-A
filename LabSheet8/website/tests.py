from django.test import TestCase


class WebsiteViewsTests(TestCase):

	def test_main_pages_render(self):
		for url in ('/', '/about/', '/contact/'):
			with self.subTest(url=url):
				response = self.client.get(url)
				self.assertEqual(response.status_code, 200)
				self.assertTemplateUsed(response, 'website/base.html')

	def test_navigation_highlights_current_page(self):
		for url, page in (('/', 'home'), ('/about/', 'about'), ('/contact/', 'contact')):
			with self.subTest(url=url):
				response = self.client.get(url)
				self.assertContains(response, f'class="active"')
				self.assertEqual(response.context['active_page'], page)

	def test_each_page_has_a_notification(self):
		for url in ('/', '/about/'):
			with self.subTest(url=url):
				response = self.client.get(url)
				self.assertContains(response, 'message-box')

	def test_contact_page_uses_child_title(self):
		response = self.client.get('/contact/')

		self.assertContains(response, '<title>Contact Us</title>', html=True)
		self.assertContains(response, 'name="name"')
		self.assertContains(response, 'name="feedback"')

	def test_valid_contact_submission_shows_success_message(self):
		response = self.client.post(
			'/contact/',
			{
				'name': 'Ada Lovelace',
				'feedback': 'The website looks great.',
			},
		)

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'Your feedback has been submitted successfully.')

	def test_incomplete_contact_submission_shows_error_message(self):
		response = self.client.post(
			'/contact/',
			{'name': 'Ada Lovelace', 'feedback': ''},
		)

		self.assertEqual(response.status_code, 200)
		self.assertContains(response, 'Please complete your name and feedback.')
