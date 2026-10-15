import os
import json
import hashlib
import math
from google import genai
from google.genai import types
import db

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CV_PATH = os.path.join(DATA_DIR, "cv.txt")
PROFILE_PATH = os.path.join(DATA_DIR, "profile.json")
HASH_PATH = os.path.join(DATA_DIR, "files_hash.json")

# Embedding model for RAG retrieval. Google retired text-embedding-004, so it
# 404s on the Gemini API. gemini-embedding-001 is the current model; its
# default output is 3072 dims. Keep both in one place so index, query, and
# fallback vectors can never drift apart.
EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMS = 3072

def _resolve_role_doc(raw):
    """Unwraps the role-keyed profile store ({'general': {...}, ...}) to the general role doc."""
    if isinstance(raw, dict) and isinstance(raw.get("general"), dict):
        return raw["general"]
    return raw

def _get_live_profile_doc(mode="general"):
    """
    Fetches the canonical profile document from Supabase (the same source the
    public /profile endpoint reads). Returns the resolved role doc, or None
    when unavailable. Never raises — callers fall back to static files.
    """
    try:
        content, _updated_at = db.get_profile_config()
    except Exception as e:
        print(f"Live profile fetch failed, will fall back to static files: {e}")
        return None
    if not content or not isinstance(content, dict):
        return None
    if mode and isinstance(content.get(mode), dict):
        return content[mode]
    return _resolve_role_doc(content)

def _trim(text, limit):
    text = (text or "").strip().replace("\n", " ")
    if len(text) <= limit:
        return text
    return text[:limit].rsplit(" ", 1)[0] + "..."

def build_profile_digest(data):
    """
    Pure function: builds a compact, token-sane structured digest from a
    resolved profile dict. Contains real projects, skills, certifications and
    journey — the guaranteed grounding floor for chat context.
    """
    if not data or not isinstance(data, dict):
        return ""
    lines = []
    hero = data.get("hero", {}) or {}
    lines.append(f"Name: {hero.get('titleName', 'Adarsh Singh')}")
    if hero.get("badge"):
        lines.append(f"Title: {hero['badge']}")
    if hero.get("subtext"):
        lines.append(f"About: {_trim(hero['subtext'], 400)}")
    lines.append("")

    projects = data.get("projects", []) or []
    if projects:
        lines.append("PROJECTS:")
        for p in projects:
            if not isinstance(p, dict):
                continue
            tech = ", ".join(p.get("technologies", []) or [])
            desc = _trim(p.get("description", ""), 450)
            links = []
            if p.get("githubUrl"):
                links.append(f"GitHub: {p['githubUrl']}")
            if p.get("demoUrl"):
                links.append(f"Demo: {p['demoUrl']}")
            lines.append(f"- {p.get('title', 'Untitled')}")
            if tech:
                lines.append(f"  Tech: {tech}")
            if desc:
                lines.append(f"  {desc}")
            if links:
                lines.append("  " + " | ".join(links))
        lines.append("")

    skills = data.get("skills", []) or []
    if skills:
        lines.append("SKILLS:")
        for cat in skills:
            if not isinstance(cat, dict):
                continue
            names = [s.get("name", "") for s in (cat.get("skills") or [])
                     if isinstance(s, dict) and s.get("name")]
            if names:
                lines.append(f"- {cat.get('title', 'Skills')}: {', '.join(names[:14])}")
        lines.append("")

    certs = data.get("certifications", []) or []
    if certs:
        lines.append("CERTIFICATIONS:")
        for c in certs:
            if not isinstance(c, dict):
                continue
            line = f"- {c.get('title', '')} — {c.get('issuer', '')}"
            if c.get("date"):
                line += f" ({c['date']})"
            if c.get("credentialUrl"):
                line += f" [verify: {c['credentialUrl']}]"
            lines.append(line)
        lines.append("")

    journey = data.get("journey", []) or []
    if journey:
        lines.append("CAREER JOURNEY:")
        for m in journey:
            if not isinstance(m, dict):
                continue
            sub = _trim(m.get("subtitle", "") or m.get("description", ""), 160)
            entry = f"- {m.get('title', '')} ({m.get('period', '')})"
            if sub:
                entry += f": {sub}"
            lines.append(entry)
        lines.append("")

    strengths = data.get("strengths", []) or []
    if strengths:
        names = [s.get("title") if isinstance(s, dict) else s for s in strengths]
        names = [n for n in names if n]
        if names:
            lines.append("KEY STRENGTHS: " + ", ".join(names[:8]))

    return "\n".join(lines).strip()

