import os
import aiohttp
import json
import time
import asyncio
from datetime import datetime
from typing import Optional
from pathlib import Path
import db
from mail_helper import send_outreach_email, send_ai_reply_email

# Simple local dedupe cache to avoid duplicate side effects
import hashlib as _hashlib
_DEDUP_PATH = '/tmp/.portfolio_whatsapp_dedup.json'


def _load_dedup() -> dict:
    try:
        return json.loads(Path(_DEDUP_PATH).read_text())
    except Exception:
        return {}


def _save_dedup(data: dict):
    try:
        Path(_DEDUP_PATH).write_text(json.dumps(data, indent=2))
    except Exception:
        pass


def _wa_key(number: str, text: str) -> str:
    payload = f"{number}||{text}".encode()
    return _hashlib.md5(payload).hexdigest()


def _wa_allowed(number: str, text: str, ttl: int = 600) -> bool:
    key = _wa_key(number, text)
    data = _load_dedup()
    seen = data.get(key)
    now = int(time.time())
    if seen and now - int(seen) < ttl:
        return False
    data[key] = str(now)
    _save_dedup(data)
    return True


def _strip_reply_prefix(subject: str) -> str:
    """Remove stacked 'Re:' / 'Re: Re:' prefixes for clean display."""
    if not subject:
        return subject or ""
    import re as _re
    return _re.sub(r"(?i)^(re:\s*)+", "", subject.strip())


# Per-action status tracking for connection requests
CONNECTION_ACTIONS = [
    "visitor_acknowledgement",
    "admin_notification",
    "ai_reply",
    "whatsapp_notification",
]


def _record_action_status(contact_id: int, action_type: str, status: str, detail: str = ""):
    """Record a single action status in email_actions for auditability."""
    try:
        db.save_email_action(
            contact_id=contact_id,
            action_type=action_type,
            status=status,
            detail=detail,
        )
    except Exception as e:
        print(f"Error recording action status {action_type}: {e}")


async def handle_connection_request(
    name: str,
    email: str,
    subject: str,
    message: str,
    source: str = "Contact Form",
    intent_category: str = "General Outreach",
    visitor_ack: bool = True,
    ai_reply_enabled: bool = True,
):
    """
    Unified service for handling all inbound connection requests.
    1. Persists the lead to SQLite.
    2. Sends Admin Notification + Visitor Auto-Reply via Lark Mail.
    3. Generates and sends AI reply to visitor via Lark Mail.
    4. Sends WhatsApp Notification to Adarsh via Hermes WhatsApp Gateway.
    5. Records status of each action independently.
    """
    contact_id = None
    admin_sent = False
    visitor_sent = False
    ai_sent = False
    whatsapp_sent = False
    ai_error_detail = ""

    # 1. Save to SQLite Database
    try:
        contact_id = db.save_contact_message(
            name=name,
            email=email,
            subject=subject,
            message=f"[{source}] {message}",
            intent_category=intent_category,
        )
    except Exception as e:
        print(f"Error saving lead to DB: {e}")

    # 2. Admin Notification + 3. Visitor Acknowledgement via Lark Mail
    try:
        admin_sent, visitor_sent = await send_outreach_email(
            name, email, subject, message, intent_category, visitor_ack=visitor_ack
        )
    except Exception as e:
        print(f"Error dispatching Lark emails: {e}")

    if contact_id:
        _record_action_status(
            contact_id, "admin_notification", "sent" if admin_sent else "failed"
        )
        _record_action_status(
            contact_id, "visitor_acknowledgement", "sent" if visitor_sent else "failed"
        )

    # 4. AI-generated visitor reply via Lark Mail
    if ai_reply_enabled:
        try:
            ai_sent = await send_ai_reply_email(
                name=name,
                visitor_email=email,
                subject=subject,
                message=message,
                source=source,
                contact_id=contact_id,
            )
        except Exception as e:
            ai_error_detail = str(e)
            print(f"Error sending AI reply email: {e}")
            if contact_id:
                _record_action_status(
                    contact_id, "ai_reply", "failed", detail=ai_error_detail[:250]
                )
    else:
        if contact_id:
            _record_action_status(contact_id, "ai_reply", "skipped", detail="AI reply disabled")

    # 5. WhatsApp Notification via Hermes Gateway
    whatsapp_number = os.getenv("WHATSAPP_ADMIN_NUMBER")
    if whatsapp_number:
        if not whatsapp_number.endswith("@s.whatsapp.net"):
            clean_number = "".join(filter(str.isdigit, whatsapp_number))
            whatsapp_number = f"{clean_number}@s.whatsapp.net"

        clean_subject = _strip_reply_prefix(subject)
        wa_lines = [
            "📩 New message via portfolio",
            f"Source: {source}",
            f"Name: {name}",
            f"Email: {email}",
            f"Subject: {clean_subject}",
            "",
            f"Message: {message[:280]}",
            "",
            f"✅ Visitor email: {'sent' if visitor_sent else 'failed'}",
            f"✅ Admin alert: {'sent' if admin_sent else 'failed'}",
            f"🤖 AI reply: {'sent' if ai_sent else 'failed'}",
        ]
        if ai_error_detail:
            wa_lines.append(f"⚠️ AI reply error: {ai_error_detail[:120]}")
        wa_text = "\n".join(wa_lines)

        try:
            allowed = _wa_allowed(whatsapp_number, wa_text)
            print(f"WhatsApp dedup allow={allowed} for {whatsapp_number}")
            if allowed:
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.post(
                            "http://127.0.0.1:3000/send",
                            json={"chatId": whatsapp_number, "message": wa_text},
                            timeout=aiohttp.ClientTimeout(total=10),
                        ) as resp:
                            if resp.status != 200:
                                print(f"Failed to send WhatsApp via Hermes: HTTP {resp.status}")
                                whatsapp_sent = False
                            else:
                                print(f"WhatsApp notification sent to {whatsapp_number}")
                                whatsapp_sent = True
                except Exception as e:
                    print(f"aiohttp WhatsApp failed ({e}), trying sync fallback...")
                    try:
                        import requests as _requests
                        resp = _requests.post(
                            "http://127.0.0.1:3000/send",
                            json={"chatId": whatsapp_number, "message": wa_text},
                            timeout=10,
                        )
                        if resp.status_code == 200:
                            print(f"WhatsApp notification sent (sync fallback) to {whatsapp_number}")
                            whatsapp_sent = True
                        else:
                            print(f"Sync WhatsApp fallback failed: HTTP {resp.status_code}")
                    except Exception as fallback_err:
                        print(f"Sync WhatsApp fallback also failed: {fallback_err}")
            else:
                print(f"Skipping duplicate WhatsApp send to {whatsapp_number}")
                whatsapp_sent = False
        except Exception as e:
            print(f"Hermes WhatsApp gateway error: {e}")
            whatsapp_sent = False
    else:
        print("WHATSAPP_ADMIN_NUMBER not set. Skipping WhatsApp notification.")

    if contact_id:
        _record_action_status(
            contact_id, "whatsapp_notification", "sent" if whatsapp_sent else "failed"
        )

    return {
        "contact_id": contact_id,
        "admin_sent": admin_sent,
        "visitor_sent": visitor_sent,
        "ai_sent": ai_sent,
        "whatsapp_sent": whatsapp_sent,
    }
