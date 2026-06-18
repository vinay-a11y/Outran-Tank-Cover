import secrets
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Order, OrderItem, Product, ProductVariant, ShippingAddress
from backend.app.schemas.common import CheckoutIn, RazorpayVerifyIn
from backend.app.core.config import settings
from backend.app.services.catalog import resolve_product_identifier
from backend.app.services.payments import PaymentOrderError, create_payment_order, verify_payment_signature, verify_webhook

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/checkout")
def checkout(payload: CheckoutIn, db: Session = Depends(get_db)):
    subtotal = 0
    order_lines: list[tuple[Product, ProductVariant | None, int, float]] = []
    for item in payload.items:
        product_slug = resolve_product_identifier(item.product_id)
        product = db.scalar(select(Product).where(Product.slug == product_slug, Product.is_active == True))
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {item.product_id}. Refresh product data and try again.")
        variant = None
        unit_price = float(product.price)
        if item.variant_id:
            variant = db.get(ProductVariant, item.variant_id)
            if not variant or variant.product_id != product.id:
                raise HTTPException(status_code=400, detail="Invalid product variant")
            unit_price = float(variant.price)
        subtotal += unit_price * item.quantity
        order_lines.append((product, variant, item.quantity, unit_price))
    tax = round(subtotal * 0.18, 2)
    shipping = 0 if subtotal >= 999 else 199
    total = subtotal + tax + shipping
    address = ShippingAddress(**payload.address.model_dump())
    db.add(address)
    db.flush()
    order = Order(
        order_number=f"OTR{secrets.randbelow(89999) + 10000}",
        shipping_address_id=address.id,
        subtotal=subtotal,
        tax=tax,
        shipping=shipping,
        total=total,
        payment_method=payload.payment_method
    )
    db.add(order)
    db.flush()
    for product, variant, quantity, unit_price in order_lines:
        db.add(OrderItem(
            order_id=order.id,
            product_id=product.id,
            variant_id=variant.id if variant else None,
            name=product.name,
            quantity=quantity,
            unit_price=unit_price
        ))
    if payload.payment_method == "razorpay":
        try:
            payment_order = create_payment_order(total, order.order_number)
        except PaymentOrderError as exc:
            db.rollback()
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        order.razorpay_order_id = payment_order["id"]
    db.commit()
    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "razorpay_order_id": order.razorpay_order_id,
        "razorpay_key_id": settings.razorpay_key_id.strip(),
        "total": total
    }


@router.post("/verify-payment")
def verify_payment(payload: RazorpayVerifyIn, db: Session = Depends(get_db)):
    if not verify_payment_signature(payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    order = db.get(Order, payload.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.payment_status = "paid"
    order.razorpay_payment_id = payload.razorpay_payment_id
    db.commit()
    return {"status": "paid"}


@router.post("/razorpay-webhook")
async def razorpay_webhook(request: Request, x_razorpay_signature: str = Header(default="")):
    body = await request.body()
    if not verify_webhook(body, x_razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    return {"received": True}
