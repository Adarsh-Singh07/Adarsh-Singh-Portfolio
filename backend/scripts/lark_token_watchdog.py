#!/usr/bin/env python3
"""
Lark Mail token watchdog.

Runs on a schedule (Hermes cron every 30 minutes). It:
1. Loads the canonical user token from data/lark_tokens.json (single source of truth).
2. If the access token has fewer than 35 minutes remaining, triggers a proactive refresh.
3. On any refresh failure / expiry / missing token, sends a single WhatsApp
   renewal link to the admin and exits with a non-zero code so the failure is visible.

This is independent of the in-process token_lifecycle_loop: if the web service is
down, this cron still protects the token. It is intentionally self-contained and
uses only the backend venv (httpx, dotenv).

No token values are printed. Only prefixes / metadata are logged.
"""

import os
import sys
import time
import json
from pathlib import Path

# Backend directory (where lark/ package, .env, and data/lark_tokens.json live).
_BACKEND_DIR = Path(os.getenv("PORTFOLIO_BACKEND_DIR", "/home/ubuntu/portfolio/backend")).resolve()
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

try:
    from dotenv import load_dotenv
    load_dotenv(_BACKEND_DIR / ".env")
except Exception:
    pass

import httpx

# Refresh when less than this remains. User asked for 35 minutes.
REFRESH_THRESHOLD_SECONDS = 35 * 60

# WhatsApp bridge contract: POST {"chatId": "...", "message": "..."}
WHATSAPP_BRIDGE_URL = os.getenv("WHATSAPP_BRIDGE_URL", "http://127.0.0.1:3000/send")

OAUTH_LOGIN_PATH = "/api/v1/portfolio/email/lark/oauth/login"
LOCAL_STATUS_URL = "http://127.0.0.1:8000/api/v1/portfolio/email/lark/oauth/login"

# Dedupe file: avoid spamming WhatsApp on every failed tick.
_ALERT_DEDUP_PATH = Path(os.getenv("DATA_DIR", _BACKEND_DIR / "data")) / ".lark_token_alert.json"
_ALERT_DEDUP_TTL = 6 * 3600  # at most one alert per 6 hours per failure class


def _load_tokens() -> dict:
    data_dir = Path(os.getenv("DATA_DIR", _BACKEND_DIR / "data"))
    path = data_dir / "lark_tokens.json"
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except Exception:
        return {}


def _already_alerted(kind: str) -> bool:
    try:
        data = json.loads(_ALERT_DEDUP_PATH.read_text())
        seen = data.get(kind)
        if seen and (time.time() - float(seen)) < _ALERT_DEDUP_TTL:
            return True
    except Exception:
        pass
    return False


def _mark_alerted(kind: str):
    data = {}
    try:
        data = json.loads(_ALERT_DEDUP_PATH.read_text())
    except Exception:
        pass
    data[kind] = time.time()
    try:
        _ALERT_DEDUP_PATH.write_text(json.dumps(data))
    except Exception:
        pass


def _normalize_wa_number(raw: str) -> str:
    if not raw:
        return ""
    if raw.endswith("@s.whatsapp.net"):
        return raw
    digits = "".join(ch for ch in raw if ch.isdigit())
    return f"{digits}@s.whatsapp.net"


def _send_whatsapp_link(reason: str) -> bool:
    number = _normalize_wa_number(os.getenv("WHATSAPP_ADMIN_NUMBER", ""))
    if not number:
        print("WATCHDOG_ALERT_SKIP: WHATSAPP_ADMIN_NUMBER not set")
        return False

    # Prefer the live login endpoint if the service is up; fall back to the
    # relative path so the admin can open it on the proper domain.
    login_url = LOCAL_STATUS_URL
    try:
        r = httpx.get("http://127.0.0.1:8000/api/v1/portfolio/email/status", timeout=5)
        if r.status_code == 200:
            login_url = "https://api.adarshsingh.in/api/v1/portfolio/email/lark/oauth/login"
    except Exception:
        pass

    text = (
        "⚠️ Lark Mail auth needs renewal\n"
        f"Reason: {reason}\n"
        "Open this link to re-authorize (takes 10 seconds):\n"
        f"{login_url}\n"
        "After approval, tokens refresh automatically. No code needed."
    )

    try:
        resp = httpx.post(
            WHATSAPP_BRIDGE_URL,
            json={"chatId": number, "message": text},
            timeout=10,
        )
        if resp.status_code == 200:
            print("WATCHDOG_WHATSAPP_SENT")
            return True
        print(f"WATCHDOG_WHATSAPP_FAILED http={resp.status_code}")
        return False
    except Exception as e:
        print(f"WATCHDOG_WHATSAPP_ERROR {type(e).__name__}: {e}")
        return False


def main() -> int:
    # Late import so env is loaded first.
    from lark.auth import LarkAuth

    tokens = _load_tokens()
    if not tokens.get("refresh_token"):
        if not _already_alerted("missing"):
            _send_whatsapp_link("No Lark refresh token present (not authorized).")
            _mark_alerted("missing")
        print("WATCHDOG_FAIL: missing refresh token")
        return 1

    remaining = tokens.get("expires_at", 0) - time.time()
    print(f"WATCHDOG_TOKEN remaining={remaining:.0f}s threshold={REFRESH_THRESHOLD_SECONDS}s")

    if remaining > REFRESH_THRESHOLD_SECONDS:
        print("WATCHDOG_OK: token healthy, no refresh needed")
        return 0

    # Under threshold -> attempt refresh.
    print("WATCHDOG_REFRESH_NEEDED")
    try:
        auth = LarkAuth()
        new_token = auth.get_user_access_token()  # self-heals via proactive refresh
        if not new_token:
            raise RuntimeError("empty token after refresh")
        # Clear any prior alert so future real failures re-alert.
        try:
            p = _ALERT_DEDUP_PATH
            if p.exists():
                p.unlink()
        except Exception:
            pass
        print("WATCHDOG_REFRESH_OK")
        return 0
    except Exception as e:
        reason = f"{type(e).__name__}: {e}"
        if not _already_alerted("refresh_failed"):
            _send_whatsapp_link(reason)
            _mark_alerted("refresh_failed")
        print(f"WATCHDOG_FAIL: {reason}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
