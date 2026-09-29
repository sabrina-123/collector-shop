from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0002_product_moderation_comment_product_moderation_status_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='image',
            field=models.FileField(
                blank=True,
                null=True,
                upload_to='products/',
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=['jpg', 'jpeg', 'png', 'webp'],
                    ),
                ],
            ),
        ),
    ]
