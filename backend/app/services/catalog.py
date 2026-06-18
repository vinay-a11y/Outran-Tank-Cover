import json
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from backend.app.models.entities import (
    Banner,
    BikeModel,
    Category,
    Coupon,
    Product,
    ProductImage,
    ProductVariant,
    Review,
    Setting,
    VariantImage,
)
from backend.app.services.pricing import calculate_discounted_price


TANK_COVER_SLUG = "terrain-core-tank-cover"
LEGACY_PRODUCT_IDS = {"terrain-core", "terrain-core-tank-cover", "tank-cover", "himalayan-tank-cover"}

PRODUCT_SPECS = [
    {"label": "Compatibility", "value": "Royal Enfield Himalayan 450"},
    {"label": "Material", "value": "1000D waterproof fabric"},
    {"label": "Fit Type", "value": "4-point secure fit"},
    {"label": "Access", "value": "Fuel cap access without removing cover"},
    {"label": "Warranty", "value": "1 year manufacturer warranty"},
    {"label": "Weight", "value": "~450g"},
]

PRODUCT_FEATURES = [
    {"title": "100% Waterproof", "body": "Rain-tested fabric, coated panels, and water-shedding construction."},
    {"title": "Zero Tank Wobble", "body": "Four anchor points keep the cover planted at highway speed."},
    {"title": "Quick Install", "body": "Quick lock buckles make mounting and removal simple."},
    {"title": "Paint Protection", "body": "Soft contact zones reduce scratches and tank scuffs."},
    {"title": "Premium Build", "body": "Reinforced stitching and tactical webbing for long-term use."},
    {"title": "Easy Access", "body": "Fuel-cap access without removing the cover."},
]

VARIANT_SEED = [
    {
        "sku": "OTR-TC-H450-BLK",
        "color": "Stealth Black",
        "color_hex": "#090909",
        "material": "1000D Waterproof Fabric",
        "size": "Himalayan 450",
        "stock": 50,
        "is_default": True,
        "images": [
            "/assets/feature-quick-lock.png",
            "/assets/feature-waterproof.png",
            "/assets/feature-premium-craft.png",
            "/assets/feature-terrain-fit.png",
            "/assets/product-detail.jpeg",
        ],
    },
    {
        "sku": "OTR-TC-H450-ORG",
        "color": "Black / Orange Stitch",
        "color_hex": "#2B1A0F",
        "material": "1000D Waterproof Fabric",
        "size": "Himalayan 450",
        "stock": 35,
        "is_default": False,
        "images": [
            "/assets/feature-waterproof.png",
            "/assets/feature-quick-lock.png",
            "/assets/feature-premium-craft.png",
            "/assets/feature-terrain-fit.png",
            "/assets/cart-page.jpeg",
        ],
    },
    {
        "sku": "OTR-TC-H450-GRN",
        "color": "Trail Green",
        "color_hex": "#313926",
        "material": "Ballistic Waterproof Nylon",
        "size": "Himalayan 450",
        "stock": 20,
        "is_default": False,
        "images": [
            "/assets/feature-terrain-fit.png",
            "/assets/feature-premium-craft.png",
            "/assets/feature-waterproof.png",
            "/assets/feature-quick-lock.png",
            "/assets/checkout-page.jpeg",
        ],
    },
]

PRODUCT_IMAGES = [
    ("/assets/feature-quick-lock.png", "OUTRAN tank cover mounted on Himalayan 450", True),
    ("/assets/feature-waterproof.png", "Waterproof buckles and stitching", False),
    ("/assets/feature-premium-craft.png", "Water droplets on waterproof fabric", False),
    ("/assets/feature-terrain-fit.png", "OUTRAN tank cover closeup", False),
]


def stock_status(quantity: int) -> str:
    if quantity <= 0:
        return "out_of_stock"
    if quantity <= 5:
        return "low_stock"
    return "in_stock"


def resolve_product_identifier(identifier: str) -> str:
    if identifier in LEGACY_PRODUCT_IDS:
        return TANK_COVER_SLUG
    return identifier


def _variant_to_dict(variant: ProductVariant) -> dict:
    images = sorted(variant.images, key=lambda item: item.sort_order)
    return {
        "id": variant.id,
        "sku": variant.sku,
        "color": variant.color,
        "material": variant.material,
        "size": variant.size,
        "price": float(variant.price),
        "stock": variant.stock,
        "color_hex": variant.color_hex or "#090909",
        "is_default": bool(variant.is_default),
        "stock_status": stock_status(variant.stock),
        "images": [
            {
                "url": image.url,
                "alt": image.alt,
                "sort_order": image.sort_order,
                "is_thumbnail": image.is_thumbnail,
            }
            for image in images
        ],
    }


