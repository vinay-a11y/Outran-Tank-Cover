import json
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from backend.app.models.entities import (
    Banner,
    BikeModel,
    CartItem,
    Category,
    Coupon,
    Inventory,
    OrderItem,
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

PRODUCT_FEATURES = [
    {"title": "100% Waterproof", "body": "Rain-tested fabric, coated panels, and water-shedding construction."},
    {"title": "Zero Tank Wobble", "body": "Four anchor points keep the cover planted at highway speed."},
    {"title": "Quick Install", "body": "Quick lock buckles make mounting and removal simple."},
    {"title": "Paint Protection", "body": "Soft contact zones reduce scratches and tank scuffs."},
    {"title": "Premium Build", "body": "Reinforced stitching and tactical webbing for long-term use."},
    {"title": "Easy Access", "body": "Fuel-cap access without removing the cover."},
]

CATALOG_PRODUCTS = [
    {
        "slug": "terrain-core-tank-cover",
        "product_code": "OTR-TC-H450",
        "sku": "OTR-TC-H450",
        "name": "Terrain Core Tank Cover",
        "short_description": "Waterproof four-point tank cover for Himalayan 450.",
        "description": "A waterproof, four-point secure tank cover system made for Royal Enfield Himalayan 450. Locks tight, protects paint, and keeps essentials accessible on long rides.",
        "price": 4999,
        "compare_at_price": 5999,
        "discount_type": "fixed",
        "discount_value": 1000,
        "is_featured": True,
        "supported_bike_models": ["Royal Enfield Himalayan 450"],
        "specs": [
            {"label": "Compatibility", "value": "Royal Enfield Himalayan 450"},
            {"label": "Material", "value": "1000D waterproof fabric"},
            {"label": "Fit Type", "value": "4-point secure fit"},
            {"label": "Access", "value": "Fuel cap access without removing cover"},
            {"label": "Warranty", "value": "1 year manufacturer warranty"},
            {"label": "Weight", "value": "~450g"},
        ],
        "images": [
            ("/assets/feature-quick-lock.png", "Terrain Core on Himalayan 450", True),
            ("/assets/feature-waterproof.png", "Waterproof buckles and stitching", False),
            ("/assets/feature-premium-craft.png", "Premium craftsmanship detail", False),
            ("/assets/feature-terrain-fit.png", "Terrain Core closeup", False),
        ],
        "variants": [
            {"sku": "OTR-TC-H450-BLK", "color": "Stealth Black", "color_hex": "#090909", "material": "1000D Waterproof Fabric", "size": "Himalayan 450", "stock": 50, "is_default": True},
            {"sku": "OTR-TC-H450-ORG", "color": "Black / Orange Stitch", "color_hex": "#2B1A0F", "material": "1000D Waterproof Fabric", "size": "Himalayan 450", "stock": 35, "is_default": False},
            {"sku": "OTR-TC-H450-GRN", "color": "Trail Green", "color_hex": "#313926", "material": "Ballistic Waterproof Nylon", "size": "Himalayan 450", "stock": 20, "is_default": False},
        ],
    },
    {
        "slug": "alpine-guard-tank-cover",
        "product_code": "OTR-TC-H411",
        "sku": "OTR-TC-H411",
        "name": "Alpine Guard Tank Cover",
        "short_description": "Trail-ready tank protection for Himalayan 411.",
        "description": "Built for Royal Enfield Himalayan 411 with reinforced anchor points, weatherproof panels, and a low-profile fit for long ADV days.",
        "price": 4499,
        "compare_at_price": 5299,
        "discount_type": "fixed",
        "discount_value": 800,
        "is_featured": True,
        "supported_bike_models": ["Royal Enfield Himalayan 411"],
        "specs": [
            {"label": "Compatibility", "value": "Royal Enfield Himalayan 411"},
            {"label": "Material", "value": "900D ripstop waterproof fabric"},
            {"label": "Fit Type", "value": "4-point secure fit"},
            {"label": "Access", "value": "Fuel cap access without removing cover"},
            {"label": "Warranty", "value": "1 year manufacturer warranty"},
            {"label": "Weight", "value": "~420g"},
        ],
        "images": [
            ("/assets/feature-waterproof.png", "Alpine Guard on Himalayan 411", True),
            ("/assets/feature-terrain-fit.png", "Alpine Guard fit detail", False),
            ("/assets/feature-premium-craft.png", "Reinforced stitching", False),
        ],
        "variants": [
            {"sku": "OTR-TC-H411-BLK", "color": "Stealth Black", "color_hex": "#090909", "material": "900D Ripstop Fabric", "size": "Himalayan 411", "stock": 40, "is_default": True},
            {"sku": "OTR-TC-H411-SND", "color": "Sand Storm", "color_hex": "#6B5A45", "material": "900D Ripstop Fabric", "size": "Himalayan 411", "stock": 28, "is_default": False},
        ],
    },
    {
        "slug": "scram-shield-tank-cover",
        "product_code": "OTR-TC-S411",
        "sku": "OTR-TC-S411",
        "name": "Scram Shield Tank Cover",
        "short_description": "Compact tank cover tuned for Scram 411 geometry.",
        "description": "A lightweight, secure tank cover designed for Royal Enfield Scram 411. Keeps your tank protected through city commutes and off-road detours.",
        "price": 4299,
        "compare_at_price": 4999,
        "discount_type": "fixed",
        "discount_value": 700,
        "is_featured": True,
        "supported_bike_models": ["Royal Enfield Scram 411"],
        "specs": [
            {"label": "Compatibility", "value": "Royal Enfield Scram 411"},
            {"label": "Material", "value": "850D coated waterproof nylon"},
            {"label": "Fit Type", "value": "4-point secure fit"},
            {"label": "Access", "value": "Fuel cap access without removing cover"},
            {"label": "Warranty", "value": "1 year manufacturer warranty"},
            {"label": "Weight", "value": "~390g"},
        ],
        "images": [
            ("/assets/feature-terrain-fit.png", "Scram Shield on Scram 411", True),
            ("/assets/feature-quick-lock.png", "Quick lock hardware", False),
            ("/assets/cart-page.jpeg", "Scram Shield lifestyle", False),
        ],
        "variants": [
            {"sku": "OTR-TC-S411-BLK", "color": "Stealth Black", "color_hex": "#090909", "material": "850D Coated Nylon", "size": "Scram 411", "stock": 45, "is_default": True},
            {"sku": "OTR-TC-S411-RED", "color": "Rally Red", "color_hex": "#7A1E1E", "material": "850D Coated Nylon", "size": "Scram 411", "stock": 22, "is_default": False},
        ],
    },
]

VARIANT_GALLERY = [
    "/assets/feature-quick-lock.png",
    "/assets/feature-waterproof.png",
    "/assets/feature-premium-craft.png",
    "/assets/feature-terrain-fit.png",
    "/assets/product-detail.jpeg",
]


def _variant_value(variant_data, key: str, default=None):
    if isinstance(variant_data, dict):
        return variant_data.get(key, default)
    return getattr(variant_data, key, default)


def _variant_images(variant_data) -> list:
    return list(_variant_value(variant_data, "images", []) or [])


def _seed_variant_images(index: int, variant_data) -> list[dict]:
    gallery = VARIANT_GALLERY if index == 0 else VARIANT_GALLERY[index % len(VARIANT_GALLERY):]
    color = _variant_value(variant_data, "color")
    return [
        {
            "url": url,
            "alt": f"{color} view {order + 1}",
            "sort_order": order,
            "is_thumbnail": order == 0,
        }
        for order, url in enumerate(gallery[:5])
    ]


def _variant_is_referenced(db: Session, variant_id: int) -> bool:
    checks = [
        db.query(OrderItem.id).filter(OrderItem.variant_id == variant_id).first(),
        db.query(CartItem.id).filter(CartItem.variant_id == variant_id).first(),
        db.query(Inventory.id).filter(Inventory.variant_id == variant_id).first(),
        db.query(ProductImage.id).filter(ProductImage.variant_id == variant_id).first(),
    ]
    return any(checks)


def save_product_variants(db: Session, product_id: int, variants: list, *, use_seed_gallery: bool = False) -> None:
    existing_variants = db.query(ProductVariant).filter(ProductVariant.product_id == product_id).all()
    existing_by_sku = {variant.sku: variant for variant in existing_variants}
    incoming_skus: set[str] = set()

    for index, variant_in in enumerate(variants):
        sku = _variant_value(variant_in, "sku")
        incoming_skus.add(sku)
        variant = existing_by_sku.get(sku)
        if not variant:
            variant = ProductVariant(product_id=product_id, sku=sku)
            db.add(variant)
            db.flush()

        variant.color = _variant_value(variant_in, "color")
        variant.color_hex = _variant_value(variant_in, "color_hex", "#090909")
        variant.material = _variant_value(variant_in, "material")
        variant.size = _variant_value(variant_in, "size")
        variant.price = _variant_value(variant_in, "price")
        variant.stock = _variant_value(variant_in, "stock", 0)
        variant.is_default = _variant_value(variant_in, "is_default", False)

        db.query(VariantImage).filter(VariantImage.variant_id == variant.id).delete()
        images = _seed_variant_images(index, variant_in) if use_seed_gallery else _variant_images(variant_in)
        for order, image in enumerate(images):
            db.add(
                VariantImage(
                    variant_id=variant.id,
                    url=_variant_value(image, "url"),
                    alt=_variant_value(image, "alt", ""),
                    sort_order=_variant_value(image, "sort_order", order) or order,
                    is_thumbnail=_variant_value(image, "is_thumbnail", False),
                )
            )

    for variant in existing_variants:
        if variant.sku in incoming_skus:
            continue
        if _variant_is_referenced(db, variant.id):
            variant.stock = 0
            variant.is_default = False
            continue
        db.query(VariantImage).filter(VariantImage.variant_id == variant.id).delete()
        db.delete(variant)


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


def resolve_checkout_variant(
    product: Product,
    *,
    variant_id: int | None = None,
    variant_sku: str | None = None,
    color: str | None = None,
) -> ProductVariant | None:
    variants = list(product.variants)
    if not variants:
        return None
    if variant_id:
        match = next((variant for variant in variants if variant.id == variant_id), None)
        if match:
            return match
    if variant_sku:
        match = next((variant for variant in variants if variant.sku == variant_sku), None)
        if match:
            return match
    if color:
        match = next((variant for variant in variants if variant.color.lower() == color.lower()), None)
        if match:
            return match
    return next((variant for variant in variants if variant.is_default), variants[0])


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
    if default_variant and default_variant.images:
        variant_urls = [image.url for image in sorted(default_variant.images, key=lambda item: item.sort_order)]
        gallery = variant_urls or gallery

    base_price = float(default_variant.price if default_variant else product.price)
    discounted = calculate_discounted_price(base_price, product.discount_type, float(product.discount_value or 0))
    total_stock = sum(variant.stock for variant in variants)
    specs = product.specifications_list or []
    bike_models = product.bike_models_list or []
    short_desc = product.short_description or product.description[:180]
    full_desc = product.full_description or product.description

    return {
        "id": product.slug,
        "product_id": product.product_code or product.sku or f"PRD-{product.id:05d}",
        "database_id": product.id,
        "name": product.name,
        "slug": product.slug,
        "subtitle": f"For {bike_models[0]}" if bike_models else "Tank Cover",
        "badge": "",
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


def _seed_product_variants(db: Session, product: Product, product_data: dict) -> None:
    variants = [{**variant_data, "price": product_data["price"]} for variant_data in product_data["variants"]]
    save_product_variants(db, product.id, variants, use_seed_gallery=True)


def _upsert_product(db: Session, category: Category, product_data: dict) -> Product:
    product = db.scalar(select(Product).where(Product.slug == product_data["slug"]))
    if not product:
        product = Product(
            category_id=category.id,
            slug=product_data["slug"],
            name=product_data["name"],
            description=product_data["description"],
            price=product_data["price"],
            is_active=True,
        )
        db.add(product)
        db.flush()

    product.category_id = category.id
    product.product_code = product_data["product_code"]
    product.name = product_data["name"]
    product.description = product_data["description"]
    product.short_description = product_data["short_description"]
    product.full_description = product_data["description"]
    product.specifications = json.dumps(product_data["specs"])
    product.installation_guide = (
        "1. Clean and dry the tank surface.\n"
        "2. Align the cover and hook all four anchor points.\n"
        "3. Tighten quick-lock buckles evenly.\n"
        "4. Verify fuel-cap access before riding."
    )
    product.hsn_code = "63079090"
    product.sku = product_data["sku"]
    product.price = product_data["price"]
    product.compare_at_price = product_data["compare_at_price"]
    product.discount_type = product_data["discount_type"]
    product.discount_value = product_data["discount_value"]
    product.supported_bike_models = json.dumps(product_data["supported_bike_models"])
    product.inventory_tracking = True
    product.variant_stock_tracking = True
    product.is_active = True
    product.is_featured = product_data["is_featured"]

    db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
    for order, (url, alt, is_thumb) in enumerate(product_data["images"]):
        db.add(ProductImage(product_id=product.id, url=url, alt=alt, sort_order=order, is_thumbnail=is_thumb))

    _seed_product_variants(db, product, product_data)
    return product


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
    else:
        category.description = "Precision-fit tank protection for adventure motorcycles."
        category.image_url = "/assets/feature-quick-lock.png"

    bike_models = [
        ("Royal Enfield Himalayan 450", "himalayan-450"),
        ("Royal Enfield Himalayan 411", "himalayan-411"),
        ("Royal Enfield Scram 411", "scram-411"),
    ]
    for name, slug in bike_models:
        existing = db.scalar(select(BikeModel).where(BikeModel.slug == slug))
        if not existing:
            db.add(BikeModel(name=name, slug=slug))

    seeded_products: list[Product] = []
    for product_data in CATALOG_PRODUCTS:
        seeded_products.append(_upsert_product(db, category, product_data))

    hero = db.scalar(select(Banner).where(Banner.section == "hero"))
    if not hero:
        db.add(
            Banner(
                title="Built for the ride beyond roads.",
                subtitle="Tank covers engineered for Himalayan 450, 411, and Scram 411",
                image_url="/assets/Hero.png",
                href="/products",
                section="hero",
                sort_order=0,
            )
        )
    else:
        hero.subtitle = "Tank covers engineered for Himalayan 450, 411, and Scram 411"
        hero.href = "/products"

    if not db.scalar(select(Coupon).where(Coupon.code == "FOUNDER")):
        db.add(Coupon(code="FOUNDER", discount_type="fixed", value=500, is_active=True))

    if not db.scalar(select(Review).limit(1)):
        for product, name, body in [
            (seeded_products[0], "Arjun K.", "Zero tank wobble even on rough Ladakh stretches. Perfect Himalayan 450 fit."),
            (seeded_products[1], "Meera S.", "Rain-tested on a 3-day ride. Alpine Guard sits stable on my 411."),
            (seeded_products[2], "Rahul D.", "Scram Shield is compact, secure, and easy to live with every day."),
        ]:
            db.add(Review(product_id=product.id, name=name, rating=5, body=body, is_approved=True))

    settings_seed = {
        "homepage_compatibility_title": "Built for your bike",
        "homepage_compatibility_copy": "Choose a tank cover matched to Himalayan 450, Himalayan 411, or Scram 411 geometry.",
        "homepage_offer_title": "Founders Edition",
        "homepage_offer_copy": "Launch pricing across all OUTRAN tank cover models.",
        "homepage_offer_cta": "/products",
    }
    for key, value in settings_seed.items():
        setting = db.scalar(select(Setting).where(Setting.key == key))
        if setting:
            setting.value = value
        else:
            db.add(Setting(key=key, value=value))

    db.commit()


def seed_single_tank_cover(db: Session) -> None:
    seed_catalog(db)


def get_category_map(db: Session) -> dict[int, tuple[str, str]]:
    categories = db.scalars(select(Category)).all()
    return {category.id: (category.name, category.slug) for category in categories}
