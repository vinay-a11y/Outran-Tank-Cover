import unittest
from datetime import datetime, timezone
from types import SimpleNamespace

import jwt

from backend.app.core.auth import create_access_token, decode_access_token, user_payload
from backend.app.core.config import settings


class _FakeUser:
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)


class CreateAccessTokenTest(unittest.TestCase):
    def test_returns_valid_jwt(self):
        user = _FakeUser(id="user-123", email="test@example.com")
        token = create_access_token(user)
        decoded = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        self.assertEqual(decoded["sub"], "user-123")
        self.assertEqual(decoded["email"], "test@example.com")
        self.assertIn("exp", decoded)

    def test_token_expiry_is_in_future(self):
        user = _FakeUser(id="user-456", email="future@example.com")
        token = create_access_token(user)
        decoded = jwt.decode(token, settings.secret_key, algorithms=[settings.jwt_algorithm])
        exp = datetime.fromtimestamp(decoded["exp"], tz=timezone.utc)
        self.assertGreater(exp, datetime.now(timezone.utc))


class DecodeAccessTokenTest(unittest.TestCase):
    def test_decode_valid_token(self):
        user = _FakeUser(id="user-789", email="decode@example.com")
        token = create_access_token(user)
        payload = decode_access_token(token)
        self.assertEqual(payload["sub"], "user-789")

    def test_decode_invalid_token_raises(self):
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            decode_access_token("invalid.token.here")
        self.assertEqual(ctx.exception.status_code, 401)

    def test_decode_tampered_token_raises(self):
        from fastapi import HTTPException
        user = _FakeUser(id="user-000", email="tampered@example.com")
        token = create_access_token(user)
        tampered = token[:-5] + "XXXXX"
        with self.assertRaises(HTTPException):
            decode_access_token(tampered)


class UserPayloadTest(unittest.TestCase):
    def test_complete_user(self):
        now = datetime(2025, 6, 1, 12, 0, 0)
        user = _FakeUser(
            id="u-1",
            email="vinay@example.com",
            google_id="g-abc",
            name="Vinay",
            phone_number="+91 98765 43210",
            profile_image="https://example.com/photo.jpg",
            is_phone_verified=True,
            created_at=now,
            updated_at=now,
        )
        result = user_payload(user)
        self.assertEqual(result["id"], "u-1")
        self.assertEqual(result["email"], "vinay@example.com")
        self.assertEqual(result["name"], "Vinay")
        self.assertTrue(result["profile_complete"])
        self.assertTrue(result["is_phone_verified"])
        self.assertEqual(result["created_at"], now.isoformat())

    def test_incomplete_profile(self):
        user = _FakeUser(
            id="u-2",
            email="noname@example.com",
            google_id="g-xyz",
            name=None,
            phone_number=None,
            profile_image=None,
            is_phone_verified=False,
            created_at=None,
            updated_at=None,
        )
        result = user_payload(user)
        self.assertFalse(result["profile_complete"])
        self.assertIsNone(result["created_at"])

    def test_partial_profile_not_complete(self):
        user = _FakeUser(
            id="u-3",
            email="partial@example.com",
            google_id="g-partial",
            name="Partial",
            phone_number=None,
            profile_image=None,
            is_phone_verified=False,
            created_at=None,
            updated_at=None,
        )
        result = user_payload(user)
        self.assertFalse(result["profile_complete"])


if __name__ == "__main__":
    unittest.main()
