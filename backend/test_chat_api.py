import os
import sys

# Load env variables manually from parent directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(dotenv_path):
    import dotenv
    dotenv.load_dotenv(dotenv_path)

# Ensure backend directory is in path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

print("Sending request to /api/v1/portfolio/chat...")
try:
    response = client.post(
        "/api/v1/portfolio/chat",
        json={
            "message": "Hi! Can you tell me what experience you have with Azure Databricks?",
            "history": []
        }
    )

    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Response Success! Gemini output:")
        print(response.json().get("response"))
    else:
        print("Error Response:")
        print(response.text)
except Exception as e:
    print(f"Exception raised during request: {e}")
