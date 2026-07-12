import os
# CI/CD pipeline trigger comment
import json
import time
import html
import hmac
import secrets
from fastapi import FastAPI, Query, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import dotenv
from google import genai

# Load .env from the root directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(dotenv_path):
    dotenv.load_dotenv(dotenv_path)

import db
import rag
from chatbot import router as chatbot_router

app = FastAPI(title="Adarsh Singh Portfolio Core API", version="1.0.0")
app.include_router(chatbot_router)

# Resolve admin passcode securely at startup
admin_pass = os.environ.get("ADMIN_PASSCODE")
if not admin_pass:
    admin_pass = secrets.token_urlsafe(16)
    print("----------------------------------------------------------------------")
    print("WARNING: ADMIN_PASSCODE environment variable is not defined.")
    print("A secure random passcode has been generated for developer logs access:")
    print(f"PASSCODE: {admin_pass}")
    print("----------------------------------------------------------------------")
elif admin_pass == "admin123":
    print("----------------------------------------------------------------------")
    print("SECURITY WARNING: ADMIN_PASSCODE is set to the default 'admin123'.")
    print("Please configure a strong passcode in your production environment.")
    print("----------------------------------------------------------------------")

# Enable secure CORS configuration based on ALLOWED_ORIGINS env var
allowed_origins_str = os.environ.get("ALLOWED_ORIGINS", "")
if allowed_origins_str:
    allowed_origins = [o.strip() for o in allowed_origins_str.split(",") if o.strip()]
else:
    # Default local dev environments
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Secure HTTP Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# File Paths
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PROFILE_JSON = os.path.join(DATA_DIR, "profile.json")
MESSAGES_JSON = os.path.join(DATA_DIR, "contact_messages.json")
SMTP_CONFIG_JSON = os.path.join(DATA_DIR, "smtp_config.json")

@app.on_event("startup")
def on_startup():
    """Initializes SQLite database and triggers RAG semantic index generation on launch."""
    db.init_db()
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        try:
            rag.index_knowledge_base(api_key)
        except Exception as e:
            print(f"Database indexing on startup failed: {e}")
    else:
        print("GEMINI_API_KEY is not defined in environment. RAG indexing skipped.")

# Admin credentials resolving & hashing
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin_password_123")
ADMIN_SECRET_KEY = os.environ.get("ADMIN_SECRET_KEY")
if not ADMIN_SECRET_KEY:
    ADMIN_SECRET_KEY = secrets.token_urlsafe(32)

CREDENTIALS_JSON = os.path.join(DATA_DIR, "admin_credentials.json")

