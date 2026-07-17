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
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
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
    html_visitor = """\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html dir="ltr" lang="en"><head><meta content="text/html; charset=UTF-8" http-equiv="Content-Type"/><meta name="x-apple-disable-message-reformatting"/></head><body style="background-color:#F8FAFC;padding:0"><!--$--><!--html--><!--head--><div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">Your message has been received. Here&#x27;s what happens next.<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div></div><!--body--><table border="0" width="100%" cellPadding="0" cellSpacing="0" role="presentation" align="center"><tbody><tr><td style="background-color:#F8FAFC;font-family:Inter, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, sans-serif;padding:80px 0"><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:580px;margin:0 auto;padding:0 20px"><tbody><tr style="width:100%"><td><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-bottom:32px;text-align:center"><tbody><tr><td><p style="font-size:24px;line-height:24px;font-weight:700;letter-spacing:2px;color:#111827;margin:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0">A S</p></td></tr></tbody></table><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="background-color:#FFFFFF;border-radius:18px;padding:40px;border:1px solid #E5E7EB;box-shadow:0 20px 50px rgba(15, 23, 42, 0.06)"><tbody><tr><td><h1 style="font-size:26px;font-weight:700;color:#111827;line-height:1.3;margin-bottom:24px">Thanks for reaching out 👋</h1><p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 16px 0;margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0">Hi <!-- -->{escaped_name}<!-- -->,</p><p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 16px 0;margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0">Thank you for contacting me through my portfolio. I&#x27;ve successfully received your message and will personally review it as soon as possible.</p><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="background-color:#F8FAFC;border-radius:12px;padding:20px;margin:24px 0;border:1px solid #E5E7EB"><tbody><tr><td><table style="width:100%;border-collapse:collapse"><tr><td style="font-size:13px;color:#6B7280;padding-bottom:8px;font-weight:500">Status</td><td style="font-size:13px;color:#111827;padding-bottom:8px;text-align:right;font-weight:600"><span style="color:#10B981">●</span> Received Successfully</td></tr><tr><td style="font-size:13px;color:#6B7280;padding-bottom:8px;font-weight:500">Expected Response</td><td style="font-size:13px;color:#111827;padding-bottom:8px;text-align:right;font-weight:600">Within 24 hours</td></tr><tr><td style="font-size:13px;color:#6B7280;padding-bottom:8px;font-weight:500">Direct Email</td><td style="font-size:13px;color:#111827;padding-bottom:8px;text-align:right;font-weight:600"><a href="mailto:hello@adarshsingh.in" style="color:#2563EB;text-decoration-line:none;text-decoration:none" target="_blank">hello@adarshsingh.in</a></td></tr></table></td></tr></tbody></table><hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E7EB;margin:32px 0"/><h1 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#6B7280;margin-bottom:16px">Your Message</h1><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="background-color:#FAFAFA;border-radius:12px;padding:20px;border-left:4px solid #2563EB"><tbody><tr><td><p style="font-size:14px;line-height:24px;color:#111827;margin:0 0 8px 0;margin-top:0;margin-right:0;margin-bottom:8px;margin-left:0"><strong>Sub:</strong> <!-- -->{escaped_subject}</p><p style="font-size:14px;line-height:1.5;color:#4B5563;font-style:italic;margin:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0">&quot;<!-- -->{escaped_message}<!-- -->&quot;</p></td></tr></tbody></table><hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E7EB;margin:32px 0"/><h1 style="font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:700;color:#6B7280;margin-bottom:16px">Current Focus</h1><p style="font-size:15px;line-height:1.6;color:#374151;margin:0 0 16px 0;margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0">I&#x27;m an AI &amp; Data Engineer passionate about building production-ready AI systems, RAG pipelines, multi-agent workflows, and intelligent automation.</p><table style="width:100%;margin-top:16px"><tr><td style="font-size:13px;color:#4B5563;padding:6px 0;font-weight:500">Agentic AI</td><td style="font-size:13px;color:#4B5563;padding:6px 0;font-weight:500">Data Engineering</td></tr><tr><td style="font-size:13px;color:#4B5563;padding:6px 0;font-weight:500">LangGraph &amp; LangChain</td><td style="font-size:13px;color:#4B5563;padding:6px 0;font-weight:500">Python</td></tr><tr><td style="font-size:13px;color:#4B5563;padding:6px 0;font-weight:500">Azure &amp; Databricks</td><td style="font-size:13px;color:#4B5563;padding:6px 0;font-weight:500">Cloud Architecture</td></tr></table><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-top:40px;text-align:center"><tbody><tr><td><a href="https://adarshsingh.in" style="line-height:100%;text-decoration:none;display:block;max-width:100%;mso-padding-alt:0px;background-color:#2563EB;border-radius:12px;color:#FFFFFF;font-size:14px;font-weight:600;text-align:center;padding:14px 0;margin-bottom:12px;padding-top:14px;padding-right:0;padding-bottom:14px;padding-left:0" target="_blank"><span><!--[if mso]><i style="mso-font-width:0%;mso-text-raise:21" hidden></i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:10.5px">Explore My Work</span><span><!--[if mso]><i style="mso-font-width:0%" hidden>&#8203;</i><![endif]--></span></a><a href="https://adarshsingh.in/resume" style="line-height:100%;text-decoration:none;display:block;max-width:100%;mso-padding-alt:0px;background-color:#F1F5F9;border-radius:12px;color:#334155;font-size:14px;font-weight:600;text-align:center;padding:14px 0;margin-bottom:12px;border:1px solid #E2E8F0;padding-top:14px;padding-right:0;padding-bottom:14px;padding-left:0" target="_blank"><span><!--[if mso]><i style="mso-font-width:0%;mso-text-raise:21" hidden></i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:10.5px">View Resume</span><span><!--[if mso]><i style="mso-font-width:0%" hidden>&#8203;</i><![endif]--></span></a><a href="https://linkedin.com/in/adarshsingh45" style="line-height:100%;text-decoration:none;display:block;max-width:100%;mso-padding-alt:0px;background-color:#F1F5F9;border-radius:12px;color:#334155;font-size:14px;font-weight:600;text-align:center;padding:14px 0;margin-bottom:12px;border:1px solid #E2E8F0;padding-top:14px;padding-right:0;padding-bottom:14px;padding-left:0" target="_blank"><span><!--[if mso]><i style="mso-font-width:0%;mso-text-raise:21" hidden></i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:10.5px">Connect on LinkedIn</span><span><!--[if mso]><i style="mso-font-width:0%" hidden>&#8203;</i><![endif]--></span></a></td></tr></tbody></table></td></tr></tbody></table><table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-top:32px;padding:0 20px"><tbody><tr><td><p style="font-size:14px;line-height:24px;color:#4B5563;text-align:center;margin:0 0 16px 0;margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0">Looking forward to connecting with you.</p><p style="font-size:14px;line-height:1.5;color:#6B7280;text-align:center;margin:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0"><strong>Adarsh Singh</strong><br/>AI &amp; Data Engineer • Capgemini</p><hr style="width:100%;border:none;border-top:1px solid #eaeaea;border-color:#E5E7EB;margin:24px 0 16px 0"/><table style="width:100%"><tr><td><a href="https://adarshsingh.in" style="color:#9CA3AF;text-decoration-line:none;font-size:12px;text-decoration:none" target="_blank">adarshsingh.in</a></td><td style="text-align:right"><p style="font-size:12px;line-height:24px;color:#9CA3AF;margin:0;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0">Made with ❤️ using Resend</p></td></tr></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--/$--></body></html>\n    """.replace("{escaped_name}", escaped_name).replace("{escaped_subject}", escaped_subject).replace("{escaped_message}", escaped_message)
    
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
