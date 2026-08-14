# Lark Mail Integration — Hermes / Portfolio Email Layer

> **Status legend used throughout this document**
> - ✅ **VERIFIED** — implemented against current official Lark docs and covered by passing mocked tests.
> - ⚠️ **REQUIRES LIVE TESTING** — code is complete but has NOT been executed against real Lark credentials in this environment.

---

## 1. Architecture implemented

```
Portfolio frontend (Contact form)
        │  POST /api/v1/portfolio/contact
        ▼
Portfolio backend (FastAPI, main.py)
        │  _dispatch_contact_email (background)
        ▼
EmailProvider (abstract)  ── email_engine/base.py
        ├── ZohoProvider        (legacy, EMAIL_PROVIDER=zoho)
        └── LarkMailProvider    (new,    EMAIL_PROVIDER=lark)
                │  lark/provider.py
                ▼
        LarkAuth (token mgmt)   ── lark/auth.py
                │
                ▼
        Lark Open Platform Mail API
```

Inbound path (event-driven preferred):

```
Lark Mail  ── event mail.user_mailbox.event.message_received_v1 ─▶
   POST /api/v1/portfolio/email/lark/webhook
        │  verify_and_decrypt (token / AES-256-CBC)
        ▼
   EmailProcessor.process_inbound  (idempotent, alias-aware)
        │  classify + extract
        ▼
   SQLite: emails / email_threads / classifications / leads / email_actions / email_attachments
        │
        ▼
   Decision engine (AUTO_REPLY policy) → reply via LarkMailProvider (if enabled)
```

---

## 2. Lark Developer App creation

**VERIFIED (procedure per official docs).** Create a **custom app** (required — Mail API is custom-app-only):

1. Go to **https://open.larksuite.com/app** → *Create App* → *Custom App*.
2. Note **App ID** and **App Secret** (*Credentials & Basic Info*).
3. Enable **Mail** capabilities and the scopes in §4.
4. Configure **Event Subscriptions** (see §9) and **Redirect URLs** (see §5).

---

## 3. Required scopes

| Scope | Used for | Token type |
|---|---|---|
| `mail:user_mailbox.message:readonly` | List / Get / Mark read / Move / Attachments | tenant_access_token |
| `mail:user_mailbox.message:send` | Send / Reply | **user_access_token (OAuth)** |
| `mail:user_mailbox.event:subscribe` | Webhook inbound events | app subscription |

> ⚠️ **Critical constraint (verified against docs):** the **Send** API explicitly requires a `user_access_token`, NOT a tenant token. The implementation enforces this — `send_message`/`reply_to_message` call `get_user_access_token()`, and will never silently fall back to a tenant token.

---

## 4. OAuth setup

Send requires a **user** token obtained via OAuth 2.0 authorization-code flow:

1. `scripts/lark_oauth.py` builds the authorize URL.
2. You (the mailbox owner, e.g. `adarsh@adarshsingh.in`) open it, log in, grant `mail:send mail:read mail:event.sub`.
3. Lark redirects to `LARK_REDIRECT_URI?code=...`.
4. The script exchanges `code` for `access_token` + `refresh_token`.
5. Tokens are printed to stdout — **paste into `.env` / secret manager. Never commit.**

Refresh: `LarkAuth.refresh_user_token()` uses the stored `LARK_REFRESH_TOKEN` automatically when the user token nears expiry.

---

## 5. Redirect URI

Register in *App → Features → Redirect URLs*:

```
https://api.adarshsingh.in/api/v1/portfolio/email/lark/oauth/callback
```

(You must implement the callback handler that captures `?code=` and runs `scripts/lark_oauth.py --code XXX`. The helper prints tokens; a production callback would write them to your secret store.)

---

## 6. Environment variables

See `backend/.env.example`. Required when `EMAIL_PROVIDER=lark`:

