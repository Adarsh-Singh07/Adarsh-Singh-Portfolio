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
                    received_at or time.strftime("%Y-%m-%dT%H:%M:%SZ"),
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

        if classification.requires_human or classification.category.value in HUMAN_REVIEW_CATEGORIES:
            return {"action": "human_review", "auto_send": False, "requires_human": True}

        if classification.confidence < 0.7:
            return {"action": "low_confidence_review", "auto_send": False, "requires_human": True}

        if classification.category.value in AUTO_REPLY_CATEGORIES:
            return {"action": "auto_reply", "auto_send": True, "requires_human": False}

        return {"action": "none", "auto_send": False, "requires_human": False}

    async def execute_reply(self, message_id: str, sender: str, subject: str, body_text: str, thread_id: Optional[str] = None):
        """Generates an AI reply using RAG context and sends it via LarkMailProvider."""
        import rag
        from google import genai
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("Cannot execute AI reply: GEMINI_API_KEY not set.")
            return False
            
        context = ""
        try:
            results = rag.retrieve_context(api_key, body_text, top_k=3)
            if results:
                context = "\n".join([r['text'] for r in results])
        except Exception as e:
            print(f"RAG retrieval failed during auto-reply: {e}")

        prompt = f"""You are Adarsh Singh's AI assistant. Draft a professional, friendly, and concise email reply to the following inquiry.
Use the provided knowledge base context to answer any questions if relevant. Do not make up facts.
If the context doesn't have the answer, politely state that Adarsh will review this personally soon.

Context:
{context}

Original Email Subject: {subject}
Original Email Body:
{body_text}

Draft the reply text only. No subject line. Sign off as "Adarsh's AI Assistant".
"""
        
        try:
            client = genai.Client(api_key=api_key)
            resp = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            reply_text = resp.text.strip()
            
            provider = get_email_provider()
            await provider.reply_to_message(
                message_id=message_id,
                to=[sender],
                body_text=reply_text,
                body_html=f"<p>{reply_text.replace(chr(10), '<br>')}</p>",
                thread_id=thread_id
            )
            print(f"Auto-reply sent successfully for message {message_id}")
            
            # Update status in DB
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

