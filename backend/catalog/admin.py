from django.contrib import admin

from notifications.models import Notification

from .models import (
    Category,
    Product,
    ProductInterest,
    ProductPriceHistory,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'name',
    )

    search_fields = (
        'name',
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'title',
        'seller',
        'category',
        'price',
        'is_available',
        'moderation_status',
        'created_at',
    )

    list_filter = (
        'moderation_status',
        'category',
        'is_available',
    )

    search_fields = (
        'title',
        'description',
        'seller__username',
    )

    readonly_fields = (
        'seller',
        'created_at',
        'updated_at',
    )

    actions = [
        'approve_products',
        'reject_products',
    ]

    def get_queryset(self, request):

        return super().get_queryset(request).order_by(
            'moderation_status',
            '-created_at',
        )

    @admin.action(
        description='Approuver les produits sélectionnés'
    )
    def approve_products(
        self,
        request,
        queryset,
    ):

        products = list(queryset)

        for product in products:

            if (
                product.moderation_status
                ==
                Product.ModerationStatus.APPROVED
            ):
                continue

            product.moderation_status = (
                Product.ModerationStatus.APPROVED
            )

            product.moderation_comment = ''

            product.save(
                update_fields=[
                    'moderation_status',
                    'moderation_comment',
                    'updated_at',
                ]
            )

            Notification.objects.create(
                user=product.seller,
                notification_type=(
                    Notification.Type.PRODUCT_APPROVED
                ),
                title='Produit approuvé',
                message=(
                    f'Votre produit '
                    f'"{product.title}" '
                    f'a été approuvé.'
                ),
            )

    @admin.action(
        description='Refuser les produits sélectionnés'
    )
    def reject_products(
        self,
        request,
        queryset,
    ):

        products = list(queryset)

        for product in products:

            if (
                product.moderation_status
                ==
                Product.ModerationStatus.REJECTED
            ):
                continue

            product.moderation_status = (
                Product.ModerationStatus.REJECTED
            )

            product.save(
                update_fields=[
                    'moderation_status',
                    'updated_at',
                ]
            )

            Notification.objects.create(
                user=product.seller,
                notification_type=(
                    Notification.Type.PRODUCT_REJECTED
                ),
                title='Produit refusé',
                message=(
                    f'Votre produit '
                    f'"{product.title}" '
                    f'a été refusé.'
                ),
            )


@admin.register(ProductPriceHistory)
class ProductPriceHistoryAdmin(
    admin.ModelAdmin
):

    list_display = (
        'id',
        'product',
        'old_price',
        'new_price',
        'changed_by',
        'changed_at',
    )

    readonly_fields = (
        'product',
        'old_price',
        'new_price',
        'changed_by',
        'changed_at',
    )


@admin.register(ProductInterest)
class ProductInterestAdmin(
    admin.ModelAdmin
):

    list_display = (
        'id',
        'user',
        'product',
        'created_at',
    )

    readonly_fields = (
        'user',
        'product',
        'created_at',
    )