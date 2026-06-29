import os
import sys
import dotenv

# Add current dir to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import db
import rag

def main():
    # Load .env from project root
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dotenv.load_dotenv(os.path.join(root_dir, ".env"))
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY is not defined in your local .env file.")
        return
        
    print("Clearing local database cache...")
    if os.path.exists(db.DB_PATH):
        try:
            os.remove(db.DB_PATH)
        except Exception as e:
            print(f"Could not remove db file (might be locked): {e}")
            
    if os.path.exists(rag.HASH_PATH):
        try:
            os.remove(rag.HASH_PATH)
        except Exception as e:
            print(f"Could not remove hash file: {e}")

    print("Initializing SQLite Database locally...")
    db.init_db()
    
    print("Generating local RAG index (this will fetch Gemini embeddings)...")
    try:
        rag.index_knowledge_base(api_key)
        print("Local indexing completed successfully!")
    except Exception as e:
        print(f"Local indexing failed: {e}")

if __name__ == "__main__":
    main()
