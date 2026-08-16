"""
FastAPI router for Lark Mail webhooks and email management endpoints.

Wires the EmailProvider abstraction, classification, and processing pipeline
into the existing portfolio backend without altering existing functionality.
"""

import os
import json
import time
import base64
import binascii
import re
from pathlib import Path
from typing import Dict, Any, Optional

import httpx
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel

from lark.webhook_security import verify_and_decrypt, handle_url_verification
from lark.exceptions import LarkAuthError
from email_engine.processor import EmailProcessor
from email_engine.provider_factory import get_email_provider

router = APIRouter(prefix="/api/v1/portfolio/email", tags=["email"])

processor = EmailProcessor()

import hashlib as _hashlib
from datetime import datetime as _dt
_WA_DEDUP_PATH = '/tmp/.portfolio_wa_dedup.json'

_REPLY_DEDUP_PATH = '/tmp/.portfolio_reply_dedup.json'


def _load_reply_dedup() -> dict:
    try:
        return json.loads(Path(_REPLY_DEDUP_PATH).read_text())
    except Exception:
        return {}


def _save_reply_dedup(data: dict):
    try:
        Path(_REPLY_DEDUP_PATH).write_text(json.dumps(data, indent=2))
    except Exception:
        pass


def _mark_reply_sent(key: str, ttl: int = 1800):
    data = _load_reply_dedup()
    data[key] = str(int(time.time()))
    _save_reply_dedup(data)


def _already_replied(key: str, ttl: int = 1800) -> bool:
    data = _load_reply_dedup()
    seen = data.get(key)
    if not seen:
        return False
    try:
        return int(time.time()) - int(seen) < ttl
    except Exception:
        return False


def _is_recursion_subject(subject: str) -> bool:
    s = (subject or '').strip()
    return s.lower().startswith('re: re:')



def _load_wa_dedup() -> dict:
    try:
        return json.loads(Path(_WA_DEDUP_PATH).read_text())
    except Exception:
        return {}


def _save_wa_dedup(data: dict):
    try:
        Path(_WA_DEDUP_PATH).write_text(json.dumps(data, indent=2))
    except Exception:
        pass


def _try_b64_decode(value: Optional[str]) -> Optional[str]:
    if not value or not isinstance(value, str):
        return value
    try:
        cleaned = value.strip().replace(" ", "").replace("\n", "").replace("\r", "")
        if len(cleaned) % 4 != 0:
            cleaned += "=" * (4 - len(cleaned) % 4)
        decoded = base64.b64decode(cleaned, validate=True).decode("utf-8")
        if any(ord(char) < 9 or 13 < ord(char) < 32 for char in decoded):
            return value
        return decoded
    except (binascii.Error, UnicodeDecodeError, ValueError):
        return value



def _reply_key(message_id: str, sender: str, subject: str) -> str:
    payload = f"reply||{message_id}||{sender}||{subject}".encode()
    return _hashlib.md5(payload).hexdigest()


def _strip_reply_prefix(subject: str) -> str:
    """Remove stacked 'Re:' / 'Re: Re:' prefixes for clean display."""
    if not subject:
        return subject or ""
    import re as _re
    return _re.sub(r"(?i)^(re:\s*)+", "", subject.strip())


_SCHEDULING_PATTERNS = (
    r"\b(schedule|reschedule|meeting|appointment|calendar|availability)\b",
    r"\b(book|set up|setup|arrange)\b.{0,30}\b(call|meeting|interview|demo)\b",
    r"\b(call|meet|chat)\b.{0,30}\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
    r"\b(available|free)\b.{0,30}\b(at|on|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
)


def _requires_scheduling_approval(subject: str, body_text: str) -> bool:
    """Return True when replying could commit Adarsh to a time or meeting."""
    content = f"{subject or ''}\n{body_text or ''}".lower()
    return any(re.search(pattern, content, flags=re.IGNORECASE | re.DOTALL) for pattern in _SCHEDULING_PATTERNS)


