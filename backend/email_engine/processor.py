"""Email processing pipeline with idempotency, classification, extraction, and reply policy."""

import os
import json
import time
import sqlite3
from typing import Optional, Dict, Any, List

from email_engine.models import ClassificationResult, EmailRecord
from email_engine.classifier import Classifier
from email_engine.provider_factory import get_email_provider
from lark.aliases import get_alias_info, is_auto_reply_allowed, NO_AUTO_REPLY_ALIASES, all_aliases
from timezone_ist import now_ist_iso

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "portfolio.db")

AUTO_REPLY_ENABLED = os.getenv("AUTO_REPLY_ENABLED", "false").lower() == "true"

# Categories that may be auto-replied when confidence is high
AUTO_REPLY_CATEGORIES = {
    "lead", "freelance_lead", "support", "general", "project"
}
HUMAN_REVIEW_CATEGORIES = {
    "billing", "invoice", "partnership", "job_opportunity", "existing_client"
}


class EmailProcessor:
    def __init__(self):
        self.classifier = Classifier()

    def _conn(self):
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn

    def already_processed(self, provider_message_id: str) -> bool:
        conn = self._conn()
        try:
            row = conn.execute(
                "SELECT 1 FROM emails WHERE provider_message_id = ?", (provider_message_id,)
            ).fetchone()
            return row is not None
        finally:
            conn.close()

    async def process_inbound(
        self,
        provider_message_id: str,
        sender: str,
        recipients: List[str],
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        thread_id: Optional[str] = None,
        received_at: Optional[str] = None,
    ) -> Dict[str, Any]:
        # Idempotency guard
        if self.already_processed(provider_message_id):
            return {"status": "duplicate", "message_id": provider_message_id}

        # Determine recipient alias (first matching domain alias)
        alias = next((r for r in recipients if r.lower() in [a.lower() for a in all_aliases()]), None)
        alias_info = get_alias_info(alias) if alias else {}

        classification = await self.classifier.classify(
            alias or "unknown", sender, subject, body_text
        )
        extraction = await self.classifier.extract(
            classification.category.value, subject, body_text
        )

        # Persist
        conn = self._conn()
        try:
            conn.execute(
                """INSERT INTO emails 
                (provider_message_id, thread_id, provider, sender, recipients, subject, 
                 body_text, body_html, received_at, recipient_alias, classification_json, 
                 processing_status, reply_status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    provider_message_id,
                    thread_id,
                    "lark",
                    sender,
                    json.dumps(recipients),
                    subject,
                    body_text,
                    body_html,
                    received_at or now_ist_iso(),
                    alias,
                    classification.model_dump_json(),
                    "processed",
                    "pending",
                ),
            )
            conn.commit()
        finally:
            conn.close()

        # Decide on reply
        decision = self.decide_reply(alias or "", classification)
        return {
            "status": "processed",
            "classification": classification.model_dump(),
            "extraction": extraction.model_dump() if extraction else None,
            "reply_decision": decision,
        }

    def decide_reply(self, alias: str, classification: ClassificationResult) -> Dict[str, Any]:
        """Returns the reply policy decision for a classified email."""
        if not AUTO_REPLY_ENABLED:
            return {"action": "disabled", "auto_send": False, "requires_human": True}

        if alias.lower() in [a.lower() for a in NO_AUTO_REPLY_ALIASES]:
            return {"action": "blocked_noreply_alias", "auto_send": False, "requires_human": True}

        # Send AI reply for all other received mail when enabled.
        return {"action": "auto_reply", "auto_send": True, "requires_human": False}

    async def execute_reply(self, message_id: str, sender: str, subject: str, body_text: str, thread_id: Optional[str] = None):
        """Generates an AI reply using the same multi-key/model fallback as the chatbot, then sends it."""
        try:
            import ai_reply

            reply_text = await ai_reply.generate_reply(
                name="Adarsh",
                message=body_text,
                source="Inbound Email",
                extra_context="",
            )

            provider = get_email_provider()
            clean_subject = subject.strip()
            if not clean_subject.lower().startswith("re:"):
                clean_subject = f"Re: {clean_subject}"

            send_result = await provider.reply_to_message(
                message_id=message_id,
                thread_id=thread_id,
                to=[sender],
                subject=clean_subject,
                body_text=reply_text,
                body_html=f"<p>{reply_text.replace(chr(10), '<br>')}</p>",
            )
            print(f"Auto-reply sent successfully for message {message_id}: {send_result}")

            conn = self._conn()
            try:
                conn.execute(
                    "UPDATE emails SET reply_status = 'replied' WHERE provider_message_id = ?",
                    (message_id,)
                )
                conn.commit()
            finally:
                conn.close()

            return True
        except Exception as e:
            print(f"Failed to execute AI reply: {e}")
            return False

