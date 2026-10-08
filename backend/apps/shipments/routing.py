from django.urls import re_path
from .consumers import TrackingConsumer
websocket_urlpatterns = [re_path(r"^ws/tracking/(?P<code>[A-Za-z0-9-]{12})/$", TrackingConsumer.as_asgi())]
