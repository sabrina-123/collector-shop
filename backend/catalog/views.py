from django.db import transaction
from django.db.models import Q

from rest_framework import (
    status,
    viewsets,
)

from rest_framework.decorators import action

from rest_framework.permissions import (
    AllowAny,
    IsAdminUser,
    IsAuthenticated,
)

from rest_framework.response import Response

from notifications.models import Notification

from .models import (
    Category,
    Product,
    ProductInterest,
    ProductPriceHistory,
)

from .permissions import ProductPermission

from .serializers import (
    CategorySerializer,
    ProductInterestSerializer,
    ProductPriceHistorySerializer,
    ProductSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):

    queryset = Category.objects.all().order_by('name')

    serializer_class = CategorySerializer

    def get_permissions(self):

        if self.action in [
            'list',
            'retrieve',
        ]:

            return [
                AllowAny(),
            ]

        return [
            IsAdminUser(),
        ]


class ProductViewSet(viewsets.ModelViewSet):

    serializer_class = ProductSerializer

    permission_classes = [
        ProductPermission,
    ]

    def get_queryset(self):

        queryset = (
            Product.objects
            .select_related(
                'seller',
                'category',
            )
        )

        user = self.request.user

        # Admin : voit tout.
        if (
            user.is_authenticated
            and user.is_staff
        ):
            return queryset.order_by(
                '-created_at'
            )

        # Utilisateur authentifié :
        # - produits approuvés
        # - ses propres produits,
        #   même en attente/refusés.
        if user.is_authenticated:

            return (
                queryset
                .filter(
                    Q(
                        moderation_status=
                        Product.ModerationStatus.APPROVED
                    )
                    |
                    Q(
                        seller=user
                    )
                )
                .distinct()
                .order_by('-created_at')
            )

        # Visiteur :
        # seulement produits approuvés.
        return (
            queryset
            .filter(
                moderation_status=
                Product.ModerationStatus.APPROVED
            )
            .order_by('-created_at')
        )

    def perform_create(
        self,
        serializer,
    ):

        serializer.save(
            seller=self.request.user,
            moderation_status=
            Product.ModerationStatus.PENDING,
        )

    def perform_update(
        self,
        serializer,
    ):

        with transaction.atomic():

            product = (
                Product.objects
                .select_for_update()
                .get(
                    pk=self.get_object().pk
                )
            )

            old_price = product.price

            updated_product = serializer.save()

            new_price = updated_product.price

            if old_price != new_price:

                ProductPriceHistory.objects.create(
                    product=updated_product,
                    old_price=old_price,
                    new_price=new_price,
                    changed_by=self.request.user,
                )

                interested_users = (
                    ProductInterest.objects
                    .filter(
                        product=updated_product
                    )
                    .exclude(
                        user=self.request.user
                    )
                    .select_related('user')
                )

                notifications = []

                for interest in interested_users:

                    notifications.append(
                        Notification(
                            user=interest.user,
                            notification_type=(
                                Notification.Type.PRICE_CHANGED
                            ),
                            title='Changement de prix',
                            message=(
                                f'Le prix de '
                                f'"{updated_product.title}" '
                                f'est passé de '
                                f'{old_price} € à '
                                f'{new_price} €.'
                            ),
                        )
                    )

                if notifications:

                    Notification.objects.bulk_create(
                        notifications
                    )

    @action(
        detail=True,
        methods=['get'],
        url_path='price-history',
        permission_classes=[
            IsAuthenticated,
        ],
    )
    def price_history(
        self,
        request,
        pk=None,
    ):

        product = self.get_object()

        history = (
            product.price_history
            .all()
            .order_by('-changed_at')
        )

        serializer = (
            ProductPriceHistorySerializer(
                history,
                many=True,
            )
        )

        return Response(
            serializer.data
        )


class ProductInterestViewSet(
    viewsets.ModelViewSet
):

    serializer_class = ProductInterestSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    http_method_names = [
        'get',
        'post',
        'delete',
        'head',
        'options',
    ]

    def get_queryset(self):

        return (
            ProductInterest.objects
            .select_related('product')
            .filter(
                user=self.request.user
            )
            .order_by('-created_at')
        )

    def perform_create(
        self,
        serializer,
    ):

        product = serializer.validated_data[
            'product'
        ]

        # Un vendeur ne suit pas son propre produit.
        if product.seller_id == self.request.user.id:

            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                'product':
                    'Vous ne pouvez pas suivre votre propre produit.'
            })

        # Seul un produit approuvé peut être suivi.
        if (
            product.moderation_status
            !=
            Product.ModerationStatus.APPROVED
        ):

            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                'product':
                    'Ce produit n’est pas disponible au public.'
            })

        serializer.save(
            user=self.request.user
        )