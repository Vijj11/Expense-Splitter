from rest_framework import serializers
from .models import Group,Invite, Settlement
from users.models import User

from users.serializers import UserSerializer

class GroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    accepted_members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'created_by', 'members', 'accepted_members', 'created_at']

class SettlementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settlement
        fields = ['id', 'group', 'expense', 'from_user', 'to_user', 'amount', 'created_by', 'created_at']
        read_only_fields = ['id', 'created_by', 'created_at']
        
class InviteSerializer(serializers.ModelSerializer):
    inviter = serializers.SerializerMethodField()
    invited_user = serializers.SerializerMethodField()
    invited_user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='invited_user', write_only=True)
    group = serializers.SerializerMethodField()

    def get_group(self, obj):
        if obj.group_id:
            return {
                'id': obj.group_id,
                'name': getattr(obj.group, 'name', None) or self._get_group_name(obj.group_id)
            }
        return None

    def _get_group_name(self, group_id):
        from groups.models import Group
        try:
            group = Group.objects.get(id=group_id)
            return group.name
        except Group.DoesNotExist:
            return None

    def get_inviter(self, obj):
        if obj.inviter:
            return {
                'id': obj.inviter.id,
                'username': obj.inviter.username,
                'first_name': obj.inviter.first_name,
                'last_name': obj.inviter.last_name
            }
        return None

    def get_invited_user(self, obj):
        if obj.invited_user:
            return {
                'id': obj.invited_user.id,
                'username': obj.invited_user.username,
                'first_name': obj.invited_user.first_name,
                'last_name': obj.invited_user.last_name
            }
        return None

    class Meta:
        model = Invite
        fields = ['id', 'inviter', 'invited_user', 'invited_user_id', 'group', 'created_at', 'accepted']
        read_only_fields = ['inviter', 'created_at', 'accepted', 'invited_user']