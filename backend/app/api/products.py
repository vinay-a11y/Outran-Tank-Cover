from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.models.entities import Product
from backend.app.schemas.common import ProductOut
from backend.app.services.catalog import product_to_out

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(
    category: str | None = None,
    search: str | None = None,
    limit: int = Query(24, le=100),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    stmt = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants))
        .where(Product.is_active == True)
        .limit(limit)
        .offset(offset)
    )
    if search:
        stmt = stmt.where(Product.name.ilike(f"%{search}%"))
    return [product_to_out(product) for product in db.scalars(stmt).all()]


@router.get("/featured", response_model=list[ProductOut])
def featured_products(db: Session = Depends(get_db)):
    stmt = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants))
        .where(Product.is_active == True, Product.is_featured == True)
    )
    return [product_to_out(product) for product in db.scalars(stmt).all()]


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants))
        .where(Product.slug == slug, Product.is_active == True)
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_out(product)


@router.get("/{slug}/availability")
def product_availability(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(
        select(Product)
        .options(selectinload(Product.variants))
        .where(Product.slug == slug, Product.is_active == True)
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    total_stock = sum(variant.stock for variant in product.variants)
    return {
        "slug": product.slug,
        "in_stock": total_stock > 0,
        "total_stock": total_stock,
        "variants": [
            {
                "id": variant.id,
                "sku": variant.sku,
                "color": variant.color,
                "stock": variant.stock
            }
            for variant in product.variants
        ]
    }