def _allow_reply_once(message_id: str, sender: str, subject: str, ttl: int = 1800) -> bool:
    key = _reply_key(message_id, sender, subject)
    data = _load_wa_dedup()
    now = int(time.time())
    seen = data.get(key)
    if seen and now - int(seen) < ttl:
        return False
    data[key] = str(now)
    _save_wa_dedup(data)
    return True



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
    _log_event("FETCH", message_id, provider="lark")
    try:
        from lark.provider import LarkMailProvider
        from lark.auth import LarkAuth
        
        provider = LarkMailProvider(LarkAuth())
        mailbox_id = "me"
        raw_msg = await provider.get_message(mailbox_id, message_id)
        msg = raw_msg.get("message", raw_msg) if isinstance(raw_msg, dict) else {}
        
        head_from = msg.get("head_from", {})
        sender = head_from.get("mail_address") if isinstance(head_from, dict) else head_from
        if not sender and isinstance(msg.get("from"), dict):
            sender = (msg.get("from") or {}).get("mail_address") or (msg.get("from") or {}).get("email")
            
        recipients = []
        for r in msg.get("to", []):
            if isinstance(r, dict):
                recipients.append(r.get("mail_address") or r.get("email") or "")
            else:
                recipients.append(str(r))
                
        subject = msg.get("subject", "")
        body_text = msg.get("body_plain_text") or msg.get("body_html") or ""
        thread_id = msg.get("thread_id")
        
        # Ignore our own replies to avoid recursion/loops.
        # This includes: our auto-replies, admin notifications we sent ourselves,
        # and any message from our own email identities.
        own_senders = {
            "contact@adarshsingh.in",
            "support@adarshsingh.in",
            "admin@adarshsingh.in",
            "adarsh@adarshsingh.in",
        }
        own_subjects = {
            "[Portfolio Outreach]",
            "[Portfolio]",
            "New Portfolio Inquiry",
        }
        normalized_sender = (sender or "").lower()
        normalized_subject = (subject or "").strip()
        is_own_sender = normalized_sender in own_senders
        is_own_notification = any(ns.lower() in normalized_subject.lower() for ns in own_subjects)
        if is_own_sender or is_own_notification:
            _log_event("PROCESS_IGNORED_OWN", message_id, sender=normalized_sender, subject=normalized_subject)
            return {"code": 0, "msg": "ignored own sender or auto-notification"}

        result = await processor.process_inbound(
            provider_message_id=message_id,
            sender=sender,
            recipients=recipients,
            subject=subject,
            body_text=body_text,
            thread_id=thread_id,
        )

        decision = result.get("reply_decision", {})
        approval_required = _requires_scheduling_approval(
            subject, _try_b64_decode(body_text) or body_text
        )
        auto_send = bool(decision.get("auto_send")) and not approval_required
        reply_sent = False
        reply_key = _reply_key(message_id, sender or "", subject)
        if auto_send and not _already_replied(reply_key):
            reply_sent = await processor.execute_reply(
                message_id=message_id,
                sender=sender or "",
                subject=subject,
                body_text=_try_b64_decode(body_text) or body_text,
                thread_id=thread_id,
            )
            if reply_sent:
                _mark_reply_sent(reply_key)
                _log_event("REPLY_SENT", message_id, sender=sender)
            else:
                _log_event("REPLY_FAILED", message_id, sender=sender)
        elif auto_send:
            _log_event("REPLY_DEDUP_SKIP", message_id, sender=sender)

        # Only notify admin via WhatsApp for genuine inbound emails.
        # Skip auto-replies, mailing list bounces, and own-sender messages.
        is_bounce = subject.lower().startswith("undelivered") or "bounce" in subject.lower()
        if not is_bounce:
            await _notify_admin_inbound_email(
                sender=sender,
                subject=subject,
                body_text=body_text,
                message_id=message_id,
                ai_sent=reply_sent,
                approval_required=approval_required,
            )
            
        _log_event("PROCESSED", message_id, provider="lark")
        return {"status": "processed", "reply_sent": reply_sent}
    except Exception as e:
        _log_event("PROCESS_FAILED", message_id, provider="lark", error=str(e)[:200])
        raise