import hashlib
import base64
from fastapi.responses import FileResponse, RedirectResponse

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Hashes a password using PBKDF2 with SHA256 and a random salt."""
    if not salt:
        salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # number of iterations
    )
    return key.hex(), salt

def verify_password(stored_hash: str, salt: str, password_to_check: str) -> bool:
    """Verifies a password against a stored hash and salt."""
    hash_to_check, _ = hash_password(password_to_check, salt)
    return hmac.compare_digest(stored_hash, hash_to_check)

def load_admin_credentials() -> tuple[str, str, str]:
    """Loads admin credentials. Returns (username, password_hash_or_plain, salt)."""
    if os.path.exists(CREDENTIALS_JSON):
        try:
            with open(CREDENTIALS_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data["username"], data["password_hash"], data["salt"]
        except Exception as e:
            print(f"Error reading admin_credentials.json: {e}")
    return ADMIN_USERNAME, ADMIN_PASSWORD, ""

def generate_session_token(username: str, expiry_seconds: int = 86400) -> str:
    """Generates a secure, signed session token."""
    expiry_time = int(time.time()) + expiry_seconds
    payload_str = f"{username}:{expiry_time}"
    sig = hmac.new(ADMIN_SECRET_KEY.encode("utf-8"), payload_str.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_str}:{sig}"

def verify_session_token(token: str) -> bool:
    """Verifies a signed session token against secret key and expiration."""
    if not token:
        return False
    try:
        parts = token.split(":")
        if len(parts) != 3:
            return False
        username, expiry_str, sig = parts
        expiry_time = int(expiry_str)
        
        stored_username, _, _ = load_admin_credentials()
        if username != stored_username:
            return False
            
        if time.time() > expiry_time:
            return False
            
        expected_payload = f"{username}:{expiry_str}"
        expected_sig = hmac.new(ADMIN_SECRET_KEY.encode("utf-8"), expected_payload.encode("utf-8"), hashlib.sha256).hexdigest()
        
        return hmac.compare_digest(sig, expected_sig)
    except Exception:
        return False

def get_token_from_request(request: Request) -> str:
    """Extracts the session token from request headers."""
    token = request.headers.get("X-Admin-Token")
    if token:
        return token
    passcode_header = request.headers.get("X-Admin-Passcode")
    if passcode_header and ":" in passcode_header:
        return passcode_header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]
    return ""

class AdminLoginPayload(BaseModel):
    username: str
    password: str

class ChangeCredentialsPayload(BaseModel):
    current_password: str
    new_username: str
    new_password: str

class UploadPayload(BaseModel):
    file_data: str # Base64 data URI

@app.post("/api/v1/portfolio/admin/login")
async def admin_login(payload: AdminLoginPayload):
    """Authenticates admin credentials and returns a session token."""
    stored_username, stored_pass_or_hash, salt = load_admin_credentials()
    
    is_valid = False
    if salt:
        is_valid = (payload.username == stored_username and 
                    verify_password(stored_pass_or_hash, salt, payload.password))
    else:
        is_valid = (payload.username == stored_username and 
                    payload.password == stored_pass_or_hash)
                    
    if is_valid:
        token = generate_session_token(payload.username)
        return {"success": True, "token": token}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.get("/api/v1/portfolio/admin/config")
async def get_admin_config(request: Request):
    """Retrieves the complete profile.json config. Protected by admin session token."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized access. Invalid or expired token.")
        
    profiles = load_profiles()
    if not profiles:
        raise HTTPException(status_code=500, detail="Portfolio database is not initialized.")
    return profiles

@app.post("/api/v1/portfolio/admin/config")
async def save_admin_config(payload: dict, request: Request, background_tasks: BackgroundTasks):
    """Overwrites the complete profile.json config and triggers RAG re-indexing. Protected."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized access. Invalid or expired token.")
        
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        with open(PROFILE_JSON, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write configuration: {str(e)}")
        
    # Trigger RAG re-indexing asynchronously
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        background_tasks.add_task(rag.index_knowledge_base, api_key)
        
    return {"success": True, "message": "Configuration saved. RAG re-indexing triggered."}

@app.post("/api/v1/portfolio/admin/change-credentials")
async def change_credentials(payload: ChangeCredentialsPayload, request: Request):
    """Securely updates the admin credentials. Protected by admin session token."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized access. Invalid or expired token.")
        
    stored_username, stored_pass_or_hash, salt = load_admin_credentials()
    
    is_valid = False
    if salt:
        is_valid = verify_password(stored_pass_or_hash, salt, payload.current_password)
    else:
        is_valid = (payload.current_password == stored_pass_or_hash)
        
    if not is_valid:
        raise HTTPException(status_code=400, detail="Current password verification failed.")
        
    new_hash, new_salt = hash_password(payload.new_password)
    
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        with open(CREDENTIALS_JSON, "w", encoding="utf-8") as f:
            json.dump({
                "username": payload.new_username,
                "password_hash": new_hash,
                "salt": new_salt
            }, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save credentials: {str(e)}")
        
    return {"success": True, "message": "Credentials updated successfully."}

@app.post("/api/v1/portfolio/admin/upload/avatar")
async def upload_avatar(payload: UploadPayload, request: Request):
    """Uploads a new profile image. Protected by admin session token."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized access. Invalid or expired token.")
        
    try:
        base64_str = payload.file_data
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        binary_data = base64.b64decode(base64_str)
        
        avatar_path = os.path.join(DATA_DIR, "avatar.jpg")
        with open(avatar_path, "wb") as f:
            f.write(binary_data)
        return {"success": True, "message": "Avatar image uploaded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

@app.post("/api/v1/portfolio/admin/upload/cv")
async def upload_cv(payload: UploadPayload, request: Request):
    """Uploads a new CV PDF. Protected by admin session token."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized access. Invalid or expired token.")
        
    try:
        base64_str = payload.file_data
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        binary_data = base64.b64decode(base64_str)
        
        cv_path = os.path.join(DATA_DIR, "cv.pdf")
        with open(cv_path, "wb") as f:
            f.write(binary_data)
        return {"success": True, "message": "CV PDF uploaded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CV: {str(e)}")

