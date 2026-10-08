from rest_framework.permissions import BasePermission

def _role(u):
    return "ADMIN" if getattr(u, "is_superuser", False) else getattr(u, "role", None)

class IsAdminRole(BasePermission):
    message = "You do not have permission to perform this action."
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _role(request.user) == "ADMIN")

class IsStaffOrAdmin(IsAdminRole):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and _role(request.user) in ("ADMIN", "STAFF"))
