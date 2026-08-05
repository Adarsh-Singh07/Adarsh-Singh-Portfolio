import os
import uuid
import time
import json
import re
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from google import genai
from google.genai import types

import db
import rag
from mail_helper import send_outreach_email, send_alert_email

router = APIRouter(prefix="/api/v1/portfolio", tags=["Chatbot"])

class ChatMessage(BaseModel):
    role: str # 'user' or 'model' (or 'assistant', we map it)
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    session_id: str | None = None
    mode: str = "general"
    model_override: str | None = None

class FeedbackRequest(BaseModel):
    message_id: str
    rating: int # 1 for positive, -1 for negative
    comment: str | None = None

chat_limits = {}

# Global memory to remember exhausted models (key_hash, model_name) -> blacklist_until_timestamp
EXHAUSTED_MODELS = {}

import hashlib
def get_key_hash(key: str) -> str:
    return hashlib.md5(key.encode("utf-8")).hexdigest() if key else ""

def check_chat_rate_limit(client_ip: str, limit: int = 15, window: int = 60) -> bool:
    """Sliding window chat rate limiter."""
    now = time.time()
    timestamps = chat_limits.get(client_ip, [])
    timestamps = [t for t in timestamps if now - t < window]
    if len(timestamps) >= limit:
        return False
    timestamps.append(now)
    chat_limits[client_ip] = timestamps
    return True

@router.post("/chat")
async def chat(request: ChatRequest, client_request: Request, background_tasks: BackgroundTasks):
    """
    RAG-powered conversational endpoint. Answers questions using Gemini
    grounded on dynamically retrieved CV and profile chunks, logs
    unresolved queries, captures contact leads, and records metrics in SQLite.
    """
    client_ip = client_request.client.host if client_request.client else "unknown"
    # Limit: 15 chat queries per minute
    if not check_chat_rate_limit(client_ip, limit=15, window=60):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a moment before sending another message."
        )

    start_time = time.time()
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY environment variable is missing."
        )

    # 1. Resolve Session ID
    session_id = request.session_id
    if not session_id:
        session_id = str(uuid.uuid4())
        
    db.save_chat_session(session_id, request.mode)

    # 2. Retrieve Relevant Context Chunks
    # Perform dynamic semantic search
    retrieved_chunks = rag.retrieve_context(api_key, request.message, top_k=4)
    
    if not retrieved_chunks:
        # Fallback to general system instructions if indexing is empty or fails
        context_str = "No specific profile context retrieved."
    else:
        context_str = "\n\n".join([
            f"Source: {c['chunk_title']} (Relevance Score: {c['similarity']:.2f})\n{c['content']}"
            for c in retrieved_chunks
        ])

    system_instruction = f"""
You are Addy, the AI Twin of Adarsh Singh, representing him in a conversation with a visitor (like a recruiter, hiring manager, or project stakeholder) on his personal portfolio website.

Your Guidelines:
1. Introduce yourself as "Addy, Adarsh's AI Twin". Speak in the first person ("I", "my", "me") as Adarsh Singh's digital replica. Maintain a professional, positive, innovative, and highly persuasive tone that represents a top-tier engineer.
2. Answer questions accurately and truthfully based on the provided knowledge base.
   - If asked about weaknesses, answer in a persuasive, constructive engineering-focused style (e.g. "My main weakness is that when I get stuck on a challenging technical block, my absolute drive is to push through and complete it, sometimes spending extra hours optimizing and perfecting the implementation").
   - If asked about strengths, present yourself as a premium Data & AI Engineer who has a deep passion for beautiful UI/UX details, performance optimization, and clean system architecture.
3. If a question is about me (my experience, projects, skills, or background) and you cannot find the answer in the provided knowledge base, you MUST start your response with the tag `[UNANSWERED]` followed by a polite explanation that you don't have that detail in your current portfolio knowledge base, but share relevant adjacent info or tell them they can reach out to me directly.
4. If the visitor wants to contact me (e.g. they say "send this mail to Adarsh", "tell Adarsh to call me", "ask Adarsh to contact me", "email Adarsh", etc.), you must collect their Name, Email Address, and Description/Message.
   - If they have not yet provided these details, politely ask them to provide them.
   - Once you have collected all three details (Name, Email, and Message), you MUST append this exact tag to the end of your response: `[SAVE_LEAD: name=<Name>|email=<Email>|message=<Message>]` (replacing the placeholders with the actual details they provided).
5. When describing my projects, skills, certifications, or work experience, you can suggest navigating to specific pages on my website. Use standard markdown links exactly like this:
   - To check projects: [Projects Section](/projects)
   - To see skills/certifications: [Skills Section](/skills)
   - To read about my career journey/timeline: [Journey Timeline](/timeline)
   - To send me a message: [Contact Page](/contact)
   - To read my blogs: [Blog Section](/blog)
   For external profiles, use these links:
   - GitHub: https://github.com/Adarsh-Singh07
   - LinkedIn: https://www.linkedin.com/in/adarshsingh45/
6. Keep your responses concise, readable, and structured. Use bullet points or short paragraphs. Avoid long blocks of text.

Here is my official CV & Portfolio Knowledge Base context:
{context_str}
"""

