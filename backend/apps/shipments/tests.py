from rest_framework.test import APITestCase
from apps.accounts.models import User
from .models import Shipment

class ShipmentTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user("a", password="pw-12345-x", role="ADMIN")
        self.staff = User.objects.create_user("s", password="pw-12345-x", role="STAFF")
        self.s = Shipment.objects.create(customer_name="Jane", customer_phone="1",
                                         pickup_address="a", delivery_address="b")
    def test_public_lookup_hides_private_data(self):
        r = self.client.get(f"/api/v1/track/{self.s.tracking_code}/")
        self.assertEqual(r.status_code, 200)
        self.assertNotIn("customer_name", r.json()["data"])
    def test_unknown_code_404(self):
        self.assertEqual(self.client.get("/api/v1/track/TRK-AAAAAAAA/").status_code, 404)
    def test_requires_auth(self):
        self.assertEqual(self.client.get("/api/v1/shipments/").status_code, 401)
    def test_invalid_transition_rejected_and_valid_accepted(self):
        self.client.force_authenticate(self.admin)
        url = f"/api/v1/shipments/{self.s.pk}/events/"
        self.assertEqual(self.client.post(url, {"status": "DELIVERED"}, format="json").status_code, 400)
        self.assertEqual(self.client.post(url, {"status": "PICKED_UP"}, format="json").status_code, 201)
    def test_staff_cannot_create(self):
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.post("/api/v1/shipments/", {}, format="json").status_code, 403)
