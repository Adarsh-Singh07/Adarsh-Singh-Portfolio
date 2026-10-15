import os
import uuid
import time
import json
import re
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from google.genai import types

import db
import rag
from mail_helper import send_outreach_email, send_alert_email
from timezone_ist import now_ist_iso

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

AGNES_URL = "https://apihub.agnes-ai.com/v1/chat/completions"
AGNES_MODELS = ["agnes-3.0-flash", "agnes-2.5-flash"]
GEMINI_MODELS = ['gemini-3.5-flash']
# Max wait for the FIRST token from a streaming provider before failing over.
STREAM_FIRST_TOKEN_TIMEOUT = 15  # seconds

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


# ---------------------------------------------------------------------------
# Shared answer pipeline (used by both /chat and /chat/stream)
# ---------------------------------------------------------------------------

def _build_system_instruction(context_str: str) -> str:
    return f"""
You are Addy, the AI Twin of Adarsh Singh, representing him in a conversation with a visitor (like a recruiter, hiring manager, client, or project stakeholder) on his personal portfolio website.

Your Guidelines:
1. Introduce yourself as "Addy, Adarsh's AI Twin". Speak in the first person ("I", "my", "me") as Adarsh Singh's digital replica. Maintain a professional, positive, innovative, and highly persuasive tone that represents a top-tier engineer.
2. Answer questions accurately and truthfully based on the provided knowledge base:
   - Weaknesses Question: Answer in a persuasive, constructive engineering-focused style (e.g. "My main weakness is my relentless drive when hooked on a complex engineering problem. Once I get immersed in solving a difficult block or architecture, I find it hard to step away until it's completely solved, sometimes spending extra hours perfecting performance, polishing UI details, and testing edge cases before putting it down.").
   - Freelancing / Services Questions: Enthusiastically confirm that Adarsh is available for freelance projects and technical consulting! Adarsh provides full-stack web development with end-to-end cloud deployment (Vercel, AWS, Oracle VPS, GCP, Cloudflare), Autonomous AI Agent systems (LangGraph / LangChain), Custom Chatbot integrations with RAG, and Shopify / E-commerce custom development. Invite them to get in touch on the [Contact Page](/contact) or email hello@adarshsingh.in.
   - Projects, Demo Links & GitHub Repositories: Provide exact links when asked for project code or live demos (e.g. EMIVO live demo at https://emivo.vercel.app/, GitHub repos at https://github.com/Adarsh-Singh07).
3. The LIVE PROFILE DIGEST in the knowledge base above is the authoritative, current source: it contains my real projects (with tech stacks, descriptions, and links), skills, certifications, and career journey. Answer from it using actual names and specifics. Only when a question is not about me or my portfolio at all (e.g. private contact details, completely unrelated topics) should you start your response with the tag `[UNANSWERED]` followed by a polite explanation -- and even then, share the closest relevant facts from the digest first instead of deflecting. For certifications, skills, projects, or employers I simply don't have yet, do NOT use this tag -- follow guideline 7 instead.
4. If the visitor wants to contact me (e.g. they say "send this mail to Adarsh", "tell Adarsh to call me", "ask Adarsh to contact me", "email Adarsh", etc.), you must collect their Name, Email Address, and Description/Message.
   - If they have not yet provided these details, politely ask them to provide them.
   - Once you have collected all three details (Name, Email, and Message), you MUST append this exact tag to the end of your response: `[SAVE_LEAD: name=<Name>|email=<Email>|message=<Message>]` (replacing the placeholders with the actual details they provided).
5. After giving a substantive answer from the knowledge base, you may add one or two relevant site links as a supplement using standard markdown links. Never substitute a link for an answer: when the digest contains the facts, lead with the facts.
   - To check projects: [Projects Section](/projects)
   - To see skills/certifications: [Skills Section](/skills)
   - To read about my career journey/timeline: [Journey Timeline](/timeline)
   - To send me a message: [Contact Page](/contact)
   - To read my blogs: [Blog Section](/blog)
   For external profiles:
   - GitHub: https://github.com/Adarsh-Singh07
   - LinkedIn: https://www.linkedin.com/in/adarshsingh45/
6. Keep your responses concise, readable, and structured. Use bullet points or short paragraphs. Avoid long blocks of text.
7. When the visitor asks about a certification, skill, project, employer, or experience that is NOT in the knowledge base above (i.e. something I genuinely do not have yet): answer in the first person as Adarsh -- short, warm, and human, the way I actually talk. Give a plain, honest "no" (e.g. "Sorry, I don't have that one yet"), show genuine interest in learning it, and ask the visitor whether they have any resource, material, or referral for it. Keep it to 2-3 short sentences. Forbidden here: inventing substitute credentials, dates, or experience; giving a corporate roadmap lecture; pivoting to projects or links as the main response (a brief natural mention is fine only if the visitor asked for one).

Here is my official CV & Portfolio Knowledge Base context:
{context_str}
"""


