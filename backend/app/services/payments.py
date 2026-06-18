import hmac
import hashlib
import razorpay
from backend.app.core.config import settings


class PaymentOrderError(RuntimeError):
    pass


def razorpay_client():
    key_id = settings.razorpay_key_id.strip()
    key_secret = settings.razorpay_key_secret.strip()
    if not key_id or not key_secret:
        return None
    return razorpay.Client(auth=(key_id, key_secret))


def create_payment_order(amount_rupees: float, receipt: str) -> dict:
    client = razorpay_client()
    if client is None:
        return {
            "id": f"order_dev_{receipt}",
            "amount": int(amount_rupees * 100),
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1
        }
    try:
        return client.order.create({
            "amount": int(amount_rupees * 100),
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1
        })
    except Exception as exc:
        raise PaymentOrderError("Razorpay order creation failed. Check test key id/secret and Razorpay account access.") from exc


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    key_secret = settings.razorpay_key_secret.strip()
    if not key_secret:
        return signature == "dev_signature"
    message = f"{order_id}|{payment_id}".encode()
    expected = hmac.new(key_secret.encode(), message, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook(body: bytes, signature: str) -> bool:
    webhook_secret = settings.razorpay_webhook_secret.strip()
    if not webhook_secret:
        return False
    expected = hmac.new(webhook_secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
