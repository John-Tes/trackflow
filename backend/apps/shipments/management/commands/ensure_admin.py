import os
from django.core.management.base import BaseCommand
from apps.accounts.models import User


class Command(BaseCommand):
    help = (
        "Create the admin user from ADMIN_USERNAME / ADMIN_PASSWORD if it doesn't exist"
    )

    def handle(self, *a, **k):
        u, p = os.environ.get("ADMIN_USERNAME"), os.environ.get("ADMIN_PASSWORD")
        if not u or not p:
            return self.stdout.write("ADMIN_USERNAME/ADMIN_PASSWORD not set; skipping")
        if not User.objects.filter(username=u).exists():
            User.objects.create_user(
                u,
                os.environ.get("ADMIN_EMAIL", ""),
                p,
                role="ADMIN",
                is_staff=True,
                is_superuser=True,
            )
            self.stdout.write("Admin created")