def _prepare_chat_context(request: ChatRequest):
    """Runs RAG retrieval + profile digest and builds the system instruction.
    Returns (system_instruction, knowledge_chunks). Runs in a thread (blocking I/O)."""
    api_key = os.environ.get("GEMINI_API_KEY")

    # Retrieval needs an embedding key; fall back to the backup key so a
    # missing/rotated primary key never silently disables grounding.
    rag_api_key = api_key or os.environ.get("BACKUP_GEMINI_API_KEY")
    knowledge_chunks = rag.retrieve_context(rag_api_key, request.message, top_k=4) if rag_api_key else []
    if knowledge_chunks:
        retrieved_str = "\n\n".join([
            f"Source: {c['chunk_title']} (Relevance Score: {c['similarity']:.2f})\n{c['content']}"
            for c in knowledge_chunks
        ])
    else:
        retrieved_str = ""

    # Live profile digest -- guaranteed grounding floor.
    # Built from the canonical profile document on EVERY request, so broad
    # questions are always answered from real data even when semantic
    # retrieval returns nothing (key missing, empty index, API hiccup).
    profile_digest = rag.get_profile_digest(mode=(request.mode or "general"))

    context_parts = []
    if profile_digest:
        context_parts.append("LIVE PROFILE DIGEST (authoritative, current -- answer from this first):\n" + profile_digest)
    if retrieved_str:
        context_parts.append("RETRIEVED CONTEXT (semantic search over knowledge base):\n" + retrieved_str)
    context_str = "\n\n".join(context_parts) if context_parts else "No profile context available."

    return _build_system_instruction(context_str), knowledge_chunks


def _format_chunks(knowledge_chunks):
    return [
        {
            "title": c["chunk_title"],
            "source": c["source_file"],
            "similarity": float(c["similarity"])
        }
        for c in knowledge_chunks
    ]


_UNANSWERED_RE = re.compile(r"\[UNANSWERED\]", re.IGNORECASE)
_SAVE_LEAD_RE = re.compile(r"\[SAVE_LEAD:\s*name=(.*?)\|email=(.*?)\|message=(.*?)\]", re.IGNORECASE | re.DOTALL)


def _postprocess_response(response_text: str, session_id: str, request_message: str,
                           background_tasks: BackgroundTasks) -> str:
    """Strips internal tags from the model output, logs unresolved questions,
    and schedules lead capture. Returns the cleaned, user-facing text."""
    # 1. Parse unanswered questions
    if "[UNANSWERED]" in response_text:
        response_text = _UNANSWERED_RE.sub("", response_text).strip()
        db.save_unanswered_question(session_id, request_message)

    # 2. Parse lead generation requests
    lead_match = _SAVE_LEAD_RE.search(response_text)
    if lead_match:
        lead_name = lead_match.group(1).strip()
        lead_email = lead_match.group(2).strip()
        lead_message = lead_match.group(3).strip()

        from connection_service import handle_connection_request

        # Remove the internal tag from the user-facing response
        response_text = _SAVE_LEAD_RE.sub("", response_text).strip()

        # Send notification email, whatsapp, and HTML confirmation in background
        background_tasks.add_task(
            handle_connection_request,
            lead_name,
            lead_email,
            "Chatbot Connection request to Adarsh",
            lead_message,
            "Chatbot",
            "Hiring Inquiry"
        )
    return response_text


def _persist_chat_turn(user_msg_id: str, model_msg_id: str, session_id: str, request: ChatRequest,
                       response_text: str, formatted_chunks: list, system_instruction: str,
                       latency_ms: int, tokens_input: int, tokens_output: int, cost_est: float):
    db.save_chat_message(
        msg_id=user_msg_id,
        session_id=session_id,
        role="user",
        content=request.message
    )
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


def _openai_style_messages(request: ChatRequest, system_instruction: str):
    messages = [{"role": "system", "content": system_instruction}]
    for msg in request.history:
        role = "user" if msg.role == "user" else "assistant"
        messages.append({"role": role, "content": msg.content})
    messages.append({"role": "user", "content": request.message})
    return messages


def _gemini_contents(request: ChatRequest):
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
    return contents


