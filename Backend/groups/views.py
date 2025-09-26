from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from transactions.models import Transaction
from transactions.serializers import TransactionSerializer
# API to return paid and received settlements and transactions for the current user
class HistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # Settlements paid (user is from_user)
        paid_settlements = Settlement.objects.filter(from_user=user)
        # Settlements received (user is to_user)
        received_settlements = Settlement.objects.filter(to_user=user)

        # Transactions paid (user is user, type is debit)
        paid_transactions = Transaction.objects.filter(user=user, type='debit')
        # Transactions received (user is user, type is credit)
        received_transactions = Transaction.objects.filter(user=user, type='credit')

        def serialize_settlement(s, paid=True):
            return {
                'id': s.id,
                'from': getattr(s.from_user, 'username', ''),
                'from_name': getattr(s.from_user, 'first_name', ''),
                'to': getattr(s.to_user, 'username', ''),
                'to_name': getattr(s.to_user, 'first_name', ''),
                'amount': float(s.amount),
                'group_name': getattr(s.group, 'name', ''),
                'date': s.created_at.strftime('%Y-%m-%d %H:%M'),
                'type': 'settlement',
                'direction': 'paid' if paid else 'received',
            }

        def serialize_transaction(t, paid=True):
            return {
                'id': t.id,
                'amount': float(t.amount),
                'group_name': getattr(t.group, 'name', ''),
                'date': t.created_at.strftime('%Y-%m-%d %H:%M'),
                'type': 'transaction',
                'direction': 'paid' if paid else 'received',
                'description': t.description,
            }

        paid = [serialize_settlement(s, paid=True) for s in paid_settlements] + [serialize_transaction(t, paid=True) for t in paid_transactions]
        received = [serialize_settlement(s, paid=False) for s in received_settlements] + [serialize_transaction(t, paid=False) for t in received_transactions]

        # Sort by date descending
        paid = sorted(paid, key=lambda x: x['date'], reverse=True)
        received = sorted(received, key=lambda x: x['date'], reverse=True)

        return Response({'paid': paid, 'received': received})
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Group, Invite, Settlement
from users.models import User
from .serializers import GroupSerializer, InviteSerializer, SettlementSerializer
from groups.utils import calculate_settlements
from django.db.models import Q


class DeclineInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, invite_id):
        try:
            invite = Invite.objects.get(id=invite_id, invited_user=request.user)
            invite.delete()
            return Response({'detail': 'Invite declined.'}, status=status.HTTP_204_NO_CONTENT)
        except Invite.DoesNotExist:
            return Response({'error': 'Invite not found.'}, status=status.HTTP_404_NOT_FOUND)
class LeaveGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)
        group.members.remove(request.user)
        group.accepted_members.remove(request.user)
        return Response({'detail': 'Left group.'}, status=status.HTTP_200_OK)

class RemoveMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        member_id = request.data.get('member_id')
        try:
            group = Group.objects.get(id=group_id)
            member = User.objects.get(id=member_id)
        except (Group.DoesNotExist, User.DoesNotExist):
            return Response({'error': 'Group or member not found.'}, status=status.HTTP_404_NOT_FOUND)
        if group.created_by != request.user:
            return Response({'error': 'Only admin can remove members.'}, status=status.HTTP_403_FORBIDDEN)
        group.members.remove(member)
        group.accepted_members.remove(member)
        return Response({'detail': 'Member removed.'}, status=status.HTTP_200_OK)

class DeleteGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found.'}, status=status.HTTP_404_NOT_FOUND)
        if group.created_by != request.user:
            return Response({'error': 'Only admin can delete group.'}, status=status.HTTP_403_FORBIDDEN)
        group.delete()
        return Response({'detail': 'Group deleted.'}, status=status.HTTP_200_OK)
from django.shortcuts import render
from rest_framework import viewsets, permissions, generics, status
from .models import Group, Invite, Settlement
from users.models import User
from .serializers import GroupSerializer, InviteSerializer, SettlementSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from groups.utils import calculate_settlements
from django.db.models import Q

class GroupViewSet(viewsets.ModelViewSet):
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Show groups created by user or where user is in accepted_members
        return Group.objects.filter(Q(created_by=user) | Q(accepted_members=user)).distinct()

    def perform_create(self, serializer):
        group = serializer.save(created_by=self.request.user)
        group.members.add(self.request.user)


