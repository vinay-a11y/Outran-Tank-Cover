import json
import secrets as _secrets

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from backend.app.core.config import settings
from backend.app.db.session import get_db
from backend.app.models.entities import Category, Product, ProductImage, ProductVariant
from backend.app.schemas.admin import ProductCreateIn, ProductUpdateIn
from backend.app.services.catalog import get_category_map, product_to_out, save_product_variants, seed_catalog

router = APIRouter(prefix="/admin", tags=["admin"])


def verify_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or not _secrets.compare_digest(x_admin_key, settings.admin_api_key):
        raise HTTPException(status_code=401, detail="Invalid admin key")


@router.get("/products")
def admin_list_products(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    products = db.scalars(
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.variants).selectinload(ProductVariant.images),
        )
        .order_by(Product.created_at.desc())
    ).all()
    category_map = get_category_map(db)
    return [
        product_to_out(
            product,
            category_map.get(product.category_id, ("Tank Covers", "tank-covers"))[0],
            category_map.get(product.category_id, ("Tank Covers", "tank-covers"))[1],
        )
        for product in products
    ]


def _save_product_images(db: Session, product_id: int, images: list) -> None:
    db.query(ProductImage).filter(ProductImage.product_id == product_id).delete()
    for order, image in enumerate(images):
        db.add(
            ProductImage(
                product_id=product_id,
                url=image.url,
                alt=image.alt,
                sort_order=image.sort_order or order,
                is_thumbnail=image.is_thumbnail,
            )
        )


def _save_variants(db: Session, product_id: int, variants: list) -> None:
    save_product_variants(db, product_id, variants)


@router.post("/products")
def admin_create_product(
    payload: ProductCreateIn,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    category = db.scalar(select(Category).where(Category.slug == payload.category_slug))
    if not category:
        raise HTTPException(status_code=400, detail="Category not found")
    product = Product(
        category_id=category.id,
        product_code=payload.product_code,
        name=payload.name,
        slug=payload.slug,
        description=payload.description or payload.full_description,
        short_description=payload.short_description,
        full_description=payload.full_description,
        specifications=json.dumps(payload.specifications),
        installation_guide=payload.installation_guide,
        hsn_code=payload.hsn_code,
        sku=payload.sku,
        price=payload.price,
        compare_at_price=payload.compare_at_price,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        inventory_tracking=payload.inventory_tracking,
        variant_stock_tracking=payload.variant_stock_tracking,
        supported_bike_models=json.dumps(payload.supported_bike_models),
        is_active=payload.is_active,
        is_featured=payload.is_featured,
    )
    db.add(product)
    db.flush()
    _save_product_images(db, product.id, payload.images)
    if payload.variants:
        _save_variants(db, product.id, payload.variants)
    db.commit()
    db.refresh(product)
    return product_to_out(product)


@router.put("/products/{slug}")
def admin_update_product(
    slug: str,
    payload: ProductUpdateIn,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    product = db.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    data = payload.model_dump(exclude_unset=True)
    if "specifications" in data:
        product.specifications = json.dumps(data.pop("specifications"))
    if "supported_bike_models" in data:
        product.supported_bike_models = json.dumps(data.pop("supported_bike_models"))
    images = data.pop("images", None)
    variants = data.pop("variants", None)
    for key, value in data.items():
        setattr(product, key, value)
    if images is not None:
        _save_product_images(db, product.id, images)
    if variants is not None:
        _save_variants(db, product.id, variants)
    db.commit()
    db.refresh(product)
    return product_to_out(product)


@router.delete("/products/{slug}")
def admin_delete_product(
    slug: str,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    product = db.scalar(select(Product).where(Product.slug == slug))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"status": "disabled", "slug": slug}


@router.post("/seed")
def admin_seed(
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    seed_catalog(db)
    return {"status": "seeded"}