| Variable | Purpose |
|---|---|
| `EMAIL_PROVIDER` | `zoho` (default) or `lark` |
| `LARK_APP_ID` | Custom app ID |
| `LARK_APP_SECRET` | Custom app secret |
| `LARK_REDIRECT_URI` | OAuth redirect URI |
| `LARK_USER_ACCESS_TOKEN` | OAuth user token (from §4) |
| `LARK_REFRESH_TOKEN` | OAuth refresh token |
| `LARK_VERIFICATION_TOKEN` | Webhook verification token |
| `LARK_ENCRYPT_KEY` | Webhook encrypt key (AES-256-CBC) |
| `EMAIL_POLL_ENABLED` | `false` (prefer webhook) |
| `EMAIL_POLL_INTERVAL_SECONDS` | polling fallback interval |
| `AUTO_REPLY_ENABLED` | `false` until live testing done |

`LARK_DOMAIN` defaults to `https://open.larksuite.com` (override only for `larksuite.com` vs `feishu.cn`).

---

## 7. Token generation & refresh

- **Tenant token:** `LarkAuth.get_tenant_access_token()` internally POSTs `/open-apis/auth/v3/tenant_access_token/internal`. Cached until ~60s before expiry.
- **User token:** obtained via `scripts/lark_oauth.py` (auth-code) or auto-refreshed via `refresh_user_token()`.

---

## 8. Mail API usage (endpoints implemented)

| Operation | Endpoint | Token | Status |
|---|---|---|---|
| List messages | `GET /mail/v1/user_mailboxes/:id/messages` | tenant | ✅ implemented |
| Get message | `GET /mail/v1/user_mailboxes/:id/messages/:mid` | tenant | ✅ implemented |
| Send | `POST /mail/v1/user_mailboxes/:id/messages/send` | **user** | ✅ implemented (⚠️ live) |
| Batch modify (read/move) | `POST /mail/v1/user_mailboxes/:id/messages/batch_modify` | tenant | ✅ implemented (⚠️ live-verify body) |
| Attachment download URL | `GET /mail/v1/user_mailboxes/:id/messages/:mid/attachments/:aid/download_url` | tenant | ✅ implemented |
| Message received event | `mail.user_mailbox.event.message_received_v1` | webhook | ✅ implemented (⚠️ live-verify payload) |

Send payload uses `to`/`cc`/`bcc` as `[{"mailbox": "..."}]`, `body_html`, `body_plain_text`, `head_from`, `reply_to`, `attachments`, `dedupe_key` — all per the official schema (no invented fields).

> ⚠️ **Live-verified gap (2026-08-14):** `List messages` returned `Access denied. One of the following scopes is required: [mail:user_mailbox.message:readonly]` before the scope was granted. After you enable the scopes in the app console, re-run `scripts/lark_live_probe.py` to confirm read/list access.

---

## 9. Webhook setup

1. App → *Event Subscriptions* → enable, set **Request URL** to:
   `https://api.adarshsingh.in/api/v1/portfolio/email/lark/webhook`
2. Subscribe to event: `mail.user_mailbox.event.message_received_v1`.
3. Copy **Verification Token** → `LARK_VERIFICATION_TOKEN`.
4. (Optional but recommended) enable encryption, copy **Encrypt Key** → `LARK_ENCRYPT_KEY`.

The endpoint handles: URL verification (`challenge`), v1 token check, and v2 AES-256-CBC decryption + HMAC-SHA256 signature verification. Invalid requests return `401`.

---

## 10. Alias configuration

Defined in `lark/aliases.py` (signal only, never absolute rule):

| Alias | Purpose hint | Suggests category |
|---|---|---|
| `hello@adarshsingh.in` | General business | `general` |
| `contact@adarshsingh.in` | Portfolio contact | `lead` |
| `work@adarshsingh.in` | Freelance/client | `freelance_lead` |
| `projects@adarshsingh.in` | Project comms | `project` |
| `support@adarshsingh.in` | Support | `support` |
| `billing@adarshsingh.in` | Billing | `billing` |
| `noreply@adarshsingh.in` | Automated only | `automated` (never auto-replies) |

---

## 11. Local testing

```bash
cd portfolio/backend
venv/bin/python -m pytest tests/test_email_integration.py -q   # mocked, no creds
```

Set `EMAIL_PROVIDER=lark` + real creds to test live send via a small script:
```python
import asyncio
from email_engine.zoho_provider import get_email_provider
async def t():
    p = get_email_provider()
    print(await p.send_message(to=["you@test.com"], subject="Hi", body_text="Test"))
asyncio.run(t())
```

---

## 12. Production setup

