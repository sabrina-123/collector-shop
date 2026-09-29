from django.db import transaction
from django.db.models import Q

from rest_framework import viewsets
from rest_framework.exceptions import ValidationError

from catalog.models import Product

from .models import Order
from .permissions import OrderPermission
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):

    serializer_class = OrderSerializer

    permission_classes = [
        OrderPermission,
    ]

    http_method_names = [
        'get',
        'post',
        'head',
        'options',
    ]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            return (
                Order.objects
                .select_related(
                    'buyer',
                    'product',
                    'product__seller',
                )
                .all()
                .order_by('-created_at')
            )

        return (
            Order.objects
            .select_related(
                'buyer',
                'product',
                'product__seller',
            )
            .filter(
                Q(buyer=user)
                |
                Q(product__seller=user)
            )
            .distinct()
            .order_by('-created_at')
        )

    def perform_create(self, serializer):

        user = self.request.user

        product_id = (
            serializer.validated_data[
                'product'
            ].id
        )

        with transaction.atomic():

            try:
                product = (
                    Product.objects
                    .select_for_update()
                    .get(id=product_id)
                )

            except Product.DoesNotExist:
                raise ValidationError({
                    'product':
                        'Produit introuvable.'
                })

            # Impossible d'acheter son propre produit
            if product.seller_id == user.id:
                raise ValidationError({
                    'product':
                        'Vous ne pouvez pas acheter votre propre produit.'
                })

            # Le produit doit être approuvé
            if (
                product.moderation_status
                !=
                Product.ModerationStatus.APPROVED
            ):
                raise ValidationError({
                    'product':
                        'Ce produit n’est pas autorisé à la vente.'
                })

            # Le produit doit être disponible
            if not product.is_available:
                raise ValidationError({
                    'product':
                        'Ce produit n’est plus disponible.'
                })

            # Création de la commande
            # Le prix vient du backend, jamais du frontend
            serializer.save(
                buyer=user,
                product=product,
                unit_price=product.price,
            )

            # L'objet devient indisponible
            product.is_available = False

            product.save(
                update_fields=[
                    'is_available',
                ]
            )