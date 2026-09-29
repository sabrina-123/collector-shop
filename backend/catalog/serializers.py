from rest_framework import serializers

from .models import (
    Category,
    Product,
    ProductInterest,
    ProductPriceHistory,
)


class CategorySerializer(serializers.ModelSerializer):

    class Meta:

        model = Category

        fields = [
            'id',
            'name',
        ]


class ProductSerializer(serializers.ModelSerializer):

    seller = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    seller_username = serializers.CharField(
        source='seller.username',
        read_only=True,
    )

    category_name = serializers.CharField(
        source='category.name',
        read_only=True,
    )

    moderation_status = serializers.CharField(
        read_only=True,
    )

    moderation_comment = serializers.CharField(
        read_only=True,
    )

    class Meta:

        model = Product

        fields = [
            'id',
            'seller',
            'seller_username',
            'category',
            'category_name',
            'title',
            'description',
            'price',
            'image',
            'is_available',
            'moderation_status',
            'moderation_comment',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'seller',
            'moderation_status',
            'moderation_comment',
            'created_at',
            'updated_at',
        ]

    def validate_price(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                'Le prix doit être supérieur à 0.'
            )

        return value

    def validate_image(self, value):

        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                'La photo ne doit pas dépasser 5 Mo.'
            )

        return value

    def validate_title(self, value):

        value = value.strip()

        if len(value) < 3:

            raise serializers.ValidationError(
                'Le titre doit contenir au moins 3 caractères.'
            )

        return value

    def validate_description(self, value):

        value = value.strip()

        if len(value) < 10:

            raise serializers.ValidationError(
                'La description doit contenir au moins 10 caractères.'
            )

        return value


class ProductPriceHistorySerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = ProductPriceHistory

        fields = [
            'id',
            'old_price',
            'new_price',
            'changed_at',
        ]


class ProductInterestSerializer(
    serializers.ModelSerializer
):

    product_title = serializers.CharField(
        source='product.title',
        read_only=True,
    )

    class Meta:

        model = ProductInterest

        fields = [
            'id',
            'product',
            'product_title',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
        ]