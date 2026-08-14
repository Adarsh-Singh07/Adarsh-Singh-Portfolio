"""Lark Mail API alias routing configuration."""

from enum import Enum
from typing import Dict, List


class AliasPurpose(str, Enum):
    GENERAL = "general_business"
    CONTACT = "portfolio_contact"
    WORK = "freelance_client"
    PROJECTS = "project_communication"
    SUPPORT = "support_maintenance"
    BILLING = "billing_invoices"
    NOREPLY = "automated_outgoing"


ALIAS_CONFIG: Dict[str, Dict[str, str]] = {
    "hello@adarshsingh.in": {
        "purpose": AliasPurpose.GENERAL,
        "hint_category": "general",
        "description": "General business communication, partnerships, opportunities",
    },
    "contact@adarshsingh.in": {
        "purpose": AliasPurpose.CONTACT,
        "hint_category": "lead",
        "description": "Portfolio contact form and general website enquiries",
    },
    "work@adarshsingh.in": {
        "purpose": AliasPurpose.WORK,
        "hint_category": "freelance_lead",
        "description": "Freelance / client work: web dev, AI integration, migrations",
    },
    "projects@adarshsingh.in": {
        "purpose": AliasPurpose.PROJECTS,
        "hint_category": "project",
        "description": "Existing project discussion, requirements, deliverables",
    },
    "support@adarshsingh.in": {
        "purpose": AliasPurpose.SUPPORT,
        "hint_category": "support",
        "description": "Client support, bugs, maintenance, post-launch issues",
    },
    "billing@adarshsingh.in": {
        "purpose": AliasPurpose.BILLING,
        "hint_category": "billing",
        "description": "Invoices, payments, quotes, billing questions",
    },
    "noreply@adarshsingh.in": {
        "purpose": AliasPurpose.NOREPLY,
        "hint_category": "automated",
        "description": "Automated outgoing mail only; never auto-reply to inbound",
    },
}

NO_AUTO_REPLY_ALIASES: List[str] = ["noreply@adarshsingh.in"]


def get_alias_info(alias: str) -> Dict[str, str]:
    return ALIAS_CONFIG.get(alias.lower(), {})


def is_auto_reply_allowed(alias: str) -> bool:
    return alias.lower() not in NO_AUTO_REPLY_ALIASES


def all_aliases() -> List[str]:
    return list(ALIAS_CONFIG.keys())
