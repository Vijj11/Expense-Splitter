from rest_framework import serializers
from .models import Expense, ExpenseShare


from users.serializers import UserSerializer
from users.models import User

class ExpenseShareSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ExpenseShare
        fields = ['user', 'share_amount']


class ExpenseSerializer(serializers.ModelSerializer):
    shares = ExpenseShareSerializer(many=True, required=False)
    paid_by = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    paid_by_details = UserSerializer(source='paid_by', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'group', 'description', 'amount', 'paid_by', 'paid_by_details', 'created_at', 'shares']

    def create(self, validated_data):
        shares_data = validated_data.pop('shares', None)
        split_among = self.initial_data.get('split_among', None)
        expense = Expense.objects.create(**validated_data)

        if shares_data:
            total_share = sum(share['share_amount'] for share in shares_data)
            if total_share != expense.amount:
                raise serializers.ValidationError("Total share amounts must match the expense amount.")
            for share in shares_data:
                ExpenseShare.objects.create(expense=expense, **share)
        elif split_among:
            # Split among selected members only
            member_ids = [int(mid) for mid in split_among]
            members = expense.group.members.filter(id__in=member_ids)
            if not members.exists():
                raise serializers.ValidationError("At least one member must be selected to split expense.")
            equal_share = expense.amount / members.count()
            for member in members:
                ExpenseShare.objects.create(expense=expense, user=member, share_amount=equal_share)
        else:
            # Fallback: split among all group members
            members = expense.group.members.all()
            if not members.exists():
                raise serializers.ValidationError("Group must have at least one member to split expense.")
            equal_share = expense.amount / members.count()
            for member in members:
                ExpenseShare.objects.create(expense=expense, user=member, share_amount=equal_share)

        return expense
