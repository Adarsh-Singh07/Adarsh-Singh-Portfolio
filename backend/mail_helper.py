import os
import html
import smtplib
import urllib.request
import json
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_CONFIG_JSON = "/app/data/smtp_config.json"
if not os.path.exists("/app/data"):
    SMTP_CONFIG_JSON = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "smtp_config.json")

def get_smtp_config():
    """Helper to retrieve SMTP configuration from JSON database or environment variables."""
    # 1. Load from environment variables first (fallbacks)
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port_str = os.getenv("SMTP_PORT")
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_to = os.getenv("SMTP_TO") or os.getenv("SMTP_USER") or "adarsh2001gop@gmail.com"
    resend_api_key = os.getenv("RESEND_API_KEY")
    resend_from = os.getenv("RESEND_FROM") or "onboarding@resend.dev"
    
    # 2. Override with JSON if it exists
    if os.path.exists(SMTP_CONFIG_JSON):
        try:
            with open(SMTP_CONFIG_JSON, "r", encoding="utf-8") as f:
                data = json.load(f)
                smtp_host = data.get("SMTP_HOST", smtp_host)
                smtp_port_str = str(data.get("SMTP_PORT", smtp_port_str))
                smtp_user = data.get("SMTP_USER", smtp_user)
                smtp_password = data.get("SMTP_PASSWORD", smtp_password)
                smtp_to = data.get("SMTP_TO", smtp_to)
                resend_api_key = data.get("RESEND_API_KEY", resend_api_key)
                resend_from = data.get("RESEND_FROM", resend_from)
        except Exception as e:
            print(f"Error loading smtp_config.json: {e}")

    smtp_port = 587
    if smtp_port_str:
        try:
            smtp_port = int(smtp_port_str)
        except ValueError:
            pass
            
    return {
        "host": smtp_host,
        "port": smtp_port,
        "user": smtp_user,
        "password": smtp_password,
        "to": smtp_to,
        "resend_api_key": resend_api_key,
        "resend_from": resend_from
    }

def send_email_via_resend(to_email: str, subject: str, html_content: str, reply_to: str = None) -> bool:
    """Dispatches email using Resend API (HTTP client). Returns True if successful."""
    config = get_smtp_config()
    api_key = config["resend_api_key"]
    if not api_key:
        return False
        
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Resend free tier sends from onboarding@resend.dev by default unless a domain is verified
    from_email = config["resend_from"]
    
    payload = {
        "from": from_email,
        "to": to_email,
        "subject": subject,
        "html": html_content
    }
    if reply_to:
        payload["reply_to"] = reply_to
        
    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(payload).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode("utf-8")
            print(f"Resend API Success response: {res_body}")
            return True
    except Exception as e:
        print(f"Resend API dispatch failure: {e}")
        return False