def get_profile_digest(mode="general"):
    """
    Returns the live profile digest for chat context. Tries the canonical
    Supabase document first, falls back to the static profile.json file.
    Never raises — returns "" only when nothing is available.
    """
    doc = _get_live_profile_doc(mode)
    if doc is None:
        try:
            if os.path.exists(PROFILE_PATH):
                with open(PROFILE_PATH, "r", encoding="utf-8") as f:
                    doc = _resolve_role_doc(json.load(f))
        except Exception as e:
            print(f"Static profile fallback failed: {e}")
            return ""
    if doc is None:
        return ""
    try:
        return build_profile_digest(doc)
    except Exception as e:
        print(f"Digest build failed: {e}")
        return ""

def _current_profile_source():
    """
    Returns (profile_hash, profile_doc) used for indexing.
    Prefers the live Supabase document so the index never goes stale;
    falls back to the static profile.json file. Never raises.
    """
    doc = _get_live_profile_doc("general")
    if doc is not None:
        h = hashlib.md5(json.dumps(doc, sort_keys=True).encode("utf-8")).hexdigest()
        return h, doc
    return calculate_file_hash(PROFILE_PATH), None

def calculate_file_hash(filepath):
    """Calculates the MD5 hash of a file."""
    if not os.path.exists(filepath):
        return ""
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def chunk_data(profile_doc=None):
    """
    Parses cv.txt and the profile document into a list of structured dictionaries
    containing content and chunk metadata.
    profile_doc: a resolved profile dict (live document preferred). When None,
    falls back to the static profile.json file.
    """
    chunks = []
    
    # 1. Chunk cv.txt
    if os.path.exists(CV_PATH):
        try:
            with open(CV_PATH, "r", encoding="utf-8") as f:
                cv_text = f.read()
                
            # Split by double newlines (paragraphs/sections)
            raw_paragraphs = cv_text.split("\n\n")
            for i, p in enumerate(raw_paragraphs):
                p_trimmed = p.strip()
                if not p_trimmed:
                    continue
                
                # Try to extract a title from the first line of the chunk
                lines = p_trimmed.split("\n")
                title = lines[0][:50] if lines else "CV Section"
                
                chunks.append({
                    "source_file": "cv.txt",
                    "chunk_title": f"CV: {title}",
                    "content": p_trimmed
                })
        except Exception as e:
            print(f"Error chunking cv.txt: {e}")
            
    # 2. Chunk profile (live document preferred, static file fallback)
    profile = profile_doc
    if profile is None and os.path.exists(PROFILE_PATH):
        try:
            with open(PROFILE_PATH, "r", encoding="utf-8") as f:
                profile = _resolve_role_doc(json.load(f))
        except Exception as e:
            print(f"Error chunking profile.json: {e}")

    if profile:
        try:
            # We index different sections under 'general', since it contains the superset
            # or we consolidate sections
            data = _resolve_role_doc(profile)
            
            # 2.1 Chunk projects
            for project in data.get("projects", []):
                title = project.get("title", "Project")
                tech_stack = ", ".join(project.get("technologies", []))
                highlights = "\n".join([f"- {h}" for h in project.get("highlights", [])])
                
                content = (
                    f"Project: {title}\n"
                    f"Role: {project.get('role', '')}\n"
                    f"Tech Stack: {tech_stack}\n"
                    f"Description: {project.get('description', '')}\n"
                    f"Highlights:\n{highlights}"
                )
                chunks.append({
                    "source_file": "profile.json",
                    "chunk_title": f"Project: {title}",
                    "content": content
                })
                
            # 2.2 Chunk skills
            for cat in data.get("skills", []):
                cat_name = cat.get("title", "Skill Set")
                skills_list = ", ".join([s.get("name", "") for s in cat.get("skills", []) if s.get("name")])
                content = f"Skills Category: {cat_name}\nAssociated Technologies: {skills_list}"
                chunks.append({
                    "source_file": "profile.json",
                    "chunk_title": f"Skills: {cat_name}",
                    "content": content
                })
                
            # 2.3 Chunk certifications
            for cert in data.get("certifications", []):
                title = cert.get("title", "Certification")
                code_val = cert.get("code") or cert.get("id", "")
                content = (
                    f"Certification: {title}\n"
                    f"Issuer: {cert.get('issuer', '')}\n"
                    f"Verification Code: {code_val}\n"
                    f"Date: {cert.get('date', '')}"
                )
                chunks.append({
                    "source_file": "profile.json",
                    "chunk_title": f"Cert: {title}",
                    "content": content
                })
                
            # 2.4 Chunk journey (career milestones)
            for milestone in data.get("journey", []):
                title = milestone.get("title", "")
                subtitle = milestone.get("subtitle", "")
                period = milestone.get("period", "")
                desc = milestone.get("description", "")
                
                content = (
                    f"Career Milestone: {title} ({period})\n"
                    f"Subtitle/Role: {subtitle}\n"
                    f"Description: {desc}"
                )
                chunks.append({
                    "source_file": "profile.json",
                    "chunk_title": f"Timeline: {title}",
                    "content": content
                })
                
            # 2.5 Chunk blogs
            for blog in data.get("blogs", []):
                title = blog.get("title", "")
                content = (
                    f"Blog Post: {title}\n"
                    f"Category: {blog.get('category', '')}\n"
                    f"Read Time: {blog.get('readTime', '')}\n"
                    f"Summary: {blog.get('excerpt', '')}"
                )
                chunks.append({
                    "source_file": "profile.json",
                    "chunk_title": f"Blog: {title}",
                    "content": content
                })
                
            # 2.6 Chunk FAQs
            for faq in data.get("faqs", []):
                q = faq.get("question", "")
                a = faq.get("answer", "")
                if q and a:
                    content = f"Question: {q}\nAnswer: {a}"
                    chunks.append({
                        "source_file": "profile.json",
                        "chunk_title": f"FAQ: {q[:40]}",
                        "content": content
                    })
                
        except Exception as e:
            print(f"Error chunking profile.json: {e}")
            
    return chunks

