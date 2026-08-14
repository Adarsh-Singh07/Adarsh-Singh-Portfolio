"""
FastAPI router for Lark Mail webhooks and email management endpoints.

Wires the EmailProvider abstraction, classification, and processing pipeline
into the existing portfolio backend without altering existing functionality.
"""

import os
import json
import time
from typing import Dict, Any, Optional

from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel

from lark.webhook_security import verify_and_decrypt, handle_url_verification
from lark.exceptions import LarkAuthError
from email_engine.processor import EmailProcessor
from email_engine.zoho_provider import get_email_provider

router = APIRouter(prefix="/api/v1/portfolio/email", tags=["email"])

processor = EmailProcessor()


class ContactPayload(BaseModel):
    name: str
    email: str
    subject: str
    message: str


def _log_event(event_type: str, message_id: str = None, **kwargs):
    # Structured log without sensitive payloads
    print(f"EMAIL_EVENT {event_type} msg={message_id or '-'} {json.dumps(kwargs, default=str)[:200]}")


@router.post("/lark/webhook")
async def lark_webhook(request: Request):
    """
    Receives Lark mail events (mail.user_mailbox.event.message_received_v1).
    Verifies token/encryption, then enqueues processing.
    """
    raw = await request.body()
    try:
        body = json.loads(raw)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # URL verification
    if body.get("type") == "url_verification":
        return handle_url_verification(body)

    verification_token = os.getenv("LARK_VERIFICATION_TOKEN", "")
    encrypt_key = os.getenv("LARK_ENCRYPT_KEY", "")

    try:
        inner = verify_and_decrypt(body, verification_token, encrypt_key)
    except LarkAuthError as e:
        raise HTTPException(status_code=401, detail=f"Webhook verification failed: {e}")

    event = inner.get("event", {})
    header = inner.get("header", {})
    event_type = (
        header.get("event_type")
        or inner.get("event_type")
        or inner.get("type")
        or event.get("type")
    )
    _log_event(event_type)

    if event_type == "mail.user_mailbox.event.message_received_v1":
        # Official payload uses `mail_address`, not `mailbox`.
        message_id = event.get("message_id") or event.get("data", {}).get("message_id")
        mail_address = event.get("mail_address") or event.get("data", {}).get("mail_address")
        if message_id:
            await _fetch_and_process(message_id, mail_address)
        return {"code": 0, "msg": "success"}

    return {"code": 0, "msg": "event ignored"}


async def _fetch_and_process(message_id: str, mail_address: Optional[str]):
    """Fetches a Lark message and runs it through the processing pipeline."""
    try:
        provider = get_email_provider()
        if not hasattr(provider, "get_message"):
            _log_event("FETCH_SKIP", message_id, reason="provider_unsupported")
            return
        mailbox_id = mail_address or "me"
        msg = await provider.get_message(mailbox_id, message_id)
        sender = msg.get("from", {}).get("email") if isinstance(msg.get("from"), dict) else msg.get("from")
        recipients = [r.get("email") for r in msg.get("to", []) if isinstance(r, dict)]
        subject = msg.get("subject", "")
        body_text = msg.get("body_plain_text") or msg.get("body_html") or ""
        thread_id = msg.get("thread_id")
        await processor.process_inbound(
            provider_message_id=message_id,
            sender=sender,
            recipients=recipients,
            subject=subject,
            body_text=body_text,
            thread_id=thread_id,
        )
        _log_event("PROCESSED", message_id)
    except Exception as e:
        _log_event("PROCESS_FAILED", message_id, error=str(e)[:200])


@router.get("/status")
async def email_status():
    """Health/status endpoint for the email engine."""
    provider_name = os.getenv("EMAIL_PROVIDER", "zoho")
    return {
        "provider": provider_name,
        "auto_reply_enabled": os.getenv("AUTO_REPLY_ENABLED", "false").lower() == "true",
        "webhook_configured": bool(os.getenv("LARK_VERIFICATION_TOKEN")),
    }
