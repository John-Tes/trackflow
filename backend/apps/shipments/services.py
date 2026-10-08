import json
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.renderers import JSONRenderer
from apps.accounts.permissions import _role
from apps.audit.models import AuditLog
from .models import Shipment, Status as S, TrackingEvent
from .serializers import PublicShipmentSerializer
from .notifications import notify_status_change

TRANSITIONS = {
    S.CREATED: {S.PICKED_UP, S.DELAYED, S.CANCELLED},
    S.PICKED_UP: {S.PROCESSING, S.IN_TRANSIT, S.DELAYED, S.CANCELLED},
    S.PROCESSING: {S.IN_TRANSIT, S.DELAYED, S.CANCELLED},
    S.IN_TRANSIT: {S.ARRIVED_AT_DESTINATION, S.DELAYED, S.CANCELLED},
    S.ARRIVED_AT_DESTINATION: {S.OUT_FOR_DELIVERY, S.DELAYED, S.CANCELLED},
    S.OUT_FOR_DELIVERY: {S.DELIVERED, S.DELAYED, S.CANCELLED},
    S.DELAYED: {
        S.IN_TRANSIT,
        S.ARRIVED_AT_DESTINATION,
        S.OUT_FOR_DELIVERY,
        S.CANCELLED,
    },
    S.DELIVERED: set(),
    S.CANCELLED: set(),
}


def group_name(code):
    return "tracking_" + code.replace("-", "_")


def public_data(shipment):
    return json.loads(JSONRenderer().render(PublicShipmentSerializer(shipment).data))


def broadcast(shipment):
    async_to_sync(get_channel_layer().group_send)(
        group_name(shipment.tracking_code),
        {"type": "tracking.update", "data": public_data(shipment)},
    )


def log(actor, action, shipment, detail=None):
    AuditLog.objects.create(
        actor=actor, action=action, target=shipment.tracking_code, detail=detail or {}
    )


def apply_event(
    shipment,
    actor,
    status=None,
    location=None,
    latitude=None,
    longitude=None,
    description="",
    override=False,
):
    with transaction.atomic():
        s = Shipment.objects.select_for_update().get(pk=shipment.pk)
        old = s.status
        if status and status != old:
            if override:
                if _role(actor) != "ADMIN":
                    raise PermissionDenied(
                        "You do not have permission to perform this action."
                    )
            elif status not in TRANSITIONS.get(old, set()):
                raise ValidationError(
                    {"status": f"Cannot change status from {old} to {status}."}
                )
            s.status = status
            if status == S.DELIVERED:
                s.delivered_at = timezone.now()
        if location is not None:
            s.current_location = location
        if latitude is not None:
            s.latitude, s.longitude = latitude, longitude
        s.save()
        TrackingEvent.objects.create(
            shipment=s,
            status=s.status,
            location=s.current_location,
            description=description,
            latitude=s.latitude,
            longitude=s.longitude,
            created_by=actor,
        )
        log(
            actor,
            "shipment.update",
            s,
            {"from": old, "to": s.status, "location": s.current_location},
        )

        status_changed = s.status != old

        def after_commit():
            broadcast(s)
            if status_changed:
                notify_status_change(s)

        transaction.on_commit(after_commit)  # never notify before commit
    return s
