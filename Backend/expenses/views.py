from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        group_id = self.request.query_params.get('group')
        if group_id:
            from groups.models import Group
            try:
                group = Group.objects.get(id=group_id)
            except Group.DoesNotExist:
                return Expense.objects.none()
            return Expense.objects.filter(group=group)
        return Expense.objects.all()

    def perform_create(self, serializer):
        return serializer.save()
