#!/usr/bin/env python3
"""
Lark OAuth helper (v2) for obtaining a user access token.

Usage:
  python scripts/lark_oauth.py --app-id cli_... --app-secret ... --redirect-uri https://... [--code ...]
"""

import argparse
import sys
import os

try:
    import requests
except ImportError:
    sys.exit("requests is required: pip install requests")

LARK_DOMAIN = os.getenv("LARK_DOMAIN", "https://open.larksuite.com")
AUTH_URL = f"{LARK_DOMAIN}/open-apis/authen/v1/authorize"
TOKEN_URL = f"{LARK_DOMAIN}/open-apis/authen/v2/oauth/token"
SCOPES = (
    "mail:user_mailbox.message:readonly "
    "mail:user_mailbox.message:send "
    "mail:event "
    "mail:user_mailbox.event.mail_address:read "
    "mail:user_mailbox"
)


def main():
    p = argparse.ArgumentParser(description="Lark OAuth v2 token helper")
    p.add_argument("--app-id", default=os.getenv("LARK_APP_ID"))
    p.add_argument("--app-secret", default=os.getenv("LARK_APP_SECRET"))
    p.add_argument("--redirect-uri", default=os.getenv("LARK_REDIRECT_URI"))
    p.add_argument("--code", help="Authorization code from redirect")
    args = p.parse_args()

    if not args.app_id or not args.app_secret or not args.redirect_uri:
        sys.exit("LARK_APP_ID, LARK_APP_SECRET, and LARK_REDIRECT_URI are required.")

    if not args.code:
        url = (
            f"{AUTH_URL}?app_id={args.app_id}"
            f"&redirect_uri={args.redirect_uri}"
            f"&response_type=code&scope={SCOPES.replace(' ', '%20')}"
            f"&state=hermes"
        )
        print("\nOpen this authorization URL in a browser:\n")
        print(url)
        print("\nRe-run with: python scripts/lark_oauth.py --code YOUR_AUTH_CODE\n")
        return

    resp = requests.post(
        TOKEN_URL,
        json={
            "grant_type": "authorization_code",
            "client_id": args.app_id,
            "client_secret": args.app_secret,
            "code": args.code,
            "redirect_uri": args.redirect_uri,
        },
        timeout=10,
    )
    data = resp.json()
    if data.get("code") != 0:
        sys.exit(f"Exchange error: {data.get('msg')} ({data.get('code')})")

    tdata = data.get("data", data)
    print("\n=== SUCCESS: COPY INTO .env ===")
    print(f"LARK_USER_ACCESS_TOKEN={tdata['access_token']}")
    if tdata.get("refresh_token"):
        print(f"LARK_REFRESH_TOKEN={tdata['refresh_token']}")
    print(f"# expires_in: {tdata.get('expires_in')}s")
    print("===============================\n")


if __name__ == "__main__":
    main()
