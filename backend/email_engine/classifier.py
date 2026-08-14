"""Classification and extraction service using schema-validated LLM output."""

import os
import json
from typing import Optional

from email_engine.models import (
    ClassificationResult,
    LeadExtraction,
    ProjectSupportExtraction,
    BillingExtraction,
    EmailCategory,
)
from lark.aliases import get_alias_info

CATEGORY_LIST = ", ".join([c.value for c in EmailCategory])

CLASSIFY_PROMPT = """You are an email classifier for a consultant's domain.
Given the recipient alias, sender, subject, and body, classify the email.

Recipient alias hint (signal only, NOT absolute rule):
{alias_hint}

Return ONLY valid JSON with this exact schema:
{{
  "category": one of [{cats}],
  "priority": "low"|"medium"|"high"|"critical",
  "confidence": float between 0 and 1,
  "requires_reply": boolean,
  "requires_human": boolean,
  "sentiment": "positive"|"neutral"|"negative",
  "summary": short summary string,
  "intent": short intent string,
  "entities": {{}},
  "recommended_action": "reply"|"acknowledge"|"human_review"|"none"
}}

Alias: {alias}
Sender: {sender}
Subject: {subject}
Body: {body}
"""

EXTRACT_PROMPT = """Extract structured information from this email as JSON.
Only populate fields supported by evidence. Use null for missing values.
Do not hallucinate.

If this is a lead/inquiry, return:
{{"type":"lead","data":{lead_schema}}}

If this is project/support, return:
{{"type":"project_support","data":{ps_schema}}}

If this is billing, return:
{{"type":"billing","data":{billing_schema}}}

Otherwise return {{"type":"none","data":{{}}}}

Subject: {subject}
Body: {body}
"""


class Classifier:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")

    async def classify(
        self, alias: str, sender: str, subject: str, body: str
    ) -> ClassificationResult:
        alias_info = get_alias_info(alias)
        alias_hint = alias_info.get("description", "Unknown alias")
        prompt = CLASSIFY_PROMPT.format(
            alias_hint=alias_hint,
            cats=CATEGORY_LIST,
            alias=alias,
            sender=sender,
            subject=subject,
            body=body[:4000],
        )
        raw = await self._llm_json(prompt)
        return ClassificationResult(**raw)

    async def extract(
        self, category: str, subject: str, body: str
    ):
        prompt = EXTRACT_PROMPT.format(
            lead_schema=LeadExtraction.model_json_schema(),
            ps_schema=ProjectSupportExtraction.model_json_schema(),
            billing_schema=BillingExtraction.model_json_schema(),
            subject=subject,
            body=body[:4000],
        )
        raw = await self._llm_json(prompt)
        t = raw.get("type")
        data = raw.get("data", {})
        if t == "lead":
            return LeadExtraction(**data)
        if t == "project_support":
            return ProjectSupportExtraction(**data)
        if t == "billing":
            return BillingExtraction(**data)
        return None

    async def _llm_json(self, prompt: str) -> dict:
        if not self.api_key:
            # Deterministic fallback when no LLM configured
            return {
                "category": "unknown",
                "priority": "medium",
                "confidence": 0.0,
                "requires_reply": False,
                "requires_human": True,
                "sentiment": "neutral",
                "summary": "",
                "intent": "",
                "entities": {},
                "recommended_action": "human_review",
            }
        try:
            import google.genai as genai
            client = genai.Client(api_key=self.api_key)
            resp = client.models.generate_content(
                model="gemini-2.5-flash", contents=prompt
            )
            text = resp.text.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            return json.loads(text)
        except Exception as e:
            # Fail safe to human review
            return {
                "category": "unknown",
                "priority": "medium",
                "confidence": 0.0,
                "requires_reply": False,
                "requires_human": True,
                "sentiment": "neutral",
                "summary": f"classification error: {e}",
                "intent": "",
                "entities": {},
                "recommended_action": "human_review",
            }
