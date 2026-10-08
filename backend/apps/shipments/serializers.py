from rest_framework import serializers
from .models import Shipment, Status, TrackingEvent

class PublicEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackingEvent
        fields = ["status", "location", "description", "created_at"]

class PublicShipmentSerializer(serializers.ModelSerializer):
    """Only what a recipient needs. No names, phones, emails, staff or internal ids."""
    events = PublicEventSerializer(many=True, read_only=True)
    class Meta:
        model = Shipment
        fields = ["tracking_code", "status", "current_location", "latitude", "longitude",
                  "estimated_delivery", "delivered_at", "package_type", "events"]

class ShipmentSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="assigned_staff.username", read_only=True, default=None)
    class Meta:
        model = Shipment
        fields = ["id", "tracking_code", "customer_name", "customer_phone", "customer_email",
                  "pickup_address", "delivery_address", "package_description", "package_type", "weight_kg",
                  "status", "current_location", "latitude", "longitude", "estimated_delivery",
                  "assigned_staff", "staff_name", "created_at", "updated_at", "delivered_at"]
        # Mass-assignment protection: state fields change only through services.apply_event
        read_only_fields = ["id", "tracking_code", "status", "current_location", "latitude",
                            "longitude", "created_at", "updated_at", "delivered_at"]

class EventInputSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Status.choices, required=False)
    location = serializers.CharField(max_length=120, required=False, allow_blank=True)
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)
    latitude = serializers.FloatField(min_value=-90, max_value=90, required=False)
    longitude = serializers.FloatField(min_value=-180, max_value=180, required=False)
    override = serializers.BooleanField(required=False, default=False)
    def validate(self, a):
        if not any(k in a for k in ("status", "location", "description", "latitude")):
            raise serializers.ValidationError("Provide at least one field to update.")
        return a

class LocationSerializer(serializers.Serializer):
    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)
    location = serializers.CharField(max_length=120, required=False, allow_blank=True)
