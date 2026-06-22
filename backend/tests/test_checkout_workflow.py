import tempfile
import unittest
from pathlib import Path

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

from backend.app.api.orders import checkout
from backend.app.core.config import settings
from backend.app.db.migrate import run_migrations
from backend.app.models.entities import Base, Product
from backend.app.schemas.common import CheckoutIn
from backend.app.services.catalog import seed_catalog


class CheckoutWorkflowTest(unittest.TestCase):
    def test_checkout_resolves_variant_by_sku_after_reseed(self):
        with tempfile.TemporaryDirectory() as db_dir:
            settings.razorpay_key_id = ""
            settings.razorpay_key_secret = ""
            db_path = Path(db_dir) / "checkout.db"
            engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
            Session = sessionmaker(bind=engine)
            Base.metadata.create_all(bind=engine)
            run_migrations(engine)

            db = Session()
            try:
                seed_catalog(db)
                product = db.scalar(select(Product).where(Product.slug == "terrain-core-tank-cover"))
                payload = CheckoutIn.model_validate({
                    "payment_method": "razorpay",
                    "address": {
                        "full_name": "Rohit Sharma",
                        "phone": "+91 98765 43210",
                        "email": "rohit@example.com",
                        "address": "123 Mountain View Road",
                        "city": "Bangalore",
                        "state": "Karnataka",
                        "pincode": "560034"
                    },
                    "items": [{
                        "product_id": "terrain-core-tank-cover",
                        "variant_id": 99999,
                        "variant_sku": "OTR-TC-H450-BLK",
                        "color": "Stealth Black",
                        "bike_model": "Royal Enfield Himalayan 450",
                        "quantity": 1
                    }]
                })

                result = checkout(payload, db)
                self.assertEqual(result["total"], 3999)
                self.assertTrue(result["razorpay_order_id"].startswith("order_dev_"))
                self.assertIsNotNone(product)
            finally:
                db.close()
                engine.dispose()


if __name__ == "__main__":
    unittest.main()
