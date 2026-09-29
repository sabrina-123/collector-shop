from rest_framework.permissions import BasePermission


class ConversationPermission(BasePermission):

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

        return request.user.id in [
            obj.buyer_id,
            obj.seller_id,
        ]


class MessagePermission(BasePermission):

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

        conversation = obj.conversation

        return request.user.id in [
            conversation.buyer_id,
            conversation.seller_id,
        ]