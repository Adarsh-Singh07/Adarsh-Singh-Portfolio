import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from timezone_ist import now_ist, now_ist_iso, now_ist_human, IST


def test_now_ist_is_aware_and_ist_offset():
    dt = now_ist()
    assert dt.tzinfo is not None
    assert dt.utcoffset() == IST.utcoffset(None)


def test_now_ist_iso_has_offset_suffix():
    iso = now_ist_iso()
    assert "+05:30" in iso


def test_human_format_includes_ist():
    human = now_ist_human()
    assert "IST" in human


def test_ist_is_five_thirty_ahead_of_utc():
    from datetime import datetime, timezone
    utc_now = datetime.now(timezone.utc)
    ist_now = now_ist()
    # IST is a fixed UTC+5:30 offset.
    assert ist_now.utcoffset().total_seconds() == 5 * 3600 + 30 * 60
    # The corresponding UTC instants are equivalent.
    assert abs((ist_now - utc_now).total_seconds()) < 2
