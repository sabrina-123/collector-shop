from rest_framework import generics
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)

from .models import Profile
from .serializers import (
    RegisterSerializer,
    ProfileSerializer,
)


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer

    permission_classes = [
        AllowAny,
    ]


class MeView(generics.RetrieveAPIView):

    serializer_class = ProfileSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_object(self):

        profile, _ = Profile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'is_seller': False,
            },
        )

        return profile