from sqlalchemy import select
from sqlalchemy.orm import Session
from backend.app.models.entities import Category, Product, ProductImage, ProductVariant


TANK_COVER_SLUG = "terrain-core-tank-cover"
LEGACY_PRODUCT_IDS = {"terrain-core", "terrain-core-tank-cover", "tank-cover", "himalayan-tank-cover"}

PRODUCT_SPECS = [
    ("Compatibility", "Royal Enfield Himalayan 450"),
    ("Material", "1000D waterproof fabric"),
    ("Fit Type", "4-point secure fit"),
    ("Access", "Fuel cap access without removing cover"),
    ("Warranty", "1 year manufacturer warranty"),
    ("Weight", "~450g")
]

PRODUCT_FEATURES = [
    ("100% Waterproof", "Rain-tested fabric, coated panels, and water-shedding construction."),
    ("Zero Tank Wobble", "Four anchor points keep the cover planted at highway speed."),
    ("Quick Install", "Quick lock buckles make mounting and removal simple."),
    ("Paint Protection", "Soft contact zones reduce scratches and tank scuffs."),
    ("Premium Build", "Reinforced stitching and tactical webbing for long-term use."),
    ("Easy Access", "Fuel-cap access without removing the cover.")
]

COLOR_HEX = {
    "Stealth Black": "#090909",
    "Black / Orange Stitch": "#2B1A0F",
    "Trail Green": "#313926"
}


def seed_single_tank_cover(db: Session) -> None:
    category = db.scalar(select(Category).where(Category.slug == "tank-covers"))
    if not category:
        category = Category(name="Tank Covers", slug="tank-covers")
        db.add(category)
        db.flush()

    product = db.scalar(select(Product).where(Product.slug == TANK_COVER_SLUG))
    if not product:
        product = Product(
            category_id=category.id,
            name="Terrain Core Tank Cover",
            slug=TANK_COVER_SLUG,
            description="A waterproof, four-point secure tank cover system made for Royal Enfield Himalayan 450.",
            price=4999,
            compare_at_price=5999,
            is_active=True,
            is_featured=True
        )
        db.add(product)
        db.flush()
    else:
        product.category_id = category.id
        product.name = "Terrain Core Tank Cover"
        product.description = "A waterproof, four-point secure tank cover system made for Royal Enfield Himalayan 450. Locks tight, protects paint, and keeps essentials accessible on long rides."
        product.price = 4999
        product.compare_at_price = 5999
        product.is_active = True
        product.is_featured = True

    db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
    for order, (url, alt) in enumerate([
        ("/assets/feature-quick-lock.png", "OUTRAN tank cover mounted on Himalayan 450"),
        ("/assets/feature-waterproof.png", "Waterproof buckles and stitching"),
        ("/assets/feature-premium-craft.png", "Water droplets on waterproof fabric"),
        ("/assets/feature-terrain-fit.png", "OUTRAN tank cover closeup")
    ]):
        db.add(ProductImage(product_id=product.id, url=url, alt=alt, sort_order=order))

    db.query(ProductVariant).filter(ProductVariant.product_id == product.id).delete()
    for sku, color, material, size, stock in [
        ("OTR-TC-H450-BLK", "Stealth Black", "1000D Waterproof Fabric", "Himalayan 450", 50),
        ("OTR-TC-H450-ORG", "Black / Orange Stitch", "1000D Waterproof Fabric", "Himalayan 450", 35),
        ("OTR-TC-H450-GRN", "Trail Green", "Ballistic Waterproof Nylon", "Himalayan 450", 20)
    ]:
        db.add(ProductVariant(product_id=product.id, sku=sku, color=color, material=material, size=size, price=4999, stock=stock))

    db.commit()


def resolve_product_identifier(identifier: str) -> str:
    if identifier in LEGACY_PRODUCT_IDS:
        return TANK_COVER_SLUG
    return identifier


def product_to_out(product: Product) -> dict:
    images = sorted(product.images, key=lambda item: item.sort_order)
    variants = sorted(product.variants, key=lambda item: item.id)
    primary_image = images[0].url if images else "/assets/feature-quick-lock.png"
    primary_variant = variants[0] if variants else None
    material = primary_variant.material if primary_variant else "1000D Waterproof Fabric"
    color = primary_variant.color if primary_variant else "Stealth Black"

    return {
        "id": product.slug,
        "database_id": product.id,
        "name": product.name,
        "slug": product.slug,
        "subtitle": "For Himalayan 450",
        "badge": "Founders Edition",
        "description": product.description,
        "price": float(product.price),
        "compareAt": float(product.compare_at_price) if product.compare_at_price else None,
        "image": primary_image,
        "gallery": [image.url for image in images],
        "images": [
            {
                "url": image.url,
                "alt": image.alt,
                "media_type": image.media_type,
                "sort_order": image.sort_order
            }
            for image in images
        ],
        "colors": [
            {
                "id": variant.id,
                "sku": variant.sku,
                "color": variant.color,
                "material": variant.material,
                "size": variant.size,
                "price": float(variant.price),
                "stock": variant.stock,
                "color_hex": COLOR_HEX.get(variant.color, "#090909")
            }
            for variant in variants
        ],
        "color": color,
        "material": material,
        "category": "Tank Covers",
        "rating": 4.9,
        "reviews": 256,
        "specs": [{"label": label, "value": value} for label, value in PRODUCT_SPECS],
        "features": [{"title": title, "body": copy} for title, copy in PRODUCT_FEATURES],
        "is_active": product.is_active
    }