def send_outreach_email(visitor_name: str, visitor_email: str, subject: str, message: str):
    """
    Sends a dual email with strict sequential fallback:
    1. A notification to Adarsh (tries Resend, falls back to SMTP).
    2. A premium HTML auto-responder to the visitor (tries Resend, falls back to SMTP).
    """
    escaped_name = html.escape(visitor_name)
    escaped_email = html.escape(visitor_email)
    escaped_subject = html.escape(subject)
    escaped_message = html.escape(message)
    current_year = datetime.now().year
    
    # Define Notification HTML for Adarsh
    html_admin = f"""
    <html>
    <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #007AFF; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">New Portfolio Outreach Connection</h2>
        <p><strong>From:</strong> {escaped_name} ({escaped_email})</p>
        <p><strong>Subject:</strong> {escaped_subject}</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #007AFF; margin-top: 15px;">
            <p style="white-space: pre-wrap; margin: 0;">{escaped_message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 10px; color: #888; text-align: center;">This message was dispatched securely via your Portfolio Core email service.</p>
    </body>
    </html>
    """
    
    # Define Auto-Response HTML for Visitor
    html_visitor = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {{ font-family: 'Inter', Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f8fafc; line-height: 1.6; margin: 0; padding: 0; }}
        .container {{ max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .header {{ background: #0f172a; padding: 32px; text-align: center; }}
        .header h2 {{ color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }}
        .content {{ padding: 40px 32px; }}
        .content p {{ margin: 0 0 16px; font-size: 16px; color: #334155; }}
        .content p.strong {{ font-weight: 600; color: #0f172a; }}
        .quote-box {{ background-color: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #007AFF; margin: 24px 0; }}
        .quote-box p {{ margin: 0; font-size: 14px; font-style: italic; color: #475569; }}
        .button-container {{ text-align: center; margin: 32px 0 16px; }}
        .button {{ background-color: #007AFF; color: #ffffff !important; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block; transition: background-color 0.2s; }}
        .footer {{ background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; }}
        .footer a {{ color: #007AFF; text-decoration: none; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Connection Confirmed</h2>
        </div>
        <div class="content">
          <p class="strong">Hello {escaped_name},</p>
          <p>Thank you for reaching out and establishing contact. This is an automated confirmation that your message packet has successfully routed to my inbox.</p>
          <p>Here is a copy of your transmission details:</p>
          <div class="quote-box">
            <p><strong>Subject:</strong> {escaped_subject}</p>
            <p style="margin-top: 8px; white-space: pre-wrap;">{escaped_message}</p>
          </div>
          <p>I will personally review your inquiry and follow up with an operational response within 24 hours.</p>
          <p>In the meantime, feel free to explore my latest projects or review my professional journey:</p>
          <div class="button-container">
            <a href="https://github.com/Adarsh-Singh07" class="button" style="color: #ffffff;">View GitHub Projects</a>
          </div>
        </div>
        <div class="footer">
          <p>Sent securely via Adarsh Singh's Portfolio API.</p>
          <p>&copy; {current_year} Adarsh Singh. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    """
    
    smtp_config = get_smtp_config()
    admin_recipient = smtp_config["to"]
    
    # ---------------------------------------------
    # 1. DISPATCH NOTIFICATION TO ADARSH (ADMIN)
    # ---------------------------------------------
    admin_sent = False
    
    # Try Resend First (Sending to Adarsh is allowed in Sandbox mode)
    if os.getenv("RESEND_API_KEY"):
        try:
            print("Attempting to send Admin Notification via Resend API...")
            admin_sent = send_email_via_resend(
                to_email=admin_recipient,
                subject=f"[Portfolio Outreach] {subject}",
                html_content=html_admin,
                reply_to=visitor_email
            )
        except Exception as e:
            print(f"Resend Admin Notification failed: {e}")
            
    # Fallback to Gmail SMTP
    if not admin_sent:
        try:
            print("Resend Admin Notification failed/skipped. Falling back to Gmail SMTP...")
            if smtp_config["host"] and smtp_config["user"] and smtp_config["password"]:
                msg_admin = MIMEMultipart("alternative")
                msg_admin["Subject"] = f"[Portfolio Outreach] {escaped_subject}"
                msg_admin["From"] = smtp_config["user"]
                msg_admin["To"] = admin_recipient
                msg_admin["Reply-To"] = escaped_email
                msg_admin.attach(MIMEText(f"Outreach from {escaped_name} ({escaped_email}): {escaped_message}", "plain", "utf-8"))
                msg_admin.attach(MIMEText(html_admin, "html", "utf-8"))
                _dispatch_smtp(msg_admin, smtp_config)
                admin_sent = True
            else:
                print("SMTP fallback skipped: Credentials missing.")
        except Exception as e:
            print(f"Gmail SMTP Admin Notification fallback failed: {e}")
            
    # ---------------------------------------------
    # 2. DISPATCH AUTO-RESPONDER TO VISITOR
    # ---------------------------------------------
    visitor_sent = False
    
    # Try Resend First (Will fail in Sandbox if domain is unverified, triggering fallback)
    if os.getenv("RESEND_API_KEY"):
        try:
            print("Attempting to send Visitor Auto-responder via Resend API...")
            visitor_sent = send_email_via_resend(
                to_email=visitor_email,
                subject="Thank you for contacting Adarsh Singh",
                html_content=html_visitor,
                reply_to=admin_recipient
            )
        except Exception as e:
            print(f"Resend Visitor Auto-responder failed (likely Sandbox restriction): {e}")
            
    # Fallback to Gmail SMTP (No custom domain required)
    if not visitor_sent:
        try:
            print("Resend Visitor Auto-responder failed/skipped. Falling back to Gmail SMTP...")
            if smtp_config["host"] and smtp_config["user"] and smtp_config["password"]:
                msg_visitor = MIMEMultipart("alternative")
                msg_visitor["Subject"] = "Thank you for contacting Adarsh Singh"
                msg_visitor["From"] = smtp_config["user"]
                msg_visitor["To"] = visitor_email
                msg_visitor["Reply-To"] = admin_recipient
                msg_visitor.attach(MIMEText("Thank you for reaching out! We received your message.", "plain", "utf-8"))
                msg_visitor.attach(MIMEText(html_visitor, "html", "utf-8"))
                _dispatch_smtp(msg_visitor, smtp_config, to_override=visitor_email)
                visitor_sent = True
            else:
                print("SMTP fallback skipped: Credentials missing.")
        except Exception as e:
            print(f"Gmail SMTP Visitor Auto-responder fallback failed: {e}")
            
    return admin_sent or visitor_sent

def send_alert_email(subject: str, html_body: str):
    """
    Sends a critical operational alert/RCA to Adarsh.
    Tries Resend API first (since sending to self is supported in sandbox),
    falls back to SMTP.
    """
    recipient = os.getenv("SMTP_TO") or "adarsh2001gop@gmail.com"
    sent = False
    
    # Try Resend
    if os.getenv("RESEND_API_KEY"):
        try:
            print("Attempting to send alert via Resend API...")
            sent = send_email_via_resend(to_email=recipient, subject=subject, html_content=html_body)
        except Exception as e:
            print(f"Failed to send alert via Resend: {e}")
            
    # Fallback to SMTP
    if not sent:
        config = get_smtp_config()
        if config["host"] and config["user"] and config["password"]:
            try:
                print("Resend alert failed/skipped. Falling back to SMTP...")
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = config["user"]
                msg["To"] = recipient
                msg.attach(MIMEText("Critical Operational Alert: check html logs.", "plain", "utf-8"))
                msg.attach(MIMEText(html_body, "html", "utf-8"))
                _dispatch_smtp(msg, config, to_override=recipient)
                sent = True
            except Exception as e:
                print(f"Failed to dispatch alert via SMTP fallback: {e}")
                
    if not sent:
        print(f"ALERT LOG ONLY (No mail channels active): {subject} - {html_body}")
    return sent

def _dispatch_smtp(msg: MIMEMultipart, config: dict, to_override: str = None):
    """Internal helper to connect to SMTP server and send a message."""
    host = config["host"]
    port = config["port"]
    user = config["user"]
    password = config["password"]
    to = to_override or config["to"]
    
    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=10)
    else:
        server = smtplib.SMTP(host, port, timeout=10)
        server.ehlo()
        if "starttls" in server.esmtp_features:
            server.starttls()
            server.ehlo()
            
    server.login(user, password)
    server.sendmail(user, [to], msg.as_string())
    server.quit()
