import tempfile
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.api.orders import checkout
from backend.app.core.config import settings
from backend.app.models.entities import Base, Order, OrderItem
from backend.app.schemas.common import CheckoutIn
from backend.app.services.catalog import seed_single_tank_cover


class CheckoutWorkflowTest(unittest.TestCase):
    def test_single_tank_cover_checkout_creates_order_items(self):
        with tempfile.TemporaryDirectory() as db_dir:
            settings.razorpay_key_id = ""
            settings.razorpay_key_secret = ""
            db_path = Path(db_dir) / "checkout.db"
            engine = create_engine(f"sqlite:///{db_path}", connect_args={"check_same_thread": False})
            Session = sessionmaker(bind=engine)
            Base.metadata.create_all(bind=engine)

            db = Session()
            try:
                seed_single_tank_cover(db)
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
                    "items": [{"product_id": "terrain-core", "quantity": 2}]
                })

                result = checkout(payload, db)

                self.assertEqual(result["total"], 11797.64)
                self.assertTrue(result["razorpay_order_id"].startswith("order_dev_"))
                self.assertEqual(db.query(Order).count(), 1)
                self.assertEqual(db.query(OrderItem).count(), 1)
            finally:
                db.close()
                engine.dispose()


if __name__ == "__main__":
    unittest.main()