class InviteUserView(generics.CreateAPIView):
    serializer_class = InviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        group_id = request.data.get('group')
        phones = request.data.get('phones', [])
        inviter = request.user

        print(f"[DEBUG] InviteUserView: group_id={group_id}, phones={phones}, inviter={inviter}")

        if not group_id or not phones:
            print("[DEBUG] InviteUserView: Missing group or phones")
            return Response({'error': 'Group and phones are required.'}, status=status.HTTP_400_BAD_REQUEST)

        invites = []

        from groups.models import Group
        try:
            group_instance = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            print(f"[DEBUG] InviteUserView: Group with id {group_id} does not exist")
            group_instance = None

        for phone in phones:
            try:
                invited_user = User.objects.get(phone=phone)
            except User.DoesNotExist:
                print(f"[DEBUG] InviteUserView: User with phone {phone} does not exist")
                continue
            serializer = self.get_serializer(data={'group': group_id, 'invited_user_id': invited_user.id, 'inviter': inviter.id})
            serializer.is_valid(raise_exception=True)
            invite_obj = serializer.save(inviter=inviter, group=group_instance)
            invites.append(self.get_serializer(invite_obj).data)
            print(f"[DEBUG] InviteUserView: Created invite for user {invited_user.username} in group {group_id}")

        if not invites:
            print("[DEBUG] InviteUserView: No valid invites created")
            return Response({'error': 'No valid users found for the provided phone numbers or group does not exist.'}, status=status.HTTP_400_BAD_REQUEST)

        print(f"[DEBUG] InviteUserView: Returning invites: {invites}")
        return Response(invites, status=status.HTTP_201_CREATED)

class PendingInvitesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        invites = Invite.objects.filter(invited_user=request.user, accepted=False)
        invites = invites.filter(group__isnull=False, inviter__isnull=False)
        print(f"[DEBUG] PendingInvitesView: user={request.user.username}, invites_count={invites.count()}")
        for inv in invites:
            print(f"[DEBUG] PendingInvitesView: Invite id={inv.id}, group={inv.group_id}, inviter={inv.inviter_id}, accepted={inv.accepted}")
        serializer = InviteSerializer(invites, many=True)
        print(f"[DEBUG] PendingInvitesView: Response data: {serializer.data}")
        return Response(serializer.data)

class AcceptInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        invite_id = request.data.get('invite_id')
        try:
            invite = Invite.objects.get(id=invite_id, invited_user=request.user)
        except Invite.DoesNotExist:
            return Response({'error': 'Invite not found.'}, status=status.HTTP_404_NOT_FOUND)
        if invite.accepted:
            return Response({'detail': 'Already accepted.'}, status=status.HTTP_400_BAD_REQUEST)
        if not invite.group:
            return Response({'error': 'Group for this invite does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        invite.accepted = True
        invite.save()
        invite.group.accepted_members.add(request.user)
        invite.group.members.add(request.user)
        return Response({'detail': 'Invite accepted.'}, status=status.HTTP_200_OK)
        

class GroupSettlementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):
        data = calculate_settlements(group_id)
        username = request.user.username
        net_balance = data["balances"].get(username, 0.0)
        if net_balance > 0:
            status_str = "Gets back"
        elif net_balance < 0:
            status_str = "Owes"
        else:
            status_str = "Settled"

        # Only include settlements where the user is involved and NOT already settled
        from groups.models import Settlement
        group_settled = Settlement.objects.filter(group_id=group_id)
        settled_pairs = set((s.from_user.username, s.to_user.username, float(s.amount)) for s in group_settled)
        settlements = [
            s for s in data["settlements"]
            if (s["from"], s["to"], float(s["amount"])) not in settled_pairs and (s["from"] == username or s["to"] == username)
        ]

        return Response({
            "net_balance": net_balance,
            "status": status_str,
            "settlements": settlements,
            "username": username
        })

    def post(self, request, group_id):
        data = request.data.copy()
        data["group"] = group_id
        # Accept expense field if provided
        expense_id = data.get("expense")
        if expense_id:
            data["expense"] = expense_id
        serializer = SettlementSerializer(data=data)
        if serializer.is_valid():
            settlement = serializer.save(created_by=request.user)

            # Create Transaction records for both users
            from transactions.models import Transaction
            from transactions.serializers import TransactionSerializer

            # Payer (debit)
            Transaction.objects.create(
                user=settlement.from_user,
                group=settlement.group,
                amount=settlement.amount,
                type='debit',
                description=f"Settlement paid to {settlement.to_user.username}"
            )
            # Receiver (credit)
            Transaction.objects.create(
                user=settlement.to_user,
                group=settlement.group,
                amount=settlement.amount,
                type='credit',
                description=f"Settlement received from {settlement.from_user.username}"
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
