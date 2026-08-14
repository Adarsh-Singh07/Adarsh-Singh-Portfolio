import os
import time
import json
import asyncio
import logging
import httpx
from typing import Optional, Dict, Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("LinkedInPublisher")

METRICS = {
    "linkedin_posts_sent": 0,
    "linkedin_posts_failed": 0,
    "linkedin_total_latency_seconds": 0.0,
    "linkedin_average_latency": 0.0,
    "last_successful_post": None,
    "last_failure_reason": None
}

class LinkedInPublisher:
    """Production-grade LinkedIn Publisher utilizing Make.com OAuth Webhook."""
    
    def __init__(self, webhook_url: Optional[str] = None):
        self.webhook_url = webhook_url or os.getenv(
            "LINKEDIN_MAKE_WEBHOOK",
            "https://hook.eu1.make.com/jhrc9xp3yiu8jcbz767e830kbui6uejb"
        )
        
    async def publish(self, text: str, image_url: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Publishes post text (and optional image_url) to personal LinkedIn profile via Make.com OAuth Webhook with 3x Exponential Backoff retries."""
        
        if not self.webhook_url:
            err_msg = "LINKEDIN_MAKE_WEBHOOK environment variable is not configured."
            logger.error(f"[LinkedIn] Error: {err_msg}")
            METRICS["linkedin_posts_failed"] += 1
            METRICS["last_failure_reason"] = err_msg
            return {"status": "failed", "reason": err_msg}

        payload = {"text": text}
        if image_url:
            payload["image_url"] = image_url

        payload_size = len(json.dumps(payload))
        logger.info(f"[LinkedIn] Job Created")
        logger.info(f"[LinkedIn] Preparing payload | Size: {payload_size} bytes")
        logger.info(f"[LinkedIn] POST {self.webhook_url}")

        max_retries = 3
        backoff_delays = [2, 4, 8]
        start_time = time.time()

        for attempt in range(1, max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    res = await client.post(self.webhook_url, json=payload)
                    
                if res.status_code in [200, 202]:
                    latency = round(time.time() - start_time, 3)
                    logger.info("[LinkedIn] ✓ Webhook accepted by Make.com")
                    logger.info(f"[LinkedIn] LinkedIn publishing completed | Latency: {latency}s")
                    
                    METRICS["linkedin_posts_sent"] += 1
                    METRICS["linkedin_total_latency_seconds"] += latency
                    METRICS["linkedin_average_latency"] = round(
                        METRICS["linkedin_total_latency_seconds"] / METRICS["linkedin_posts_sent"], 3
                    )
                    METRICS["last_successful_post"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                    
                    return {
                        "status": "success",
                        "platform": "Personal LinkedIn Profile (Make.com OAuth)",
                        "status_code": res.status_code,
                        "response_text": res.text,
                        "latency_seconds": latency
                    }
                else:
                    error_desc = f"HTTP {res.status_code}: {res.text}"
                    logger.warning(f"[LinkedIn] Attempt {attempt}/{max_retries} failed: {error_desc}")
            except Exception as e:
                error_desc = f"Network/Timeout error: {str(e)}"
                logger.warning(f"[LinkedIn] Attempt {attempt}/{max_retries} failed with exception: {error_desc}")

            if attempt < max_retries:
                delay = backoff_delays[attempt - 1]
                logger.info(f"[LinkedIn] Retrying in {delay} seconds (Exponential Backoff)...")
                await asyncio.sleep(delay)

        failure_reason = f"All {max_retries} attempts failed to deliver to Make.com Webhook."
        logger.error(f"[LinkedIn] LinkedIn webhook failed: {failure_reason}")
        METRICS["linkedin_posts_failed"] += 1
        METRICS["last_failure_reason"] = failure_reason

        return {
            "status": "failed",
            "platform": "Personal LinkedIn Profile (Make.com OAuth)",
            "reason": failure_reason
        }

def get_linkedin_metrics() -> Dict[str, Any]:
    return METRICS
