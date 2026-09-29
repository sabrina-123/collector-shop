from rest_framework import serializers

from .models import Order


class OrderSerializer(serializers.ModelSerializer):

    buyer = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    buyer_username = serializers.CharField(
        source='buyer.username',
        read_only=True,
    )

    seller_username = serializers.CharField(
        source='product.seller.username',
        read_only=True,
    )

    product_title = serializers.CharField(
        source='product.title',
        read_only=True,
    )

    unit_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    status = serializers.CharField(
        read_only=True,
    )

    class Meta:
        model = Order

        fields = [
            'id',

            'buyer',
            'buyer_username',

            'seller_username',

            'product',
            'product_title',

            'unit_price',
            'status',

            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'buyer',
            'unit_price',
            'status',
            'created_at',
            'updated_at',
        ]