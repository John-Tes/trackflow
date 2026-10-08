from rest_framework import serializers
from rest_framework.generics import ListAPIView
from apps.accounts.permissions import IsAdminRole
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    actor = serializers.CharField(source="actor.username", default=None)
    class Meta:
        model = AuditLog
        fields = ["id", "actor", "action", "target", "detail", "created_at"]

class AuditLogListView(ListAPIView):
    permission_classes = [IsAdminRole]
    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.select_related("actor")
