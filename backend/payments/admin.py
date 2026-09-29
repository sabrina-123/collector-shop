from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'reference',
        'order',
        'amount',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
        'created_at',
    )

    search_fields = (
        'reference',
        'order__buyer__username',
    )

    readonly_fields = (
        'reference',
        'order',
        'amount',
        'status',
        'created_at',
        'updated_at',
    )