import secrets
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload
from backend.app.core.auth import get_current_user, get_current_user_optional
from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models.entities import Coupon, Order, OrderItem, Product, ProductImage, ProductVariant, ShippingAddress, User, UserAddress
from backend.app.schemas.common import CheckoutIn, OrderOut, RazorpayVerifyIn
from backend.app.services.catalog import resolve_checkout_variant, resolve_product_identifier
from backend.app.services.payments import PaymentOrderError, create_payment_order, verify_payment_signature, verify_webhook
from backend.app.services.pricing import calculate_discounted_price, calculate_line_total

router = APIRouter(prefix="/orders", tags=["orders"])


def _variant_image(variant: ProductVariant | None) -> str | None:
    if not variant or not variant.images:
        return None
    images = sorted(variant.images, key=lambda item: item.sort_order)
    thumb = next((image.url for image in images if image.is_thumbnail), None)
    return thumb or images[0].url


def _product_image(db: Session, product: Product) -> str | None:
    image = db.scalar(
        select(ProductImage)
        .where(ProductImage.product_id == product.id)
        .order_by(ProductImage.is_thumbnail.desc(), ProductImage.sort_order.asc())
    )
    return image.url if image else None


@router.post("/checkout")
def checkout(payload: CheckoutIn, db: Session = Depends(get_db), current_user: User | None = Depends(get_current_user)):
    subtotal = 0.0
    discount_total = 0.0
    order_lines: list[tuple[Product, ProductVariant | None, int, float, float, str | None, str | None]] = []

    for item in payload.items:
        product_slug = resolve_product_identifier(item.product_id)
        product = db.scalar(
            select(Product)
            .options(selectinload(Product.variants))
            .where(Product.slug == product_slug, Product.is_active == True)
        )
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product not found: {item.product_id}. Refresh product data and try again.",
            )

        variant = resolve_checkout_variant(
            product,
            variant_id=item.variant_id,
            variant_sku=item.variant_sku,
            color=item.color,
        )
        unit_price = float(product.price)
        if variant:
            unit_price = float(variant.price)
            if product.variant_stock_tracking and variant.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {variant.color}")
        elif product.variant_stock_tracking and product.variants:
            raise HTTPException(status_code=400, detail="Please select a valid color variant and try again.")

        discounted_unit = calculate_discounted_price(unit_price, product.discount_type, float(product.discount_value or 0))
        line_discount = (unit_price - discounted_unit) * item.quantity
        subtotal += calculate_line_total(discounted_unit, item.quantity)
        discount_total += line_discount
        order_lines.append(
            (
                product,
                variant,
                item.quantity,
                discounted_unit,
                line_discount,
                variant.color if variant else None,
                item.bike_model,
            )
        )

    coupon_discount = 0.0
    if payload.coupon_code:
        coupon = db.scalar(
            select(Coupon).where(Coupon.code == payload.coupon_code.upper(), Coupon.is_active == True)
        )
        if coupon:
            if coupon.discount_type == "percent":
                coupon_discount = round(subtotal * float(coupon.value) / 100, 2)
            else:
                coupon_discount = float(coupon.value)

    discount_total += coupon_discount
    shipping = 0 if subtotal >= 999 else 199
    tax = 0
    total = round(subtotal - coupon_discount + shipping, 2)

    address = ShippingAddress(**payload.address.model_dump())
    db.add(address)
    db.flush()
    if isinstance(current_user, User):
        existing_address = db.scalar(
            select(UserAddress).where(
                UserAddress.user_id == current_user.id,
                UserAddress.address == payload.address.address,
                UserAddress.pincode == payload.address.pincode,
            )
        )
        if not existing_address:
            saved_address = UserAddress(user_id=current_user.id, **payload.address.model_dump())
            db.add(saved_address)
            db.flush()
            older_addresses = db.scalars(
                select(UserAddress.id)
                .where(UserAddress.user_id == current_user.id, UserAddress.id != saved_address.id)
                .order_by(UserAddress.created_at.desc())
                .offset(1)
            ).all()
            if older_addresses:
                db.execute(delete(UserAddress).where(UserAddress.id.in_(older_addresses)))
    order = Order(
        order_number=f"OTR{secrets.randbelow(89999) + 10000}",
        user_id=current_user.id if isinstance(current_user, User) else None,
        shipping_address_id=address.id,
        subtotal=round(subtotal, 2),
        discount=round(discount_total, 2),
        tax=tax,
        shipping=shipping,
        total=total,
        payment_method=payload.payment_method,
    )
    db.add(order)
    db.flush()

    for product, variant, quantity, unit_price, _, color, bike_model in order_lines:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                variant_id=variant.id if variant else None,
                name=product.name,
                quantity=quantity,
                unit_price=unit_price,
                color=color,
                bike_model=bike_model,
                variant_sku=variant.sku if variant else product.sku,
            )
        )
        if variant and product.variant_stock_tracking:
            variant.stock = max(variant.stock - quantity, 0)

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
        "subtotal": order.subtotal,
        "discount": order.discount,
        "shipping": order.shipping,
        "tax": order.tax,
        "total": total,
    }


