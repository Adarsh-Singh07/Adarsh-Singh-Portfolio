import os
import json
import hashlib
import math
from google import genai
from google.genai import types
from db import get_db_connection

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
CV_PATH = os.path.join(DATA_DIR, "cv.txt")
PROFILE_PATH = os.path.join(DATA_DIR, "profile.json")
HASH_PATH = os.path.join(DATA_DIR, "files_hash.json")

def calculate_file_hash(filepath):
    """Calculates the MD5 hash of a file."""
    if not os.path.exists(filepath):
        return ""
    hasher = hashlib.md5()
    with open(filepath, "rb") as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def chunk_data():
    """
    Parses cv.txt and profile.json into a list of structured dictionaries
    containing content and chunk metadata.
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
            
    # 2. Chunk profile.json
    if os.path.exists(PROFILE_PATH):
        try:
            with open(PROFILE_PATH, "r", encoding="utf-8") as f:
                profile = json.load(f)
                
            # We index different sections under 'general', since it contains the superset
            # or we consolidate sections
            data = profile.get("general", profile)
            
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
                
        except Exception as e:
            print(f"Error chunking profile.json: {e}")
            
    return chunks

def generate_embeddings_batch(client, texts):
    """Calls the Gemini Embedding API for a list of texts individually."""
    embeddings = []
    for text in texts:
        try:
            response = client.models.embed_content(
                model="gemini-embedding-2",
                contents=text
            )
            if hasattr(response, 'embedding') and response.embedding:
                embeddings.append(response.embedding.values)
            elif hasattr(response, 'embeddings') and response.embeddings:
                embeddings.append(response.embeddings[0].values)
            else:
                print(f"Invalid embedding response format for text: {text[:30]}")
                embeddings.append([0.0] * 3072)
        except Exception as e:
            print(f"Error calling embedding API for text: {e}")
            embeddings.append([0.0] * 3072)
    return embeddings

def check_cache_validity():
    """Checks if the cached RAG database matches the current source files."""
    if not os.path.exists(HASH_PATH):
        return False
        
    try:
        with open(HASH_PATH, "r") as f:
            saved_hashes = json.load(f)
    except Exception:
        return False
        
    current_cv_hash = calculate_file_hash(CV_PATH)
    current_profile_hash = calculate_file_hash(PROFILE_PATH)
    
    if (saved_hashes.get("cv_hash") == current_cv_hash and 
        saved_hashes.get("profile_hash") == current_profile_hash):
        
        # Verify db has records
        conn = get_db_connection()
        count = conn.execute("SELECT COUNT(*) FROM rag_chunks").fetchone()[0]
        conn.close()
        return count > 0
        
    return False

def save_hashes():
    """Saves the current file hashes to file."""
    hashes = {
        "cv_hash": calculate_file_hash(CV_PATH),
        "profile_hash": calculate_file_hash(PROFILE_PATH)
    }
    with open(HASH_PATH, "w") as f:
        json.dump(hashes, f, indent=2)

def index_knowledge_base(api_key: str):
    """
    Chunks cv.txt and profile.json, generates embeddings via Gemini,
    and inserts records into the SQLite database. Caches to avoid redundant runs.
    """
    if check_cache_validity():
        print("RAG database cache is valid. Skipping embedding generation.")
        return

    print("Index stale or missing. Rebuilding RAG database...")
    chunks = chunk_data()
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
    conn = get_db_connection()
    try:
        conn.execute("DELETE FROM rag_chunks") # Clear old index
        
        for chunk, emb in zip(chunks, all_embeddings):
            conn.execute(
                """
                INSERT INTO rag_chunks (source_file, chunk_title, content, embedding_json)
                VALUES (?, ?, ?, ?)
                """,
                (chunk["source_file"], chunk["chunk_title"], chunk["content"], json.dumps(emb))
            )
        conn.commit()
        save_hashes()
        print(f"Successfully indexed {len(chunks)} chunks in SQLite.")
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
            model="gemini-embedding-2",
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

    # 2. Retrieve all chunks from SQLite
    conn = get_db_connection()
    rows = conn.execute("SELECT source_file, chunk_title, content, embedding_json FROM rag_chunks").fetchall()
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
