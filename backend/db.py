import os
import psycopg2
import psycopg2.extras
import json
from datetime import datetime
import hashlib

from timezone_ist import now_ist_iso

def get_db_connection():
    """Returns a PostgreSQL connection object with dict cursor enabled."""
    conn = psycopg2.connect(
        os.getenv("DATABASE_URL"),
        sslmode='require',
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn

def init_db():
    """Initializes database tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. RAG Chunks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rag_chunks (
        id SERIAL PRIMARY KEY,
        source_file TEXT NOT NULL,
        chunk_title TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding_json TEXT NOT NULL
    )
    """)
    
    # 2. Chat Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        created_at TIMESTAMP NOT NULL,
        role_mode TEXT NOT NULL
    )
    """)
    
    # 3. Chat Messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        retrieved_chunks_json TEXT,
        prompt_template TEXT,
        latency_ms INTEGER,
        tokens_input INTEGER,
        tokens_output INTEGER,
        cost_est REAL,
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    )
    """)
    
    # 4. Visitor Feedback table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS visitor_feedback (
        id SERIAL PRIMARY KEY,
        message_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP NOT NULL,
        FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
    )
    """)
    
    # 5. Contact Messages table (outreach leads)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        intent_category TEXT
    )
    """)
    
    # 6. Unanswered Questions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS unanswered_questions (
        id SERIAL PRIMARY KEY,
        session_id TEXT,
        question TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        resolved INTEGER DEFAULT 0
    )
    """)

    # 7. File Backups Table (Audit & Version History for profile.json, cv.txt, cv.pdf)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS file_backups (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        content_text TEXT,
        content_blob BYTEA,
        file_hash TEXT NOT NULL,
        source TEXT DEFAULT 'system',
        created_at TIMESTAMP NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()
    print("PostgreSQL Database initialized successfully.")

# --- HELPER FUNCTIONS ---

def save_chat_session(session_id: str, role_mode: str):
    """Saves a new chat session if it does not already exist."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO chat_sessions (id, created_at, role_mode) VALUES (%s, %s, %s) ON CONFLICT (id) DO NOTHING",
            (session_id, now_ist_iso(), role_mode)
        )
        conn.commit()
    except Exception as e:
        print(f"Error saving chat session: {e}")
    finally:
        conn.close()

def save_chat_message(
    msg_id: str,
    session_id: str,
    role: str,
    content: str,
    retrieved_chunks: list = None,
    prompt_template: str = None,
    latency_ms: int = 0,
    tokens_input: int = 0,
    tokens_output: int = 0,
    cost_est: float = 0.0
):
    """Saves a chat message with its operational metadata."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        chunks_json = json.dumps(retrieved_chunks) if retrieved_chunks else None
        cursor.execute(
            """
            INSERT INTO chat_messages (
                id, session_id, role, content, created_at, 
                retrieved_chunks_json, prompt_template, latency_ms, 
                tokens_input, tokens_output, cost_est
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                msg_id, session_id, role, content, now_ist_iso(),
                chunks_json, prompt_template, latency_ms,
                tokens_input, tokens_output, cost_est
            )
        )
        conn.commit()
    except Exception as e:
        print(f"Error saving chat message: {e}")
    finally:
        conn.close()

def save_feedback(message_id: str, rating: int, comment: str = None):
    """Saves thumbs feedback for a message."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM visitor_feedback WHERE message_id = %s", (message_id,))
        row = cursor.fetchone()
        
        if row:
            cursor.execute(
                "UPDATE visitor_feedback SET rating = %s, comment = %s, created_at = %s WHERE message_id = %s",
                (rating, comment, now_ist_iso(), message_id)
            )
        else:
            cursor.execute(
                "INSERT INTO visitor_feedback (message_id, rating, comment, created_at) VALUES (%s, %s, %s, %s)",
                (message_id, rating, comment, now_ist_iso())
            )
        conn.commit()
    except Exception as e:
        print(f"Error saving visitor feedback: {e}")
    finally:
        conn.close()

def save_contact_message(name: str, email: str, subject: str, message: str, intent_category: str = "General Outreach"):
    """Saves outreach message and its AI-determined intent category."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO contact_messages (name, email, subject, message, created_at, intent_category)
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
            """,
            (name, email, subject, message, now_ist_iso(), intent_category),
        )
        conn.commit()
        return cursor.fetchone()['id']
    except Exception as e:
        print(f"Error saving contact message to DB: {e}")
        return None
    finally:
        conn.close()

def save_unanswered_question(session_id: str, question: str):
    """Saves a question that the chatbot was unable to answer."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO unanswered_questions (session_id, question, created_at, resolved)
            VALUES (%s, %s, %s, 0)
            """,
            (session_id, question, now_ist_iso())
        )
        conn.commit()
    except Exception as e:
        print(f"Error saving unanswered question: {e}")
    finally:
        conn.close()

def resolve_unanswered_question(question_id: int):
    """Marks a previously unanswered question as resolved."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE unanswered_questions SET resolved = 1 WHERE id = %s",
            (question_id,)
        )
        conn.commit()
    except Exception as e:
        print(f"Error resolving unanswered question: {e}")
    finally:
        conn.close()

