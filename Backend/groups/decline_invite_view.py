from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from groups.models import Invite

class DeclineInviteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, invite_id):
        try:
            invite = Invite.objects.get(id=invite_id, invited_user=request.user)
            invite.delete()
            return Response({'detail': 'Invite declined.'}, status=status.HTTP_204_NO_CONTENT)
        except Invite.DoesNotExist:
            return Response({'error': 'Invite not found.'}, status=status.HTTP_404_NOT_FOUND)
