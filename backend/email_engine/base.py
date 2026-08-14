from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class EmailProvider(ABC):
    """
    Abstract base class for email providers.
    Ensures provider-agnostic integration across Hermes and portfolio.
    """

    @abstractmethod
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
        dedupe_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """Sends an email message. Returns dict with message_id and thread_id."""
        pass

    @abstractmethod
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
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Replies to an existing message/thread."""
        pass

    @abstractmethod
    async def get_message(self, user_mailbox_id: str, message_id: str) -> Dict[str, Any]:
        """Retrieves full email message details by provider message ID."""
        pass

    @abstractmethod
    async def list_messages(
        self,
        user_mailbox_id: str,
        folder_id: Optional[str] = "INBOX",
        page_size: int = 20,
        page_token: Optional[str] = None,
        only_unread: Optional[bool] = None,
        label_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Lists mail messages in a user mailbox."""
        pass

    @abstractmethod
    async def mark_read(self, user_mailbox_id: str, message_ids: List[str], is_read: bool = True) -> bool:
        """Marks messages as read or unread."""
        pass

    @abstractmethod
    async def move_message(self, user_mailbox_id: str, message_ids: List[str], target_folder_id: str) -> bool:
        """Moves messages to a specified folder."""
        pass

    @abstractmethod
    async def get_attachment(self, user_mailbox_id: str, message_id: str, attachment_id: str) -> Dict[str, Any]:
        """Retrieves attachment download link or binary metadata."""
        pass
