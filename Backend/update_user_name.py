import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expense_splitter.settings')
django.setup()

from users.models import User

# Update these with your actual username/phone and desired names
user = User.objects.get(phone='9019043890')
user.first_name = 'John'
user.last_name = 'Doe'
user.save()

print(f"Updated user: {user.username} ({user.first_name} {user.last_name})")
