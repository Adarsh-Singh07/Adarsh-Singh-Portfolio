"""Email engine models: classification, extraction, email records."""

from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class EmailCategory(str, Enum):
    GENERAL = "general"
    LEAD = "lead"
    FREELANCE_LEAD = "freelance_lead"
    EXISTING_CLIENT = "existing_client"
    SUPPORT = "support"
    PROJECT = "project"
    BILLING = "billing"
    INVOICE = "invoice"
    PARTNERSHIP = "partnership"
    JOB_OPPORTUNITY = "job_opportunity"
    NEWSLETTER = "newsletter"
    NOTIFICATION = "notification"
    SPAM = "spam"
    PERSONAL = "personal"
    AUTOMATED = "automated"
    UNKNOWN = "unknown"


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Sentiment(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class ClassificationResult(BaseModel):
    category: EmailCategory
    priority: Priority = Priority.MEDIUM
    confidence: float = Field(0.0, ge=0.0, le=1.0)
    requires_reply: bool = False
    requires_human: bool = False
    sentiment: Sentiment = Sentiment.NEUTRAL
    summary: str = ""
    intent: str = ""
    entities: Dict[str, Any] = Field(default_factory=dict)
    recommended_action: str = "none"


class LeadExtraction(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    project_type: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    lead_source: Optional[str] = None
    urgency: Optional[str] = None


class ProjectSupportExtraction(BaseModel):
    client: Optional[str] = None
    project: Optional[str] = None
    issue: Optional[str] = None
    severity: Optional[str] = None
    deadline: Optional[str] = None
    requested_action: Optional[str] = None


class BillingExtraction(BaseModel):
    client: Optional[str] = None
    invoice_number: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    due_date: Optional[str] = None
    payment_status: Optional[str] = None


class EmailRecord(BaseModel):
    provider_message_id: str
    thread_id: Optional[str] = None
    provider: str = "lark"
    sender: Optional[str] = None
    recipients: List[str] = Field(default_factory=list)
    subject: Optional[str] = None
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    received_at: Optional[str] = None
    recipient_alias: Optional[str] = None
    classification: Optional[ClassificationResult] = None
    processing_status: str = "pending"
    reply_status: str = "not_sent"
