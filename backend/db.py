import os
import sqlite3
import json
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DATA_DIR, "portfolio.db")

def get_db_connection():
    """Returns a SQLite connection object with row factory enabled."""
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Optimize SQLite for GCS FUSE to avoid journal file conflicts on object storage
    try:
        conn.execute("PRAGMA journal_mode=MEMORY")
        conn.execute("PRAGMA synchronous=OFF")
    except Exception as e:
        print(f"Error configuring SQLite PRAGMA: {e}")
    return conn

def init_db():
    """Initializes database tables if they do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. RAG Chunks table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rag_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        created_at TEXT NOT NULL,
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
        created_at TEXT NOT NULL,
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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (message_id) REFERENCES chat_messages(id) ON DELETE CASCADE
    )
    """)
    
    # 5. Contact Messages table (outreach leads)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL,
        intent_category TEXT
    )
    """)
    
    # 6. Unanswered Questions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS unanswered_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        question TEXT NOT NULL,
        created_at TEXT NOT NULL,
        resolved INTEGER DEFAULT 0
    )
    """)
    
    conn.commit()
    conn.close()
    print("SQLite Database initialized successfully.")

# --- HELPER FUNCTIONS ---

def save_chat_session(session_id: str, role_mode: str):
    """Saves a new chat session if it does not already exist."""
    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT OR IGNORE INTO chat_sessions (id, created_at, role_mode) VALUES (?, ?, ?)",
            (session_id, datetime.utcnow().isoformat() + "Z", role_mode)
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
        chunks_json = json.dumps(retrieved_chunks) if retrieved_chunks else None
        conn.execute(
            """
            INSERT INTO chat_messages (
                id, session_id, role, content, created_at, 
                retrieved_chunks_json, prompt_template, latency_ms, 
                tokens_input, tokens_output, cost_est
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                msg_id, session_id, role, content, datetime.utcnow().isoformat() + "Z",
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
        # Check if feedback already exists for this message to prevent duplicates
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM visitor_feedback WHERE message_id = ?", (message_id,))
        row = cursor.fetchone()
        
        if row:
            conn.execute(
                "UPDATE visitor_feedback SET rating = ?, comment = ?, created_at = ? WHERE message_id = ?",
                (rating, comment, datetime.utcnow().isoformat() + "Z", message_id)
            )
        else:
            conn.execute(
                "INSERT INTO visitor_feedback (message_id, rating, comment, created_at) VALUES (?, ?, ?, ?)",
                (message_id, rating, comment, datetime.utcnow().isoformat() + "Z")
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
        conn.execute(
            """
            INSERT INTO contact_messages (name, email, subject, message, created_at, intent_category)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (name, email, subject, message, datetime.utcnow().isoformat() + "Z", intent_category)
        )
        conn.commit()
    except Exception as e:
        print(f"Error saving contact message to DB: {e}")
    finally:
        conn.close()

def save_unanswered_question(session_id: str, question: str):
    """Saves a question that the chatbot was unable to answer."""
    conn = get_db_connection()
    try:
        conn.execute(
            """
            INSERT INTO unanswered_questions (session_id, question, created_at, resolved)
            VALUES (?, ?, ?, 0)
            """,
            (session_id, question, datetime.utcnow().isoformat() + "Z")
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
        conn.execute(
            "UPDATE unanswered_questions SET resolved = 1 WHERE id = ?",
            (question_id,)
        )
        conn.commit()
    except Exception as e:
        print(f"Error resolving unanswered question: {e}")
    finally:
        conn.close()
