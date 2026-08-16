"""Timezone-aware timestamp helpers.

All human-facing and stored timestamps in the portfolio backend use Asia/Kolkata
(IST, UTC+5:30) so logs, emails, and records match Adarsh's local time.
"""
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))


def now_ist() -> datetime:
    """Return the current time as an aware datetime in Asia/Kolkata."""
    return datetime.now(IST)


def now_ist_iso() -> str:
    """Return the current IST time in ISO 8601 with the +05:30 offset."""
    return now_ist().isoformat()


def now_ist_human(fmt: str = "%B %d, %Y at %I:%M %p IST") -> str:
    """Return a human-readable IST timestamp for emails/notifications."""
    return now_ist().strftime(fmt)
