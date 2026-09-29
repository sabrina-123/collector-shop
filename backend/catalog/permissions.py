from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
)

from accounts.models import Profile


class ProductPermission(BasePermission):

    def has_permission(
        self,
        request,
        view,
    ):

        # Catalogue public
        if request.method in SAFE_METHODS:
            return True

        # Création/modification :
        # connexion obligatoire
        if not request.user.is_authenticated:
            return False

        # Admin
        if request.user.is_staff:
            return True

        try:
            profile = request.user.profile

        except Profile.DoesNotExist:
            return False

        # L'utilisateur doit avoir
        # activé son statut vendeur.
        return profile.is_seller

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):

        if request.method in SAFE_METHODS:
            return True

        if request.user.is_staff:
            return True

        return obj.seller_id == request.user.id