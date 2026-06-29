import os
import sys
import json
import sqlite3

# Load env variables manually from parent directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(dotenv_path):
    import dotenv
    dotenv.load_dotenv(dotenv_path)

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from fastapi.testclient import TestClient
from main import app, on_startup
import db
import rag

client = TestClient(app)

def test_database_initialization():
    print("\n--- Testing Database Init ---")
    db.init_db()
    conn = db.get_db_connection()
    cursor = conn.cursor()
    
    # Check tables
    tables = ["rag_chunks", "chat_sessions", "chat_messages", "visitor_feedback", "contact_messages"]
    for t in tables:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (t,))
        row = cursor.fetchone()
        assert row is not None, f"Table {t} does not exist!"
        print(f"Verified: Table {t} exists.")
        
    conn.close()
    print("Database initialization verification passed.")

def test_rag_playground():
    print("\n--- Testing RAG Playground Endpoint ---")
    response = client.get("/api/v1/portfolio/rag/playground?query=Spark")
    print(f"Status Code: {response.status_code}")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    print(f"RAG search returned {len(data)} chunks.")
    if data:
        print(f"Top matching chunk: '{data[0]['chunk_title']}' with similarity {data[0]['similarity']:.2f}")
        assert data[0]['similarity'] > 0.1, f"Cosine similarity should be non-zero! Got {data[0]['similarity']:.2f}"
    else:
        assert False, "No chunks returned by RAG playground search!"

def test_chat_interaction_and_feedback():
    print("\n--- Testing Chat Interaction & Logging ---")
    session_id = "test-session-uuid-123"
    
    # Send chat message
    response = client.post(
        "/api/v1/portfolio/chat",
        json={
            "message": "What is Adarsh's experience with Spark?",
            "history": [],
            "session_id": session_id,
            "mode": "data-engineer"
        }
    )
    print(f"Chat response status: {response.status_code}")
    assert response.status_code == 200
    res_data = response.json()
    message_id = res_data.get("message_id")
    print(f"Generated message ID: {message_id}")
    assert message_id is not None
    
    # Check trace metrics
    trace = res_data.get("trace")
    assert trace is not None
    print(f"Trace telemetry - Latency: {trace.get('latency_ms')}ms, Cost: ${trace.get('cost_est'):.6f}")
    assert len(trace.get("chunks", [])) > 0
    assert trace["chunks"][0]["similarity"] > 0.1, f"Retrieved chunks similarity should be non-zero! Got {trace['chunks'][0]['similarity']}"
    
    # Verify records were created in SQLite
    conn = db.get_db_connection()
    session_row = conn.execute("SELECT * FROM chat_sessions WHERE id = ?", (session_id,)).fetchone()
    assert session_row is not None
    assert session_row["role_mode"] == "data-engineer"
    
    msg_rows = conn.execute("SELECT * FROM chat_messages WHERE session_id = ?", (session_id,)).fetchall()
    assert len(msg_rows) >= 2 # 1 user + 1 model message
    print(f"SQLite verification: Logged {len(msg_rows)} messages in chat session.")
    conn.close()
    
    # Send thumbs up feedback
    print("\n--- Testing Chat Feedback Endpoint ---")
    fb_response = client.post(
        "/api/v1/portfolio/chat/feedback",
        json={
            "message_id": message_id,
            "rating": 1,
            "comment": "Perfect answer!"
        }
    )
    assert fb_response.status_code == 200
    print("Feedback submission returned 200 OK.")
    
    # Verify feedback was stored
    conn = db.get_db_connection()
    fb_row = conn.execute("SELECT * FROM visitor_feedback WHERE message_id = ?", (message_id,)).fetchone()
    assert fb_row is not None
    assert fb_row["rating"] == 1
    assert fb_row["comment"] == "Perfect answer!"
    print("SQLite verification: Logged visitor feedback correctly.")
    conn.close()

def test_contact_intent_classification():
    print("\n--- Testing Contact Ingestion and AI Classification ---")
    # Send a contact inquiry about hiring
    response = client.post(
        "/api/v1/portfolio/contact",
        json={
            "name": "Alex Recruiter",
            "email": "alex@google.com",
            "subject": "Urgent Job Opportunity for Senior Engineer",
            "message": "Hi Adarsh, I saw your portfolio and would love to interview you for a Senior GenAI/Data Engineer role on our team at Google. Let's schedule a call."
        }
    )
    assert response.status_code == 200
    print("Contact submission returned 200 OK.")
    
    # Verify lead logging and intent classification in SQLite
    conn = db.get_db_connection()
    lead = conn.execute("SELECT * FROM contact_messages ORDER BY id DESC LIMIT 1").fetchone()
    assert lead is not None
    assert lead["name"] == "Alex Recruiter"
    print(f"Logged outreach lead in SQLite. AI intent classification: '{lead['intent_category']}'")
    assert lead["intent_category"] == "Hiring Inquiry"
    conn.close()

def test_analytics_and_logs():
    print("\n--- Testing Analytics Stats Endpoint ---")
    stats_response = client.get("/api/v1/portfolio/analytics/stats")
    assert stats_response.status_code == 200
    stats = stats_response.json()
    print("Analytics Stats Payload:")
    print(json.dumps(stats, indent=2))
    assert stats["total_sessions"] > 0
    assert stats["total_messages"] > 0
    assert stats["total_leads"] > 0
    assert stats["helpful_percentage"] == 100
    
    print("\n--- Testing Logs Masking (Public vs Admin) ---")
    # 1. Access logs without passcode (Public)
    public_response = client.get("/api/v1/portfolio/analytics/logs")
    assert public_response.status_code == 200
    public_logs = public_response.json()
    assert public_logs["is_admin"] is False
    
    lead_masked = public_logs["leads"][0]
    print(f"Public Masked Lead Name: '{lead_masked['name']}'")
    print(f"Public Masked Lead Email: '{lead_masked['email']}'")
    print(f"Public Masked Lead Message: '{lead_masked['message']}'")
    assert lead_masked["name"] != "Alex Recruiter"
    assert "alex@google.com" not in lead_masked["email"]
    assert "locked for recruiter privacy" in lead_masked["message"]
    
    # 2. Access logs with correct passcode (Admin)
    admin_pass = os.getenv("ADMIN_PASSCODE", "admin123")
    admin_response = client.get(f"/api/v1/portfolio/analytics/logs?passcode={admin_pass}")
    assert admin_response.status_code == 200
    admin_logs = admin_response.json()
    assert admin_logs["is_admin"] is True
    
    lead_unmasked = admin_logs["leads"][0]
    print(f"Admin Unmasked Lead Name: '{lead_unmasked['name']}'")
    print(f"Admin Unmasked Lead Email: '{lead_unmasked['email']}'")
    print(f"Admin Unmasked Lead Message: '{lead_unmasked['message']}'")
    assert lead_unmasked["name"] == "Alex Recruiter"
    assert lead_unmasked["email"] == "alex@google.com"
    assert "Google" in lead_unmasked["message"]

if __name__ == "__main__":
    try:
        # Trigger startup indexing to generate embeddings
        on_startup()
        test_database_initialization()
        test_rag_playground()
        test_chat_interaction_and_feedback()
        test_contact_intent_classification()
        test_analytics_and_logs()
        print("\n==============================")
        print("ALL BACKEND TEST SCRIPTS PASSED!")
        print("==============================")
    except AssertionError as ae:
        print(f"\nTEST FAILURE: {ae}")
        sys.exit(1)
    except Exception as e:
        print(f"\nTEST CRASHED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