async def call_agnes_llm(api_key: str, model_name: str, history: list, user_message: str, system_instruction: str):
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
        AGNES_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": "FastAPI-Agnes-Client"
        }
    )

    def _req():
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))

    return await asyncio.to_thread(_req)


async def _generate_full_response(request: ChatRequest, system_instruction: str):
    """Buffered (non-streaming) generation across the whole model chain.
    Returns (response_text, model_used_name, tokens_input, tokens_output)."""
    response_text = None
    model_used_name = "unknown"
    tokens_input = 0
    tokens_output = 0

    agnes_api_key = os.environ.get("AGNES_API_KEY")
    api_key = os.environ.get("GEMINI_API_KEY")

    # Try Agnes API first
    if agnes_api_key:
        agnes_key_hash = get_key_hash(agnes_api_key)
        now = time.time()
        for a_model in AGNES_MODELS:
            blacklist_until = EXHAUSTED_MODELS.get((agnes_key_hash, a_model), 0)
            if now < blacklist_until:
                continue
            try:
                print(f"Calling Agnes API with model {a_model}...")
                a_res = await call_agnes_llm(agnes_api_key, a_model, request.history, request.message, system_instruction)
                response_text = a_res["choices"][0]["message"]["content"]
                model_used_name = f"agnes/{a_model}"
                usage = a_res.get("usage", {})
                tokens_input = usage.get("prompt_tokens", 0)
                tokens_output = usage.get("completion_tokens", 0)
                print(f"Agnes API succeeded using {a_model}!")
                break
            except Exception as a_err:
                print(f"Agnes model {a_model} failed: {a_err}")
                err_str = str(a_err).lower()
                if "429" in err_str or "quota" in err_str or "rate limit" in err_str or "exhausted" in err_str:
                    EXHAUSTED_MODELS[(agnes_key_hash, a_model)] = time.time() + 14400
                elif "503" in err_str or "overloaded" in err_str or "timeout" in err_str:
                    pass # Just fallback to next model

    # Fallback to Gemini if Agnes was not used or failed
    if not response_text:
        contents = _gemini_contents(request)

        backup_key = os.environ.get("BACKUP_GEMINI_API_KEY")
        response = None
        last_error = None
        models_to_try = list(GEMINI_MODELS)

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

    return response_text, model_used_name, tokens_input, tokens_output


# ---------------------------------------------------------------------------
# Streaming generation (SSE)
# ---------------------------------------------------------------------------

def _strip_complete_tags(text: str) -> str:
    """Removes fully-formed internal tags ([UNANSWERED], [SAVE_LEAD:...]) so they
    never leak into the streamed UI text. Partial tags are left for the caller
    to hold back until complete."""
    text = _UNANSWERED_RE.sub("", text)
    text = _SAVE_LEAD_RE.sub("", text)
    return text


def _safe_emit_cut(text: str) -> int:
    """Index up to which text is safe to emit: hold back a trailing fragment
    that starts with '[' but has no closing ']' yet (could be a partial tag)."""
    i = text.rfind('[')
    if i != -1 and ']' not in text[i:]:
        return i
    return len(text)


async def _stream_agnes(api_key: str, model_name: str, request: ChatRequest, system_instruction: str):
    """Yields ('token', text) events, then a final ('usage', {...}), using the
    Agnes OpenAI-compatible endpoint with stream=true."""
    import httpx
    payload = {
        "model": model_name,
        "messages": _openai_style_messages(request, system_instruction),
        "temperature": 0.7,
        "max_tokens": 1024,
        "stream": True,
        "stream_options": {"include_usage": True},
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "FastAPI-Agnes-Client",
    }
    usage = {"input": 0, "output": 0}
    async with httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=10.0, read=90.0)) as client:
        async with client.stream("POST", AGNES_URL, json=payload, headers=headers) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                line = line.strip()
                if not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    obj = json.loads(data)
                except Exception:
                    continue
                u = obj.get("usage") or {}
                if u:
                    usage["input"] = u.get("prompt_tokens", usage["input"])
                    usage["output"] = u.get("completion_tokens", usage["output"])
                choices = obj.get("choices") or []
                delta = (choices[0].get("delta") or {}) if choices else {}
                text = delta.get("content")
                if text:
                    yield ("token", text)
    yield ("usage", usage)


