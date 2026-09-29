from django.db import migrations


CATEGORY_NAMES = [
    'Pieces de monnaie',
    'Poupees anciennes',
    'Photographie vintage',
    'Vinyles & musique',
    'Objets anciens',
    'Arts decoratifs',
    'Ceramique',
    'Design & mobilier',
    'Publicite vintage',
]


def create_categories(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    Category.objects.bulk_create(
        [Category(name=name) for name in CATEGORY_NAMES],
        ignore_conflicts=True,
    )


def remove_categories(apps, schema_editor):
    Category = apps.get_model('catalog', 'Category')
    Category.objects.filter(name__in=CATEGORY_NAMES).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0003_alter_product_image'),
    ]

    operations = [
        migrations.RunPython(create_categories, remove_categories),
    ]
