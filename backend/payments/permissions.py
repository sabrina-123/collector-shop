from rest_framework.permissions import BasePermission


class PaymentPermission(BasePermission):

    def has_permission(
        self,
        request,
        view,
    ):
        return request.user.is_authenticated

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):

        if request.user.is_staff:
            return True

        return (
            obj.order.buyer_id
            ==
            request.user.id
        )