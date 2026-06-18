from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload
from backend.app.db.session import get_db
from backend.app.models.entities import Category, Product, ProductVariant
from backend.app.schemas.common import ProductOut
from backend.app.services.catalog import get_category_map, product_to_out

router = APIRouter(prefix="/products", tags=["products"])


def _load_products_stmt():
    return (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.variants).selectinload(ProductVariant.images),
        )
        .where(Product.is_active == True)
    )


def _serialize_products(products: list[Product], db: Session) -> list[dict]:
    category_map = get_category_map(db)
    return [
        product_to_out(
            product,
            category_map.get(product.category_id, ("Tank Covers", "tank-covers"))[0],
            category_map.get(product.category_id, ("Tank Covers", "tank-covers"))[1],
        )
        for product in products
    ]


def _apply_filters(
    stmt,
    *,
    category: str | None,
    search: str | None,
    bike_model: str | None,
    color: str | None,
    stock_status: str | None,
    sort: str | None,
):
    if category:
        stmt = stmt.join(Category, Product.category_id == Category.id).where(
            or_(Category.slug == category, Category.name.ilike(f"%{category}%"))
        )
    if search:
        stmt = stmt.where(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
                Product.short_description.ilike(f"%{search}%"),
                Product.supported_bike_models.ilike(f"%{search}%"),
            )
        )
    if bike_model:
        stmt = stmt.where(Product.supported_bike_models.ilike(f"%{bike_model}%"))
    if color:
        stmt = stmt.join(ProductVariant).where(ProductVariant.color.ilike(f"%{color}%"))
    if stock_status == "in_stock":
        stmt = stmt.join(ProductVariant).where(ProductVariant.stock > 0)
    elif stock_status == "out_of_stock":
        stmt = stmt.join(ProductVariant).where(ProductVariant.stock <= 0)
    if sort == "price_asc":
        stmt = stmt.order_by(Product.price.asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(Product.price.desc())
    elif sort == "newest":
        stmt = stmt.order_by(Product.created_at.desc())
    else:
        stmt = stmt.order_by(Product.is_featured.desc(), Product.created_at.desc())
    return stmt


@router.get("", response_model=list[ProductOut])
def list_products(
    category: str | None = None,
    search: str | None = None,
    bike_model: str | None = None,
    color: str | None = None,
    stock_status: str | None = None,
    sort: str | None = None,
    limit: int = Query(24, le=100),
    offset: int = 0,
    db: Session = Depends(get_db),
):
    stmt = _apply_filters(
        _load_products_stmt(),
        category=category,
        search=search,
        bike_model=bike_model,
        color=color,
        stock_status=stock_status,
        sort=sort,
    )
    products = db.scalars(stmt.distinct().limit(limit).offset(offset)).all()
    return _serialize_products(products, db)


@router.get("/featured", response_model=list[ProductOut])
def featured_products(db: Session = Depends(get_db)):
    stmt = _load_products_stmt().where(Product.is_featured == True)
    products = db.scalars(stmt).all()
    return _serialize_products(products, db)


@router.get("/latest", response_model=list[ProductOut])
def latest_products(limit: int = Query(8, le=24), db: Session = Depends(get_db)):
    stmt = _load_products_stmt().order_by(Product.created_at.desc()).limit(limit)
    products = db.scalars(stmt).all()
    return _serialize_products(products, db)


@router.get("/filters")
def product_filters(db: Session = Depends(get_db)):
    products = db.scalars(
        _load_products_stmt().options(selectinload(Product.variants))
    ).all()
    colors = sorted({variant.color for product in products for variant in product.variants})
    bike_models = sorted(
        {
            bike
            for product in products
            for bike in product.bike_models_list
        }
    )
    categories = db.scalars(select(Category).where(Category.is_active == True)).all()
    return {
        "categories": [{"name": category.name, "slug": category.slug} for category in categories],
        "bike_models": bike_models,
        "colors": colors,
        "stock_statuses": ["in_stock", "low_stock", "out_of_stock"],
        "sort_options": [
            {"value": "featured", "label": "Featured"},
            {"value": "newest", "label": "Newest"},
            {"value": "price_asc", "label": "Price: Low to High"},
            {"value": "price_desc", "label": "Price: High to Low"},
        ],
    }


@router.get("/{slug}", response_model=ProductOut)
def get_product(slug: str, db: Session = Depends(get_db)):
    product = db.scalar(
        _load_products_stmt().where(Product.slug == slug)
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    category_map = get_category_map(db)
    name, cat_slug = category_map.get(product.category_id, ("Tank Covers", "tank-covers"))
    return product_to_out(product, name, cat_slug)


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
        "stock_status": "in_stock" if total_stock > 0 else "out_of_stock",
        "variants": [
            {
                "id": variant.id,
                "sku": variant.sku,
                "color": variant.color,
                "stock": variant.stock,
                "stock_status": "in_stock" if variant.stock > 0 else "out_of_stock",
            }
            for variant in product.variants
        ],
    }