- Inject `LARK_*` secrets via deployment secret manager (not committed).
- Ensure HTTPS terminates at the webhook URL.
- Keep `AUTO_REPLY_ENABLED=false` until manual live verification (§17 checklist).
- Keep `EMAIL_PROVIDER=zoho` as the safe default until Lark is proven.

---

## 13. Lark Starter / Free-plan limitations (⚠️ verify in your plan)

- **Custom app required** for Mail API (Starter free plan supports custom apps, but verify mailbox feature availability for your domain).
- **Send quota / external recipient limits** exist (rate codes `1236006`–`1236013`). The provider surfaces these as `LarkRateLimitError` / `LarkError`.
- **Daily send caps** per user and per tenant — monitor `429` responses.
- Webhook event support depends on plan; if events are unavailable, set `EMAIL_POLL_ENABLED=true` as fallback (polling uses cursor/message-id idempotency).
- **Single-user send locking**: the Send API is sequential per user — concurrent sends from the same mailbox will 429. The provider is structured for sequential dispatch; add a send queue if high volume.

---

## 14. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `403 permission deny (1234017)` | Missing scope | Enable `mail:send`/`mail:read`/`mail:event.sub` |
| `404 user mailbox not found (1234013)` | Mailbox inactive / wrong id | Use `me` or verified mailbox address |
| `401 webhook ...` | Bad token/encrypt key | Verify `LARK_VERIFICATION_TOKEN` / `LARK_ENCRYPT_KEY` |
| Send uses wrong token | Using tenant for send | Ensure `LARK_USER_ACCESS_TOKEN` set; send needs user token |
| Duplicate emails | No dedupe_key | Provider sends `dedupe_key`; DB enforces unique `provider_message_id` |

---

## 15. Zoho migration procedure

**Current state: Zoho retained.** Do NOT remove until the live-test checklist passes.

1. ⚠️ Complete live tests (§17).
2. Switch `.env`: `EMAIL_PROVIDER=lark`.
3. Run `pytest` + a production smoke send.
4. Monitor logs (`EMAIL_EVENT` markers) for 24–48h.
5. Only after stable: deprecate `ZohoProvider` (keep code behind `EMAIL_PROVIDER=zoho` for rollback).

---

## 16. API endpoints added

- `POST /api/v1/portfolio/email/lark/webhook` — Lark event receiver
- `GET  /api/v1/portfolio/email/status` — provider/auto-reply status
- `POST /api/v1/portfolio/contact` — **unchanged contract**, now dispatches via provider abstraction

---

## 17. Live-testing checklist (⚠️ REQUIRES YOUR CREDENTIALS)

- [ ] OAuth user token obtained (`scripts/lark_oauth.py`)
- [ ] Hermes authenticates (tenant + user token)
- [ ] Hermes sends an email (`send_message`)
- [ ] Hermes replies (`reply_to_message`)
- [ ] Hermes reads an incoming email (`get_message`)
- [ ] Hermes identifies recipient alias
- [ ] Hermes receives mail event (webhook)
- [ ] Hermes processes event (DB row created)
- [ ] Portfolio contact form sends via Lark

**None of the above live steps have been executed in this environment.** All are implemented and unit-tested with mocks. Do not set `EMAIL_PROVIDER=lark` in production until you complete this list.

---

## 19. Security incident note (2026-08-14)

During live probing, a Lark App Secret was pasted into chat. **Treat that secret as compromised and rotate it immediately in the Lark developer console.** After rotation:

1. Update the secret only in your deployment secret manager / `.env`.
2. Re-run `scripts/lark_live_probe.py` to confirm the new credentials work.
3. Do not paste secrets into chat again.

## 20. Files

Created:
- `lark/__init__.py`, `lark/auth.py`, `lark/provider.py`, `lark/aliases.py`, `lark/exceptions.py`, `lark/webhook_security.py`
- `email_engine/__init__.py`, `base.py`, `models.py`, `classifier.py`, `processor.py`, `zoho_provider.py`, `db.py`, `router.py`
- `tests/test_email_integration.py`, `pytest.ini`
- `scripts/lark_oauth.py`, `scripts/lark_live_probe.py`
- `backend/.env.example` (updated)

Modified:
- `main.py` — imports email router + `init_email_db()` on startup; contact endpoint dispatches via provider abstraction (Zoho default preserved).
