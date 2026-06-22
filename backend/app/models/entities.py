import json
import uuid
from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.db.session import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def new_uuid() -> str:
    return str(uuid.uuid4())


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    google_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(30), unique=True, nullable=True, index=True)
    profile_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_phone_verified: Mapped[bool] = mapped_column(Boolean, default=False)


class CartItem(Base, TimestampMixin):
    __tablename__ = "cart_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    product_id: Mapped[str] = mapped_column(String(200))
    variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.id"), nullable=True)
    variant_sku: Mapped[str | None] = mapped_column(String(120), nullable=True)
    bike_model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    __table_args__ = (UniqueConstraint("user_id", "product_id", "variant_sku", "bike_model"),)


class UserAddress(Base, TimestampMixin):
    __tablename__ = "user_addresses"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    full_name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(160))
    address: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(120))
    state: Mapped[str] = mapped_column(String(120))
    pincode: Mapped[str] = mapped_column(String(20))


class WishlistItem(Base, TimestampMixin):
    __tablename__ = "wishlist_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    __table_args__ = (UniqueConstraint("user_id", "product_id"),)


class Category(Base, TimestampMixin):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    subcategories: Mapped[list["Subcategory"]] = relationship(back_populates="category")


class Subcategory(Base, TimestampMixin):
    __tablename__ = "subcategories"
    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(140), index=True)
    category: Mapped[Category] = relationship(back_populates="subcategories")
    __table_args__ = (UniqueConstraint("category_id", "slug"),)


class BikeModel(Base, TimestampMixin):
    __tablename__ = "bike_models"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    brand: Mapped[str] = mapped_column(String(120), default="Royal Enfield")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Product(Base, TimestampMixin):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))
    subcategory_id: Mapped[int | None] = mapped_column(ForeignKey("subcategories.id"), nullable=True)
    product_code: Mapped[str | None] = mapped_column(String(120), unique=True, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    short_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    full_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    specifications: Mapped[str | None] = mapped_column(Text, nullable=True)
    installation_guide: Mapped[str | None] = mapped_column(Text, nullable=True)
    hsn_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    sku: Mapped[str | None] = mapped_column(String(120), unique=True, nullable=True, index=True)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    compare_at_price: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    discount_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    discount_value: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    inventory_tracking: Mapped[bool] = mapped_column(Boolean, default=True)
    variant_stock_tracking: Mapped[bool] = mapped_column(Boolean, default=True)
    supported_bike_models: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    images: Mapped[list["ProductImage"]] = relationship(cascade="all, delete-orphan")
    variants: Mapped[list["ProductVariant"]] = relationship(cascade="all, delete-orphan")

    @property
    def bike_models_list(self) -> list[str]:
        if not self.supported_bike_models:
            return []
        try:
            parsed = json.loads(self.supported_bike_models)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []

    @property
    def specifications_list(self) -> list[dict[str, str]]:
        if not self.specifications:
            return []
        try:
            parsed = json.loads(self.specifications)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []


class ProductImage(Base, TimestampMixin):
    __tablename__ = "product_images"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.id"), nullable=True)
    url: Mapped[str] = mapped_column(String(500))
    alt: Mapped[str] = mapped_column(String(180), default="")
    media_type: Mapped[str] = mapped_column(String(40), default="image")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_thumbnail: Mapped[bool] = mapped_column(Boolean, default=False)


class ProductVariant(Base, TimestampMixin):
    __tablename__ = "product_variants"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    sku: Mapped[str] = mapped_column(String(120), unique=True)
    color: Mapped[str] = mapped_column(String(80))
    color_hex: Mapped[str] = mapped_column(String(20), default="#090909")
    material: Mapped[str] = mapped_column(String(120))
    size: Mapped[str] = mapped_column(String(80))
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    images: Mapped[list["VariantImage"]] = relationship(cascade="all, delete-orphan")


class VariantImage(Base, TimestampMixin):
    __tablename__ = "variant_images"
    id: Mapped[int] = mapped_column(primary_key=True)
    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id"))
    url: Mapped[str] = mapped_column(String(500))
    alt: Mapped[str] = mapped_column(String(180), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_thumbnail: Mapped[bool] = mapped_column(Boolean, default=False)


class ProductMaterial(Base, TimestampMixin):
    __tablename__ = "product_materials"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True)


class ProductColor(Base, TimestampMixin):
    __tablename__ = "product_colors"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    hex: Mapped[str] = mapped_column(String(20))


class ProductSize(Base, TimestampMixin):
    __tablename__ = "product_sizes"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)


