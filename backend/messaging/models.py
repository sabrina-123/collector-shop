from django.db import models
from django.contrib.auth.models import User

from catalog.models import Product


class Conversation(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='conversations',
    )

    buyer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='buyer_conversations',
    )

    seller = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='seller_conversations',
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'product',
                    'buyer',
                    'seller',
                ],
                name='unique_product_conversation',
            ),
        ]

    def __str__(self):
        return (
            f'Conversation #{self.id} '
            f'- {self.product.title}'
        )


class Message(models.Model):

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='sent_messages',
    )

    content = models.TextField(
        max_length=1000,
    )

    is_read = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return (
            f'Message #{self.id} '
            f'par {self.sender.username}'
        )