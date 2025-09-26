from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet
from .views import ExpenseViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from groups.utils import calculate_settlements

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expenses')

class GroupSplitView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, group_id):
        settlements = calculate_settlements(group_id)
        return Response(settlements)

urlpatterns = [
    path('', include(router.urls)),
    path('group/<int:group_id>/split/', GroupSplitView.as_view(), name='group-split'),
]
