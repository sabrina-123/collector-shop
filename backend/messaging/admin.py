from django.contrib import admin

from .models import (
    Conversation,
    Message,
)


@admin.register(Conversation)
class ConversationAdmin(
    admin.ModelAdmin
):

    list_display = (
        'id',
        'product',
        'buyer',
        'seller',
        'created_at',
        'updated_at',
    )

    search_fields = (
        'buyer__username',
        'seller__username',
        'product__title',
    )

    readonly_fields = (
        'product',
        'buyer',
        'seller',
        'created_at',
        'updated_at',
    )


@admin.register(Message)
class MessageAdmin(
    admin.ModelAdmin
):

    list_display = (
        'id',
        'conversation',
        'sender',
        'is_read',
        'created_at',
    )

    list_filter = (
        'is_read',
        'created_at',
    )

    search_fields = (
        'sender__username',
        'content',
    )

    readonly_fields = (
        'conversation',
        'sender',
        'content',
        'created_at',
    )