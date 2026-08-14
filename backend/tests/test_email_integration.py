"""
Tests for the Lark email integration.

All Lark API calls are mocked — no real credentials required.
Run:  pytest tests/test_email_integration.py
"""

import os
import sys
import json
import asyncio
import types
import tempfile
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from lark.auth import LarkAuth, USER_TOKEN_ENDPOINT, REQUIRED_SCOPES
from lark.provider import LarkMailProvider
from lark.aliases import get_alias_info, is_auto_reply_allowed
from email_engine.models import (
    ClassificationResult,
    EmailCategory,
    Priority,
    Sentiment,
    LeadExtraction,
    BillingExtraction,
)
from email_engine.processor import EmailProcessor
from email_engine.router import router as email_router
from fastapi.testclient import TestClient
import main


# ============================================================================
# Auth + scopes
# ============================================================================


class TestLarkAuth:
    def setup_method(self):
        os.environ["LARK_APP_ID"] = "cli_test"
        os.environ["LARK_APP_SECRET"] = "secret"

    def test_build_oauth_url_includes_all_required_scopes(self):
        auth = LarkAuth()
        url = auth.build_oauth_url("https://api.adarshsingh.in/api/v1/portfolio/email/lark/oauth/callback")
        assert "mail:user_mailbox.message:readonly" in url
        assert "mail:user_mailbox.message:send" in url
        assert "mail:event" in url
        assert "mail:user_mailbox.event.mail_address:read" in url
        assert "mail:user_mailbox" in url
        assert "offline_access" in url

    def test_build_oauth_url_contains_expected_fields(self):
        auth = LarkAuth()
        url = auth.build_oauth_url("https://example.com/cb", state="abc")
        assert "app_id=cli_test" in url
        assert "redirect_uri=https%3A%2F%2Fexample.com%2Fcb" in url
        assert "response_type=code" in url
        assert "state=abc" in url

    @pytest.mark.asyncio
    async def test_exchange_code_for_token_uses_v2_endpoint_and_fields(self):
        auth = LarkAuth()
        fake_resp = _FakeAsyncResponse({"code": 0, "data": {"access_token": "u_123", "refresh_token": "r_123", "expires_in": 3600}})
        fake_client = _FakeAsyncClient(fake_resp, expected_method="POST", expected_url=USER_TOKEN_ENDPOINT)
        with patch("httpx.AsyncClient", return_value=fake_client):
            access_token, refresh_token, expires_in = await auth.exchange_code_for_token(
                code="auth_code_1",
                redirect_uri="https://api.adarshsingh.in/api/v1/portfolio/email/lark/oauth/callback",
            )
        assert access_token == "u_123"
        assert refresh_token == "r_123"
        assert expires_in == 3600
        body = fake_client.last_body
        assert body["grant_type"] == "authorization_code"
        assert body["code"] == "auth_code_1"
        assert body["client_id"] == "cli_test"
        assert body["client_secret"] == "secret"

    @pytest.mark.asyncio
    async def test_refresh_user_token_uses_v2_endpoint_and_fields(self):
        auth = LarkAuth()
        auth.user_access_token = "u_old"
        auth.refresh_token = "r_old"
        auth._user_token_exp = 0.0
        fake_resp = _FakeAsyncResponse({"code": 0, "data": {"access_token": "u_new", "refresh_token": "r_new", "expires_in": 3600}})
        fake_client = _FakeAsyncClient(fake_resp, expected_method="POST", expected_url=USER_TOKEN_ENDPOINT)
        with patch("httpx.AsyncClient", return_value=fake_client):
            token = await auth.refresh_user_token()
        assert token == "u_new"
        body = fake_client.last_body
        assert body["grant_type"] == "refresh_token"
        assert body["refresh_token"] == "r_old"
        assert body["client_id"] == "cli_test"


class _FakeAsyncResponse:
    status_code = 200
    def __init__(self, payload):
        self._payload = payload

    def json(self):
        return self._payload


class _FakeAsyncClient:
    def __init__(self, response, expected_method="POST", expected_url="", last_body=None):
        self._response = response
        self.expected_method = expected_method
        self.expected_url = expected_url
        self.last_body = last_body

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def post(self, url, json=None, **kwargs):
        if self.expected_url and url != self.expected_url:
            raise AssertionError(f"Unexpected POST url: {url}")
        self.last_body = json
        return self._response

    async def get(self, url, headers=None, params=None, **kwargs):
        return self._response

    async def request(self, method, url, headers=None, json=None, **kwargs):
        return self._response


# ============================================================================
# Provider batch_modify schema verification
# ============================================================================


