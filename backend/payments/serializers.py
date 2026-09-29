from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):

    order = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    reference = serializers.UUIDField(
        read_only=True,
    )

    status = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = Payment

        fields = [
            'id',
            'order',
            'amount',
            'reference',
            'status',
            'created_at',
            'updated_at',
        ]