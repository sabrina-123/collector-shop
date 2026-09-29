from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
    )

    # Tout utilisateur peut acheter.
    # Ce booléen indique simplement
    # s'il peut aussi vendre.
    is_seller = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):

        if self.is_seller:
            return f'{self.user.username} - Acheteur / Vendeur'

        return f'{self.user.username} - Acheteur'