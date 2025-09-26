from groups.models import Invite

for invite in Invite.objects.all():
    group = invite.group
    print(f"Invite ID: {invite.id}, group_id: {invite.group_id}, group: {group if group else 'None'}")