def save_file_backup(filename: str, content: str | bytes, source: str = "system"):
    """
    Saves a versioned backup snapshot of profile.json, cv.txt, or cv.pdf to PostgreSQL.
    Skips insertion if the latest backup for filename has the exact same SHA-256 hash.
    """
    conn = get_db_connection()
    try:
        if isinstance(content, str):
            content_bytes = content.encode('utf-8')
            is_text = True
        else:
            content_bytes = content
            is_text = False
            
        file_hash = hashlib.sha256(content_bytes).hexdigest()
        
        cursor = conn.cursor()
        cursor.execute(
            "SELECT file_hash FROM file_backups WHERE filename = %s ORDER BY id DESC LIMIT 1",
            (filename,)
        )
        latest = cursor.fetchone()
        
        if latest and latest["file_hash"] == file_hash:
            return  # No changes detected, skip duplicate insertion
            
        now_str = now_ist_iso()
        if is_text:
            cursor.execute(
                "INSERT INTO file_backups (filename, content_text, file_hash, source, created_at) VALUES (%s, %s, %s, %s, %s)",
                (filename, content, file_hash, source, now_str)
            )
        else:
            cursor.execute(
                "INSERT INTO file_backups (filename, content_blob, file_hash, source, created_at) VALUES (%s, %s, %s, %s, %s)",
                (filename, content, file_hash, source, now_str)
            )
        conn.commit()
        print(f"[Backup System] Logged new version of {filename} (hash: {file_hash[:8]}, source: {source})")
    except Exception as e:
        print(f"Error saving file backup for {filename}: {e}")
    finally:
        conn.close()

def get_file_backups(filename: str = None, limit: int = 50):
    """Retrieves list of file backup versions from PostgreSQL."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if filename:
            cursor.execute(
                "SELECT id, filename, file_hash, source, created_at, LENGTH(COALESCE(content_text, '')) as text_len, LENGTH(COALESCE(content_blob, ''::bytea)) as blob_len FROM file_backups WHERE filename = %s ORDER BY id DESC LIMIT %s",
                (filename, limit)
            )
        else:
            cursor.execute(
                "SELECT id, filename, file_hash, source, created_at, LENGTH(COALESCE(content_text, '')) as text_len, LENGTH(COALESCE(content_blob, ''::bytea)) as blob_len FROM file_backups ORDER BY id DESC LIMIT %s",
                (limit,)
            )
        rows = cursor.fetchall()
        return rows
    except Exception as e:
        print(f"Error getting file backups: {e}")
        return []
    finally:
        conn.close()

def save_email_action(contact_id: int, action_type: str, status: str, detail: str = ""):
    """Records an action status for a contact/email for auditability."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO email_actions (email_id, action_type, status, detail, created_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                contact_id,
                action_type,
                status,
                detail,
                now_ist_iso(),
            ),
        )
        conn.commit()
    except Exception as e:
        print(f"Error saving email action: {e}")
    finally:
        conn.close()

def get_email_actions(contact_id: int = None, limit: int = 50):
    """Retrieves action status records, optionally filtered by contact/email id."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        if contact_id:
            cursor.execute(
                "SELECT * FROM email_actions WHERE email_id = %s ORDER BY id DESC LIMIT %s",
                (contact_id, limit),
            )
        else:
            cursor.execute(
                "SELECT * FROM email_actions ORDER BY id DESC LIMIT %s",
                (limit,),
            )
        rows = cursor.fetchall()
        return rows
    except Exception as e:
        print(f"Error getting email actions: {e}")
        return []
    finally:
        conn.close()

def get_backup_by_id(backup_id: int):
    """Retrieves a single backup record by ID."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM file_backups WHERE id = %s", (backup_id,))
        row = cursor.fetchone()
        return row
    except Exception as e:
        print(f"Error getting backup by id: {e}")
        return None
    finally:
        conn.close()
