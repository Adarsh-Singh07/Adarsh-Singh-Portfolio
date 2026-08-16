import os
import html
import base64
from email_engine.provider_factory import get_email_provider
from timezone_ist import now_ist_human
import db

SIGNATURE = "\nBest regards,\nAdarsh Singh"

async def send_outreach_email(visitor_name: str, visitor_email: str, subject: str, message: str, intent_category: str = "General Question", visitor_ack: bool = True):
    """
    Sends admin notification via Lark Mail.
    Visitor-facing reply is handled separately as a single AI reply.
    """
    provider = get_email_provider()
    escaped_name = html.escape(visitor_name)
    escaped_email = html.escape(visitor_email)
    escaped_subject = html.escape(subject)
    escaped_message = html.escape(message)
    
    admin_recipient = "admin@adarshsingh.in"
    html_admin = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 0; color: #2c3e50; }}
        .wrapper {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 35px 30px; text-align: center; color: white; }}
        .header h2 {{ margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }}
        .content {{ padding: 40px 35px; }}
        .meta-data {{ background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #667eea; }}
        .meta-item {{ margin-bottom: 10px; font-size: 15px; }}
        .meta-item:last-child {{ margin-bottom: 0; }}
        .meta-label {{ font-weight: 600; color: #475569; width: 80px; display: inline-block; }}
        .message-body {{ font-size: 16px; line-height: 1.7; color: #334155; white-space: pre-wrap; }}
        .footer {{ text-align: center; padding: 25px; background-color: #f8fafc; border-top: 1px solid #edf2f7; color: #94a3b8; font-size: 13px; }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h2>New Portfolio Inquiry</h2>
        </div>
        <div class="content">
          <div class="meta-data">
            <div class="meta-item"><span class="meta-label">From:</span> {escaped_name} ({escaped_email})</div>
            <div class="meta-item"><span class="meta-label">Subject:</span> {escaped_subject}</div>
            <div class="meta-item"><span class="meta-label">Date:</span> {now_ist_human()}</div>
          </div>
          <h3 style="margin-top: 0; color: #1e293b; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Message</h3>
          <div class="message-body">{escaped_message}</div>
        </div>
        <div class="footer">
          This secure notification was dispatched from your Adarsh Singh Portfolio.
        </div>
      </div>
    </body>
    </html>
    """
    
    admin_sent = False
    visitor_sent = False
    try:
        print("Attempting to send Admin Notification via Lark Mail API...")
        await provider.send_message(
            to=[admin_recipient],
            subject=f"[Portfolio Outreach] {subject}",
            body_html=html_admin,
            body_text=f"Outreach from {visitor_name} ({visitor_email}): {message}",
            reply_to=visitor_email
        )
        admin_sent = True
    except Exception as e:
        print(f"Lark Mail Admin Notification failed: {e}")

    return admin_sent, visitor_sent

async def send_ai_reply_email(
    name: str,
    visitor_email: str,
    subject: str,
    message: str,
    source: str = "Contact Form",
    contact_id: int = None,
) -> bool:
    """
    Generates a single AI response as Adarsh and sends it via Lark Mail.
    """
    provider = get_email_provider()
    ai_sent = False
    ai_error_detail = ""

    try:
        print("Attempting to generate and send AI reply via Lark Mail API...")
        import ai_reply

        context = ""
        try:
            import rag
            results = rag.retrieve_context(os.getenv("GEMINI_API_KEY") or "", message, top_k=3)
            if results:
                context = "\n".join([r.get("text") or r.get("content") or "" for r in results])
        except Exception as e:
            print(f"RAG retrieval failed during AI reply generation: {e}")

        reply_text = await ai_reply.generate_reply(
            name=name,
            message=message,
            source=source,
            extra_context=context,
        )
        reply_text = (reply_text or "").strip()
        if reply_text and not reply_text.endswith(SIGNATURE.strip()):
            reply_text = reply_text + SIGNATURE

        await provider.send_message(
            to=[visitor_email],
            subject=f"Re: {subject}",
            body_text=reply_text,
            body_html=f"<p>{reply_text.replace(chr(10), '<br>')}</p>",
        )
        ai_sent = True
        print("AI reply sent successfully.")
    except Exception as e:
        ai_error_detail = str(e)
        print(f"Lark Mail AI reply failed: {e}")

    if contact_id:
        try:
            ai_error_short = (ai_error_detail or "")[:250]
            db.save_email_action(
                contact_id=contact_id,
                action_type="ai_reply",
                status="sent" if ai_sent else "failed",
                detail=ai_error_short,
            )
        except Exception as e:
            print(f"Error recording AI reply status: {e}")

    return ai_sent

async def send_alert_email(subject: str, html_body: str):
    """
    Sends a critical operational alert/RCA to Adarsh via Lark Mail.
    """
    provider = get_email_provider()
    recipient = "admin@adarshsingh.in"
    sent = False
    
    try:
        print("Attempting to send alert via Lark Mail API...")
        await provider.send_message(
            to=[recipient],
            subject=subject,
            body_html=html_body,
            body_text="Critical Operational Alert: check html logs."
        )
        sent = True
    except Exception as e:
        print(f"Failed to send alert via Lark Mail API: {e}")
                
    if not sent:
        print(f"ALERT LOG ONLY (No mail channels active): {subject} - {html_body}")
    return sent