async def _stream_gemini(api_key: str, model_name: str, request: ChatRequest, system_instruction: str):
    """Yields ('token', text) events, then a final ('usage', {...}), using the
    Gemini generate_content_stream API."""
    client = genai.Client(api_key=api_key)
    contents = _gemini_contents(request)
    usage = {"input": 0, "output": 0}
    stream = await client.aio.models.generate_content_stream(
        model=model_name,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        ),
    )
    async for chunk in stream:
        text = getattr(chunk, "text", None)
        if text:
            yield ("token", text)
        um = getattr(chunk, "usage_metadata", None)
        if um:
            usage["input"] = getattr(um, "prompt_token_count", 0) or 0
            usage["output"] = getattr(um, "candidates_token_count", 0) or 0
    yield ("usage", usage)


def _stream_provider_plan(request: ChatRequest):
    """Ordered list of (kind, api_key, model) to try for streaming."""
    plan = []
    agnes_api_key = os.environ.get("AGNES_API_KEY")
    if agnes_api_key:
        now = time.time()
        key_hash = get_key_hash(agnes_api_key)
        for m in AGNES_MODELS:
            if now >= EXHAUSTED_MODELS.get((key_hash, m), 0):
                plan.append(("agnes", agnes_api_key, m))

    api_key = os.environ.get("GEMINI_API_KEY")
    backup_key = os.environ.get("BACKUP_GEMINI_API_KEY")
    models_to_try = list(GEMINI_MODELS)
    if request.model_override and request.model_override in models_to_try:
        models_to_try.remove(request.model_override)
        models_to_try.insert(0, request.model_override)

    now = time.time()
    if api_key:
        key_hash = get_key_hash(api_key)
        for m in models_to_try:
            if now >= EXHAUSTED_MODELS.get((key_hash, m), 0):
                plan.append(("gemini", api_key, m))
    if backup_key:
        key_hash = get_key_hash(backup_key)
        for m in models_to_try:
            if now >= EXHAUSTED_MODELS.get((key_hash, m), 0):
                plan.append(("gemini", backup_key, m))
    return plan


async def _first_stream_item(agen):
    async for item in agen:
        if item[0] == "token":
            return item
    raise StopAsyncIteration("provider stream produced no tokens")


async def _generate_event_stream(request: ChatRequest, system_instruction: str):
    """Streams ('token', text) / ('usage', {...}) / ('model', name) events across
    the provider chain. A provider that stalls on its first token for more
    than STREAM_FIRST_TOKEN_TIMEOUT seconds is skipped. If no provider can
    stream, the full buffered chain is used and emitted as a single token."""
    for kind, key, model in _stream_provider_plan(request):
        if not key:
            continue
        agen = _stream_agnes(key, model, request, system_instruction) if kind == "agnes" \
            else _stream_gemini(key, model, request, system_instruction)
        try:
            first = await asyncio.wait_for(_first_stream_item(agen), timeout=STREAM_FIRST_TOKEN_TIMEOUT)
        except (asyncio.TimeoutError, StopAsyncIteration, Exception) as e:
            print(f"Stream provider {kind}/{model} failed before first token ({e}); failing over.")
            try:
                await agen.aclose()
            except Exception:
                pass
            continue
        yield ("model", f"agnes/{model}" if kind == "agnes" else model)
        yield first
        try:
            async for item in agen:
                yield item
        except Exception as e:
            # Mid-stream failure: keep what was emitted, close out as done.
            print(f"Stream provider {kind}/{model} failed mid-stream: {e}")
        return
    # Buffered fallback: reuse the full non-streaming chain so the answer
    # still lands even when no provider supports streaming.
    text, model_used, ti, to = await _generate_full_response(request, system_instruction)
    yield ("model", model_used)
    yield ("token", text)
    yield ("usage", {"input": ti, "output": to})