class Inventory(Base, TimestampMixin):
    __tablename__ = "inventory"
    id: Mapped[int] = mapped_column(primary_key=True)
    variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id"), unique=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0)
    low_stock_threshold: Mapped[int] = mapped_column(Integer, default=5)


class ShippingAddress(Base, TimestampMixin):
    __tablename__ = "shipping_addresses"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str] = mapped_column(String(30))
    email: Mapped[str] = mapped_column(String(160))
    address: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(120))
    state: Mapped[str] = mapped_column(String(120))
    pincode: Mapped[str] = mapped_column(String(20))


class Order(Base, TimestampMixin):
    __tablename__ = "orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    shipping_address_id: Mapped[int] = mapped_column(ForeignKey("shipping_addresses.id"))
    status: Mapped[str] = mapped_column(String(40), default="processing")
    payment_status: Mapped[str] = mapped_column(String(40), default="pending")
    payment_method: Mapped[str] = mapped_column(String(40), default="razorpay")
    razorpay_order_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(120), nullable=True)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    tax: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    shipping: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total: Mapped[float] = mapped_column(Numeric(10, 2))
    items: Mapped[list["OrderItem"]] = relationship(cascade="all, delete-orphan")
    shipping_address: Mapped["ShippingAddress"] = relationship()


class OrderItem(Base, TimestampMixin):
    __tablename__ = "order_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    variant_id: Mapped[int | None] = mapped_column(ForeignKey("product_variants.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(180))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))
    color: Mapped[str | None] = mapped_column(String(80), nullable=True)
    bike_model: Mapped[str | None] = mapped_column(String(120), nullable=True)
    variant_sku: Mapped[str | None] = mapped_column(String(120), nullable=True)


class Coupon(Base, TimestampMixin):
    __tablename__ = "coupons"
    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(80), unique=True)
    discount_type: Mapped[str] = mapped_column(String(30), default="fixed")
    value: Mapped[float] = mapped_column(Numeric(10, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class Setting(Base, TimestampMixin):
    __tablename__ = "settings"
    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(120), unique=True)
    value: Mapped[str] = mapped_column(Text)


class Review(Base, TimestampMixin):
    __tablename__ = "reviews"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    name: Mapped[str] = mapped_column(String(140))
    rating: Mapped[int] = mapped_column(Integer)
    body: Mapped[str] = mapped_column(Text)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)


class Banner(Base, TimestampMixin):
    __tablename__ = "banners"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(180))
    subtitle: Mapped[str | None] = mapped_column(String(300), nullable=True)
    image_url: Mapped[str] = mapped_column(String(500))
    href: Mapped[str | None] = mapped_column(String(300), nullable=True)
    section: Mapped[str] = mapped_column(String(80), default="hero")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class JournalPost(Base, TimestampMixin):
    __tablename__ = "journal_posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(220))
    slug: Mapped[str] = mapped_column(String(240), unique=True, index=True)
    excerpt: Mapped[str] = mapped_column(Text)
    body: Mapped[str] = mapped_column(Text)
    hero_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)


class CrewSignup(Base, TimestampMixin):
    __tablename__ = "crew_signups"
    id: Mapped[int] = mapped_column(primary_key=True)
    phone: Mapped[str] = mapped_column(String(30), unique=True, index=True)
