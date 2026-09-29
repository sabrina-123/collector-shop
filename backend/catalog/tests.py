from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import Profile

from .models import Category, Product


class CatalogApiTests(APITestCase):

	def setUp(self):
		self.category = Category.objects.create(name='Objets anciens')
		self.seller = User.objects.create_user(
			username='seller',
			password='Strong-password-123',
		)
		Profile.objects.create(user=self.seller, is_seller=True)

	def test_public_catalog_only_returns_approved_products(self):
		Product.objects.create(
			seller=self.seller,
			category=self.category,
			title='Piece approuvee',
			description='Une description suffisamment longue.',
			price='25.00',
			moderation_status=Product.ModerationStatus.APPROVED,
		)
		Product.objects.create(
			seller=self.seller,
			category=self.category,
			title='Piece en attente',
			description='Une description suffisamment longue.',
			price='30.00',
		)

		response = self.client.get('/api/products/')

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 1)
		self.assertEqual(response.data[0]['title'], 'Piece approuvee')

	def test_seller_can_submit_an_image_for_moderation(self):
		self.client.force_authenticate(self.seller)
		image = SimpleUploadedFile(
			'object.webp',
			b'fake-image-content',
			content_type='image/webp',
		)

		response = self.client.post(
			'/api/products/',
			{
				'category': self.category.id,
				'title': 'Nouvel objet ancien',
				'description': 'Une description suffisamment longue.',
				'price': '45.00',
				'image': image,
			},
			format='multipart',
		)

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(response.data['moderation_status'], 'PENDING')
		self.assertTrue(response.data['image'])
