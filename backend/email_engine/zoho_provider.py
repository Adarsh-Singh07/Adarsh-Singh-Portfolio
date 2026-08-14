"""Factory and legacy Zoho provider that cleanly matches the EmailProvider ABC signature."""

import os
from typing import List, Dict, Any, Optional

from email_engine.base import EmailProvider
from lark.provider import LarkMailProvider
from lark.auth import LarkAuth


class ZohoProvider(EmailProvider):
    """
    Legacy provider wrapping the existing mail_helper send path.
    Kept available until live Lark testing passes (see migration plan).
    """

    def __init__(self):
        from mail_helper import send_outreach_email
        self._send_outreach = send_outreach_email

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
        self._send_outreach(to[0] if to else "", subject, body_html or body_text or "")
        return {"message_id": "zoho-legacy", "thread_id": None}

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
            to=to, subject=subject, body_text=body_text, body_html=body_html,
            from_email=from_email, cc=cc, bcc=bcc, attachments=attachments
        )

    async def get_message(self, user_mailbox_id: str, message_id: str) -> Dict[str, Any]:
        raise NotImplementedError("Zoho legacy provider does not support read")

    async def list_messages(
        self, user_mailbox_id: str, folder_id: Optional[str] = "INBOX",
        page_size: int = 20, page_token: Optional[str] = None,
        only_unread: Optional[bool] = None, label_id: Optional[str] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError("Zoho legacy provider does not support list")

    async def mark_read(self, user_mailbox_id: str, message_ids: List[str], is_read: bool = True) -> bool:
        return False

    async def move_message(self, user_mailbox_id: str, message_ids: List[str], target_folder_id: str) -> bool:
        return False

    async def get_attachment(self, user_mailbox_id: str, message_id: str, attachment_id: str) -> Dict[str, Any]:
        raise NotImplementedError("Not supported")


_PROVIDER_INSTANCE: Optional[EmailProvider] = None


def get_email_provider() -> EmailProvider:
    """Returns the configured email provider based on EMAIL_PROVIDER env."""
    global _PROVIDER_INSTANCE
    if _PROVIDER_INSTANCE is not None:
        return _PROVIDER_INSTANCE

    provider_name = os.getenv("EMAIL_PROVIDER", "zoho").lower()
    if provider_name == "lark":
        _PROVIDER_INSTANCE = LarkMailProvider(LarkAuth())
    else:
        _PROVIDER_INSTANCE = ZohoProvider()
    return _PROVIDER_INSTANCE
