from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):

    class Type(models.TextChoices):
        PRICE_CHANGED = (
            'PRICE_CHANGED',
            'Changement de prix',
        )

        PRODUCT_APPROVED = (
            'PRODUCT_APPROVED',
            'Produit approuvé',
        )

        PRODUCT_REJECTED = (
            'PRODUCT_REJECTED',
            'Produit refusé',
        )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
    )

    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices,
    )

    title = models.CharField(
        max_length=200,
    )

    message = models.CharField(
        max_length=500,
    )

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f'{self.user.username} - {self.title}'