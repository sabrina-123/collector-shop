from django.db import transaction

from rest_framework import (
    status,
    viewsets,
)

from rest_framework.decorators import action

from rest_framework.exceptions import (
    PermissionDenied,
    ValidationError,
)

from rest_framework.response import Response

from orders.models import Order

from .models import Payment
from .permissions import PaymentPermission
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = PaymentSerializer

    permission_classes = [
        PaymentPermission,
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Payment.objects
            .select_related(
                'order',
                'order__buyer',
                'order__product',
            )
            .all()
        )

        if user.is_staff:
            return queryset

        return queryset.filter(
            order__buyer=user
        )

    @action(
        detail=False,
        methods=['post'],
        url_path='simulate',
    )
    def simulate(self, request):

        order_id = request.data.get('order')

        simulation_result = request.data.get(
            'result',
            'success',
        )

        if not order_id:
            raise ValidationError({
                'order':
                    'La commande est obligatoire.'
            })

        if simulation_result not in [
            'success',
            'failure',
        ]:
            raise ValidationError({
                'result':
                    'Valeur attendue : success ou failure.'
            })

        with transaction.atomic():

            try:
                order = (
                    Order.objects
                    .select_for_update()
                    .select_related(
                        'buyer',
                        'product',
                    )
                    .get(id=order_id)
                )

            except Order.DoesNotExist:
                raise ValidationError({
                    'order':
                        'Commande introuvable.'
                })

            if order.buyer_id != request.user.id:
                raise PermissionDenied(
                    'Cette commande ne vous appartient pas.'
                )

            if order.status == Order.Status.CANCELLED:
                raise ValidationError({
                    'order':
                        'Cette commande est annulée.'
                })

            existing_payment = (
                Payment.objects
                .select_for_update()
                .filter(order=order)
                .first()
            )

            if existing_payment:

                if (
                    existing_payment.status
                    ==
                    Payment.Status.SUCCEEDED
                ):
                    return Response(
                        PaymentSerializer(
                            existing_payment
                        ).data,
                        status=status.HTTP_200_OK,
                    )

                payment = existing_payment

            else:

                payment = Payment.objects.create(
                    order=order,
                    amount=order.unit_price,
                )

            if simulation_result == 'failure':

                payment.status = Payment.Status.FAILED

                payment.save(
                    update_fields=[
                        'status',
                        'updated_at',
                    ]
                )

                return Response(
                    PaymentSerializer(payment).data,
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payment.status = Payment.Status.SUCCEEDED

            payment.save(
                update_fields=[
                    'status',
                    'updated_at',
                ]
            )

            order.status = Order.Status.PAID

            order.save(
                update_fields=[
                    'status',
                    'updated_at',
                ]
            )

            return Response(
                PaymentSerializer(payment).data,
                status=status.HTTP_200_OK,
            )