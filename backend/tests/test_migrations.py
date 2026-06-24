import tempfile
import unittest
from pathlib import Path

from sqlalchemy import create_engine, inspect, text

from backend.app.db.migrate import run_migrations
from backend.app.models.entities import Base


def _make_engine():
    db_dir = tempfile.mkdtemp()
    db_path = Path(db_dir) / "migrate_test.db"
    engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
    return engine


class RunMigrationsTest(unittest.TestCase):
    def test_migrations_add_columns_to_existing_tables(self):
        engine = _make_engine()
        try:
            Base.metadata.create_all(bind=engine)
            run_migrations(engine)
            inspector = inspect(engine)
            product_cols = {col["name"] for col in inspector.get_columns("products")}
            self.assertIn("product_code", product_cols)
            self.assertIn("short_description", product_cols)
            self.assertIn("specifications", product_cols)
            self.assertIn("discount_type", product_cols)
            self.assertIn("supported_bike_models", product_cols)
            variant_cols = {col["name"] for col in inspector.get_columns("product_variants")}
            self.assertIn("color_hex", variant_cols)
            self.assertIn("is_default", variant_cols)
            category_cols = {col["name"] for col in inspector.get_columns("categories")}
            self.assertIn("description", category_cols)
            self.assertIn("image_url", category_cols)
        finally:
            engine.dispose()

    def test_migrations_are_idempotent(self):
        engine = _make_engine()
        try:
            Base.metadata.create_all(bind=engine)
            run_migrations(engine)
            run_migrations(engine)
            inspector = inspect(engine)
            product_cols = {col["name"] for col in inspector.get_columns("products")}
            self.assertIn("product_code", product_cols)
        finally:
            engine.dispose()

    def test_migrations_skip_missing_tables(self):
        engine = _make_engine()
        try:
            run_migrations(engine)
        finally:
            engine.dispose()

    def test_banner_columns_added(self):
        engine = _make_engine()
        try:
            Base.metadata.create_all(bind=engine)
            run_migrations(engine)
            inspector = inspect(engine)
            banner_cols = {col["name"] for col in inspector.get_columns("banners")}
            self.assertIn("subtitle", banner_cols)
            self.assertIn("section", banner_cols)
            self.assertIn("sort_order", banner_cols)
        finally:
            engine.dispose()

    def test_order_columns_added(self):
        engine = _make_engine()
        try:
            Base.metadata.create_all(bind=engine)
            run_migrations(engine)
            inspector = inspect(engine)
            order_cols = {col["name"] for col in inspector.get_columns("orders")}
            self.assertIn("discount", order_cols)
            self.assertIn("user_id", order_cols)
            order_item_cols = {col["name"] for col in inspector.get_columns("order_items")}
            self.assertIn("color", order_item_cols)
            self.assertIn("bike_model", order_item_cols)
            self.assertIn("variant_sku", order_item_cols)
        finally:
            engine.dispose()

    def test_image_columns_added(self):
        engine = _make_engine()
        try:
            Base.metadata.create_all(bind=engine)
            run_migrations(engine)
            inspector = inspect(engine)
            image_cols = {col["name"] for col in inspector.get_columns("product_images")}
            self.assertIn("is_thumbnail", image_cols)
            self.assertIn("variant_id", image_cols)
        finally:
            engine.dispose()


if __name__ == "__main__":
    unittest.main()
