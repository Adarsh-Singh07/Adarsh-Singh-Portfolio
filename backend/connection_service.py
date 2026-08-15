import os
import aiohttp
from datetime import datetime
import db
from mail_helper import send_outreach_email

async def handle_connection_request(name: str, email: str, subject: str, message: str, source: str = "Contact Form", intent_category: str = "General Outreach"):
    """
    Unified service for handling all inbound connection requests from the Contact Form and Chatbot.
    1. Persists the lead to SQLite.
    2. Sends Admin Notification + Visitor Auto-Reply via Lark Mail.
    3. Sends WhatsApp Notification to Adarsh via the local Hermes WhatsApp Gateway.
    """
    # 1. Save to SQLite Database
    try:
        db.save_contact_message(
            name=name,
            email=email,
            subject=subject,
            message=f"[{source}] {message}",
            intent_category=intent_category
        )
    except Exception as e:
        print(f"Error saving lead to DB: {e}")

    # 2. Email Notifications (Admin + Visitor) via Lark Mail
    try:
        await send_outreach_email(name, email, subject, message, intent_category)
    except Exception as e:
        print(f"Error dispatching Lark emails: {e}")

    # 3. WhatsApp Notification via Hermes Gateway
    whatsapp_number = os.getenv("WHATSAPP_ADMIN_NUMBER")
    if whatsapp_number:
        # Format number correctly for Baileys/WhatsApp if it doesn't already have the suffix
        if not whatsapp_number.endswith("@s.whatsapp.net"):
            # Strip non-digits except + if needed, but assuming env var is clean
            clean_number = "".join(filter(str.isdigit, whatsapp_number))
            whatsapp_number = f"{clean_number}@s.whatsapp.net"
            
        wa_text = f"🚨 *New {source} Lead*\n*Name*: {name}\n*Email*: {email}\n*Subject*: {subject}\n*Message*:\n{message}"
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "http://127.0.0.1:3000/send",
                    json={"chatId": whatsapp_number, "text": wa_text},
                    timeout=10
                ) as resp:
                    if resp.status != 200:
                        print(f"Failed to send WhatsApp via Hermes: HTTP {resp.status}")
                    else:
                        print(f"WhatsApp notification sent to {whatsapp_number}")
        except Exception as e:
            print(f"Hermes WhatsApp gateway error: {e}")
    else:
        print("WHATSAPP_ADMIN_NUMBER not set. Skipping WhatsApp notification.")
