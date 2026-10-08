import json
import logging
import threading
import urllib.error
import urllib.request
from django.conf import settings

log = logging.getLogger(__name__)


def _send(to, subject, body):
    if not settings.BREVO_API_KEY:
        print(f"[BREVO_API_KEY not set - email not sent] to={to}\n{subject}\n{body}")
        return
    payload = json.dumps(
        {
            "sender": {
                "name": settings.BREVO_SENDER_NAME,
                "email": settings.BREVO_SENDER_EMAIL,
            },
            "to": [{"email": to}],
            "subject": subject,
            "textContent": body,
        }
    ).encode()
    req = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=payload,
        method="POST",
        headers={
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
            "accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            log.info("Brevo accepted email (%s)", r.status)
    except urllib.error.HTTPError as e:
        log.error("Brevo rejected email: %s %s", e.code, e.read()[:300])
    except Exception:
        log.exception("Brevo email failed")


def notify_status_change(shipment):
    if not shipment.customer_email:
        return
    status = shipment.status.replace("_", " ").title()
    eta = (
        shipment.estimated_delivery.strftime("%b %d, %Y %H:%M UTC")
        if shipment.estimated_delivery
        else "To be confirmed"
    )
    link = f"{settings.FRONTEND_URL}/track/{shipment.tracking_code}"
    body = (
        f"Hello,\n\nYour package {shipment.tracking_code} is now: {status}\n"
        f"Current location: {shipment.current_location or 'Not available'}\n"
        f"Estimated delivery: {eta}\n\nTrack it live: {link}\n\n- TrackFlow"
    )
    threading.Thread(
        target=_send,
        daemon=True,
        args=(
            shipment.customer_email,
            f"Package update: {status} ({shipment.tracking_code})",
            body,
        ),
    ).start()
