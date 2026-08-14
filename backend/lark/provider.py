"""Lark Mail provider implementation."""

import base64
import json
import httpx
from typing import List, Dict, Any, Optional

from lark.auth import LarkAuth
from lark.exceptions import (
    LarkAuthError,
    LarkRateLimitError,
    LarkMailboxNotFoundError,
    LarkPermissionError,
    LarkError,
)
from email_engine.base import EmailProvider

LARK_DOMAIN = "https://open.larksuite.com"
MAIL_BASE = f"{LARK_DOMAIN}/open-apis/mail/v1/user_mailboxes"


class LarkMailProvider(EmailProvider):
    """
    EmailProvider implementation backed by the Lark Open Platform Mail API.

    Read/list/mark/move operations use the tenant_access_token.
    Send/reply operations require a user_access_token (per Lark docs).
    """

    def __init__(self, auth: Optional[LarkAuth] = None):
        self.auth = auth or LarkAuth()

    # ----- internal helpers -----
    async def _request(self, method: str, url: str, token: str, json_body: Optional[dict] = None) -> dict:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=utf-8",
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.request(method, url, headers=headers, json=json_body)
            if resp.status_code == 429:
                raise LarkRateLimitError("Lark rate limit exceeded")
            try:
                data = resp.json()
            except Exception:
                raise LarkError(f"Invalid JSON response: {resp.text[:200]}")
            if data.get("code") != 0:
                code = data.get("code")
                msg = data.get("msg")
                if code == 1234013:
                    raise LarkMailboxNotFoundError(msg)
                if code == 1234017 or code == 1230002:
                    raise LarkPermissionError(msg)
                raise LarkError(msg, code)
            return data

    # ----- EmailProvider interface -----
    async def send_message(
        self,
        to: List[str],
        subject: str,
        body_text: Optional[str] = None,
        body_html: Optional[str] = None,
        from_email: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        reply_to: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
        dedupe_key: Optional[str] = None,
    ) -> Dict[str, Any]:
        user_token = await self.auth.get_user_access_token()
        mailbox = from_email or "me"
        payload: Dict[str, Any] = {
            "to": [{"mailbox": t} for t in to],
            "subject": subject,
        }
        if body_text:
            payload["body_plain_text"] = body_text
        if body_html:
            payload["body_html"] = body_html
        if cc:
            payload["cc"] = [{"mailbox": c} for c in cc]
        if bcc:
            payload["bcc"] = [{"mailbox": b} for b in bcc]
        if from_email:
            payload["head_from"] = {"mailbox": from_email, "name": "Adarsh Singh"}
        if reply_to:
            payload["reply_to"] = [{"mailbox": reply_to}]
        if attachments:
            payload["attachments"] = attachments
        if dedupe_key:
            payload["dedupe_key"] = dedupe_key

        url = f"{MAIL_BASE}/{mailbox}/messages/send"
        data = await self._request("POST", url, user_token, payload)
        return {
            "message_id": data["data"]["message_id"],
            "thread_id": data["data"].get("thread_id"),
        }

    async def reply_to_message(
        self,
        message_id: str,
        thread_id: Optional[str],
        to: List[str],
        subject: str,
        body_text: Optional[str] = None,
        body_html: Optional[str] = None,
        from_email: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        # Lark reply uses send with same thread context (In-Reply-To handled by thread_id)
        return await self.send_message(
            to=to,
            subject=subject,
            body_text=body_text,
            body_html=body_html,
            from_email=from_email,
            cc=cc,
            bcc=bcc,
            attachments=attachments,
            dedupe_key=f"reply-{message_id}",
        )

    async def get_message(self, user_mailbox_id: str, message_id: str) -> Dict[str, Any]:
        tenant_token = await self.auth.get_tenant_access_token()
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/{message_id}"
        data = await self._request("GET", url, tenant_token)
        return data["data"]

    async def list_messages(
        self,
        user_mailbox_id: str,
        folder_id: Optional[str] = "INBOX",
        page_size: int = 20,
        page_token: Optional[str] = None,
        only_unread: Optional[bool] = None,
        label_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        tenant_token = await self.auth.get_tenant_access_token()
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages"
        params = {"page_size": page_size, "folder_id": folder_id}
        if page_token:
            params["page_token"] = page_token
        if only_unread is not None:
            params["only_unread"] = str(only_unread).lower()
        if label_id:
            params["label_id"] = label_id
        # GET with query params
        async with httpx.AsyncClient(timeout=30) as client:
            headers = {"Authorization": f"Bearer {tenant_token}"}
            resp = await client.get(url, headers=headers, params=params)
            if resp.status_code == 429:
                raise LarkRateLimitError("Rate limit")
            data = resp.json()
            if data.get("code") != 0:
                raise LarkError(data.get("msg"), data.get("code"))
            return data["data"]

    async def mark_read(self, user_mailbox_id: str, message_ids: List[str], is_read: bool = True) -> bool:
        tenant_token = await self.auth.get_tenant_access_token()
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/batch_modify"
        # Verified schema uses label ids; UNREAD label controls read/unread state.
        label_ids = [] if is_read else ["UNREAD"]
        payload = {
            "message_ids": message_ids,
            "add_label_ids": label_ids,
            "remove_label_ids": ["UNREAD"] if is_read else [],
        }
        await self._request("POST", url, tenant_token, payload)
        return True

    async def move_message(self, user_mailbox_id: str, message_ids: List[str], target_folder_id: str) -> bool:
        tenant_token = await self.auth.get_tenant_access_token()
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/batch_modify"
        payload = {
            "message_ids": message_ids,
            "add_folder": target_folder_id,
        }
        await self._request("POST", url, tenant_token, payload)
        return True

    async def get_attachment(self, user_mailbox_id: str, message_id: str, attachment_id: str) -> Dict[str, Any]:
        tenant_token = await self.auth.get_tenant_access_token()
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/{message_id}/attachments/{attachment_id}/download_url"
        data = await self._request("GET", url, tenant_token)
        return data["data"]
