import hashlib
import hmac
import unittest

from backend.app.core.config import settings
from backend.app.services.payments import (
    PaymentOrderError,
    create_payment_order,
    razorpay_client,
    verify_payment_signature,
    verify_webhook,
)


class RazorpayClientTest(unittest.TestCase):
    def test_returns_none_when_keys_empty(self):
        original_id = settings.razorpay_key_id
        original_secret = settings.razorpay_key_secret
        try:
            settings.razorpay_key_id = ""
            settings.razorpay_key_secret = ""
            self.assertIsNone(razorpay_client())
        finally:
            settings.razorpay_key_id = original_id
            settings.razorpay_key_secret = original_secret

    def test_returns_none_when_keys_whitespace(self):
        original_id = settings.razorpay_key_id
        original_secret = settings.razorpay_key_secret
        try:
            settings.razorpay_key_id = "   "
            settings.razorpay_key_secret = "  "
            self.assertIsNone(razorpay_client())
        finally:
            settings.razorpay_key_id = original_id
            settings.razorpay_key_secret = original_secret


class CreatePaymentOrderDevModeTest(unittest.TestCase):
    def setUp(self):
        self.original_id = settings.razorpay_key_id
        self.original_secret = settings.razorpay_key_secret
        settings.razorpay_key_id = ""
        settings.razorpay_key_secret = ""

    def tearDown(self):
        settings.razorpay_key_id = self.original_id
        settings.razorpay_key_secret = self.original_secret

    def test_dev_mode_returns_order_dict(self):
        result = create_payment_order(3999, "OTR12345")
        self.assertEqual(result["id"], "order_dev_OTR12345")
        self.assertEqual(result["amount"], 399900)
        self.assertEqual(result["currency"], "INR")
        self.assertEqual(result["receipt"], "OTR12345")
        self.assertEqual(result["payment_capture"], 1)

    def test_dev_mode_amount_conversion(self):
        result = create_payment_order(19.99, "OTR99999")
        self.assertEqual(result["amount"], int(19.99 * 100))


class VerifyPaymentSignatureTest(unittest.TestCase):
    def setUp(self):
        self.original_secret = settings.razorpay_key_secret

    def tearDown(self):
        settings.razorpay_key_secret = self.original_secret

    def test_dev_mode_accepts_dev_signature(self):
        settings.razorpay_key_secret = ""
        self.assertTrue(verify_payment_signature("order_123", "pay_456", "dev_signature"))

    def test_dev_mode_rejects_wrong_signature(self):
        settings.razorpay_key_secret = ""
        self.assertFalse(verify_payment_signature("order_123", "pay_456", "wrong"))

    def test_real_mode_verifies_hmac(self):
        secret = "test_secret_key_12345"
        settings.razorpay_key_secret = secret
        order_id = "order_abc"
        payment_id = "pay_xyz"
        message = f"{order_id}|{payment_id}".encode()
        valid_sig = hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()
        self.assertTrue(verify_payment_signature(order_id, payment_id, valid_sig))

    def test_real_mode_rejects_bad_signature(self):
        settings.razorpay_key_secret = "test_secret_key_12345"
        self.assertFalse(verify_payment_signature("order_abc", "pay_xyz", "bad_sig"))


class VerifyWebhookTest(unittest.TestCase):
    def setUp(self):
        self.original_secret = settings.razorpay_webhook_secret

    def tearDown(self):
        settings.razorpay_webhook_secret = self.original_secret

    def test_no_secret_returns_false(self):
        settings.razorpay_webhook_secret = ""
        self.assertFalse(verify_webhook(b"body", "sig"))

    def test_valid_webhook_signature(self):
        secret = "webhook_secret_123"
        settings.razorpay_webhook_secret = secret
        body = b'{"event":"payment.captured"}'
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        self.assertTrue(verify_webhook(body, expected))

    def test_invalid_webhook_signature(self):
        settings.razorpay_webhook_secret = "webhook_secret_123"
        self.assertFalse(verify_webhook(b"body", "invalid_sig"))


if __name__ == "__main__":
    unittest.main()
