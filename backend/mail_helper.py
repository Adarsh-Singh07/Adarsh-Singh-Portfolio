import os
import html
from datetime import datetime
from email_engine.provider_factory import get_email_provider

async def send_outreach_email(visitor_name: str, visitor_email: str, subject: str, message: str, intent_category: str = "General Question"):
    """
    Sends a dual email using Lark Mail:
    1. A notification to Adarsh (admin).
    2. A premium HTML auto-responder to the visitor.
    """
    provider = get_email_provider()
    escaped_name = html.escape(visitor_name)
    escaped_email = html.escape(visitor_email)
    escaped_subject = html.escape(subject)
    escaped_message = html.escape(message)
    current_year = datetime.now().year
    
    # ---------------------------------------------
    # 1. DISPATCH NOTIFICATION TO ADARSH (ADMIN)
    # ---------------------------------------------
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
            <div class="meta-item"><span class="meta-label">Date:</span> {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</div>
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

    # ---------------------------------------------
    # 2. DISPATCH AUTO-RESPONDER TO VISITOR
    # ---------------------------------------------
    reply_to_address = "contact@adarshsingh.in" if intent_category in ["Hiring Inquiry", "Collaboration"] else "support@adarshsingh.in"
    html_visitor = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 0; color: #334155; }}
        .wrapper {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 40px; border: 1px solid #e2e8f0; }}
        h1 {{ color: #0f172a; margin-top: 0; }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <h1>Thanks for reaching out 👋</h1>
        <p>Hi {escaped_name},</p>
        <p>Thank you for contacting me through my portfolio. I've successfully received your message and will personally review it as soon as possible.</p>
        <p><strong>Your Message:</strong><br/>{escaped_message}</p>
        <p>Best regards,<br/>Adarsh Singh</p>
      </div>
    </body>
    </html>
    """
    
    visitor_sent = False
    try:
        print("Attempting to send Visitor Auto-responder via Lark Mail API...")
        await provider.send_message(
            to=[visitor_email],
            subject="Thank you for contacting Adarsh Singh",
            body_html=html_visitor,
            body_text="Thank you for reaching out! We received your message.",
            reply_to=reply_to_address
        )
        visitor_sent = True
    except Exception as e:
        print(f"Lark Mail Visitor Auto-responder failed: {e}")
        
    return admin_sent or visitor_sent

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
