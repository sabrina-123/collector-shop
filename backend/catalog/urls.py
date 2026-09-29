from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ProductInterestViewSet,
    ProductViewSet,
)


router = DefaultRouter()

router.register(
    r'categories',
    CategoryViewSet,
)

router.register(
    r'products',
    ProductViewSet,
    basename='products',
)

router.register(
    r'interests',
    ProductInterestViewSet,
    basename='interests',
)


urlpatterns = [
    path('', include(router.urls)),
]