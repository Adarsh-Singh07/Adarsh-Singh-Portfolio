from email_engine.base import EmailProvider
from lark.provider import LarkMailProvider

_provider_instance = None

def get_email_provider() -> EmailProvider:
    """
    Factory that strictly returns LarkMailProvider per Phase 5 architecture.
    """
    global _provider_instance
    if _provider_instance is None:
        _provider_instance = LarkMailProvider()
    return _provider_instance
