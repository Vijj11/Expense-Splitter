from collections import defaultdict
from decimal import Decimal
from groups.models import Group
from expenses.models import Expense

def calculate_settlements(group_id):
    group = Group.objects.get(id=group_id)
    from groups.models import Settlement
    # Get all settled expense IDs for this group
    settled_expense_ids = set(
        Settlement.objects.filter(group=group, expense__isnull=False).values_list('expense_id', flat=True)
    )
    # Only include expenses that are not settled
    expenses = Expense.objects.filter(group=group).exclude(id__in=settled_expense_ids)
    from expenses.models import ExpenseShare

    # Step 1: Net balance calculation
    balances = defaultdict(Decimal)

    # Step 2: Direct settlements per expense
    settlements = []
    for expense in expenses:
        payer = expense.paid_by
        shares = ExpenseShare.objects.filter(expense=expense)
        for share in shares:
            if share.user != payer:
                settlements.append({
                    "from": share.user.username,
                    "from_name": share.user.first_name or share.user.username,
                    "to": payer.username,
                    "to_name": payer.first_name or payer.username,
                    "amount": float(share.share_amount)
                })
            balances[share.user] -= share.share_amount
        balances[payer] += expense.amount

    # Ensure all group members are present in balances
    for user in group.members.all():
        balances[user] = balances.get(user, Decimal('0.00'))

    # Step 3: Check that the sum of all balances is zero (or very close)
    total_balance = sum(balances.values())
    assert abs(total_balance) < 0.01, "Balances do not sum to zero!"

    return {
        "balances": {u.username: float(balances[u]) for u in balances},
        "settlements": settlements
    }
