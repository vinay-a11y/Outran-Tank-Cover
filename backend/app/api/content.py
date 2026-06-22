from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from backend.app.db.session import get_db
from backend.app.models.entities import Banner, BikeModel, Category, Coupon, CrewSignup, Product, ProductVariant, Review, Setting
from backend.app.services.catalog import get_category_map, product_to_out

router = APIRouter(tags=["content"])


class CrewSignupIn(BaseModel):
    phone: str = Field(min_length=6, max_length=30)


@router.get("/categories")
def categories(db: Session = Depends(get_db)):
    items = db.scalars(select(Category).where(Category.is_active == True).order_by(Category.name)).all()
    return {
        "items": [
            {
                "name": category.name,
                "slug": category.slug,
                "description": category.description,
                "image_url": category.image_url,
            }
            for category in items
        ]
    }


@router.get("/bike-models")
def bike_models(db: Session = Depends(get_db)):
    items = db.scalars(select(BikeModel).where(BikeModel.is_active == True).order_by(BikeModel.name)).all()
    return {
        "items": [{"name": model.name, "slug": model.slug, "brand": model.brand} for model in items]
    }


@router.get("/coupons/{code}")
def coupon(code: str, db: Session = Depends(get_db)):
    record = db.scalar(select(Coupon).where(Coupon.code == code.upper(), Coupon.is_active == True))
    if not record:
        return {"code": code.upper(), "valid": False, "discount": 0}
    return {
        "code": record.code,
        "valid": True,
        "discount_type": record.discount_type,
        "discount": float(record.value),
    }


@router.get("/journal")
def journal_posts():
    return {"items": [{"title": "Built for the ride beyond roads", "slug": "built-for-the-ride-beyond-roads"}]}


@router.post("/crew-signups")
def crew_signup(payload: CrewSignupIn, db: Session = Depends(get_db)):
    phone = payload.phone.strip()
    existing = db.scalar(select(CrewSignup).where(CrewSignup.phone == phone))
    if existing:
        return {"ok": True, "id": existing.id}
    signup = CrewSignup(phone=phone)
    db.add(signup)
    db.commit()
    db.refresh(signup)
    return {"ok": True, "id": signup.id}


def _product_load_options():
    return (
        selectinload(Product.images),
        selectinload(Product.variants).selectinload(ProductVariant.images),
    )


@router.get("/homepage")
def homepage(db: Session = Depends(get_db)):
    settings = {setting.key: setting.value for setting in db.scalars(select(Setting)).all()}
    hero_banner = db.scalar(
        select(Banner).where(Banner.section == "hero", Banner.is_active == True).order_by(Banner.sort_order)
    )
    featured = db.scalars(
        select(Product)
        .options(*_product_load_options())
        .where(Product.is_active == True, Product.is_featured == True)
        .limit(4)
    ).all()
    latest = db.scalars(
        select(Product)
        .options(*_product_load_options())
        .where(Product.is_active == True)
        .order_by(Product.created_at.desc())
        .limit(4)
    ).all()
    categories_list = db.scalars(select(Category).where(Category.is_active == True)).all()
    bike_models_list = db.scalars(select(BikeModel).where(BikeModel.is_active == True)).all()
    offers = db.scalars(select(Coupon).where(Coupon.is_active == True).limit(3)).all()
    testimonials = db.scalars(select(Review).where(Review.is_approved == True).limit(6)).all()
    category_map = get_category_map(db)

    def serialize(products):
        return [
            product_to_out(
                product,
                category_map.get(product.category_id, ("Tank Covers", "tank-covers"))[0],
                category_map.get(product.category_id, ("Tank Covers", "tank-covers"))[1],
            )
            for product in products
        ]

    return {
        "hero": {
            "eyebrow": "Terrain Core",
            "title": hero_banner.title if hero_banner else "Built for the ride beyond roads.",
            "subtitle": hero_banner.subtitle if hero_banner else "Precision fit tank cover for Himalayan 450",
            "image": hero_banner.image_url if hero_banner else "/assets/Hero.png",
            "cta_href": hero_banner.href if hero_banner else "/products/terrain-core-tank-cover",
            "cta_label": "Shop tank cover",
        },
        "featured_products": serialize(featured),
        "latest_products": serialize(latest),
        "bike_categories": [
            {
                "name": category.name,
                "slug": category.slug,
                "description": category.description,
                "image_url": category.image_url,
            }
            for category in categories_list
        ],
        "compatibility_highlights": {
            "title": settings.get("homepage_compatibility_title", "Fits your ride"),
            "copy": settings.get("homepage_compatibility_copy", ""),
            "bike_models": [{"name": model.name, "slug": model.slug} for model in bike_models_list],
        },
        "offers": [
            {
                "code": offer.code,
                "title": settings.get("homepage_offer_title", offer.code),
                "copy": settings.get("homepage_offer_copy", ""),
                "discount_type": offer.discount_type,
                "discount_value": float(offer.value),
                "cta_href": settings.get("homepage_offer_cta", "/products"),
            }
            for offer in offers
        ],
        "testimonials": [
            {
                "name": review.name,
                "rating": review.rating,
                "body": review.body,
            }
            for review in testimonials
        ],
    }
