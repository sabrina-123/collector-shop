import uuid

from django.db import models

from orders.models import Order


class Payment(models.Model):

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        SUCCEEDED = 'SUCCEEDED', 'Réussi'
        FAILED = 'FAILED', 'Échoué'

    order = models.OneToOneField(
        Order,
        on_delete=models.PROTECT,
        related_name='payment',
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    reference = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f'Paiement {self.reference} '
            f'- commande #{self.order_id}'
        )