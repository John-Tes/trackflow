from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.accounts.models import User
from apps.shipments.models import Shipment, Status as S, TrackingEvent

FLOW = [(S.CREATED, "Lagos", "Shipment created"), (S.PICKED_UP, "Ikeja", "Package picked up"),
        (S.IN_TRANSIT, "Ikeja", "In transit"), (S.OUT_FOR_DELIVERY, "Lekki", "Out for delivery")]

class Command(BaseCommand):
    help = "Seed fake development data (dev credentials only)"
    def handle(self, *a, **k):
        if User.objects.filter(username="admin").exists():
            return self.stdout.write("Already seeded")
        User.objects.create_user("admin", "admin@example.test", "admin12345", role="ADMIN", is_staff=True, is_superuser=True)
        staff = User.objects.create_user("michael", "m@example.test", "staff12345", role="STAFF")
        for i, name in enumerate(["Ada Obi", "Tunde Bello", "Chioma Eze"]):
            s = Shipment.objects.create(customer_name=name, customer_phone=f"+23480000000{i}",
                customer_email=f"c{i}@example.test", pickup_address="12 Allen Ave, Ikeja, Lagos",
                delivery_address="5 Admiralty Way, Lekki, Lagos", package_type="Parcel",
                package_description="Electronics", assigned_staff=staff,
                estimated_delivery=timezone.now() + timedelta(hours=6))
            for st, loc, d in FLOW[:i + 2]:
                TrackingEvent.objects.create(shipment=s, status=st, location=loc, description=d, created_by=staff)
                s.status, s.current_location = st, loc
            s.save()
            self.stdout.write(f"{name}: {s.tracking_code}")
