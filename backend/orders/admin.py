from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'buyer',
        'product',
        'unit_price',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
        'created_at',
    )

    search_fields = (
        'buyer__username',
        'product__title',
    )

    readonly_fields = (
        'buyer',
        'product',
        'unit_price',
        'created_at',
        'updated_at',
    )