@app.get("/api/v1/portfolio/assets/avatar.jpg")
async def get_avatar():
    """Serves the custom avatar.jpg from GCS mount, falls back to default avatar.jpg."""
    avatar_path = os.path.join(DATA_DIR, "avatar.jpg")
    if os.path.exists(avatar_path):
        return FileResponse(avatar_path)
    return RedirectResponse(url="/avatar.jpg")

@app.get("/api/v1/portfolio/assets/cv.pdf")
async def get_cv():
    """Serves the custom cv.pdf from GCS mount, falls back to default Adarsh_Singh_CV.pdf."""
    cv_path = os.path.join(DATA_DIR, "cv.pdf")
    if os.path.exists(cv_path):
        return FileResponse(cv_path)
    return RedirectResponse(url="/Adarsh_Singh_CV.pdf")

def load_profiles():
    """Loads consolidated profile roles from local JSON database."""
    if not os.path.exists(PROFILE_JSON):
        return {}
    try:
        with open(PROFILE_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading profiles database: {e}")
        return {}

class ContactPayload(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class PasscodePayload(BaseModel):
    passcode: str

class SmtpConfigPayload(BaseModel):
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_TO: str
    RESEND_API_KEY: str
    RESEND_FROM: str

class RoleCreatePayload(BaseModel):
    id: str
    label: str
    icon: str
    copy_from: str = "general"

@app.get("/api/v1/portfolio/roles")
async def get_roles():
    """Returns the list of available dynamic profile roles and their metadata."""
    profiles = load_profiles()
    if not profiles:
        return []
    
    # 1. Check if roles list exists in profile.json
    roles_list = profiles.get("roles")
    if roles_list and isinstance(roles_list, list):
        return roles_list
        
    # 2. Fallback to default roles if roles array is not present (migration/backward compatibility)
    role_meta = {
        "general": {"label": "General AI/Data", "icon": "Layers"},
        "data-engineer": {"label": "Data Engineer", "icon": "Database"},
        "ai-engineer": {"label": "Gen AI Engineer", "icon": "Cpu"}
    }
    
    result = []
    ordered_keys = ["general", "data-engineer", "ai-engineer"]
    keys_to_process = [k for k in ordered_keys if k in profiles]
    
    for key in keys_to_process:
        meta = role_meta.get(key, {"label": key.replace("-", " ").title(), "icon": "Layers"})
        result.append({
            "id": key,
            "label": meta["label"],
            "icon": meta["icon"]
        })
    return result

@app.post("/api/v1/portfolio/admin/roles")
async def add_or_update_role(payload: RoleCreatePayload, request: Request):
    """Adds a new dynamic role or updates an existing one in profile.json."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized session.")
        
    profiles = load_profiles()
    if not profiles:
        profiles = {}
        
    # Ensure "roles" key exists at root
    if "roles" not in profiles or not isinstance(profiles["roles"], list):
        profiles["roles"] = [
            {"id": "general", "label": "General AI/Data", "icon": "Layers"},
            {"id": "data-engineer", "label": "Data Engineer", "icon": "Database"},
            {"id": "ai-engineer", "label": "Gen AI Engineer", "icon": "Cpu"}
        ]
        
    # Check if role already exists in dynamic roles list
    role_index = -1
    for idx, r in enumerate(profiles["roles"]):
        if r["id"] == payload.id:
            role_index = idx
            break
            
    if role_index >= 0:
        # Update metadata
        profiles["roles"][role_index]["label"] = payload.label
        profiles["roles"][role_index]["icon"] = payload.icon
    else:
        # Create new metadata
        profiles["roles"].append({
            "id": payload.id,
            "label": payload.label,
            "icon": payload.icon
        })
        
    # If the profile data for this role key does not exist, initialize it by copying from template
    if payload.id not in profiles:
        source_profile = profiles.get(payload.copy_from) or profiles.get("general") or {}
        profiles[payload.id] = json.loads(json.dumps(source_profile))
        
    # Save the updated profile.json
    try:
        with open(PROFILE_JSON, "w", encoding="utf-8") as f:
            json.dump(profiles, f, indent=2, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profiles: {str(e)}")
        
    return {"success": True, "message": f"Role '{payload.label}' configured successfully."}

@app.get("/api/v1/portfolio/admin/smtp")
async def get_smtp_settings(request: Request):
    """Retrieves current SMTP and Resend configuration (passwords masked)."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized session.")
        
    from mail_helper import get_smtp_config
    cfg = get_smtp_config()
    
    password_mask = "********" if cfg["password"] else ""
    resend_key_mask = "********" if cfg["resend_api_key"] else ""
    
    return {
        "SMTP_HOST": cfg["host"] or "",
        "SMTP_PORT": cfg["port"],
        "SMTP_USER": cfg["user"] or "",
        "SMTP_PASSWORD": password_mask,
        "SMTP_TO": cfg["to"] or "",
        "RESEND_API_KEY": resend_key_mask,
        "RESEND_FROM": cfg["resend_from"] or "onboarding@resend.dev"
    }

@app.post("/api/v1/portfolio/admin/smtp")
async def save_smtp_settings(payload: SmtpConfigPayload, request: Request):
    """Saves SMTP and Resend API settings to persistent smtp_config.json."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized session.")
        
    current_data = {}
    if os.path.exists(SMTP_CONFIG_JSON):
        try:
            with open(SMTP_CONFIG_JSON, "r", encoding="utf-8") as f:
                current_data = json.load(f)
        except Exception:
            pass
            
    current_password = current_data.get("SMTP_PASSWORD") or os.getenv("SMTP_PASSWORD") or ""
    current_resend_key = current_data.get("RESEND_API_KEY") or os.getenv("RESEND_API_KEY") or ""
    
    saved_password = payload.SMTP_PASSWORD if payload.SMTP_PASSWORD != "********" else current_password
    saved_resend_key = payload.RESEND_API_KEY if payload.RESEND_API_KEY != "********" else current_resend_key
    
    new_config = {
        "SMTP_HOST": payload.SMTP_HOST,
        "SMTP_PORT": payload.SMTP_PORT,
        "SMTP_USER": payload.SMTP_USER,
        "SMTP_PASSWORD": saved_password,
        "SMTP_TO": payload.SMTP_TO,
        "RESEND_API_KEY": saved_resend_key,
        "RESEND_FROM": payload.RESEND_FROM
    }
    
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(SMTP_CONFIG_JSON, "w", encoding="utf-8") as f:
            json.dump(new_config, f, indent=2)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save SMTP config: {str(e)}")
        
    return {"success": True, "message": "SMTP settings saved successfully."}

@app.get("/api/v1/portfolio/profile")
async def get_profile(mode: str = Query(default="general")):
    """Returns the custom profile data based on active role toggle."""
    profiles = load_profiles()
    if not profiles:
        raise HTTPException(status_code=500, detail="Portfolio database is not initialized.")
    
    profile_data = profiles.get(mode)
    if not profile_data:
        profile_data = profiles.get("general")
        
    if not profile_data:
        raise HTTPException(status_code=404, detail=f"Profile mode '{mode}' not found.")
        
    return profile_data

rate_limit_records = {}

def check_rate_limit(client_ip: str, limit: int = 10, window: int = 60) -> bool:
    """Sliding window rate limiter without external dependencies."""
    now = time.time()
    timestamps = rate_limit_records.get(client_ip, [])
    timestamps = [t for t in timestamps if now - t < window]
    if len(timestamps) >= limit:
        return False
    timestamps.append(now)
    rate_limit_records[client_ip] = timestamps
    return True

from mail_helper import send_outreach_email

@app.post("/api/v1/portfolio/contact")
async def submit_contact(payload: ContactPayload, background_tasks: BackgroundTasks, request: Request):
    """Saves incoming messages locally in JSON and SQLite, then triggers SMTP dispatch."""
    client_ip = request.client.host if request.client else "unknown"
    # Limit: 5 outreach submissions per 5 minutes
    if not check_rate_limit(client_ip, limit=5, window=300):
        raise HTTPException(
            status_code=429,
            detail="Too many outreach submissions. Please wait before transmitting again."
        )

    os.makedirs(DATA_DIR, exist_ok=True)
    messages = []
    
    # Keep JSON logging active as a backup
    if os.path.exists(MESSAGES_JSON):
        try:
            with open(MESSAGES_JSON, "r", encoding="utf-8") as f:
                messages = json.load(f)
        except Exception:
            messages = []
            
    message_entry = payload.model_dump()
    messages.append(message_entry)
    
    try:
        with open(MESSAGES_JSON, "w", encoding="utf-8") as f:
            json.dump(messages, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Failed to record message in JSON: {e}")
        
    # Analyze message intent category using Gemini (AI Lead Routing)
    intent_category = "General Outreach"
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        try:
            client = genai.Client(api_key=api_key)
            cat_prompt = f"""
            Analyze this portfolio contact form message. Categorize the intent of the sender into exactly one of these labels:
            - "Hiring Inquiry" (if discussing jobs, interviews, recruitment, hiring, contract work)
            - "Collaboration" (if discussing side projects, open source, partnerships)
            - "General Question" (if asking about technologies, certifications, blog posts)
            - "Other" (if spam or uncategorized)
            
            Subject: {payload.subject}
            Message: {payload.message}
            
            Return ONLY the label. Do not include extra explanation or markup.
            """
            cat_response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=cat_prompt,
            )
            parsed_intent = cat_response.text.strip().replace('"', '').replace("'", "")
            if parsed_intent in ["Hiring Inquiry", "Collaboration", "General Question", "Other"]:
                intent_category = parsed_intent
        except Exception as e:
            print(f"Outreach intent classification failed: {e}")
            
    # Record lead in SQLite
    db.save_contact_message(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
        intent_category=intent_category
    )
        
    # Attempt background SMTP dispatch
    background_tasks.add_task(
        send_outreach_email, 
        payload.name,
        payload.email,
        payload.subject,
        payload.message
    )
        
    return {
        "success": True, 
        "message": "Transmission secured. Adarsh will reach out within 24 hours."
    }

# --- ANALYTICS & RAG OBSERVABILITY ENDPOINTS ---

@app.post("/api/v1/portfolio/analytics/verify-passcode")
async def verify_passcode(payload: PasscodePayload, request: Request):
    """Validates developer access passcode to view raw recruiter messages."""
    header_pass = request.headers.get("X-Admin-Passcode")
    check_code = header_pass or payload.passcode
    token = get_token_from_request(request)
    if (check_code and hmac.compare_digest(check_code, admin_pass)) or verify_session_token(token):
        return {"success": True}
    return {"success": False}

@app.get("/api/v1/portfolio/analytics/stats")
async def get_analytics_stats():
    """Aggregates chatbot interactions and outreach lead analytics from database."""
    conn = db.get_db_connection()
    try:
        # Total counts
        sessions_count = conn.execute("SELECT COUNT(*) FROM chat_sessions").fetchone()[0]
        messages_count = conn.execute("SELECT COUNT(*) FROM chat_messages").fetchone()[0]
        leads_count = conn.execute("SELECT COUNT(*) FROM contact_messages").fetchone()[0]
        
        # Feedback aggregates
        feedback = conn.execute("SELECT rating, COUNT(*) FROM visitor_feedback GROUP BY rating").fetchall()
        feedback_map = {r[0]: r[1] for r in feedback}
        pos_feedback = feedback_map.get(1, 0)
        neg_feedback = feedback_map.get(-1, 0)
        total_feedback = pos_feedback + neg_feedback
        helpful_pct = int((pos_feedback / total_feedback * 100)) if total_feedback > 0 else 100
        
        # LLM operational telemetry
        metrics = conn.execute(
            """
            SELECT AVG(latency_ms), SUM(tokens_input), SUM(tokens_output), SUM(cost_est)
            FROM chat_messages WHERE role = 'model'
            """
        ).fetchone()
        
        avg_latency = int(metrics[0]) if metrics[0] is not None else 0
        total_input = metrics[1] if metrics[1] is not None else 0
        total_output = metrics[2] if metrics[2] is not None else 0
        total_cost = float(metrics[3]) if metrics[3] is not None else 0.0
        
        # Distributions
        modes = conn.execute("SELECT role_mode, COUNT(*) FROM chat_sessions GROUP BY role_mode").fetchall()
        mode_dist = {r[0]: r[1] for r in modes}
        
        intents = conn.execute("SELECT intent_category, COUNT(*) FROM contact_messages GROUP BY intent_category").fetchall()
        intent_dist = {r[0]: r[1] for r in intents}
        
        return {
            "total_sessions": sessions_count,
            "total_messages": messages_count,
            "total_leads": leads_count,
            "helpful_percentage": helpful_pct,
            "feedback_stats": {
                "helpful": pos_feedback,
                "unhelpful": neg_feedback
            },
            "avg_latency_ms": avg_latency,
            "tokens_used": {
                "input": total_input,
                "output": total_output,
                "total": total_input + total_output
            },
            "estimated_cost_usd": total_cost,
            "mode_distribution": mode_dist,
            "intent_distribution": intent_dist
        }
    except Exception as e:
        print(f"Error querying analytics stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analytical aggregates.")
    finally:
        conn.close()

def mask_email(email: str) -> str:
    """Masks email address for public demonstration protection."""
    try:
        parts = email.split("@")
        if len(parts) == 2:
            local, domain = parts
            if len(local) > 2:
                return f"{local[0]}***{local[-1]}@{domain}"
            return f"***@{domain}"
    except Exception:
        pass
    return "***@***.***"

def mask_name(name: str) -> str:
    """Masks name for public demonstration protection."""
    try:
        parts = name.split()
        masked_parts = []
        for p in parts:
            if len(p) > 1:
                masked_parts.append(f"{p[0]}***")
            else:
                masked_parts.append("*")
        return " ".join(masked_parts)
    except Exception:
        return "***"

@app.get("/api/v1/portfolio/analytics/logs")
async def get_analytics_logs(request: Request, passcode: str = Query(default=None)):
    """Retrieves session conversations and leads. Masks recruiter personal details unless passcode or session token is valid."""
    header_pass = request.headers.get("X-Admin-Passcode")
    check_code = header_pass or passcode
    token = get_token_from_request(request)
    is_admin = False
    if (check_code and hmac.compare_digest(check_code, admin_pass)) or verify_session_token(token):
        is_admin = True
    
    conn = db.get_db_connection()
    try:
        # Get chat sessions and messages
        sessions = conn.execute("SELECT * FROM chat_sessions ORDER BY created_at DESC LIMIT 50").fetchall()
        sessions_list = []
        
        for s in sessions:
            messages = conn.execute(
                """
                SELECT m.*, f.rating 
                FROM chat_messages m 
                LEFT JOIN visitor_feedback f ON m.id = f.message_id 
                WHERE m.session_id = ? 
                ORDER BY m.created_at ASC
                """,
                (s["id"],)
            ).fetchall()
            
            messages_list = []
            for m in messages:
                messages_list.append({
                    "id": m["id"],
                    "role": m["role"],
                    "content": m["content"],
                    "created_at": m["created_at"],
                    "retrieved_chunks": json.loads(m["retrieved_chunks_json"]) if m["retrieved_chunks_json"] else None,
                    "latency_ms": m["latency_ms"],
                    "tokens_input": m["tokens_input"],
                    "tokens_output": m["tokens_output"],
                    "cost_est": m["cost_est"],
                    "rating": m["rating"]
                })
                
            sessions_list.append({
                "id": s["id"],
                "created_at": s["created_at"],
                "role_mode": s["role_mode"],
                "messages": messages_list
            })
            
        # Get outreach leads
        leads = conn.execute("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50").fetchall()
        leads_list = []
        
        for l in leads:
            if is_admin:
                leads_list.append({
                    "id": l["id"],
                    "name": l["name"],
                    "email": l["email"],
                    "subject": l["subject"],
                    "message": l["message"],
                    "created_at": l["created_at"],
                    "intent_category": l["intent_category"]
                })
            else:
                leads_list.append({
                    "id": l["id"],
                    "name": mask_name(l["name"]),
                    "email": mask_email(l["email"]),
                    "subject": l["subject"],
                    "message": "[Message content locked for recruiter privacy. Enter passcode at the top to decrypt.]",
                    "created_at": l["created_at"],
                    "intent_category": l["intent_category"]
                })
                
        return {
            "is_admin": is_admin,
            "sessions": sessions_list,
            "leads": leads_list
        }
    except Exception as e:
        print(f"Error querying logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversation logs.")
    finally:
        conn.close()

@app.get("/api/v1/portfolio/rag/playground")
async def rag_playground(query: str = Query(...)):
    """API endpoint to run a test query directly against the cached RAG embedding index."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY environment variable missing.")
        
    try:
        chunks = rag.retrieve_context(api_key, query, top_k=6)
        cleaned_chunks = []
        for c in chunks:
            cleaned_chunks.append({
                "chunk_title": c["chunk_title"],
                "source_file": c["source_file"],
                "content": c["content"],
                "similarity": float(c["similarity"])
            })
        return cleaned_chunks
    except Exception as e:
        print(f"RAG search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search execution failed: {str(e)}")