def product_to_out(product: Product, category_name: str = "Tank Covers", category_slug: str = "tank-covers") -> dict:
    images = sorted(product.images, key=lambda item: item.sort_order)
    variants = sorted(product.variants, key=lambda item: (not item.is_default, item.id))
    default_variant = next((variant for variant in variants if variant.is_default), variants[0] if variants else None)
    primary_image = next((image.url for image in images if image.is_thumbnail), None)
    if not primary_image and default_variant and default_variant.images:
        thumb = next((img.url for img in sorted(default_variant.images, key=lambda i: i.sort_order) if img.is_thumbnail), None)
        primary_image = thumb or sorted(default_variant.images, key=lambda i: i.sort_order)[0].url
    if not primary_image:
        primary_image = images[0].url if images else "/assets/feature-quick-lock.png"

    gallery = [image.url for image in images]
    if default_variant:
        variant_urls = [image.url for image in sorted(default_variant.images, key=lambda item: item.sort_order)]
        gallery = variant_urls or gallery

    base_price = float(default_variant.price if default_variant else product.price)
    discounted = calculate_discounted_price(base_price, product.discount_type, float(product.discount_value or 0))
    total_stock = sum(variant.stock for variant in variants)
    specs = product.specifications_list or PRODUCT_SPECS
    bike_models = product.bike_models_list or ["Royal Enfield Himalayan 450"]
    short_desc = product.short_description or product.description[:180]
    full_desc = product.full_description or product.description

    return {
        "id": product.slug,
        "product_id": product.product_code or product.sku or f"PRD-{product.id:05d}",
        "database_id": product.id,
        "name": product.name,
        "slug": product.slug,
        "subtitle": f"For {bike_models[0]}" if bike_models else "Tank Cover",
        "badge": "Founders Edition" if product.is_featured else "",
        "short_description": short_desc,
        "description": product.description,
        "full_description": full_desc,
        "installation_guide": product.installation_guide or "Attach all four anchor points, tighten quick-lock buckles, and verify fuel-cap access before riding.",
        "hsn_code": product.hsn_code,
        "sku": product.sku,
        "price": float(product.price),
        "compareAt": float(product.compare_at_price) if product.compare_at_price else None,
        "discount_type": product.discount_type,
        "discount_value": float(product.discount_value) if product.discount_value else None,
        "discounted_price": discounted,
        "total_price": discounted,
        "image": primary_image,
        "thumbnail": primary_image,
        "gallery": gallery,
        "images": [
            {
                "url": image.url,
                "alt": image.alt,
                "media_type": image.media_type,
                "sort_order": image.sort_order,
                "is_thumbnail": image.is_thumbnail,
            }
            for image in images
        ],
        "colors": [_variant_to_dict(variant) for variant in variants],
        "variants": [_variant_to_dict(variant) for variant in variants],
        "color": default_variant.color if default_variant else "Stealth Black",
        "material": default_variant.material if default_variant else "1000D Waterproof Fabric",
        "category": category_name,
        "category_slug": category_slug,
        "rating": 4.9,
        "reviews": 256,
        "specs": specs,
        "features": PRODUCT_FEATURES,
        "supported_bike_models": bike_models,
        "stock_quantity": total_stock,
        "stock_status": stock_status(total_stock),
        "inventory_tracking": bool(product.inventory_tracking),
        "variant_stock_tracking": bool(product.variant_stock_tracking),
        "enable_disable_status": product.is_active,
        "featured_product": product.is_featured,
        "is_active": product.is_active,
    }


