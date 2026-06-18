import tempfile
import unittest
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker, selectinload

from backend.app.api.products import get_product, product_availability
from backend.app.models.entities import Base, Product
from backend.app.services.catalog import TANK_COVER_SLUG, seed_single_tank_cover


class ProductsApiTest(unittest.TestCase):
    def test_product_detail_is_rich_frontend_payload(self):
        with tempfile.TemporaryDirectory() as db_dir:
            db_path = Path(db_dir) / "products.db"
            engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
            Session = sessionmaker(bind=engine)
            Base.metadata.create_all(bind=engine)
            db = Session()
            try:
                seed_single_tank_cover(db)
                payload = get_product(TANK_COVER_SLUG, db)
                availability = product_availability(TANK_COVER_SLUG, db)

                self.assertEqual(payload["id"], TANK_COVER_SLUG)
                self.assertEqual(len(payload["gallery"]), 4)
                self.assertEqual(len(payload["colors"]), 3)
                self.assertEqual(len(payload["specs"]), 6)
                self.assertEqual(len(payload["features"]), 6)
                self.assertTrue(availability["in_stock"])
            finally:
                db.close()
                engine.dispose()


if __name__ == "__main__":
    unittest.main()
