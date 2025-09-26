from django.core.management.base import BaseCommand
from groups.models import Group

class Command(BaseCommand):
    help = 'Ensure all group creators are members of their groups.'

    def handle(self, *args, **options):
        updated = 0
        for group in Group.objects.all():
            if group.created_by not in group.members.all():
                group.members.add(group.created_by)
                updated += 1
        self.stdout.write(self.style.SUCCESS(f'Updated {updated} groups to include creator as member.'))