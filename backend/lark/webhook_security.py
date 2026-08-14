"""
Lark webhook security: URL verification and P2 encrypted event decryption.

Lark Open Platform delivers events in two shapes:
  - URL verification: {"type": "url_verification", "challenge": "..."}
  - v1 event:        {"type": "event_callback", "token": "...", "event": {...}}
  - v2 (P2) event:   {"encrypt": "<base64 AES-256-CBC ciphertext>"}

P2 decryption (official algorithm):
  key = SHA256(encrypt_key)[:32]
  ciphertext = base64.b64decode(encrypt)
  iv = first 16 bytes, body = rest
  plaintext = AES-256-CBC decrypt, then PKCS7 unpad
Signature (v2): HMAC-SHA256(encrypt_key, timestamp + nonce + encrypt) == signature
"""

import base64
import hashlib
import hmac
import json
from typing import Dict, Any, Tuple

from lark.exceptions import LarkAuthError


def handle_url_verification(body: Dict[str, Any]) -> Dict[str, Any]:
    """Returns the challenge response for Lark URL verification handshake."""
    if body.get("type") == "url_verification":
        return {"challenge": body.get("challenge")}
    return {}


def _aes_decrypt(encrypt_key: str, ciphertext_b64: str) -> str:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.backends import default_backend

    key = hashlib.sha256(encrypt_key.encode("utf-8")).digest()[:32]
    raw = base64.b64decode(ciphertext_b64)
    iv = raw[:16]
    data = raw[16:]
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    decrypted = decryptor.update(data) + decryptor.finalize()
    # PKCS7 unpad
    pad = decrypted[-1]
    if isinstance(pad, int) and 1 <= pad <= 16:
        decrypted = decrypted[:-pad]
    return decrypted.decode("utf-8")


def verify_and_decrypt(
    body: Dict[str, Any],
    verification_token: str,
    encrypt_key: str,
) -> Dict[str, Any]:
    """
    Validates the webhook authenticity and returns the inner event dict.
    Raises LarkAuthError on verification failure.
    """
    # URL verification shortcut
    if body.get("type") == "url_verification":
        return body

    # v2 encrypted event
    if "encrypt" in body:
        if not encrypt_key:
            raise LarkAuthError("ENCRYPT_KEY required for encrypted Lark events")
        # Signature check if provided
        timestamp = body.get("timestamp", "")
        nonce = body.get("nonce", "")
        signature = body.get("signature", "")
        if signature:
            expected = hmac.new(
                encrypt_key.encode("utf-8"),
                f"{timestamp}{nonce}{body['encrypt']}".encode("utf-8"),
                hashlib.sha256,
            ).hexdigest()
            if not hmac.compare_digest(expected, signature):
                raise LarkAuthError("Lark webhook signature mismatch")
        plaintext = _aes_decrypt(encrypt_key, body["encrypt"])
        inner = json.loads(plaintext)
        # v2 inner still carries token for v1 compatibility; verify if present
        if inner.get("token") and verification_token and inner["token"] != verification_token:
            raise LarkAuthError("Lark webhook token mismatch")
        return inner

    # v1 event
    if body.get("token") and verification_token and body["token"] != verification_token:
        raise LarkAuthError("Lark webhook token mismatch")
    return body
