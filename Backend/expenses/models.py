from django.db import models
from users.models import User
from groups.models import Group

class Expense(models.Model):
    group = models.ForeignKey("groups.Group", on_delete=models.CASCADE, related_name="expenses")
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_by = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="expenses_paid")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.description} - {self.amount}"



class ExpenseShare(models.Model):
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    share_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.user.username} owes {self.share_amount}'
