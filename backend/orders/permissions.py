from rest_framework.permissions import BasePermission


class OrderPermission(BasePermission):

    def has_permission(self, request, view):

        # Toutes les opérations sur les commandes
        # nécessitent une authentification.
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):

        # Administrateur
        if request.user.is_staff:
            return True

        # Acheteur concerné
        if obj.buyer == request.user:
            return True

        # Vendeur concerné
        if obj.product.seller == request.user:
            return True

        return False