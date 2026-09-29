from django.db import models
from django.contrib.auth.models import User

from catalog.models import Product


class Order(models.Model):

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente de paiement'
        PAID = 'PAID', 'Payée'
        CANCELLED = 'CANCELLED', 'Annulée'
        COMPLETED = 'COMPLETED', 'Terminée'

    buyer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='purchases',
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='orders',
    )

    # IMPORTANT :
    # on conserve le prix au moment de l'achat.
    #
    # Si le vendeur change le prix plus tard,
    # la commande reste au prix initial.
    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f'Commande #{self.id} - {self.product.title}'