def _order_card(db: Session, order: Order) -> dict:
    first_item = order.items[0] if order.items else None
    product = db.get(Product, first_item.product_id) if first_item else None
    variant = db.get(ProductVariant, first_item.variant_id) if first_item and first_item.variant_id else None
    if variant:
        db.refresh(variant, attribute_names=["images"])
    image = _variant_image(variant) if variant else None
    if not image and product:
        image = _product_image(db, product)
    return {
        "id": order.id,
        "order_number": order.order_number,
        "product_image": image,
        "product_name": first_item.name if first_item else "Order",
        "variant": first_item.color if first_item else None,
        "quantity": sum(item.quantity for item in order.items),
        "amount": float(order.total),
        "payment_status": order.payment_status,
        "order_status": order.status,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


@router.get("")
def list_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.scalars(
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
    ).all()
    return {"items": [_order_card(db, order) for order in orders]}


@router.get("/id/{order_id}")
def get_order_by_id(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.scalar(
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.shipping_address))
        .where(Order.id == order_id, Order.user_id == current_user.id)
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    base = _order_detail_payload(db, order)
    base["id"] = order.id
    return base


@router.get("/{order_number}", response_model=OrderOut)
def get_order(order_number: str, db: Session = Depends(get_db), current_user: User | None = Depends(get_current_user_optional)):
    order = db.scalar(
        select(Order)
        .options(
            selectinload(Order.items),
            selectinload(Order.shipping_address),
        )
        .where(Order.order_number == order_number)
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user and order.user_id and order.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    return _order_detail_payload(db, order)


def _order_detail_payload(db: Session, order: Order) -> dict:
    items_out = []
    for item in order.items:
        product = db.get(Product, item.product_id)
        variant = db.get(ProductVariant, item.variant_id) if item.variant_id else None
        if variant:
            db.refresh(variant, attribute_names=["images"])
        image = _variant_image(variant) if variant else None
        if not image and product:
            image = _product_image(db, product)
        items_out.append(
            {
                "name": item.name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "line_total": round(float(item.unit_price) * item.quantity, 2),
                "color": item.color,
                "bike_model": item.bike_model,
                "variant_sku": item.variant_sku,
                "image": image,
            }
        )

    return {
        "order_number": order.order_number,
        "status": order.status,
        "payment_status": order.payment_status,
        "payment_method": order.payment_method,
        "subtotal": float(order.subtotal),
        "discount": float(order.discount),
        "shipping": float(order.shipping),
        "tax": float(order.tax),
        "total": float(order.total),
        "items": items_out,
        "shipping_address": {
            "full_name": order.shipping_address.full_name,
            "phone": order.shipping_address.phone,
            "email": order.shipping_address.email,
            "address": order.shipping_address.address,
            "city": order.shipping_address.city,
            "state": order.shipping_address.state,
            "pincode": order.shipping_address.pincode,
        } if order.shipping_address else None,
        "razorpay_payment_id": order.razorpay_payment_id,
        "timeline": [
            {"label": "Confirmed", "complete": True},
            {"label": "Processing", "complete": order.status in {"processing", "shipped", "delivered"}},
            {"label": "Shipped", "complete": order.status in {"shipped", "delivered"}},
            {"label": "Delivered", "complete": order.status == "delivered"},
        ],
        "invoice": {"number": f"INV-{order.order_number}", "total": float(order.total)},
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }


@router.post("/verify-payment")
def verify_payment(payload: RazorpayVerifyIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not verify_payment_signature(payload.razorpay_order_id, payload.razorpay_payment_id, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    order = db.get(Order, payload.order_id)
    if not order or order.user_id != current_user.id:
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