def generate_embeddings_batch(client, texts):
    """Calls the Gemini Embedding API for a list of texts individually."""
    embeddings = []
    for text in texts:
        try:
            response = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=text
            )
            if hasattr(response, 'embedding') and response.embedding:
                embeddings.append(response.embedding.values)
            elif hasattr(response, 'embeddings') and response.embeddings:
                embeddings.append(response.embeddings[0].values)
            else:
                print(f"Invalid embedding response format for text: {text[:30]}")
                embeddings.append([0.0] * EMBEDDING_DIMS)
        except Exception as e:
            print(f"Error calling embedding API for text: {e}")
            embeddings.append([0.0] * EMBEDDING_DIMS)
    return embeddings

def check_cache_validity(current_profile_hash):
    """
    Checks if the cached RAG database matches the current profile source.
    current_profile_hash: hash of the live profile doc (preferred) or of the
    static profile.json file. Adds a DB round-trip guard so a missing/empty
    table can never be mistaken for a valid cache.
    """
    if not os.path.exists(HASH_PATH):
        return False

    try:
        with open(HASH_PATH, "r") as f:
            saved_hashes = json.load(f)
    except Exception:
        return False

    if saved_hashes.get("cv_hash") != calculate_file_hash(CV_PATH):
        return False
    if saved_hashes.get("profile_hash") != current_profile_hash:
        return False

    # Force re-index whenever the embedding model changes: embeddings written
    # with a retired/replaced model are garbage (e.g. zero vectors), so a
    # cache saved under a different model can never be reused.
    if saved_hashes.get("embedding_model") != EMBEDDING_MODEL:
        return False

    # Verify db has records
    try:
        conn = db.get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM rag_chunks")
        count = cursor.fetchone()['count']
        conn.close()
    except Exception as e:
        print(f"RAG cache DB check failed: {e}")
        return False
    return count > 0

