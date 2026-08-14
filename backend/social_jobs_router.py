import os
import json
from fastapi import APIRouter, HTTPException, Header, Body
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/api/v1/social", tags=["Social Jobs Queue"])

QUEUE_FILE = os.path.expanduser("~/.hermes/social_jobs_queue.json")
WORKER_SECRET = os.getenv("HERMES_WORKER_SECRET", "")

def load_queue():
    if not os.path.exists(QUEUE_FILE):
        return []
    try:
        with open(QUEUE_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def save_queue(queue):
    os.makedirs(os.path.dirname(QUEUE_FILE), exist_ok=True)
    with open(QUEUE_FILE, "w") as f:
        json.dump(queue, f, indent=2)

class JobCreateReq(BaseModel):
    platform: str
    content: str
    title: Optional[str] = ""

class JobStatusReq(BaseModel):
    job_id: str
    status: str
    result_message: Optional[str] = ""

@router.post("/jobs/create")
def create_job(req: JobCreateReq):
    queue = load_queue()
    job_id = f"job_{int(os.times().user * 1000)}_{len(queue) + 1}"
    job = {
        "job_id": job_id,
        "platform": req.platform,
        "content": req.content,
        "title": req.title or "",
        "status": "pending",
        "result_message": "",
        "created_at": os.popen("date -u +'%Y-%m-%dT%H:%M:%SZ'").read().strip()
    }
    queue.append(job)
    save_queue(queue)
    return {"status": "success", "job": job}

@router.get("/jobs/pending")
def get_pending_jobs(authorization: Optional[str] = Header(None)):
    queue = load_queue()
    pending = [j for j in queue if j["status"] == "pending"]
    return {"status": "success", "jobs": pending}

@router.post("/jobs/complete")
def complete_job(req: JobStatusReq, authorization: Optional[str] = Header(None)):
    queue = load_queue()
    found = False
    for j in queue:
        if j["job_id"] == req.job_id:
            j["status"] = req.status
            j["result_message"] = req.result_message or ""
            j["updated_at"] = os.popen("date -u +'%Y-%m-%dT%H:%M:%SZ'").read().strip()
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Job ID not found")
    save_queue(queue)
    return {"status": "success", "message": f"Job {req.job_id} updated to {req.status}"}