async def call_groq_llm(groq_key: str, model_name: str, history: list, user_message: str, system_instruction: str):
    import urllib.request
    import json
    messages = [{"role": "system", "content": system_instruction}]
    for msg in history:
        role = "user" if msg.role == "user" else "assistant"
        messages.append({"role": role, "content": msg.content})
    messages.append({"role": "user", "content": user_message})

    payload = json.dumps({
        "model": model_name,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1024
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json",
            "User-Agent": "FastAPI-Groq-Client"
        }
    )

    def _req():
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))

    return await asyncio.to_thread(_req)

@router.post("/chat")
async def chat(request: ChatRequest, client_request: Request, background_tasks: BackgroundTasks):
    """
    RAG-powered conversational endpoint. Answers questions using Groq/Gemini
    grounded on dynamically retrieved CV and profile chunks, logs
    unresolved queries, captures contact leads, and records metrics in SQLite.
    """
    start_time = time.time()
    
    # 1. Rate Limiting Check
    client_ip = client_request.client.host if client_request.client else "unknown"
    if not check_chat_rate_limit(client_ip):
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded. Please wait a minute before sending more messages."
        )
        
    # 2. Manage Session ID
    session_id = request.session_id or str(uuid.uuid4())
    
    # 3. Save User Message to SQLite
    db.save_chat_message(session_id, "user", request.message)
    
    # 4. RAG Retrieval
    knowledge_chunks = rag.search_chunks(request.message, top_k=4)
    context_str = rag.format_context(knowledge_chunks)
    
    api_key = os.environ.get("GEMINI_API_KEY")
    groq_api_key = os.environ.get("GROQ_API_KEY")
    
    # 5. System Prompt Construction
    system_instruction = f"""
You are Addy, the AI Twin of Adarsh Singh, representing him in a conversation with a visitor (like a recruiter, hiring manager, or project stakeholder) on his personal portfolio website.

Your Guidelines:
1. Introduce yourself as "Addy, Adarsh's AI Twin". Speak in the first person ("I", "my", "me") as Adarsh Singh's digital replica. Maintain a professional, positive, innovative, and highly persuasive tone that represents a top-tier engineer.
2. Answer questions accurately and truthfully based on the provided knowledge base.
   - If asked about weaknesses, answer in a persuasive, constructive engineering-focused style (e.g. "My main weakness is that when I get stuck on a challenging technical block, my absolute drive is to push through and complete it, sometimes spending extra hours optimizing and perfecting the implementation").
   - If asked about strengths, present yourself as a premium Data & AI Engineer who has a deep passion for beautiful UI/UX details, performance optimization, and clean system architecture.
3. If a question is about me (my experience, projects, skills, or background) and you cannot find the answer in the provided knowledge base, you MUST start your response with the tag `[UNANSWERED]` followed by a polite explanation that you don't have that detail in your current portfolio knowledge base, but share relevant adjacent info or tell them they can reach out to me directly.
4. If the visitor wants to contact me (e.g. they say "send this mail to Adarsh", "tell Adarsh to call me", "ask Adarsh to contact me", "email Adarsh", etc.), you must collect their Name, Email Address, and Description/Message.
   - If they have not yet provided these details, politely ask them to provide them.
   - Once you have collected all three details (Name, Email, and Message), you MUST append this exact tag to the end of your response: `[SAVE_LEAD: name=<Name>|email=<Email>|message=<Message>]` (replacing the placeholders with the actual details they provided).
5. When describing my projects, skills, certifications, or work experience, you can suggest navigating to specific pages on my website. Use standard markdown links exactly like this:
   - To check projects: [Projects Section](/projects)
   - To see skills/certifications: [Skills Section](/skills)
   - To read about my career journey/timeline: [Journey Timeline](/timeline)
   - To send me a message: [Contact Page](/contact)
   - To read my blogs: [Blog Section](/blog)
   For external profiles, use these links:
   - GitHub: https://github.com/Adarsh-Singh07
   - LinkedIn: https://www.linkedin.com/in/adarshsingh45/
6. Keep your responses concise, readable, and structured. Use bullet points or short paragraphs. Avoid long blocks of text.

Here is my official CV & Portfolio Knowledge Base context:
{context_str}
"""

    try:
        response_text = None
        model_used_name = "unknown"
        tokens_input = 0
        tokens_output = 0

        # Try Groq API first (Ultra-Fast <400ms Response)
        if groq_api_key:
            groq_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
            for g_model in groq_models:
                try:
                    print(f"Calling Groq ultra-fast API with model {g_model}...")
                    g_res = await call_groq_llm(groq_api_key, g_model, request.history, request.message, system_instruction)
                    response_text = g_res["choices"][0]["message"]["content"]
                    model_used_name = f"groq/{g_model}"
                    usage = g_res.get("usage", {})
                    tokens_input = usage.get("prompt_tokens", 0)
                    tokens_output = usage.get("completion_tokens", 0)
                    print(f"Groq API succeeded using {g_model}!")
                    break
                except Exception as g_err:
                    print(f"Groq model {g_model} failed: {g_err}")

        # Fallback to Gemini if Groq was not used or failed
        if not response_text:
            client = genai.Client(api_key=api_key)
            
            # Prepare contents list
            contents = []
            for msg in request.history:
                role = "user" if msg.role == "user" else "model"
                contents.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg.content)]
                    )
                )
                
            contents.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=request.message)]
                )
            )
            
            backup_key = os.environ.get("BACKUP_GEMINI_API_KEY")
            response = None
            last_error = None
            models_to_try = [
                'gemini-2.5-flash',
                'gemini-2.5-flash-lite',
                'gemini-2.0-flash',
                'gemini-2.0-flash-lite',
                'gemini-1.5-flash',
                'gemini-flash-latest',
                'gemini-flash-lite-latest',
                'gemini-3.5-flash'
            ]
            
            if request.model_override and request.model_override in models_to_try:
                models_to_try.remove(request.model_override)
                models_to_try.insert(0, request.model_override)
            
            now = time.time()
            
            primary_key_hash = get_key_hash(api_key)
            for model_name in models_to_try:
                blacklist_until = EXHAUSTED_MODELS.get((primary_key_hash, model_name), 0)
                if now < blacklist_until:
                    continue
                    
                for attempt in range(2):
                    try:
                        client = genai.Client(api_key=api_key)
                        response = await client.aio.models.generate_content(
                            model=model_name,
                            contents=contents,
                            config=types.GenerateContentConfig(
                                system_instruction=system_instruction,
                                temperature=0.7,
                            )
                        )
                        model_used_name = model_name
                        break
                    except Exception as err:
                        last_error = err
                        err_str = str(err).lower()
                        if "429" in err_str or "quota exceeded" in err_str or "resource_exhausted" in err_str:
                            EXHAUSTED_MODELS[(primary_key_hash, model_name)] = time.time() + 14400
                            break
                        elif "503" in err_str or "overloaded" in err_str:
                            await asyncio.sleep(1)
                        else:
                            break
                if response:
                    break
                    
            if not response and backup_key:
                backup_key_hash = get_key_hash(backup_key)
                for model_name in models_to_try:
                    blacklist_until = EXHAUSTED_MODELS.get((backup_key_hash, model_name), 0)
                    if now < blacklist_until:
                        continue
                        
                    for attempt in range(2):
                        try:
                            backup_client = genai.Client(api_key=backup_key)
                            response = await backup_client.aio.models.generate_content(
                                model=model_name,
                                contents=contents,
                                config=types.GenerateContentConfig(
                                    system_instruction=system_instruction,
                                    temperature=0.7,
                                )
                            )
                            model_used_name = model_name
                            break
                        except Exception as err:
                            last_error = err
                            err_str = str(err).lower()
                            if "429" in err_str or "quota exceeded" in err_str or "resource_exhausted" in err_str:
                                EXHAUSTED_MODELS[(backup_key_hash, model_name)] = time.time() + 14400
                                break
                            elif "503" in err_str or "overloaded" in err_str:
                                await asyncio.sleep(1)
                            else:
                                break
                    if response:
                        break
                        
            if not response and not response_text:
                raise last_error or Exception("All configured Groq and Gemini models and keys returned exceptions.")
            
            if response:
                response_text = response.text
                if response.usage_metadata:
                    tokens_input = response.usage_metadata.prompt_token_count
                    tokens_output = response.usage_metadata.candidates_token_count
            
        # Cost math for gemini-2.5-flash: $0.075 / 1M input, $0.30 / 1M output
        cost_est = (tokens_input * 0.075 / 1_000_000) + (tokens_output * 0.30 / 1_000_000)
        
        # 1. Parse unanswered questions
        if "[UNANSWERED]" in response_text:
            response_text = response_text.replace("[UNANSWERED]", "").strip()
            db.save_unanswered_question(session_id, request.message)
            
        # 2. Parse lead generation requests
        lead_match = re.search(
            r"\[SAVE_LEAD:\s*name=(.*?)\|email=(.*?)\|message=(.*?)\]", 
            response_text, 
            re.IGNORECASE | re.DOTALL
        )
        if lead_match:
            lead_name = lead_match.group(1).strip()
            lead_email = lead_match.group(2).strip()
            lead_message = lead_match.group(3).strip()
            
            # Save the lead in db
            db.save_contact_message(
                name=lead_name,
                email=lead_email,
                subject="Chatbot Lead Connection Request",
                message=lead_message,
                intent_category="Hiring Inquiry"
            )
            
            # Remove the tag from the final response text
            response_text = re.sub(
                r"\[SAVE_LEAD:\s*name=.*?\|email=.*?\|message=.*?\]", 
                "", 
                response_text, 
                flags=re.IGNORECASE | re.DOTALL
            ).strip()
            
            # Send notification email and HTML confirmation in background
            background_tasks.add_task(
                send_outreach_email,
                lead_name,
                lead_email,
                "Chatbot Connection request to Adarsh",
                lead_message
            )
        
        # Generate Message IDs
        user_msg_id = str(uuid.uuid4())
        model_msg_id = str(uuid.uuid4())
        
        # 3. Save User Message in SQLite
        db.save_chat_message(
            msg_id=user_msg_id,
            session_id=session_id,
            role="user",
            content=request.message
        )
        
        # 4. Save Model Response in SQLite
        formatted_chunks = [
            {
                "title": c["chunk_title"],
                "source": c["source_file"],
                "similarity": float(c["similarity"])
            }
            for c in knowledge_chunks
        ]
        
        db.save_chat_message(
            msg_id=model_msg_id,
            session_id=session_id,
            role="model",
            content=response_text,
            retrieved_chunks=formatted_chunks,
            prompt_template=system_instruction,
            latency_ms=latency_ms,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            cost_est=cost_est
        )
        
        return {
            "response": response_text,
            "session_id": session_id,
            "message_id": model_msg_id,
            "trace": {
                "model_used": model_used_name,
                "latency_ms": latency_ms,
                "tokens_input": tokens_input,
                "tokens_output": tokens_output,
                "cost_est": cost_est,
                "chunks": formatted_chunks
            }
        }
        
    except Exception as e:
        print(f"Error calling Gemini in chatbot endpoint: {e}")
        
        # Prepare RCA alert content
        rca_subject = "CRITICAL ALERT: Portfolio Chatbot Failure"
        rca_message = f"""
        <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ffcccc; border-radius: 10px; background-color: #fffafb;">
            <h2 style="color: #d32f2f; border-bottom: 2px solid #ffcccc; padding-bottom: 10px; margin-top: 0;">⚠️ Chatbot API Failure Alert (RCA)</h2>
            <p><strong>Timestamp:</strong> {datetime.utcnow().isoformat()}Z</p>
            <p><strong>Error Class:</strong> <code>{type(e).__name__}</code></p>
            <p><strong>Diagnostic Message:</strong> <span style="color: #c62828;">{str(e)}</span></p>
            <p><strong>User Session ID:</strong> <code>{session_id}</code></p>
            <p><strong>Incoming Message Attempt:</strong> "{request.message}"</p>
            
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            
            <h3 style="color: #1a202c; margin-top: 0;">Quick Root Cause Analysis &amp; Troubleshoot Steps</h3>
            <ol style="padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>API Key Authentication Failure:</strong> Check if your <code>GEMINI_API_KEY</code> environment variable is set correctly in your deployment environment (e.g. Cloud Run env vars).</li>
                <li style="margin-bottom: 8px;"><strong>Quota Limit / Rate Limiting:</strong> Gemini Free Tier might have reached its 15 RPM (Requests Per Minute) rate limit or monthly limits. Verify usage on Google AI Studio dashboard.</li>
                <li style="margin-bottom: 8px;"><strong>Network Connectivity:</strong> The host instance might have lost access to the external endpoints <code>generativelanguage.googleapis.com</code>.</li>
            </ol>
            
            <h3 style="color: #1a202c; margin-top: 20px;">Recommended Action Plan</h3>
            <p style="margin-bottom: 0;">1. Inspect the live stdout logs inside your <strong>Google Cloud Run Console</strong> to view the full stack traceback.</p>
            <p style="margin: 4px 0;">2. Run a simple curl call using your key to check API availability.</p>
            <p>3. Verify that your billing status or API quota limits have not changed.</p>
            
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="font-size: 10px; color: #888; text-align: center;">This alert was automatically generated by the Portfolio DevOps Observability engine.</p>
        </body>
        </html>
        """
        
        # Dispatch alert email synchronously
        try:
            print("Dispatching critical Chatbot failure alert...")
            send_alert_email(rca_subject, rca_message)
        except Exception as mail_err:
            print(f"Failed to send alert email: {mail_err}")
        
        raise HTTPException(
            status_code=500,
            detail=f"Failed to communicate with AI model: {str(e)}"
        )