def save_hashes(profile_hash):
    """Saves the current source hashes to file."""
    hashes = {
        "cv_hash": calculate_file_hash(CV_PATH),
        "profile_hash": profile_hash,
        "embedding_model": EMBEDDING_MODEL
    }
    with open(HASH_PATH, "w") as f:
        json.dump(hashes, f, indent=2)


# Supabase-backed index cache metadata. The local files_hash.json lives on the
# container's ephemeral disk, so every fresh instance would otherwise re-embed
# every chunk on every cold start (~19s of embedding API calls). This
# single-row table records which profile/cv hashes and embedding model the
# persisted rag_chunks rows were built from, letting cold instances reuse the
# stored index without any embedding API calls.
def _ensure_index_cache_table(conn):
    """Creates the index-cache metadata table if it doesn't exist (idempotent)."""
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS rag_index_cache (
            id INTEGER PRIMARY KEY,
            profile_hash TEXT NOT NULL,
            cv_hash TEXT NOT NULL,
            embedding_model TEXT NOT NULL,
            chunk_count INTEGER NOT NULL,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """)
    conn.commit()


def _db_cache_valid(current_profile_hash):
    """
    Checks whether Supabase already holds a usable index for the current
    profile + embedding model, without relying on the ephemeral local hash
    file. Returns (valid, chunk_count). Never raises — any DB error means
    "rebuild", not "crash".
    """
    try:
        conn = db.get_db_connection()
        try:
            _ensure_index_cache_table(conn)
            cursor = conn.cursor()
            cursor.execute(
                "SELECT profile_hash, cv_hash, embedding_model, chunk_count "
                "FROM rag_index_cache WHERE id = 1"
            )
            row = cursor.fetchone()
            if row is None:
                return False, 0
            if row["profile_hash"] != current_profile_hash:
                return False, 0
            if row["cv_hash"] != calculate_file_hash(CV_PATH):
                return False, 0
            # Embeddings written with a different model are garbage — never reuse.
            if row["embedding_model"] != EMBEDDING_MODEL:
                return False, 0
            cursor.execute("SELECT COUNT(*) as count FROM rag_chunks")
            count = cursor.fetchone()["count"]
            return count > 0, count
        finally:
            conn.close()
    except Exception as e:
        print(f"RAG index DB cache check failed (will rebuild): {e}")
        return False, 0


def _db_cache_save(profile_hash, chunk_count):
    """Records the freshly built index's metadata in Supabase. Non-fatal on error."""
    try:
        conn = db.get_db_connection()
        try:
            _ensure_index_cache_table(conn)
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO rag_index_cache (id, profile_hash, cv_hash, embedding_model, chunk_count, updated_at)
                VALUES (1, %s, %s, %s, %s, NOW())
                ON CONFLICT (id) DO UPDATE SET
                    profile_hash = EXCLUDED.profile_hash,
                    cv_hash = EXCLUDED.cv_hash,
                    embedding_model = EXCLUDED.embedding_model,
                    chunk_count = EXCLUDED.chunk_count,
                    updated_at = NOW()
                """,
                (profile_hash, calculate_file_hash(CV_PATH), EMBEDDING_MODEL, chunk_count),
            )
            conn.commit()
        finally:
            conn.close()
    except Exception as e:
        print(f"RAG index DB cache save failed (local cache still valid): {e}")

def index_knowledge_base(api_key: str):
    """
    Chunks cv.txt and the LIVE profile document (Supabase; static file
    fallback), generates embeddings via Gemini, and inserts records into the
    database. Caches to avoid redundant runs; re-indexes whenever the live
    document changes. On a fresh container the local hash file is gone, so the
    Supabase-backed rag_index_cache row is consulted before paying for
    embedding regeneration.
    """
    profile_hash, live_doc = _current_profile_source()

    if check_cache_validity(profile_hash):
        print("RAG database cache is valid. Skipping embedding generation.")
        return

    # Fresh container: the local hash file doesn't exist, but Supabase may
    # already hold an index built from this exact profile + embedding model
    # (the rag_chunks rows persist across instances). Reuse it — no embedding
    # API calls needed.
    db_valid, db_count = _db_cache_valid(profile_hash)
    if db_valid:
        print(f"RAG index cache found in Supabase ({db_count} chunks, model {EMBEDDING_MODEL}). "
              "Skipping embedding regeneration.")
        save_hashes(profile_hash)
        return

    print("Index stale or missing. Rebuilding RAG database...")
    chunks = chunk_data(live_doc)
    if not chunks:
        print("No source files found to index.")
        return

    client = genai.Client(api_key=api_key)
    
    # Batch embeddings call (up to 30 items per batch to stay safe under payload limits)
    batch_size = 30
    chunk_texts = [c["content"] for c in chunks]
    all_embeddings = []
    
    for i in range(0, len(chunk_texts), batch_size):
        batch = chunk_texts[i:i+batch_size]
        print(f"Generating embeddings for chunks {i+1} to {min(i+batch_size, len(chunk_texts))}...")
        embeddings = generate_embeddings_batch(client, batch)
        all_embeddings.extend(embeddings)

    # Insert into DB
    conn = db.get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM rag_chunks") # Clear old index
        
        for chunk, emb in zip(chunks, all_embeddings):
            cursor.execute(
                """
                INSERT INTO rag_chunks (source_file, chunk_title, content, embedding_json)
                VALUES (%s, %s, %s, %s)
                """,
                (chunk["source_file"], chunk["chunk_title"], chunk["content"], json.dumps(emb))
            )
        conn.commit()
        save_hashes(profile_hash)
        _db_cache_save(profile_hash, len(chunks))
        print(f"Successfully indexed {len(chunks)} chunks.")
    except Exception as e:
        print(f"Failed to save indexed chunks to database: {e}")
    finally:
        conn.close()

def cosine_similarity(v1, v2):
    """Calculates cosine similarity between two float vectors."""
    dot_product = sum(a * b for a, b in zip(v1, v2))
    magnitude1 = math.sqrt(sum(a * a for a in v1))
    magnitude2 = math.sqrt(sum(b * b for b in v2))
    if not magnitude1 or not magnitude2:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

def retrieve_context(api_key: str, query: str, top_k: int = 4):
    """
    Generates embedding for query, compares similarity against cached
    rag_chunks, and returns top K chunks with scores.
    """
    client = genai.Client(api_key=api_key)
    
    # 1. Generate query embedding
    try:
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=query
        )
        if hasattr(response, 'embeddings') and response.embeddings:
            query_vector = response.embeddings[0].values
        elif hasattr(response, 'embedding'):
            query_vector = response.embedding.values
        else:
            print("Embedding response invalid.")
            return []
    except Exception as e:
        print(f"Query embedding generation failed: {e}")
        return []

    # 2. Retrieve all chunks from the database
    conn = db.get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT source_file, chunk_title, content, embedding_json FROM rag_chunks")
    rows = cursor.fetchall()
    conn.close()
    
    # 3. Calculate similarities
    scored_chunks = []
    for row in rows:
        emb = json.loads(row["embedding_json"])
        score = cosine_similarity(query_vector, emb)
        scored_chunks.append({
            "source_file": row["source_file"],
            "chunk_title": row["chunk_title"],
            "content": row["content"],
            "similarity": score
        })
        
    # Sort and take top K
    scored_chunks.sort(key=lambda x: x["similarity"], reverse=True)
    return scored_chunks[:top_k]