class TestLarkProviderBatchModify:
    @pytest.mark.asyncio
    async def test_mark_read_uses_add_label_ids_and_remove_unread(self):
        auth = MagicMock()
        auth.get_tenant_access_token = AsyncMock(return_value="tenant_123")
        provider = LarkMailProvider(auth=auth)
        captured = {}
        async def fake_request(method, url, token, json_body=None):
            captured["method"] = method
            captured["url"] = url
            captured["token"] = token
            captured["body"] = json_body
            return {"code": 0, "data": {}}
        provider._request = fake_request
        result = await provider.mark_read("me", ["msg_1", "msg_2"], is_read=True)
        assert result is True
        assert captured["body"] == {
            "message_ids": ["msg_1", "msg_2"],
            "add_label_ids": [],
            "remove_label_ids": ["UNREAD"],
        }
        assert captured["token"] == "tenant_123"
        assert captured["url"] == "https://open.larksuite.com/open-apis/mail/v1/user_mailboxes/me/messages/batch_modify"

    @pytest.mark.asyncio
    async def test_mark_unread_uses_remove_empty_and_add_unread(self):
        auth = MagicMock()
        auth.get_tenant_access_token = AsyncMock(return_value="tenant_123")
        provider = LarkMailProvider(auth=auth)
        captured = {}
        async def fake_request(method, url, token, json_body=None):
            captured["body"] = json_body
            captured["token"] = token
            return {"code": 0, "data": {}}
        provider._request = fake_request
        result = await provider.mark_read("me", ["msg_1"], is_read=False)
        assert captured["body"] == {
            "message_ids": ["msg_1"],
            "add_label_ids": ["UNREAD"],
            "remove_label_ids": [],
        }
        assert captured["token"] == "tenant_123"

    @pytest.mark.asyncio
    async def test_move_message_uses_add_folder(self):
        auth = MagicMock()
        auth.get_tenant_access_token = AsyncMock(return_value="tenant_123")
        provider = LarkMailProvider(auth=auth)
        captured = {}
        async def fake_request(method, url, token, json_body=None):
            captured["body"] = json_body
            captured["token"] = token
            return {"code": 0, "data": {}}
        provider._request = fake_request
        result = await provider.move_message("me", ["msg_1"], "ARCHIVED")
        assert captured["body"] == {
            "message_ids": ["msg_1"],
            "add_folder": "ARCHIVED",
        }
        assert captured["token"] == "tenant_123"


# ============================================================================
# Webhook payload handling
# ============================================================================


class TestWebhookPayload:
    @pytest.mark.asyncio
    async def test_message_received_uses_mail_address(self):
        client = TestClient(main.app)
        body = {
            "schema": "2.0",
            "header": {
                "event_id": "evt_1",
                "event_type": "mail.user_mailbox.event.message_received_v1",
                "token": "tok_1",
                "app_id": "cli_test",
                "tenant_key": "tenant_1",
            },
            "event": {
                "mail_address": "contact@adarshsingh.in",
                "message_id": "mid_123",
                "mailbox_type": 1,
            },
        }
        with patch("email_engine.router._fetch_and_process", new_callable=AsyncMock) as mock_fetch:
            resp = client.post("/api/v1/portfolio/email/lark/webhook", json=body)
        assert resp.status_code == 200
        assert resp.json() == {"code": 0, "msg": "success"}
        mock_fetch.assert_awaited_once_with("mid_123", "contact@adarshsingh.in")

    @pytest.mark.asyncio
    async def test_url_verification_challenge(self):
        client = TestClient(main.app)
        body = {"type": "url_verification", "challenge": "abc123"}
        resp = client.post("/api/v1/portfolio/email/lark/webhook", json=body)
        assert resp.status_code == 200
        assert resp.json() == {"challenge": "abc123"}


# ============================================================================
# Existing coverage preserved
# ============================================================================


class TestAliases:
    def test_work_alias_hint(self):
        assert get_alias_info("work@adarshsingh.in")["hint_category"] == "freelance_lead"

    def test_noreply_guard(self):
        assert is_auto_reply_allowed("noreply@adarshsingh.in") is False

    def test_normal_alias_allowed(self):
        assert is_auto_reply_allowed("hello@adarshsingh.in") is True


class TestIdempotency:
    @pytest.mark.asyncio
    async def test_duplicate_message_skipped(self):
        import email_engine.processor as proc_mod
        import email_engine.db as dbm
        import tempfile as tf
        td = tf.mkdtemp(prefix="hermes-verify-")
        path = os.path.join(td, "t.db")
        old_db_path = proc_mod.DB_PATH
        proc_mod.DB_PATH = path
        dbm.DB_PATH = path
        dbm.init_email_db()
        processor = proc_mod.EmailProcessor()
        r1 = await processor.process_inbound(
            "same-id", "a@x.com", ["work@adarshsingh.in"], "s", "b"
        )
        r2 = await processor.process_inbound(
            "same-id", "a@x.com", ["work@adarshsingh.in"], "s", "b"
        )
        assert r1["status"] == "processed"
        assert r2["status"] == "duplicate"
        proc_mod.DB_PATH = old_db_path
        dbm.DB_PATH = old_db_path


class TestStatusEndpoint:
    def test_email_status_default_zoho(self):
        client = TestClient(main.app)
        resp = client.get("/api/v1/portfolio/email/status")
        assert resp.status_code == 200
        assert resp.json()["provider"] == "zoho"
