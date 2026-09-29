from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from rest_framework import (
    status,
    viewsets,
)

from rest_framework.exceptions import (
    PermissionDenied,
    ValidationError,
)

from rest_framework.response import Response

from catalog.models import Product

from .models import (
    Conversation,
    Message,
)

from .permissions import (
    ConversationPermission,
    MessagePermission,
)

from .serializers import (
    ConversationSerializer,
    MessageSerializer,
)


class ConversationViewSet(
    viewsets.ModelViewSet
):

    serializer_class = ConversationSerializer

    permission_classes = [
        ConversationPermission,
    ]

    http_method_names = [
        'get',
        'post',
        'head',
        'options',
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Conversation.objects
            .select_related(
                'product',
                'buyer',
                'seller',
            )
            .prefetch_related(
                'messages',
            )
        )

        if user.is_staff:
            return queryset.order_by(
                '-updated_at'
            )

        return (
            queryset
            .filter(
                Q(buyer=user)
                |
                Q(seller=user)
            )
            .distinct()
            .order_by('-updated_at')
        )

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):

        product_id = request.data.get(
            'product'
        )

        if not product_id:
            raise ValidationError({
                'product':
                    'Le produit est obligatoire.'
            })

        try:
            product = Product.objects.get(
                id=product_id
            )

        except Product.DoesNotExist:
            raise ValidationError({
                'product':
                    'Produit introuvable.'
            })

        if (
            product.seller_id
            ==
            request.user.id
        ):
            raise ValidationError({
                'product':
                    'Vous ne pouvez pas démarrer '
                    'une conversation avec vous-même.'
            })

        if (
            product.moderation_status
            !=
            Product.ModerationStatus.APPROVED
        ):
            raise ValidationError({
                'product':
                    'Ce produit n’est pas accessible.'
            })

        with transaction.atomic():

            conversation, created = (
                Conversation.objects
                .get_or_create(
                    product=product,
                    buyer=request.user,
                    seller=product.seller,
                )
            )

        serializer = self.get_serializer(
            conversation
        )

        return Response(
            serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )


class MessageViewSet(
    viewsets.ModelViewSet
):

    serializer_class = MessageSerializer

    permission_classes = [
        MessagePermission,
    ]

    http_method_names = [
        'get',
        'post',
        'patch',
        'head',
        'options',
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Message.objects
            .select_related(
                'conversation',
                'conversation__buyer',
                'conversation__seller',
                'sender',
            )
        )

        if user.is_staff:
            return queryset.order_by(
                'created_at'
            )

        return (
            queryset
            .filter(
                Q(
                    conversation__buyer=user
                )
                |
                Q(
                    conversation__seller=user
                )
            )
            .distinct()
            .order_by('created_at')
        )

    def perform_create(
        self,
        serializer,
    ):

        conversation = (
            serializer.validated_data[
                'conversation'
            ]
        )

        user = self.request.user

        if (
            not user.is_staff
            and user.id not in [
                conversation.buyer_id,
                conversation.seller_id,
            ]
        ):
            raise PermissionDenied(
                'Vous ne participez pas '
                'à cette conversation.'
            )

        serializer.save(
            sender=user
        )

        Conversation.objects.filter(
            pk=conversation.pk
        ).update(
            updated_at=timezone.now()
        )

    def partial_update(
        self,
        request,
        *args,
        **kwargs,
    ):

        message = self.get_object()

        if (
            message.sender_id
            ==
            request.user.id
        ):
            raise ValidationError({
                'is_read':
                    'Vous ne pouvez pas modifier '
                    'l’état de lecture de votre '
                    'propre message.'
            })

        if set(request.data.keys()) != {
            'is_read'
        }:
            raise ValidationError({
                'detail':
                    'Seul le statut de lecture '
                    'peut être modifié.'
            })

        if request.data.get(
            'is_read'
        ) is not True:
            raise ValidationError({
                'is_read':
                    'La seule valeur autorisée '
                    'est true.'
            })

        message.is_read = True

        message.save(
            update_fields=[
                'is_read',
            ]
        )

        return Response(
            self.get_serializer(
                message
            ).data
        )