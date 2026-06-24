import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from backend.app.db.migrate import run_migrations
from backend.app.models.entities import (
    Base,
    Category,
    Product,
    ProductImage,
    ProductVariant,
    VariantImage,
)
from backend.app.services.catalog import (
    LEGACY_PRODUCT_IDS,
    TANK_COVER_SLUG,
    VARIANT_GALLERY,
    _seed_variant_images,
    _variant_value,
    get_category_map,
    resolve_checkout_variant,
    resolve_product_identifier,
    stock_status,
)


class StockStatusTest(unittest.TestCase):
    def test_zero_is_out_of_stock(self):
        self.assertEqual(stock_status(0), "out_of_stock")

    def test_negative_is_out_of_stock(self):
        self.assertEqual(stock_status(-1), "out_of_stock")

    def test_one_is_low_stock(self):
        self.assertEqual(stock_status(1), "low_stock")

    def test_five_is_low_stock(self):
        self.assertEqual(stock_status(5), "low_stock")

    def test_six_is_in_stock(self):
        self.assertEqual(stock_status(6), "in_stock")

    def test_large_quantity(self):
        self.assertEqual(stock_status(1000), "in_stock")


class ResolveProductIdentifierTest(unittest.TestCase):
    def test_legacy_ids_resolve_to_tank_cover_slug(self):
        for legacy_id in LEGACY_PRODUCT_IDS:
            with self.subTest(legacy_id=legacy_id):
                self.assertEqual(resolve_product_identifier(legacy_id), TANK_COVER_SLUG)

    def test_non_legacy_id_passes_through(self):
        self.assertEqual(resolve_product_identifier("alpine-guard-tank-cover"), "alpine-guard-tank-cover")

    def test_empty_string_passes_through(self):
        self.assertEqual(resolve_product_identifier(""), "")


class VariantValueTest(unittest.TestCase):
    def test_dict_access(self):
        self.assertEqual(_variant_value({"color": "Red"}, "color"), "Red")

    def test_dict_missing_key_returns_default(self):
        self.assertIsNone(_variant_value({"color": "Red"}, "size"))
        self.assertEqual(_variant_value({"color": "Red"}, "size", "M"), "M")

    def test_object_access(self):
        obj = SimpleNamespace(color="Blue")
        self.assertEqual(_variant_value(obj, "color"), "Blue")

    def test_object_missing_attr_returns_default(self):
        obj = SimpleNamespace(color="Blue")
        self.assertIsNone(_variant_value(obj, "size"))
        self.assertEqual(_variant_value(obj, "size", "L"), "L")


class SeedVariantImagesTest(unittest.TestCase):
    def test_first_variant_gets_full_gallery(self):
        variant_data = {"color": "Stealth Black"}
        images = _seed_variant_images(0, variant_data)
        self.assertEqual(len(images), min(5, len(VARIANT_GALLERY)))
        self.assertTrue(images[0]["is_thumbnail"])
        self.assertEqual(images[0]["sort_order"], 0)

    def test_second_variant_gets_offset_gallery(self):
        variant_data = {"color": "Trail Green"}
        images = _seed_variant_images(1, variant_data)
        self.assertGreater(len(images), 0)
        self.assertIn("Trail Green", images[0]["alt"])

    def test_image_alt_contains_color(self):
        variant_data = {"color": "Rally Red"}
        images = _seed_variant_images(0, variant_data)
        for image in images:
            self.assertIn("Rally Red", image["alt"])


def _make_db():
    db_dir = tempfile.mkdtemp()
    db_path = Path(db_dir) / "test_catalog.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    Session = sessionmaker(bind=engine)
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    return engine, Session


