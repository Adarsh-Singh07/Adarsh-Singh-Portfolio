"""Unified AI reply generator with the same fallback structure as the chatbot.
Uses multiple Gemini keys + Groq fallback, and replies as Adarsh in first person.
All timestamps are IST-aware via timezone_ist where needed.
"""
import os
import time
import asyncio
from google import genai
from google.genai import types

MODELS_TO_TRY = [
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-2.5-flash",
]

EXHAUSTED_MODELS = {}

SIGNATURE = "\n\nBest regards,\nAdarsh Singh"


def _key_hash(key: str) -> str:
    import hashlib
    return hashlib.md5(key.encode("utf-8")).hexdigest() if key else ""


async def generate_reply(name: str, message: str, source: str, extra_context: str = "") -> str:
    """Generates a single AI response as Adarsh and returns the text."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    backup_key = os.getenv("BACKUP_GEMINI_API_KEY", "")
    groq_key = os.getenv("GROQ_API_KEY", "")

    system_instruction = f"""You are Adarsh Singh (18, Indian full-stack + GenAI developer) personally replying to someone who reached out on your portfolio.

Write EXACTLY like a real human texting/emailing a friend or peer — not like an assistant, not like a corporate bot.

Hard rules:
- First person ("I", "me", "my"). Never say "As an AI", "This automated system", "I'm an AI", or anything robotic.
- Sound like a confident, friendly Indian developer: warm, a little casual, concise. 2-4 short paragraphs max.
- Reply to what they actually said. Never confirm, accept, schedule, reschedule, or propose a meeting time without Adarsh's explicit approval. Scheduling requests are handled outside this generator and held for human review.
- Keep it personal: reference their name once, mirror their energy.
- No bullet-point spam, no numbered lists unless it truly helps. No markdown headings.
- End with a natural sign-off and your name on its own line:
Best regards,
Adarsh Singh

Visitor name: {name}
Source: {source}
Their message:
{message}

Extra context (use ONLY if directly relevant):
{extra_context}
"""

    contents = [
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=message)],
        )
    ]

    now = time.time()

    # 1. Groq fallback (non-critical if it fails)
    if groq_key:
        try:
            import urllib.request
            import json as _json
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": message},
            ]
            payload = _json.dumps(
                {
                    "model": "llama-3.1-8b-instant",
                    "messages": messages,
                    "temperature": 0.75,
                    "max_tokens": 900,
                }
            ).encode("utf-8")
            req = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=payload,
                headers={
                    "Authorization": f"Bearer {groq_key}",
                    "Content-Type": "application/json",
                },
            )
            with urllib.request.urlopen(req, timeout=12) as resp:
                body = resp.read().decode("utf-8")
                data = _json.loads(body)
                text = data["choices"][0]["message"]["content"]
                if text:
                    print("AI reply generated via Groq llama-3.1-8b-instant")
                    return _finalize(text)
        except Exception as e:
            print(f"Groq reply generation skipped: {e}")

    if not api_key and not backup_key:
        return _finalize(
            f"Thanks {name or 'there'} — I got your message from {source}. "
            "I'll review it and get back to you as soon as possible."
        )

    # 2. Gemini models in order, with backup key fallback
    for key, key_label in ((api_key, "primary"), (backup_key, "backup")):
        if not key:
            continue
        client = genai.Client(api_key=key)
        key_hash = _key_hash(key)
        for model in MODELS_TO_TRY:
            if EXHAUSTED_MODELS.get((key_hash, model), 0) > now:
                continue
            try:
                resp = await client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.75,
                    ),
                )
                text = resp.text or ""
                if text:
                    print(f"AI reply generated via {key_label} Gemini {model}")
                    return _finalize(text)
            except Exception as err:
                err_s = str(err).lower()
                if "429" in err_s or "quota exceeded" in err_s or "resource_exhausted" in err_s:
                    EXHAUSTED_MODELS[(key_hash, model)] = now + 7200
                    break
                if "503" in err_s or "overloaded" in err_s:
                    await asyncio.sleep(1.5)
                    continue
                break

    # 3. Last resort no-Gemini fallback
    return _finalize(
        f"Thanks {name or 'there'} — I received your message from {source}. "
        "I'll take a look and get back to you shortly."
    )


def _finalize(text: str) -> str:
    import re as _re
    text = (text or "").strip()
    # Strip stray code fences / markdown artifacts some models add.
    text = _re.sub(r"^```(?:text|markdown)?\s*", "", text)
    text = _re.sub(r"\s*```$", "", text)
    text = text.strip()
    # Collapse 3+ newlines to a single blank line.
    text = _re.sub(r"\n{3,}", "\n\n", text)
    # Normalize the signature: remove any existing trailing sign-off first.
    text = _re.sub(
        r"(?i)\n?\s*(best regards,?\s*adarsh singh|regards,?\s*adarsh|—\s*adarsh singh)\s*$",
        "",
        text,
    ).strip()
    if not text.endswith(SIGNATURE):
        text = text + ("" if text.endswith("\n") else "\n\n") + SIGNATURE
    return text
