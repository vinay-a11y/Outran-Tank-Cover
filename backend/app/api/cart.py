from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from backend.app.core.auth import get_current_user
from backend.app.db.session import get_db
from backend.app.models.entities import CartItem, Product, ProductImage, ProductVariant, User
from backend.app.services.catalog import resolve_product_identifier
from backend.app.services.pricing import calculate_discounted_price

router = APIRouter(prefix="/cart", tags=["cart"])


class CartItemIn(BaseModel):
    product_id: str
    variant_id: int | None = None
    variant_sku: str | None = None
    bike_model: str | None = None
    quantity: int = Field(gt=0)


class CartSyncIn(BaseModel):
    items: list[CartItemIn]


def _product_image(db: Session, product: Product, variant: ProductVariant | None) -> str:
    if variant and variant.images:
        images = sorted(variant.images, key=lambda item: item.sort_order)
        thumb = next((image.url for image in images if image.is_thumbnail), None)
        return thumb or images[0].url
    image = db.scalar(
        select(ProductImage)
        .where(ProductImage.product_id == product.id)
        .order_by(ProductImage.is_thumbnail.desc(), ProductImage.sort_order.asc())
    )
    return image.url if image else ""


def _cart_item_out(db: Session, item: CartItem) -> dict | None:
    product_slug = resolve_product_identifier(item.product_id)
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.variants).selectinload(ProductVariant.images))
        .where(Product.slug == product_slug, Product.is_active == True)
    )
    if not product:
        return None
    variant = None
    if item.variant_sku:
        variant = next((entry for entry in product.variants if entry.sku == item.variant_sku), None)
    if not variant and item.variant_id:
        variant = next((entry for entry in product.variants if entry.id == item.variant_id), None)
    if product.variants and not variant:
        return None
    unit_price = float(variant.price if variant else product.price)
    price = calculate_discounted_price(unit_price, product.discount_type, float(product.discount_value or 0))
    bike_model = item.bike_model or (product.bike_models_list[0] if product.bike_models_list else "")
    variant_id = variant.id if variant else 0
    return {
        "lineId": f"{product.slug}:{variant_id}:{bike_model}",
        "id": product.slug,
        "database_id": product.id,
        "variant_id": variant_id,
        "variant_sku": variant.sku if variant else (product.sku or ""),
        "name": product.name,
        "subtitle": product.short_description or "",
        "price": price,
        "compareAt": float(product.compare_at_price) if product.compare_at_price else None,
        "image": _product_image(db, product, variant),
        "color": variant.color if variant else "",
        "color_hex": variant.color_hex if variant else "#090909",
        "material": variant.material if variant else "",
        "bike_model": bike_model,
        "qty": min(item.quantity, variant.stock if variant else item.quantity),
        "max_qty": max(variant.stock if variant else item.quantity, 1),
    }


def _upsert_item(db: Session, user: User, incoming: CartItemIn) -> None:
    product_slug = resolve_product_identifier(incoming.product_id)
    existing = db.scalar(
        select(CartItem).where(
            CartItem.user_id == user.id,
            CartItem.product_id == product_slug,
            CartItem.variant_sku == incoming.variant_sku,
            CartItem.bike_model == incoming.bike_model,
        )
    )
    if existing:
        existing.quantity = max(existing.quantity, incoming.quantity)
    else:
        db.add(
            CartItem(
                user_id=user.id,
                product_id=product_slug,
                variant_id=incoming.variant_id,
                variant_sku=incoming.variant_sku,
                bike_model=incoming.bike_model,
                quantity=incoming.quantity,
            )
        )


@router.get("")
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    items = db.scalars(select(CartItem).where(CartItem.user_id == user.id).order_by(CartItem.created_at.desc())).all()
    return {"items": [item for item in (_cart_item_out(db, entry) for entry in items) if item]}


@router.put("")
def replace_cart(payload: CartSyncIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    db.execute(delete(CartItem).where(CartItem.user_id == user.id))
    for item in payload.items:
        _upsert_item(db, user, item)
    db.commit()
    return get_cart(db, user)


@router.post("/merge")
def merge_cart(payload: CartSyncIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    for item in payload.items:
        _upsert_item(db, user, item)
    db.commit()
    return get_cart(db, user)


@router.delete("/{line_id}")
def delete_cart_item(line_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    parts = line_id.split(":")
    if len(parts) < 3:
        raise HTTPException(status_code=400, detail="Invalid cart line id")
    product_id, variant_id_raw, bike_model = parts[0], parts[1], ":".join(parts[2:])
    try:
        variant_id = int(variant_id_raw)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid variant id in cart line id")
    item = db.scalar(
        select(CartItem).where(
            CartItem.user_id == user.id,
            CartItem.product_id == product_id,
            CartItem.variant_id == variant_id,
            CartItem.bike_model == bike_model,
        )
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}