def _seed_test_product(db):
    """Seed a product with variants directly, setting all fields at construction time."""
    category = Category(
        name="Tank Covers",
        slug="tank-covers",
        description="Test category",
        image_url="/assets/test.png",
    )
    db.add(category)
    db.flush()

    product = Product(
        category_id=category.id,
        slug=TANK_COVER_SLUG,
        name="Terrain Core Tank Cover",
        description="Test tank cover",
        price=4999,
        is_active=True,
        discount_type="fixed",
        discount_value=1000,
        supported_bike_models='["Royal Enfield Himalayan 450"]',
    )
    db.add(product)
    db.flush()

    variants_data = [
        ("OTR-TC-H450-BLK", "Stealth Black", "#090909", "1000D Waterproof Fabric", "Himalayan 450", 4999, 50, True),
        ("OTR-TC-H450-ORG", "Black / Orange Stitch", "#2B1A0F", "1000D Waterproof Fabric", "Himalayan 450", 4999, 35, False),
        ("OTR-TC-H450-GRN", "Trail Green", "#313926", "Ballistic Waterproof Nylon", "Himalayan 450", 4999, 20, False),
    ]
    for sku, color, color_hex, material, size, price, stock, is_default in variants_data:
        variant = ProductVariant(
            product_id=product.id,
            sku=sku,
            color=color,
            color_hex=color_hex,
            material=material,
            size=size,
            price=price,
            stock=stock,
            is_default=is_default,
        )
        db.add(variant)

    db.flush()
    db.commit()
    return product


class ResolveCheckoutVariantTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.engine, Session = _make_db()
        cls.db = Session()
        cls.product = _seed_test_product(cls.db)
        cls.db.refresh(cls.product, attribute_names=["variants"])

    @classmethod
    def tearDownClass(cls):
        cls.db.close()
        cls.engine.dispose()

    def test_resolve_by_variant_id(self):
        variant = self.product.variants[0]
        result = resolve_checkout_variant(self.product, variant_id=variant.id)
        self.assertEqual(result.id, variant.id)

    def test_resolve_by_sku(self):
        result = resolve_checkout_variant(self.product, variant_sku="OTR-TC-H450-BLK")
        self.assertIsNotNone(result)
        self.assertEqual(result.sku, "OTR-TC-H450-BLK")

    def test_resolve_by_color(self):
        result = resolve_checkout_variant(self.product, color="trail green")
        self.assertIsNotNone(result)
        self.assertEqual(result.color, "Trail Green")

    def test_resolve_fallback_to_default(self):
        result = resolve_checkout_variant(self.product)
        self.assertIsNotNone(result)
        self.assertTrue(result.is_default)

    def test_invalid_variant_id_falls_back(self):
        result = resolve_checkout_variant(self.product, variant_id=999999)
        self.assertIsNotNone(result)

    def test_no_variants_returns_none(self):
        empty_product = SimpleNamespace(variants=[])
        self.assertIsNone(resolve_checkout_variant(empty_product))

    def test_variant_id_takes_priority_over_sku(self):
        first_variant = self.product.variants[0]
        result = resolve_checkout_variant(
            self.product,
            variant_id=first_variant.id,
            variant_sku="OTR-TC-H450-GRN",
        )
        self.assertEqual(result.id, first_variant.id)

    def test_sku_takes_priority_over_color(self):
        result = resolve_checkout_variant(
            self.product,
            variant_sku="OTR-TC-H450-GRN",
            color="Stealth Black",
        )
        self.assertEqual(result.sku, "OTR-TC-H450-GRN")


class GetCategoryMapTest(unittest.TestCase):
    def test_returns_dict_with_category_info(self):
        engine, Session = _make_db()
        db = Session()
        try:
            category = Category(
                name="Test Category",
                slug="test-cat",
                description="A test category",
            )
            db.add(category)
            db.commit()
            result = get_category_map(db)
            self.assertIsInstance(result, dict)
            self.assertGreater(len(result), 0)
            for key, value in result.items():
                self.assertIsInstance(key, int)
                self.assertIsInstance(value, tuple)
                self.assertEqual(len(value), 2)
                self.assertEqual(value[0], "Test Category")
                self.assertEqual(value[1], "test-cat")
        finally:
            db.close()
            engine.dispose()

    def test_empty_db_returns_empty_dict(self):
        engine, Session = _make_db()
        db = Session()
        try:
            result = get_category_map(db)
            self.assertEqual(result, {})
        finally:
            db.close()
            engine.dispose()


if __name__ == "__main__":
    unittest.main()