def seed_catalog(db: Session) -> None:
    category = db.scalar(select(Category).where(Category.slug == "tank-covers"))
    if not category:
        category = Category(
            name="Tank Covers",
            slug="tank-covers",
            description="Precision-fit tank protection for adventure motorcycles.",
            image_url="/assets/feature-quick-lock.png",
        )
        db.add(category)
        db.flush()

    for name, slug in [
        ("Royal Enfield Himalayan 450", "himalayan-450"),
        ("Royal Enfield Himalayan 411", "himalayan-411"),
        ("Royal Enfield Scram 411", "scram-411"),
    ]:
        if not db.scalar(select(BikeModel).where(BikeModel.slug == slug)):
            db.add(BikeModel(name=name, slug=slug))

    product = db.scalar(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.variants).selectinload(ProductVariant.images))
        .where(Product.slug == TANK_COVER_SLUG)
    )
    if not product:
        product = Product(
            category_id=category.id,
            product_code="OTR-TC-H450",
            name="Terrain Core Tank Cover",
            slug=TANK_COVER_SLUG,
            description="A waterproof, four-point secure tank cover system made for Royal Enfield Himalayan 450.",
            price=4999,
            compare_at_price=5999,
            discount_type="fixed",
            discount_value=1000,
            is_active=True,
            is_featured=True,
        )
        db.add(product)
        db.flush()
    else:
        product.category_id = category.id
        product.product_code = "OTR-TC-H450"
        product.name = "Terrain Core Tank Cover"
        product.description = "A waterproof, four-point secure tank cover system made for Royal Enfield Himalayan 450. Locks tight, protects paint, and keeps essentials accessible on long rides."
        product.price = 4999
        product.compare_at_price = 5999
        product.discount_type = "fixed"
        product.discount_value = 1000
        product.is_active = True
        product.is_featured = True

    product.short_description = "Waterproof four-point tank cover for Himalayan 450."
    product.full_description = product.description
    product.specifications = json.dumps(PRODUCT_SPECS)
    product.installation_guide = "1. Clean and dry the tank surface.\n2. Align the cover and hook all four anchor points.\n3. Tighten quick-lock buckles evenly.\n4. Verify fuel-cap access before riding."
    product.hsn_code = "63079090"
    product.sku = "OTR-TC-H450"
    product.supported_bike_models = json.dumps(["Royal Enfield Himalayan 450"])
    product.inventory_tracking = True
    product.variant_stock_tracking = True

    db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
    for order, (url, alt, is_thumb) in enumerate(PRODUCT_IMAGES):
        db.add(ProductImage(product_id=product.id, url=url, alt=alt, sort_order=order, is_thumbnail=is_thumb))

    db.query(ProductVariant).filter(ProductVariant.product_id == product.id).delete()
    for variant_data in VARIANT_SEED:
        variant = ProductVariant(
            product_id=product.id,
            sku=variant_data["sku"],
            color=variant_data["color"],
            color_hex=variant_data["color_hex"],
            material=variant_data["material"],
            size=variant_data["size"],
            price=4999,
            stock=variant_data["stock"],
            is_default=variant_data["is_default"],
        )
        db.add(variant)
        db.flush()
        for order, url in enumerate(variant_data["images"]):
            db.add(
                VariantImage(
                    variant_id=variant.id,
                    url=url,
                    alt=f"{variant_data['color']} view {order + 1}",
                    sort_order=order,
                    is_thumbnail=order == 0,
                )
            )

    if not db.scalar(select(Banner).where(Banner.section == "hero")):
        db.add(
            Banner(
                title="Built for the ride beyond roads.",
                subtitle="Precision fit tank cover for Himalayan 450",
                image_url="/assets/Hero.png",
                href="/products/terrain-core-tank-cover",
                section="hero",
                sort_order=0,
            )
        )

    if not db.scalar(select(Coupon).where(Coupon.code == "FOUNDER")):
        db.add(Coupon(code="FOUNDER", discount_type="fixed", value=500, is_active=True))

    if not db.scalar(select(Review).limit(1)):
        db.add(
            Review(
                product_id=product.id,
                name="Arjun K.",
                rating=5,
                body="Zero tank wobble even on rough Ladakh stretches. The fit is perfect.",
                is_approved=True,
            )
        )
        db.add(
            Review(
                product_id=product.id,
                name="Meera S.",
                rating=5,
                body="Rain-tested on a 3-day ride. Tank stayed dry and paint protected.",
                is_approved=True,
            )
        )

    settings_seed = {
        "homepage_compatibility_title": "Fits your ride",
        "homepage_compatibility_copy": "Engineered for Royal Enfield ADV platforms with precision tank geometry.",
        "homepage_offer_title": "Founders Edition",
        "homepage_offer_copy": "Launch pricing on the Terrain Core Tank Cover. Limited units.",
        "homepage_offer_cta": "/products/terrain-core-tank-cover",
    }
    for key, value in settings_seed.items():
        if not db.scalar(select(Setting).where(Setting.key == key)):
            db.add(Setting(key=key, value=value))

    db.commit()


def seed_single_tank_cover(db: Session) -> None:
    seed_catalog(db)


def get_category_map(db: Session) -> dict[int, tuple[str, str]]:
    categories = db.scalars(select(Category)).all()
    return {category.id: (category.name, category.slug) for category in categories}
