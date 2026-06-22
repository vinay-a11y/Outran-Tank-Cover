import tempfile
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, selectinload

from backend.app.api.products import get_product, list_products, product_availability
from backend.app.db.migrate import run_migrations
from backend.app.models.entities import Base, Product, ProductVariant
from backend.app.services.catalog import TANK_COVER_SLUG, seed_catalog


class ProductsApiTest(unittest.TestCase):
    def test_product_detail_is_rich_frontend_payload(self):
        with tempfile.TemporaryDirectory() as db_dir:
            db_path = Path(db_dir) / "products.db"
            engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
            Session = sessionmaker(bind=engine)
            Base.metadata.create_all(bind=engine)
            run_migrations(engine)
            db = Session()
            try:
                seed_catalog(db)
                payload = get_product(TANK_COVER_SLUG, db)
                availability = product_availability(TANK_COVER_SLUG, db)
                all_products = list_products(limit=100, offset=0, db=db)

                self.assertEqual(payload["id"], TANK_COVER_SLUG)
                self.assertEqual(len(all_products), 3)
                self.assertEqual(payload["product_id"], "OTR-TC-H450")
                self.assertGreaterEqual(len(payload["gallery"]), 4)
                self.assertEqual(len(payload["colors"]), 3)
                self.assertEqual(len(payload["specs"]), 6)
                self.assertEqual(len(payload["features"]), 6)
                self.assertIn("Royal Enfield Himalayan 450", payload["supported_bike_models"])
                self.assertEqual(payload["discounted_price"], 3999)
                self.assertTrue(availability["in_stock"])
                default_variant = next(variant for variant in payload["variants"] if variant["is_default"])
                self.assertGreaterEqual(len(default_variant["images"]), 5)
            finally:
                db.close()
                engine.dispose()


if __name__ == "__main__":
    unittest.main()
