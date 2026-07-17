import os
import html
import smtplib
import urllib.request
import json
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

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
    smtp_to = os.getenv("SMTP_TO") or "admin@adarshsingh.in"
    resend_api_key = os.getenv("RESEND_API_KEY")
    resend_from = os.getenv("RESEND_FROM") or "contact@adarshsingh.in"
    
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

def send_email_via_resend(to_email: str, subject: str, html_content: str, reply_to: str = None, bcc: str = None, from_email: str = None) -> bool:
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
    
    if not from_email:
        from_email = config["resend_from"]
    
    payload = {
        "from": from_email,
        "to": to_email,
        "subject": subject,
        "html": html_content
    }
    if reply_to:
        payload["reply_to"] = reply_to
    if bcc:
        payload["bcc"] = bcc
        
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

def send_outreach_email(visitor_name: str, visitor_email: str, subject: str, message: str, intent_category: str = "General Question"):
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
    
    # Define Auto-Response HTML for Visitor
    html_visitor = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 0; color: #2c3e50; }}
        .wrapper {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); overflow: hidden; }}
        .header {{ background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 40px 30px; text-align: center; color: white; }}
        .header h2 {{ margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }}
        .header p {{ margin: 10px 0 0 0; color: #94a3b8; font-size: 15px; }}
        .content {{ padding: 40px 35px; }}
        .greeting {{ font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }}
        .body-text {{ font-size: 16px; line-height: 1.7; color: #475569; margin-bottom: 25px; }}
        .quote-box {{ background-color: #f8fafc; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 30px 0; }}
        .quote-title {{ font-size: 14px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 15px; letter-spacing: 0.5px; }}
        .quote-content {{ font-style: italic; color: #334155; font-size: 15px; white-space: pre-wrap; margin: 0; }}
        .action-button {{ display: inline-block; background-color: #3b82f6; color: white !important; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 15px; text-align: center; transition: background-color 0.3s ease; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3); }}
        .action-container {{ text-align: center; margin: 35px 0 20px; }}
        .footer {{ text-align: center; padding: 30px; background-color: #f8fafc; border-top: 1px solid #edf2f7; color: #64748b; font-size: 13px; line-height: 1.5; }}
        .footer a {{ color: #3b82f6; text-decoration: none; }}
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h2>Adarsh Singh</h2>
          <p>Software Engineer & Developer</p>
        </div>
        <div class="content">
          <div class="greeting">Hi {escaped_name},</div>
          <div class="body-text">
            Thank you for reaching out! I have received your message and will review it shortly. I typically respond to all inquiries within 24 hours.
          </div>
          <div class="quote-box">
            <div class="quote-title">Your Message Summary</div>
            <div class="quote-content"><strong>Subject:</strong> {escaped_subject}<br><br>{escaped_message}</div>
          </div>
          <div class="body-text" style="text-align: center; font-weight: 500;">
            While you wait, feel free to check out my latest work.
          </div>
          <div class="action-container">
            <a href="https://adarshsingh.in/#projects" class="action-button">View My Portfolio</a>
          </div>
        </div>
        <div class="footer">
          &copy; {current_year} Adarsh Singh. All rights reserved.<br>
          <a href="https://adarshsingh.in">adarshsingh.in</a> | <a href="https://github.com/Adarsh-Singh07">GitHub</a> | <a href="https://www.linkedin.com/in/adarsh-singh-07/">LinkedIn</a>
        </div>
      </div>
    </body>
    </html>
    """
    
    smtp_config = get_smtp_config()
    admin_recipient = smtp_config["to"]
    personal_bcc = "adarsh2001gop@gmail.com"
    
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
                reply_to=visitor_email,
                bcc=personal_bcc,
                from_email="Adarsh Singh <contact@adarshsingh.in>"
            )
        except Exception as e:
            print(f"Resend Admin Notification failed: {e}")
            
    # Fallback to Gmail SMTP
    if not admin_sent:
        try:
            print("Resend Admin Notification failed/skipped. Falling back to Zoho SMTP...")
            if smtp_config["host"] and smtp_config["user"] and smtp_config["password"]:
                msg_admin = MIMEMultipart("alternative")
                msg_admin["Subject"] = f"[Portfolio Outreach] {escaped_subject}"
                msg_admin["From"] = formataddr(("Adarsh Singh", "contact@adarshsingh.in"))
                msg_admin["To"] = admin_recipient
                msg_admin["Reply-To"] = escaped_email
                msg_admin.attach(MIMEText(f"Outreach from {escaped_name} ({escaped_email}): {escaped_message}", "plain", "utf-8"))
                msg_admin.attach(MIMEText(html_admin, "html", "utf-8"))
                _dispatch_smtp(msg_admin, smtp_config, bcc=personal_bcc)
                admin_sent = True
            else:
                print("SMTP fallback skipped: Credentials missing.")
        except Exception as e:
            print(f"Zoho SMTP Admin Notification fallback failed: {e}")
            
    # ---------------------------------------------
    # 2. DISPATCH AUTO-RESPONDER TO VISITOR
    # ---------------------------------------------
    visitor_sent = False
    
    reply_to_address = "contact@adarshsingh.in" if intent_category in ["Hiring Inquiry", "Collaboration"] else "support@adarshsingh.in"
    
    # Try Resend First (Will fail in Sandbox if domain is unverified, triggering fallback)
    if os.getenv("RESEND_API_KEY"):
        try:
            print("Attempting to send Visitor Auto-responder via Resend API...")
            visitor_sent = send_email_via_resend(
                to_email=visitor_email,
                subject="Thank you for contacting Adarsh Singh",
                html_content=html_visitor,
                reply_to=reply_to_address,
                from_email="Adarsh Singh <noreply@adarshsingh.in>"
            )
        except Exception as e:
            print(f"Resend Visitor Auto-responder failed (likely Sandbox restriction): {e}")
            
    # Fallback to Gmail SMTP (No custom domain required)
    if not visitor_sent:
        try:
            print("Resend Visitor Auto-responder failed/skipped. Falling back to Zoho SMTP...")
            if smtp_config["host"] and smtp_config["user"] and smtp_config["password"]:
                msg_visitor = MIMEMultipart("alternative")
                msg_visitor["Subject"] = "Thank you for contacting Adarsh Singh"
                msg_visitor["From"] = formataddr(("Adarsh Singh", "noreply@adarshsingh.in"))
                msg_visitor["To"] = visitor_email
                msg_visitor["Reply-To"] = reply_to_address
                msg_visitor.attach(MIMEText("Thank you for reaching out! We received your message.", "plain", "utf-8"))
                msg_visitor.attach(MIMEText(html_visitor, "html", "utf-8"))
                _dispatch_smtp(msg_visitor, smtp_config, to_override=visitor_email)
                visitor_sent = True
            else:
                print("SMTP fallback skipped: Credentials missing.")
        except Exception as e:
            print(f"Zoho SMTP Visitor Auto-responder fallback failed: {e}")
            
    return admin_sent or visitor_sent

def send_alert_email(subject: str, html_body: str):
    """
    Sends a critical operational alert/RCA to Adarsh.
    Tries Resend API first (since sending to self is supported in sandbox),
    falls back to SMTP.
    """
    recipient = os.getenv("SMTP_TO") or "admin@adarshsingh.in"
    personal_bcc = "adarsh2001gop@gmail.com"
    sent = False
    
    # Try Resend
    if os.getenv("RESEND_API_KEY"):
        try:
            print("Attempting to send alert via Resend API...")
            sent = send_email_via_resend(
                to_email=recipient, 
                subject=subject, 
                html_content=html_body,
                bcc=personal_bcc,
                from_email="noreply@adarshsingh.in"
            )
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
                msg["From"] = "noreply@adarshsingh.in"
                msg["To"] = recipient
                msg.attach(MIMEText("Critical Operational Alert: check html logs.", "plain", "utf-8"))
                msg.attach(MIMEText(html_body, "html", "utf-8"))
                _dispatch_smtp(msg, config, to_override=recipient, bcc=personal_bcc)
                sent = True
            except Exception as e:
                print(f"Failed to dispatch alert via SMTP fallback: {e}")
                
    if not sent:
        print(f"ALERT LOG ONLY (No mail channels active): {subject} - {html_body}")
    return sent

def _dispatch_smtp(msg: MIMEMultipart, config: dict, to_override: str = None, bcc: str = None):
    """Internal helper to connect to SMTP server and send a message."""
    host = config["host"]
    port = config["port"]
    user = config["user"]
    password = config["password"]
    to = to_override or config["to"]
    
    recipients = [to]
    if bcc:
        recipients.append(bcc)
    
    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=10)
    else:
        server = smtplib.SMTP(host, port, timeout=10)
        server.ehlo()
        if "starttls" in server.esmtp_features:
            server.starttls()
            server.ehlo()
            
    server.login(user, password)
    server.sendmail(user, recipients, msg.as_string())
    server.quit()
