#!/usr/bin/env python3
"""
Live Lark Mail probe (requires real env vars).

Reads LARK_APP_ID / LARK_APP_SECRET / LARK_USER_ACCESS_TOKEN /
LARK_REFRESH_TOKEN / LARK_VERIFICATION_TOKEN / LARK_ENCRYPT_KEY from env.

Tests:
 1. tenant token acquisition
 2. list mailboxes/messages scope check
 3. send payload shape (dry-run via permission denial if no user token)
 4. event subscription endpoint reachability

Never prints raw secrets. Exits nonzero on failure.
"""

import os
import sys
import json
import urllib.request
import urllib.error


def die(msg):
    print(f"[FAIL] {msg}")
    sys.exit(1)


def info(msg):
    print(f"[INFO] {msg}")


def env(name):
    v = os.getenv(name)
    if not v:
        die(f"Missing env: {name}")
    return v


def post(url, payload, headers=None):
    data = json.dumps(payload).encode("utf-8")
    h = {"Content-Type": "application/json; charset=utf-8"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body


def get(url, headers=None):
    h = {}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, headers=h, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status, json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, body


def main():
    app_id = env("LARK_APP_ID")
    app_secret = env("LARK_APP_SECRET")
    domain = os.getenv("LARK_DOMAIN", "https://open.larksuite.com")

    # 1) tenant token
    info("Requesting tenant_access_token...")
    code, data = post(
        f"{domain}/open-apis/auth/v3/tenant_access_token/internal",
        {"app_id": app_id, "app_secret": app_secret},
    )
    if code != 200 or data.get("code") != 0:
        die(f"Tenant token failed: {data}")
    tenant = data["tenant_access_token"]
    info(f"Tenant token OK (expires in {data.get('expire')}s)")

    # 2) read/list scope probe
    info("Probing read scope (list messages)...")
    code2, data2 = get(
        f"{domain}/open-apis/mail/v1/user_mailboxes/me/messages?page_size=1",
        headers={"Authorization": f"Bearer {tenant}"},
    )
    if code2 == 403:
        msg = data2.get("msg", "")
        if "mail:user_mailbox.message:readonly" in msg:
            die("Missing scope: mail:user_mailbox.message:readonly. Enable it in Lark app console, then retry.")
        die(f"Read permission denied: {data2}")
    elif code2 == 404:
        # Some plans return 404 for /me; acceptable fallback — don't hard-fail
        info("Read endpoint returned 404 for /me; mailbox may require explicit address or plan support.")
    elif code2 == 200:
        info("Read scope OK.")
    else:
        info(f"Read probe returned {code2}: {data2}")

    # 3) send scope probe (will 403 without user token)
    info("Probing send scope (requires user_access_token)...")
    code3, data3 = post(
        f"{domain}/open-apis/mail/v1/user_mailboxes/me/messages/send",
        {"to": [{"mailbox": "test@example.com"}], "subject": "probe"},
        headers={"Authorization": f"Bearer {tenant}"},
    )
    if code3 == 403:
        msg = data3.get("msg", "")
        if "permission deny" in msg or "mail:user_mailbox.message:send" in msg:
            info("Send correctly requires user_access_token / mail:user_mailbox.message:send scope.")
        else:
            die(f"Send permission denied unexpectedly: {data3}")
    elif code3 == 200:
        info("Send probe succeeded with tenant token? Unexpected but OK.")
    else:
        info(f"Send probe returned {code3}: {data3}")

    # 4) event subscription reachability (user token required for subscribe)
    user_token = os.getenv("LARK_USER_ACCESS_TOKEN")
    if user_token:
        info("Probing event subscription endpoint with user_access_token...")
        code4, data4 = post(
            f"{domain}/open-apis/mail/v1/user_mailboxes/me/event/subscribe",
            {"event_type": 1},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        if code4 == 403:
            msg = data4.get("msg", "")
            if "mail:user_mailbox.event" in msg or "No Permission" in msg:
                die(f"Missing event subscription scope: {data4}")
            die(f"Event subscribe permission denied: {data4}")
        elif code4 == 200:
            info("Event subscription probe OK.")
        else:
            info(f"Event subscribe returned {code4}: {data4}")
    else:
        info("LARK_USER_ACCESS_TOKEN not set; skipping event subscription probe.")

    info("Probe complete. Enable the noted scopes and set LARK_USER_ACCESS_TOKEN, then re-run.")


if __name__ == "__main__":
    main()
