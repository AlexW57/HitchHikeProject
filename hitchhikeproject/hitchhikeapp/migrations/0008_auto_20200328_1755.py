# Generated by Django 3.0.2 on 2020-03-29 00:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hitchhikeapp', '0007_rating_userdata'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ride',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('startZip', models.CharField(max_length=15)),
                ('endZip', models.CharField(max_length=15)),
                ('startDate', models.DateField()),
                ('endDate', models.DateField()),
                ('status', models.IntegerField()),
                ('vehicleYear', models.CharField(max_length=4)),
                ('vehicleMake', models.CharField(max_length=100)),
                ('vehicleModel', models.CharField(max_length=100)),
            ],
        ),
        migrations.RenameField(
            model_name='rating',
            old_name='ratingBy',
            new_name='ratingByUserId',
        ),
        migrations.RenameField(
            model_name='rating',
            old_name='ratingFor',
            new_name='ratingForUserId',
        ),
    ]