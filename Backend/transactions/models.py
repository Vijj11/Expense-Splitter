# transactions/models.py
from django.db import models
from django.conf import settings
from groups.models import Group  # adjust path if your groups app is named differently

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('debit', 'Debit'),
        ('credit', 'Credit'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="transactions",
        null=True,
        blank=True
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="transactions"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # 👇 Safe default so migrations won't fail
    type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES,
        default='debit'
    )

    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.type} - {self.amount}"
