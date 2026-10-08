from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from apps.audit.views import AuditLogListView
from apps.shipments.views import OverviewView, ShipmentViewSet, TrackView
from django.http import JsonResponse

router = DefaultRouter()
router.register("shipments", ShipmentViewSet, basename="shipment")
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/login/", TokenObtainPairView.as_view()),
    path("api/v1/auth/refresh/", TokenRefreshView.as_view()),
    path("api/v1/track/<str:code>/", TrackView.as_view()),
    path("api/v1/dashboard/overview/", OverviewView.as_view()),
    path("api/v1/audit-logs/", AuditLogListView.as_view()),
    path("api/v1/", include(router.urls)),
    path("health/", lambda r: JsonResponse({"ok": True})),
]
