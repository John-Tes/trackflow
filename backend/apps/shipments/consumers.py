import re
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .models import Shipment
from .services import group_name, public_data

CODE_RE = re.compile(r"^TRK-[A-Z0-9]{8}$")

class TrackingConsumer(AsyncJsonWebsocketConsumer):
    """Read-only, public data only. Clients cannot send commands."""
    async def connect(self):
        code = self.scope["url_route"]["kwargs"]["code"].upper()
        snap = await self.snapshot(code) if CODE_RE.match(code) else None
        if snap is None:
            return await self.close(code=4404)
        self.group = group_name(code)
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()
        await self.send_json({"type": "snapshot", "data": snap})
    async def disconnect(self, code):
        if hasattr(self, "group"):
            await self.channel_layer.group_discard(self.group, self.channel_name)
    async def receive_json(self, content, **kw):
        pass
    async def tracking_update(self, event):
        await self.send_json({"type": "update", "data": event["data"]})
    @database_sync_to_async
    def snapshot(self, code):
        s = Shipment.objects.prefetch_related("events").filter(tracking_code=code).first()
        return public_data(s) if s else None
