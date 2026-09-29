from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    password_confirm = serializers.CharField(
        write_only=True,
    )

    is_seller = serializers.BooleanField(
        default=False,
        required=False,
    )

    class Meta:

        model = User

        fields = [
            'username',
            'email',
            'password',
            'password_confirm',
            'is_seller',
        ]

    def validate_email(self, value):

        value = value.strip().lower()

        if User.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                'Cette adresse email est déjà utilisée.'
            )

        return value

    def validate(self, data):

        if data['password'] != data['password_confirm']:

            raise serializers.ValidationError({
                'password_confirm':
                    'Les deux mots de passe ne correspondent pas.'
            })

        return data

    def create(self, validated_data):

        is_seller = validated_data.pop(
            'is_seller',
            False,
        )

        validated_data.pop(
            'password_confirm'
        )

        password = validated_data.pop(
            'password'
        )

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        Profile.objects.create(
            user=user,
            is_seller=is_seller,
        )

        return user


class ProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True,
    )

    email = serializers.EmailField(
        source='user.email',
        read_only=True,
    )

    class Meta:

        model = Profile

        fields = [
            'id',
            'username',
            'email',
            'is_seller',
            'created_at',
        ]