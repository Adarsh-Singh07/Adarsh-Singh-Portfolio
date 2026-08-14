"""
Database schema extensions for the email engine.

Reuses the existing portfolio.db (SQLite). Adds new tables for email
processing, classification, leads, threads, and attachments. Idempotency is
enforced via unique provider_message_id.

Run `init_email_db()` at startup to create tables if missing.
"""

import os
import sqlite3

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DB_PATH = os.path.join(DATA_DIR, "portfolio.db")


def get_db_connection():
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute("PRAGMA journal_mode=MEMORY")
        conn.execute("PRAGMA synchronous=OFF")
    except Exception:
        pass
    return conn


def init_email_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Core email record
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS emails (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_message_id TEXT UNIQUE NOT NULL,
            thread_id TEXT,
            provider TEXT DEFAULT 'lark',
            sender TEXT,
            recipients TEXT,
            subject TEXT,
            body_text TEXT,
            body_html TEXT,
            received_at TEXT,
            recipient_alias TEXT,
            classification_json TEXT,
            processing_status TEXT DEFAULT 'pending',
            reply_status TEXT DEFAULT 'not_sent',
            created_at TEXT DEFAULT (datetime('now'))
        )
        """
    )

    # Email threads for conversation awareness
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS email_threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id TEXT UNIQUE,
            provider TEXT DEFAULT 'lark',
            subject TEXT,
            participant_emails TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
        """
    )

    # Classification results (redundant with JSON but indexed)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS classifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id INTEGER,
            category TEXT,
            priority TEXT,
            confidence REAL,
            requires_reply INTEGER,
            requires_human INTEGER,
            sentiment TEXT,
            summary TEXT,
            recommended_action TEXT,
            FOREIGN KEY (email_id) REFERENCES emails(id)
        )
        """
    )

    # Leads extracted from emails / contact forms
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id INTEGER,
            name TEXT,
            company TEXT,
            email TEXT,
            phone TEXT,
            website TEXT,
            project_type TEXT,
            budget TEXT,
            timeline TEXT,
            requirements TEXT,
            location TEXT,
            lead_source TEXT,
            urgency TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
        """
    )

    # Actions queued / taken on emails
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS email_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id INTEGER,
            action_type TEXT,
            status TEXT,
            detail TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
        """
    )

    # Attachment metadata
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS email_attachments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email_id INTEGER,
            filename TEXT,
            mime_type TEXT,
            size INTEGER,
            provider_attachment_id TEXT,
            storage_location TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        )
        """
    )

    # Indexes for common query patterns
    cur.execute("CREATE INDEX IF NOT EXISTS idx_email_thread ON emails(thread_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_email_sender ON emails(sender)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_email_alias ON emails(recipient_alias)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_email_received ON emails(received_at)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_email_class ON emails(classification_json)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_email_status ON emails(processing_status)")

    conn.commit()
    conn.close()
