from django.db import models
from users.models import User
from django.conf import settings

class Group(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')
    members = models.ManyToManyField(User, related_name='group_memberships')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Invite(models.Model):
    inviter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_invites")
    invited_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_invites", null=True, blank=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Invite to {self.invited_user.username} by {self.inviter.username}"

Group.add_to_class('accepted_members', models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='accepted_groups', blank=True))
    
class Settlement(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="settlements")
    expense = models.ForeignKey('expenses.Expense', on_delete=models.SET_NULL, null=True, blank=True, related_name="settlements")
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="settlements_from")
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="settlements_to")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_settlements")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        expense_str = f" for expense {self.expense.id}" if self.expense else ""
        return f"{self.from_user} pays {self.to_user} {self.amount} in {self.group.name}{expense_str}"