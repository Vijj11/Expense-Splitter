from django.core.management.base import BaseCommand
from groups.models import Invite, Group
from django.db.models import Q

class Command(BaseCommand):
    help = 'Delete invites with missing group or invited_user.'

    def handle(self, *args, **options):
        # Find invites with missing group or invited_user
        broken_invites = Invite.objects.filter(Q(group__isnull=True) | Q(invited_user__isnull=True))

        # Also find invites where group_id does not exist in Group table
        all_group_ids = set(Group.objects.values_list('id', flat=True))
        dangling_invites = Invite.objects.exclude(group__isnull=True).exclude(group_id__in=all_group_ids)

        total_to_delete = broken_invites.count() + dangling_invites.count()
        broken_invites.delete()
        dangling_invites.delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {total_to_delete} broken/dangling invites.'))
