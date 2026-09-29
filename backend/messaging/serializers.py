import re

from rest_framework import serializers

from .models import (
    Conversation,
    Message,
)


class MessageSerializer(serializers.ModelSerializer):

    sender = serializers.PrimaryKeyRelatedField(
        read_only=True,
    )

    sender_username = serializers.CharField(
        source='sender.username',
        read_only=True,
    )

    class Meta:
        model = Message

        fields = [
            'id',
            'conversation',
            'sender',
            'sender_username',
            'content',
            'is_read',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'sender',
            'is_read',
            'created_at',
        ]

    def validate_content(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Le message ne peut pas être vide.'
            )

        # Détection simple d'adresse email
        email_pattern = (
            r'[A-Za-z0-9._%+-]+'
            r'@[A-Za-z0-9.-]+'
            r'\.[A-Za-z]{2,}'
        )

        if re.search(email_pattern, value):
            raise serializers.ValidationError(
                'Le partage d’une adresse email '
                'n’est pas autorisé.'
            )

        # Détection simple de numéro
        # français/international.
        phone_pattern = (
            r'(?<!\d)'
            r'(?:\+33|0033|0)'
            r'[\s.-]*'
            r'[1-9]'
            r'(?:[\s.-]*\d{2}){4}'
            r'(?!\d)'
        )

        if re.search(phone_pattern, value):
            raise serializers.ValidationError(
                'Le partage d’un numéro de téléphone '
                'n’est pas autorisé.'
            )

        return value


class ConversationSerializer(
    serializers.ModelSerializer
):

    product_title = serializers.CharField(
        source='product.title',
        read_only=True,
    )

    buyer_username = serializers.CharField(
        source='buyer.username',
        read_only=True,
    )

    seller_username = serializers.CharField(
        source='seller.username',
        read_only=True,
    )

    messages = MessageSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Conversation

        fields = [
            'id',
            'product',
            'product_title',
            'buyer',
            'buyer_username',
            'seller',
            'seller_username',
            'messages',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'buyer',
            'seller',
            'created_at',
            'updated_at',
        ]