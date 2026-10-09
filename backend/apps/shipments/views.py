import re
from datetime import timedelta
from django.db import transaction
from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import status as http, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from apps.accounts.permissions import IsAdminRole, IsStaffOrAdmin, _role
from . import services
from .models import Shipment, Status, TrackingEvent
from .serializers import (EventInputSerializer, LocationSerializer, PublicShipmentSerializer,
                          ShipmentSerializer)

CODE_RE = re.compile(r"^TRK-[A-Z0-9]{8}$")

class TrackView(APIView):
    permission_classes = []
    authentication_classes = []
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "track"
    def get(self, request, code):
        code = code.upper()
        s = Shipment.objects.prefetch_related("events").filter(tracking_code=code).first() \
            if CODE_RE.match(code) else None
        if not s:
            return Response({"success": False, "message": "Tracking number not found."}, status=404)
        return Response({"success": True, "data": PublicShipmentSerializer(s).data})

class ShipmentViewSet(viewsets.ModelViewSet):
    serializer_class = ShipmentSerializer
    def get_permissions(self):
        return [IsAdminRole()] if self.action in ("create", "destroy") else [IsStaffOrAdmin()]
    def get_queryset(self):
        qs = Shipment.objects.select_related("assigned_staff")
        if _role(self.request.user) != "ADMIN":
            qs = qs.filter(assigned_staff=self.request.user)
        p = self.request.query_params
        if p.get("status"):
            qs = qs.filter(status=p["status"])
        if p.get("search"):
            qs = qs.filter(Q(tracking_code__icontains=p["search"]) | Q(customer_name__icontains=p["search"]))
        order = p.get("ordering", "-created_at")
        if order.lstrip("-") in {"created_at", "status", "estimated_delivery"}:
            qs = qs.order_by(order)
        return qs
    def perform_create(self, serializer):
        s = serializer.save()
        TrackingEvent.objects.create(shipment=s, status=s.status, description="Shipment created",
                                     location=s.pickup_address[:120], created_by=self.request.user)
        services.log(self.request.user, "shipment.create", s)
    def perform_update(self, serializer):
        if _role(self.request.user) != "ADMIN" and set(serializer.validated_data) - {"estimated_delivery", "pickup_date"}:
            raise PermissionDenied("You do not have permission to perform this action.")
        s = serializer.save()
        services.log(self.request.user, "shipment.edit", s, {"fields": list(serializer.validated_data)})
        transaction.on_commit(lambda: services.broadcast(s))
    def perform_destroy(self, instance):
        services.log(self.request.user, "shipment.delete", instance)
        instance.delete()
    @action(detail=True, methods=["post"], url_path="events")
    def events(self, request, pk=None):
        s = self.get_object()
        ser = EventInputSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        s = services.apply_event(s, request.user, **ser.validated_data)
        return Response(ShipmentSerializer(s).data, status=http.HTTP_201_CREATED)
    @action(detail=True, methods=["patch"], url_path="location")
    def location(self, request, pk=None):
        s = self.get_object()
        ser = LocationSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        s = services.apply_event(s, request.user, description="Location updated", **ser.validated_data)
        return Response(ShipmentSerializer(s).data)

class OverviewView(APIView):
    permission_classes = [IsAdminRole]
    def get(self, request):
        counts = Shipment.objects.aggregate(
            total=Count("id"), **{v.lower(): Count("id", filter=Q(status=v)) for v in Status.values})
        counts["active"] = counts["total"] - counts["delivered"] - counts["cancelled"]
        daily = (Shipment.objects.filter(created_at__gte=timezone.now() - timedelta(days=14))
                 .annotate(day=TruncDate("created_at")).values("day").annotate(n=Count("id")).order_by("day"))
        return Response({"counts": counts, "daily": list(daily)})
