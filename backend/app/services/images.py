from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.entities import Product, ProductImage, ProductVariant


def get_variant_thumbnail(variant: ProductVariant | None) -> str | None:
    if not variant or not variant.images:
        return None
    images = sorted(variant.images, key=lambda item: item.sort_order)
    thumb = next((image.url for image in images if image.is_thumbnail), None)
    return thumb or images[0].url


def get_product_thumbnail(db: Session, product: Product) -> str | None:
    image = db.scalar(
        select(ProductImage)
        .where(ProductImage.product_id == product.id)
        .order_by(ProductImage.is_thumbnail.desc(), ProductImage.sort_order.asc())
    )
    return image.url if image else None


def resolve_item_image(
    db: Session, product: Product, variant: ProductVariant | None
) -> str | None:
    image = get_variant_thumbnail(variant)
    if not image and product:
        image = get_product_thumbnail(db, product)
    return image
