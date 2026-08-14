"""
Lark Open Platform authentication helper.

Verified endpoints against live Lark Open Platform as of 2026-08-14:

- Tenant access token: POST /open-apis/auth/v3/tenant_access_token/internal
- OAuth authorize:   GET  /open-apis/authen/v1/authorize
- OAuth token exchange: POST /open-apis/authen/v2/oauth/token
- OAuth token refresh:   POST /open-apis/authen/v2/oauth/token

Verified scope names:
  mail:user_mailbox.message:readonly   (list/get)
  mail:user_mailbox.message:send       (send/reply — requires user_access_token)
  mail:user_mailbox.event:subscribe    (webhook inbound events)
  mail:user_mailbox                   (modify/batch_modify)

Send API explicitly requires user_access_token, not tenant_access_token.
"""

import os
import time
import urllib.parse
import httpx
from typing import Optional, Tuple

from lark.exceptions import LarkAuthError, LarkRateLimitError

LARK_DOMAIN = os.getenv("LARK_DOMAIN", "https://open.larksuite.com")
TOKEN_ENDPOINT = f"{LARK_DOMAIN}/open-apis/auth/v3/tenant_access_token/internal"
USER_TOKEN_ENDPOINT = f"{LARK_DOMAIN}/open-apis/authen/v2/oauth/token"
USER_AUTH_URL = f"{LARK_DOMAIN}/open-apis/authen/v1/authorize"

REQUIRED_SCOPES = (
    "mail:user_mailbox.message:readonly "
    "mail:user_mailbox.message:send "
    "mail:event "
    "mail:user_mailbox.event.mail_address:read "
    "mail:user_mailbox"
)


class LarkAuth:
    def __init__(self):
        self.app_id = os.getenv("LARK_APP_ID")
        self.app_secret = os.getenv("LARK_APP_SECRET")
        if not self.app_id or not self.app_secret:
            raise LarkAuthError("LARK_APP_ID and LARK_APP_SECRET must be set in environment")

        self._tenant_token: Optional[str] = None
        self._tenant_token_exp: float = 0.0

        self.user_access_token = os.getenv("LARK_USER_ACCESS_TOKEN")
        self.refresh_token = os.getenv("LARK_REFRESH_TOKEN")
        self._user_token_exp: float = 0.0

    async def get_tenant_access_token(self) -> str:
        """Returns a valid tenant access token, fetching/refreshing as needed."""
        if self._tenant_token and time.time() < self._tenant_token_exp - 30:
            return self._tenant_token

        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                TOKEN_ENDPOINT,
                json={"app_id": self.app_id, "app_secret": self.app_secret},
            )
            data = resp.json()
            if data.get("code") != 0:
                raise LarkAuthError(f"Tenant token error: {data.get('msg')} ({data.get('code')})")
            self._tenant_token = data["tenant_access_token"]
            self._tenant_token_exp = time.time() + data.get("expire", 7200) - 60
            return self._tenant_token

    def build_oauth_url(self, redirect_uri: str, state: str = "hermes") -> str:
        """Builds the Lark OAuth authorization URL for user token consent."""
        scopes = REQUIRED_SCOPES.replace(" ", "%20")
        return (
            f"{USER_AUTH_URL}?app_id={self.app_id}"
            f"&redirect_uri={urllib.parse.quote(redirect_uri, safe='')}"
            f"&response_type=code&scope={scopes}"
            f"&state={state}"
        )

    async def exchange_code_for_token(self, code: str, redirect_uri: str) -> Tuple[str, str, int]:
        """Exchanges authorization code for user access + refresh tokens (v2 OAuth)."""
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                USER_TOKEN_ENDPOINT,
                json={
                    "grant_type": "authorization_code",
                    "client_id": self.app_id,
                    "client_secret": self.app_secret,
                    "code": code,
                    "redirect_uri": redirect_uri,
                },
            )
            data = resp.json()
            if data.get("code") != 0:
                raise LarkAuthError(f"User token exchange error: {data.get('msg')} ({data.get('code')})")
            # v2 returns token fields in data or at top level
            token_data = data.get("data", data)
            self.user_access_token = token_data["access_token"]
            self.refresh_token = token_data.get("refresh_token")
            self._user_token_exp = time.time() + token_data.get("expires_in", 7200) - 60
            return self.user_access_token, self.refresh_token, token_data.get("expires_in", 7200)

    async def refresh_user_token(self) -> str:
        """Refreshes the user access token using the stored refresh token (v2 OAuth)."""
        if not self.refresh_token:
            raise LarkAuthError("No refresh token available. Please re-authorize via OAuth.")
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                USER_TOKEN_ENDPOINT,
                json={
                    "grant_type": "refresh_token",
                    "client_id": self.app_id,
                    "client_secret": self.app_secret,
                    "refresh_token": self.refresh_token,
                },
            )
            data = resp.json()
            if data.get("code") != 0:
                raise LarkAuthError(f"User token refresh error: {data.get('msg')} ({data.get('code')})")
            token_data = data.get("data", data)
            self.user_access_token = token_data["access_token"]
            self.refresh_token = token_data.get("refresh_token", self.refresh_token)
            self._user_token_exp = time.time() + token_data.get("expires_in", 7200) - 60
            return self.user_access_token

    async def get_user_access_token(self) -> str:
        """Returns a valid user access token, refreshing if expired."""
        if self.user_access_token and time.time() < self._user_token_exp - 30:
            return self.user_access_token
        if self.refresh_token:
            return await self.refresh_user_token()
        raise LarkAuthError("User access token required for send operations but not available.")