async def _notify_admin_inbound_email(
    sender: Optional[str],
    subject: str,
    body_text: str,
    message_id: str,
    ai_sent: bool,
    approval_required: bool = False,
):
    """Sends a WhatsApp notification to admin for meaningful inbound emails."""
    whatsapp_number = os.getenv("WHATSAPP_ADMIN_NUMBER")
    if not whatsapp_number:
        return
    if not whatsapp_number.endswith("@s.whatsapp.net"):
        clean_number = "".join(filter(str.isdigit, whatsapp_number))
        whatsapp_number = f"{clean_number}@s.whatsapp.net"

    sender_display = sender or "unknown"
    raw_body = body_text or ""
    decoded_body = _try_b64_decode(raw_body) or raw_body
    # Use the first readable, non-empty line as the snippet.
    snippet = ""
    for line in decoded_body.splitlines():
        line = line.strip()
        if line:
            snippet = line[:160]
            break
    clean_subject = _strip_reply_prefix(subject)
    wa_lines = [
        "📩 New email received",
        f"From: {sender_display}",
        f"Subject: {clean_subject}",
        "",
        f"Snippet: {snippet}",
        "",
        f"🤖 AI reply: {'sent ✅' if ai_sent else 'held for your approval' if approval_required else 'not sent'}",
    ]
    if approval_required:
        wa_lines.extend([
            "",
            "⚠️ Scheduling approval required",
            "Reply with the time/availability you approve before I answer this email.",
        ])
    else:
        wa_lines.append("Check Lark Mail for the full conversation.")
    wa_text = "\n".join(wa_lines)

    key = _reply_key(message_id, sender or "", subject)
    if not _allow_reply_once(message_id, sender or "", subject):
        _log_event("WHATSAPP_DEDUP_SKIP", message_id)
        return

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                "http://127.0.0.1:3000/send",
                json={"chatId": whatsapp_number, "message": wa_text},
            )
            if resp.status_code == 200:
                _log_event("WHATSAPP_SENT", message_id)
                print(f"WhatsApp notification sent to {whatsapp_number}")
            else:
                _log_event("WHATSAPP_FAILED", message_id, http_status=resp.status_code)
                _log_event("WHATSAPP_FAILED_TEXT", message_id, text=wa_text[:300])
    except Exception as e:
        _log_event("WHATSAPP_FAILED", message_id, error=str(e)[:200])
        print(f"WhatsApp send failed: {e}")


@router.get("/status")
async def email_status():
    """Health/status endpoint for the email engine."""
    provider_name = os.getenv("EMAIL_PROVIDER", "lark")
    return {
        "provider": provider_name,
        "auto_reply_enabled": os.getenv("AUTO_REPLY_ENABLED", "false").lower() == "true",
        "webhook_configured": bool(os.getenv("LARK_VERIFICATION_TOKEN")),
    }


@router.get("/lark/oauth/login")
async def lark_oauth_login():
    """Generates the OAuth authorization URL for manual user consent."""
    from lark.auth import LarkAuth
    auth = LarkAuth()
    url = auth.build_oauth_url(redirect_uri="https://api.adarshsingh.in/api/v1/portfolio/email/lark/oauth/callback")
    return {"url": url}


@router.get("/lark/oauth/callback")
async def lark_oauth_callback(code: str, state: str = None):
    """Exchanges the OAuth code for tokens and persists them securely."""
    from lark.auth import LarkAuth
    auth = LarkAuth()
    try:
        acc_token, ref_token, exp = await auth.exchange_code_for_token(
            code, redirect_uri="https://api.adarshsingh.in/api/v1/portfolio/email/lark/oauth/callback"
        )
        data = auth._load_tokens()
        return {
            "status": "success",
            "msg": "Tokens exchanged and stored securely in lockfile.",
            "access_token_prefix": acc_token[:18] if acc_token else None,
            "refresh_token_prefix": ref_token[:18] if ref_token else None,
            "expires_at": data.get("expires_at"),
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"OAuth exchange failed: {e}")
