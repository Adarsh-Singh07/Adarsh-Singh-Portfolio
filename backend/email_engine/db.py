"""
Database schema extensions for the email engine.

Reuses the existing PostgreSQL database. Adds new tables for email
processing, classification, leads, threads, and attachments. Idempotency is
enforced via unique provider_message_id.

Run `init_email_db()` at startup to create tables if missing.
"""

import os
import psycopg2
import psycopg2.extras

def get_db_connection():
    conn = psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode='require',
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn


def init_email_db():
    conn = get_db_connection()
    cur = conn.cursor()

    # Core email record
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS emails (
            id SERIAL PRIMARY KEY,
            provider_message_id TEXT UNIQUE NOT NULL,
            thread_id TEXT,
            provider TEXT DEFAULT 'lark',
            sender TEXT,
            recipients TEXT,
            subject TEXT,
            body_text TEXT,
            body_html TEXT,
            received_at TIMESTAMP,
            recipient_alias TEXT,
            classification_json TEXT,
            processing_status TEXT DEFAULT 'pending',
            reply_status TEXT DEFAULT 'not_sent',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Email threads for conversation awareness
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS email_threads (
            id SERIAL PRIMARY KEY,
            thread_id TEXT UNIQUE,
            provider TEXT DEFAULT 'lark',
            subject TEXT,
            participant_emails TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Classification results (redundant with JSON but indexed)
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS classifications (
            id SERIAL PRIMARY KEY,
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
            id SERIAL PRIMARY KEY,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Actions queued / taken on emails
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS email_actions (
            id SERIAL PRIMARY KEY,
            email_id INTEGER,
            action_type TEXT,
            status TEXT,
            detail TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )

    # Attachment metadata
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS email_attachments (
            id SERIAL PRIMARY KEY,
            email_id INTEGER,
            filename TEXT,
            mime_type TEXT,
            size INTEGER,
            provider_attachment_id TEXT,
            storage_location TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