@app.get("/api/v1/portfolio/analytics/unanswered")
async def get_unanswered_questions(request: Request, passcode: str = Query(default=None)):
    """Retrieves list of unanswered questions. Protected by admin passcode or session token."""
    header_pass = request.headers.get("X-Admin-Passcode")
    check_code = header_pass or passcode
    token = get_token_from_request(request)
    is_authorized = False
    if (check_code and hmac.compare_digest(check_code, admin_pass)) or verify_session_token(token):
        is_authorized = True
        
    if not is_authorized:
        raise HTTPException(status_code=401, detail="Unauthorized access. Invalid passcode or token.")
        
    conn = db.get_db_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM unanswered_questions WHERE resolved = 0 ORDER BY created_at DESC"
        ).fetchall()
        return [
            {
                "id": r["id"],
                "session_id": r["session_id"],
                "question": r["question"],
                "created_at": r["created_at"],
                "resolved": r["resolved"]
            }
            for r in rows
        ]
    except Exception as e:
        print(f"Error fetching unanswered questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch unresolved queries.")
    finally:
        conn.close()
 
@app.post("/api/v1/portfolio/analytics/unanswered/resolve/{q_id}")
async def resolve_unanswered_question_endpoint(q_id: int, payload: PasscodePayload, request: Request):
    """Marks an unanswered question as resolved. Protected by admin passcode or session token."""
    header_pass = request.headers.get("X-Admin-Passcode")
    check_code = header_pass or payload.passcode
    token = get_token_from_request(request)
    is_authorized = False
    if (check_code and hmac.compare_digest(check_code, admin_pass)) or verify_session_token(token):
        is_authorized = True
        
    if not is_authorized:
        raise HTTPException(status_code=401, detail="Unauthorized access. Invalid passcode or token.")
        
    try:
        db.resolve_unanswered_question(q_id)
        return {"success": True, "message": "Question resolved successfully."}
    except Exception as e:
        print(f"Error resolving question: {e}")
        raise HTTPException(status_code=500, detail="Failed to resolve question.")