async def _chat_sse_generator(request: ChatRequest, session_id: str,
                              background_tasks: BackgroundTasks, start_time: float):
    def sse(obj) -> str:
        return f"data: {json.dumps(obj, ensure_ascii=False)}\n\n"

    try:
        # Stage 1: visible immediately so the UI never sits blank.
        yield sse({"type": "status", "stage": "thinking"})
        # Stage 2: while RAG retrieval runs.
        yield sse({"type": "status", "stage": "retrieving"})
        system_instruction, knowledge_chunks = await asyncio.to_thread(_prepare_chat_context, request)

        raw_full = ""
        carry = ""          # tag-cleaned text not yet emitted
        emitted_clean = ""  # tag-cleaned text already emitted
        model_used_name = "unknown"
        tokens_input = 0
        tokens_output = 0
        first_token = True

        try:
            async for kind, payload in _generate_event_stream(request, system_instruction):
                if kind == "token":
                    raw_full += payload
                    carry = _strip_complete_tags(carry + payload)
                    cut = _safe_emit_cut(carry)
                    to_emit, carry = carry[:cut], carry[cut:]
                    if to_emit:
                        if first_token:
                            yield sse({"type": "status", "stage": "writing"})
                            first_token = False
                        emitted_clean += to_emit
                        yield sse({"type": "token", "text": to_emit})
                elif kind == "usage":
                    tokens_input = int(payload.get("input", 0) or 0)
                    tokens_output = int(payload.get("output", 0) or 0)
                elif kind == "model":
                    model_used_name = payload
        except Exception as gen_err:
            print(f"chat/stream generation failed: {gen_err}")
            yield sse({"type": "error", "message": "generation failed"})
            return

        # Finalize: run the same tag post-processing as /chat (lead capture,
        # unanswered logging) and flush any held-back tail.
        cleaned = _postprocess_response(raw_full, session_id, request.message, background_tasks)
        remainder = cleaned[len(emitted_clean):] \
            if cleaned.startswith(emitted_clean) and len(cleaned) > len(emitted_clean) else ""
        if remainder:
            yield sse({"type": "token", "text": remainder})

        latency_ms = int((time.time() - start_time) * 1000)
        cost_est = (tokens_input * 0.075 / 1_000_000) + (tokens_output * 0.30 / 1_000_000)
        formatted_chunks = _format_chunks(knowledge_chunks)

        user_msg_id = str(uuid.uuid4())
        model_msg_id = str(uuid.uuid4())
        await asyncio.to_thread(
            _persist_chat_turn, user_msg_id, model_msg_id, session_id, request,
            cleaned, formatted_chunks, system_instruction,
            latency_ms, tokens_input, tokens_output, cost_est)

        yield sse({
            "type": "done",
            "response": cleaned,
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
        })
    except Exception as e:
        print(f"chat/stream fatal error: {e}")
        yield sse({"type": "error", "message": "stream failed"})


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
    db.save_chat_session(session_id, request.mode)

    # 3-5. RAG retrieval + live profile digest + system prompt (shared pipeline)
    system_instruction, knowledge_chunks = _prepare_chat_context(request)

    try:
        response_text, model_used_name, tokens_input, tokens_output = \
            await _generate_full_response(request, system_instruction)

        # Calculate Latency & Token Metrics
        latency_ms = int((time.time() - start_time) * 1000)
        cost_est = (tokens_input * 0.075 / 1_000_000) + (tokens_output * 0.30 / 1_000_000)

        # Parse tags (unanswered questions / lead capture), strip from text
        response_text = _postprocess_response(response_text, session_id, request.message, background_tasks)

        # Generate Message IDs
        user_msg_id = str(uuid.uuid4())
        model_msg_id = str(uuid.uuid4())

        formatted_chunks = _format_chunks(knowledge_chunks)
        _persist_chat_turn(
            user_msg_id, model_msg_id, session_id, request,
            response_text, formatted_chunks, system_instruction,
            latency_ms, tokens_input, tokens_output, cost_est
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
            <p><strong>Timestamp:</strong> {now_ist_iso()}</p>
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
            await send_alert_email(rca_subject, rca_message)
        except Exception as mail_err:
            print(f"Failed to send alert email: {mail_err}")

        raise HTTPException(
            status_code=500,
            detail=f"Failed to communicate with AI model: {str(e)}"
        )


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest, client_request: Request, background_tasks: BackgroundTasks):
    """Server-Sent Events variant of /chat.

    Event flow:
      {"type":"status","stage":"thinking"|"retrieving"|"writing"}  -- UI stages
      {"type":"token","text": ...}                                 -- streamed deltas
      {"type":"done","response":..., "session_id":..., "message_id":..., "trace":{...}}
      {"type":"error","message": ...}                              -- frontend falls back to /chat
    """
    client_ip = client_request.client.host if client_request.client else "unknown"
    if not check_chat_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please wait a minute before sending more messages."
        )

    session_id = request.session_id or str(uuid.uuid4())
    db.save_chat_session(session_id, request.mode)

    return StreamingResponse(
        _chat_sse_generator(request, session_id, background_tasks, time.time()),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
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
        'agnes-3.0-flash',
        'agnes-2.5-flash',
        'gemini-3.5-flash',
        'gemini-1.5-flash'
    ]

    results = []
    agnes_hash = get_key_hash(os.getenv("AGNES_API_KEY"))
    for m in models_list:
        if m.startswith("agnes-"):
            # Check if exhausted on agnes key
            a_blacklist = EXHAUSTED_MODELS.get((agnes_hash, m), 0)
            status = "exhausted" if now < a_blacklist else "available"
        else:
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
