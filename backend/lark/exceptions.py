class LarkError(Exception):
    """Base exception for Lark API errors."""
    def __init__(self, message: str, code: int = None):
        super().__init__(message)
        self.code = code

class LarkAuthError(LarkError):
    """Raised when authentication or token acquisition fails."""
    pass

class LarkRateLimitError(LarkError):
    """Raised when Lark API rate limits are exceeded (429)."""
    pass

class LarkMailboxNotFoundError(LarkError):
    """Raised when the specified user mailbox is not found or inactive (404)."""
    pass

class LarkPermissionError(LarkError):
    """Raised when the application lacks required scopes or permissions (403)."""
    pass
