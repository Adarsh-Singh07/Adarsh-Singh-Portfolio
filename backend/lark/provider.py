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

class LarkCapabilityNotSupported(Exception):
    """Raised when a requested feature is not supported by the official Lark Mail API."""
    pass

class LarkMailProvider(EmailProvider):
    """
    EmailProvider implementation backed by the Lark Open Platform Mail API.

    Read/list/mark/move operations use the tenant_access_token.
    Send/reply operations require a user_access_token (per Lark docs).
    """

    def __init__(self, auth: Optional[LarkAuth] = None):
        self.auth = auth or LarkAuth()

    async def subscribe_to_mail_events(self, user_mailbox_id: str = "me") -> bool:
        """Subscribes the authorized user to mail events using their user_access_token."""
        url = f"{MAIL_BASE}/{user_mailbox_id}/event/subscribe"
        payload = {"event_type": 1} # 1 = message_received_v1
        try:
            await self._request("POST", url, "user", payload)
            return True
        except Exception as e:
            # If already subscribed or error, we log but it's fine.
            print(f"EMAIL_EVENT SUBSCRIBE result: {e}")
            return False

    async def _request(self, method: str, url: str, token_type: str = "tenant", json_body: Optional[dict] = None, _retry: bool = True) -> dict:
        if token_type == "user":
            token = await self.auth.get_user_access_token()
        else:
            token = await self.auth.get_tenant_access_token()
            
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
                # 99991663 and 99991668 are token invalid/expired codes
                if _retry and (code in (99991663, 99991668, 20064) or "token" in msg.lower() or "auth" in msg.lower()):
                    if token_type == "user":
                        await self.auth.refresh_user_token(force=True)
                    else:
                        self.auth._tenant_token = None # Force tenant refresh
                    return await self._request(method, url, token_type, json_body, _retry=False)
                
                if code == 1234013:
                    raise LarkMailboxNotFoundError(msg)
                if code == 1234017 or code == 1230002:
                    raise LarkPermissionError(msg)
                raise LarkError(msg, code)
            return data

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
        thread_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        mailbox = from_email or "me"
        payload: Dict[str, Any] = {
            "to": [{"mail_address": t} for t in to],
            "subject": subject,
        }
        if body_text:
            payload["body_plain_text"] = body_text
        if body_html:
            payload["body_html"] = body_html
        if cc:
            payload["cc"] = [{"mail_address": c} for c in cc]
        if bcc:
            payload["bcc"] = [{"mail_address": b} for b in bcc]
        if from_email:
            payload["head_from"] = {"mail_address": from_email, "name": "Adarsh Singh"}
        if reply_to:
            payload["reply_to"] = [{"mail_address": reply_to}]
        if attachments:
            payload["attachments"] = attachments
        if dedupe_key:
            payload["dedupe_key"] = dedupe_key
        if thread_id:
            payload["thread_id"] = thread_id

        url = f"{MAIL_BASE}/{mailbox}/messages/send"
        data = await self._request("POST", url, "user", payload)
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
            thread_id=thread_id,
        )

    async def get_message(self, user_mailbox_id: str, message_id: str) -> Dict[str, Any]:
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/{message_id}"
        data = await self._request("GET", url, "user")
        return data["data"]

    async def get_thread(self, user_mailbox_id: str, thread_id: str) -> Dict[str, Any]:
        raise LarkCapabilityNotSupported("Lark Mail API does not natively support fetching a thread by ID via a single endpoint.")

    async def search_messages(self, user_mailbox_id: str, query: str) -> Dict[str, Any]:
        raise LarkCapabilityNotSupported("Lark Mail API does not natively support search queries on messages.")

    async def list_messages(
        self,
        user_mailbox_id: str,
        folder_id: Optional[str] = "INBOX",
        page_size: int = 20,
        page_token: Optional[str] = None,
        only_unread: Optional[bool] = None,
        label_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages"
        
        query_parts = [f"page_size={page_size}"]
        if folder_id:
            query_parts.append(f"folder_id={folder_id}")
        if page_token:
            query_parts.append(f"page_token={page_token}")
        if only_unread is not None:
            query_parts.append(f"only_unread={str(only_unread).lower()}")
        if label_id:
            query_parts.append(f"label_id={label_id}")
            
        full_url = url + "?" + "&".join(query_parts)
        
        data = await self._request("GET", full_url, "tenant")
        return data["data"]

    async def mark_read(self, user_mailbox_id: str, message_ids: List[str], is_read: bool = True) -> bool:
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/batch_modify"
        label_ids = [] if is_read else ["UNREAD"]
        payload = {
            "message_ids": message_ids,
            "add_label_ids": label_ids,
            "remove_label_ids": ["UNREAD"] if is_read else [],
        }
        await self._request("POST", url, "tenant", payload)
        return True
        
    async def mark_unread(self, user_mailbox_id: str, message_ids: List[str]) -> bool:
        return await self.mark_read(user_mailbox_id, message_ids, is_read=False)

    async def move_message(self, user_mailbox_id: str, message_ids: List[str], target_folder_id: str) -> bool:
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/batch_modify"
        payload = {
            "message_ids": message_ids,
            "add_folder": target_folder_id,
        }
        await self._request("POST", url, "tenant", payload)
        return True

    async def archive_message(self, user_mailbox_id: str, message_ids: List[str]) -> bool:
        raise LarkCapabilityNotSupported("Explicit Archive operation not safely mapped without knowing exact Lark system folder IDs.")
        
    async def delete_message(self, user_mailbox_id: str, message_ids: List[str]) -> bool:
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/batch_modify"
        payload = {
            "message_ids": message_ids,
            "add_label_ids": ["TRASH"],
        }
        await self._request("POST", url, "tenant", payload)
        return True

    async def get_attachment(self, user_mailbox_id: str, message_id: str, attachment_id: str) -> Dict[str, Any]:
        url = f"{MAIL_BASE}/{user_mailbox_id}/messages/{message_id}/attachments/{attachment_id}/download_url"
        data = await self._request("GET", url, "tenant")
        return data["data"]
        
    async def download_attachment(self, user_mailbox_id: str, message_id: str, attachment_id: str) -> bytes:
        data = await self.get_attachment(user_mailbox_id, message_id, attachment_id)
        download_url = data.get("download_url")
        if not download_url:
            raise LarkError("No download URL returned by Lark")
            
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(download_url)
            resp.raise_for_status()
            return resp.content
