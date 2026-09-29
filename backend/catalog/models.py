from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator


class Category(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    def __str__(self):
        return self.name


class Product(models.Model):

    class ModerationStatus(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        APPROVED = 'APPROVED', 'Approuvé'
        REJECTED = 'REJECTED', 'Refusé'

    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='products',
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='products',
    )

    title = models.CharField(
        max_length=200,
    )

    description = models.TextField()

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    image = models.FileField(
        upload_to='products/',
        blank=True,
        null=True,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['jpg', 'jpeg', 'png', 'webp'],
            ),
        ],
    )

    is_available = models.BooleanField(
        default=True,
    )

    moderation_status = models.CharField(
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.PENDING,
    )

    moderation_comment = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.title


class ProductPriceHistory(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='price_history',
    )

    old_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    new_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    changed_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='product_price_changes',
    )

    changed_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f'{self.product.title}: '
            f'{self.old_price} -> {self.new_price}'
        )


class ProductInterest(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='product_interests',
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='interested_users',
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'user',
                    'product',
                ],
                name='unique_product_interest',
            ),
        ]

    def __str__(self):
        return f'{self.user.username} -> {self.product.title}'