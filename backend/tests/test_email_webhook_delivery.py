import pytest

from email_engine import router
from email_engine.processor import EmailProcessor


@pytest.mark.asyncio
async def test_inbound_email_executes_enabled_reply_and_reports_result(monkeypatch, tmp_path):
    monkeypatch.setattr(router, "_REPLY_DEDUP_PATH", str(tmp_path / "reply-dedup.json"))
    class Provider:
        async def get_message(self, mailbox_id, message_id):
            assert mailbox_id == "me"
            return {
                "message": {
                    "head_from": {"mail_address": "visitor@example.com"},
                    "to": [{"mail_address": "contact@adarshsingh.in"}],
                    "subject": "Project inquiry",
                    "body_plain_text": "Can we discuss a RAG project?",
                    "thread_id": "thread-1",
                }
            }

    class Processor:
        async def process_inbound(self, **kwargs):
            return {"status": "processed", "reply_decision": {"auto_send": True}}

        async def execute_reply(self, **kwargs):
            return True

    notifications = []

    async def notify(**kwargs):
        notifications.append(kwargs)

    monkeypatch.setattr("lark.provider.LarkMailProvider", lambda auth: Provider())
    monkeypatch.setattr("lark.auth.LarkAuth", lambda: object())
    monkeypatch.setattr(router, "processor", Processor())
    monkeypatch.setattr(router, "_notify_admin_inbound_email", notify)

    result = await router._fetch_and_process("message-1", "contact@adarshsingh.in")

    assert result["reply_sent"] is True
    assert notifications[0]["ai_sent"] is True


@pytest.mark.asyncio
async def test_genuine_reply_subject_still_notifies_admin(monkeypatch, tmp_path):
    monkeypatch.setattr(router, "_REPLY_DEDUP_PATH", str(tmp_path / "reply-dedup.json"))
    class Provider:
        async def get_message(self, mailbox_id, message_id):
            return {
                "message": {
                    "head_from": {"mail_address": "visitor@example.com"},
                    "to": [{"mail_address": "contact@adarshsingh.in"}],
                    "subject": "Re: Project inquiry",
                    "body_plain_text": "Tuesday works for me.",
                }
            }

    class Processor:
        async def process_inbound(self, **kwargs):
            return {"status": "processed", "reply_decision": {"auto_send": True}}

        async def execute_reply(self, **kwargs):
            return True

    notifications = []

    async def notify(**kwargs):
        notifications.append(kwargs)

    monkeypatch.setattr("lark.provider.LarkMailProvider", lambda auth: Provider())
    monkeypatch.setattr("lark.auth.LarkAuth", lambda: object())
    monkeypatch.setattr(router, "processor", Processor())
    monkeypatch.setattr(router, "_notify_admin_inbound_email", notify)

    await router._fetch_and_process("message-2", "contact@adarshsingh.in")

    assert len(notifications) == 1


def test_base64_decoder_does_not_corrupt_plain_text():
    plain = "Can we discuss the project tomorrow?"
    assert router._try_b64_decode(plain) == plain


@pytest.mark.asyncio
async def test_execute_reply_preserves_existing_thread(monkeypatch, tmp_path):
    calls = []

    class Provider:
        async def reply_to_message(self, **kwargs):
            calls.append(kwargs)
            return {"message_id": "reply-1", "thread_id": kwargs["thread_id"]}

    async def generate_reply(**kwargs):
        return "Thanks for reaching out.\n\nBest regards,\nAdarsh Singh"

    monkeypatch.setattr("ai_reply.generate_reply", generate_reply)
    monkeypatch.setattr("email_engine.processor.get_email_provider", lambda: Provider())
    processor = EmailProcessor()
    monkeypatch.setattr(processor, "_conn", lambda: _FakeConnection())

    sent = await processor.execute_reply(
        message_id="message-1",
        sender="visitor@example.com",
        subject="Re: Project inquiry",
        body_text="Following up",
        thread_id="thread-1",
    )

    assert sent is True
    assert calls[0]["message_id"] == "message-1"
    assert calls[0]["thread_id"] == "thread-1"
    assert calls[0]["subject"] == "Re: Project inquiry"


class _FakeConnection:
    def execute(self, *args, **kwargs):
        return self

    def commit(self):
        pass

    def close(self):
        pass


@pytest.mark.asyncio
async def test_scheduling_request_is_held_and_requests_whatsapp_approval(monkeypatch, tmp_path):
    monkeypatch.setattr(router, "_REPLY_DEDUP_PATH", str(tmp_path / "reply-dedup.json"))

    class Provider:
        async def get_message(self, mailbox_id, message_id):
            return {
                "message": {
                    "head_from": {"mail_address": "visitor@example.com"},
                    "to": [{"mail_address": "contact@adarshsingh.in"}],
                    "subject": "Schedule a call",
                    "body_plain_text": "Can we meet Tuesday at 3 PM?",
                    "thread_id": "thread-2",
                }
            }

    class Processor:
        reply_attempted = False

        async def process_inbound(self, **kwargs):
            return {"status": "processed", "reply_decision": {"auto_send": True}}

        async def execute_reply(self, **kwargs):
            self.reply_attempted = True
            return True

    processor = Processor()
    notifications = []

    async def notify(**kwargs):
        notifications.append(kwargs)

    monkeypatch.setattr("lark.provider.LarkMailProvider", lambda auth: Provider())
    monkeypatch.setattr("lark.auth.LarkAuth", lambda: object())
    monkeypatch.setattr(router, "processor", processor)
    monkeypatch.setattr(router, "_notify_admin_inbound_email", notify)

    result = await router._fetch_and_process("message-3", "contact@adarshsingh.in")

    assert result["reply_sent"] is False
    assert processor.reply_attempted is False
    assert notifications[0]["approval_required"] is True


def test_scheduling_intent_detection_does_not_block_general_project_mail():
    assert router._requires_scheduling_approval("Schedule a call", "Tuesday works") is True
    assert router._requires_scheduling_approval("Project inquiry", "Can you build a RAG app?") is False