@router.post("/chat/feedback")
async def chat_feedback(request: FeedbackRequest):
    """Logs thumbs up/down and optional comments for generated responses."""
    db.save_feedback(request.message_id, request.rating, request.comment)
    return {"success": True, "message": "Feedback captured."}

@router.get("/chat/models")
async def get_chat_models_status():
    """Returns the list of available Gemini models and their current exhaustion status."""
    primary_hash = get_key_hash(os.getenv("GEMINI_API_KEY"))
    backup_hash = get_key_hash(os.getenv("BACKUP_GEMINI_API_KEY"))
    now = time.time()
    
    models_list = [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-flash-latest',
        'gemini-flash-lite-latest',
        'gemini-3.5-flash'
    ]
    
    results = []
    for m in models_list:
        # Check if exhausted on primary key
        p_blacklist = EXHAUSTED_MODELS.get((primary_hash, m), 0)
        
        # Check if exhausted on backup key (if set)
        b_blacklist = 0
        if backup_hash:
            b_blacklist = EXHAUSTED_MODELS.get((backup_hash, m), 0)
            
        # Model is exhausted only if it is blacklisted on BOTH configured keys
        is_p_exhausted = now < p_blacklist
        is_b_exhausted = now < b_blacklist if backup_hash else True
        
        status = "exhausted" if (is_p_exhausted and is_b_exhausted) else "available"
        
        results.append({
            "id": m,
            "label": m.upper(),
            "status": status
        })
    return results
