from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)
    phone = models.CharField(max_length=15, blank=True, null=True, unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    otp = models.CharField(max_length=6, blank=True, null=True)

    def __str__(self):
        return self.username
