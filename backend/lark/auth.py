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
import json
import time
import urllib.parse
import httpx
import asyncio
from typing import Optional, Tuple
from pathlib import Path

from lark.exceptions import LarkAuthError, LarkRateLimitError

LARK_DOMAIN = os.getenv("LARK_DOMAIN", "https://open.larksuite.com")
TOKEN_ENDPOINT = f"{LARK_DOMAIN}/open-apis/auth/v3/tenant_access_token/internal"
USER_TOKEN_ENDPOINT = f"{LARK_DOMAIN}/open-apis/authen/v2/oauth/token"
USER_AUTH_URL = f"{LARK_DOMAIN}/open-apis/authen/v1/authorize"

# Ensure data directory exists
DATA_DIR = Path(os.getenv("DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")))
DATA_DIR.mkdir(parents=True, exist_ok=True)

TOKENS_FILE = DATA_DIR / "lark_tokens.json"
LOCK_DIR = DATA_DIR / "lark_tokens.lock"

REQUIRED_SCOPES = (
    "mail:user_mailbox.message:readonly "
    "mail:user_mailbox.message:send "
    "mail:event "
    "mail:user_mailbox.event.mail_address:read "
    "mail:user_mailbox "
    "offline_access"
)


class LarkAuth:
    def __init__(self):
        self.app_id = os.getenv("LARK_APP_ID")
        self.app_secret = os.getenv("LARK_APP_SECRET")
        if not self.app_id or not self.app_secret:
            raise LarkAuthError("LARK_APP_ID and LARK_APP_SECRET must be set in environment")

        self._tenant_token: Optional[str] = None
        self._tenant_token_exp: float = 0.0

    async def _acquire_lock(self, timeout=10):
        """Acquires a simple directory-based lock for atomic token refresh concurrency protection."""
        start = time.time()
        while True:
            try:
                LOCK_DIR.mkdir(exist_ok=False)
                return True
            except FileExistsError:
                if time.time() - start > timeout:
                    # Break lock if stale (older than timeout)
                    if LOCK_DIR.exists() and time.time() - LOCK_DIR.stat().st_mtime > timeout:
                        try:
                            LOCK_DIR.rmdir()
                        except Exception:
                            pass
                    else:
                        raise LarkAuthError("Timeout waiting for token lock")
                await asyncio.sleep(0.1)

    def _release_lock(self):
        """Releases the directory-based lock."""
        try:
            LOCK_DIR.rmdir()
        except Exception:
            pass

    def _load_tokens(self) -> dict:
        """Loads tokens from the JSON persistent store."""
        if TOKENS_FILE.exists():
            try:
                with open(TOKENS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}

    def _save_tokens(self, access_token: str, refresh_token: str, expires_in: int):
        """Atomically saves tokens to the persistent JSON store."""
        data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": time.time() + expires_in - 60,
            "updated_at": time.time()
        }
        temp_file = TOKENS_FILE.with_suffix(".tmp")
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(data, f)
        temp_file.replace(TOKENS_FILE)

    def get_persisted_user_access_token(self) -> Optional[str]:
        """Returns the valid user access token if it exists and hasn't expired."""
        data = self._load_tokens()
        if data and time.time() < data.get("expires_at", 0):
            return data.get("access_token")
        
        # Fallback to env ONLY if no file exists to allow bootstrap migrations
        if not TOKENS_FILE.exists():
            return os.getenv("LARK_USER_ACCESS_TOKEN")
        return None

    def get_persisted_refresh_token(self) -> Optional[str]:
        """Returns the current refresh token."""
        data = self._load_tokens()
        if data and data.get("refresh_token"):
            return data.get("refresh_token")
            
        if not TOKENS_FILE.exists():
            return os.getenv("LARK_REFRESH_TOKEN")
        return None

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
            
            token_data = data.get("data", data)
            acc_token = token_data["access_token"]
            ref_token = token_data.get("refresh_token")
            exp = token_data.get("expires_in", 7200)
            
            await self._acquire_lock()
            try:
                self._save_tokens(acc_token, ref_token, exp)
            finally:
                self._release_lock()
                
            return acc_token, ref_token, exp

    async def refresh_user_token(self, force: bool = False) -> str:
        """Refreshes the user access token safely handling locks. If force=True, bypasses expiry check."""
        await self._acquire_lock()
        try:
            # Re-read to ensure another concurrent request didn't just refresh it while we were waiting for lock
            current_acc = self.get_persisted_user_access_token()
            if current_acc and not force:
                return current_acc
                
            refresh_token = self.get_persisted_refresh_token()
            if not refresh_token:
                raise LarkAuthError("No refresh token available. Please re-authorize via OAuth.")
                
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.post(
                    USER_TOKEN_ENDPOINT,
                    json={
                        "grant_type": "refresh_token",
                        "client_id": self.app_id,
                        "client_secret": self.app_secret,
                        "refresh_token": refresh_token,
                    },
                )
                data = resp.json()
                if data.get("code") != 0:
                    raise LarkAuthError(f"User token refresh error: {data.get('msg')} ({data.get('code')})")
                
                token_data = data.get("data", data)
                acc_token = token_data["access_token"]
                new_ref_token = token_data.get("refresh_token", refresh_token)
                exp = token_data.get("expires_in", 7200)
                
                self._save_tokens(acc_token, new_ref_token, exp)
                return acc_token
        finally:
            self._release_lock()

    async def get_user_access_token(self) -> str:
        """Returns a valid user access token, refreshing securely if expired."""
        acc_token = self.get_persisted_user_access_token()
        if acc_token:
            return acc_token
        
        # Token expired or missing, attempt safe refresh
        return await self.refresh_user_token()
