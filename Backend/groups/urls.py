from .views import HistoryView
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, InviteUserView, GroupSettlementView, AcceptInviteView, PendingInvitesView, LeaveGroupView, RemoveMemberView, DeleteGroupView
from .views import DeclineInviteView

router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')

urlpatterns = [
    path('history/', HistoryView.as_view(), name='history'),
    path('groups/invite/', InviteUserView.as_view(), name='invite-user'),
    path('groups/accept-invite/', AcceptInviteView.as_view(), name='accept-invite'),
    path('groups/pending-invites/', PendingInvitesView.as_view(), name='pending-invites'),
    path('', include(router.urls)),
    path('groups/<int:group_id>/settlements/', GroupSettlementView.as_view(), name='group-settlements'),
    path('groups/<int:group_id>/split/', GroupSettlementView.as_view(), name='group-split'),
    path('groups/<int:group_id>/leave/', LeaveGroupView.as_view(), name='leave-group'),
    path('groups/<int:group_id>/remove-member/', RemoveMemberView.as_view(), name='remove-member'),
    path('groups/<int:group_id>/delete/', DeleteGroupView.as_view(), name='delete-group'),
    path('groups/invite/<int:invite_id>/', DeclineInviteView.as_view(), name='decline-invite'),
]