class AnswerQuestionPayload(BaseModel):
    q_id: int
    question: str
    answer: str
    passcode: str = None

@app.post("/api/v1/portfolio/analytics/unanswered/answer")
async def answer_unanswered_question_endpoint(payload: AnswerQuestionPayload, request: Request, background_tasks: BackgroundTasks):
    """Answers an unanswered question, adds it to the profile FAQs, marks it as resolved, and triggers RAG index rebuild."""
    header_pass = request.headers.get("X-Admin-Passcode")
    check_code = header_pass or payload.passcode
    token = get_token_from_request(request)
    is_authorized = False
    if (check_code and hmac.compare_digest(check_code, admin_pass)) or verify_session_token(token):
        is_authorized = True
        
    if not is_authorized:
        raise HTTPException(status_code=401, detail="Unauthorized access. Invalid passcode or token.")
        
    # 1. Update SQLite resolved status
    try:
        db.resolve_unanswered_question(payload.q_id)
    except Exception as e:
        print(f"SQLite unresolved marker update error: {e}")
        
    # 2. Add to general FAQs in profile.json
    try:
        profiles = load_profiles()
        general = profiles.setdefault("general", {})
        faqs = general.setdefault("faqs", [])
        
        # Check if already added
        exists = False
        for f in faqs:
            if f.get("question") == payload.question:
                f["answer"] = payload.answer
                exists = True
                break
                
        if not exists:
            faqs.append({
                "question": payload.question,
                "answer": payload.answer
            })
            
        save_profiles(profiles)
        
        # 3. Trigger RAG rebuild in background
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            background_tasks.add_task(rag.index_knowledge_base, api_key)
            
        return {"success": True, "message": "Answer saved to FAQ database and RAG index rebuild scheduled."}
    except Exception as e:
        print(f"Failed to save FAQ answer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to record FAQ answer: {str(e)}")

@app.delete("/api/v1/portfolio/admin/roles/{role_id}")
async def delete_role_endpoint(role_id: str, request: Request):
    """Deletes a dynamic role metadata configuration and its profile data structure from profile.json."""
    token = get_token_from_request(request)
    if not verify_session_token(token):
        raise HTTPException(status_code=401, detail="Unauthorized session.")
        
    if role_id in ["general", "data-engineer", "ai-engineer"]:
        raise HTTPException(status_code=400, detail="Cannot delete core system profiles.")
        
    try:
        profiles = load_profiles()
        if "roles" in profiles:
            profiles["roles"] = [r for r in profiles["roles"] if r["id"] != role_id]
        profiles.pop(role_id, None)
        save_profiles(profiles)
        return {"success": True, "message": f"Role '{role_id}' deleted successfully."}
    except Exception as e:
        print(f"Failed to delete dynamic role '{role_id}': {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete role: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
