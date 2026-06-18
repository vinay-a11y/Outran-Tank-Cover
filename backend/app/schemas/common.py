from pydantic import BaseModel, EmailStr, Field


class ProductImageOut(BaseModel):
    url: str
    alt: str = ""
    media_type: str = "image"
    sort_order: int = 0
    is_thumbnail: bool = False

    class Config:
        from_attributes = True


class VariantImageOut(BaseModel):
    url: str
    alt: str = ""
    sort_order: int = 0
    is_thumbnail: bool = False

    class Config:
        from_attributes = True


class ProductVariantOut(BaseModel):
    id: int
    sku: str
    color: str
    material: str
    size: str
    price: float
    stock: int
    color_hex: str = "#090909"
    is_default: bool = False
    stock_status: str = "in_stock"
    images: list[VariantImageOut] = []

    class Config:
        from_attributes = True


class ProductSpecOut(BaseModel):
    label: str
    value: str


class ProductFeatureOut(BaseModel):
    title: str
    body: str


class ProductOut(BaseModel):
    id: str
    product_id: str
    database_id: int
    name: str
    slug: str
    subtitle: str
    badge: str
    short_description: str
    description: str
    full_description: str
    installation_guide: str
    hsn_code: str | None = None
    sku: str | None = None
    price: float
    compareAt: float | None = None
    discount_type: str | None = None
    discount_value: float | None = None
    discounted_price: float
    total_price: float
    image: str
    thumbnail: str
    gallery: list[str]
    images: list[ProductImageOut]
    colors: list[ProductVariantOut]
    variants: list[ProductVariantOut]
    color: str
    material: str
    category: str
    category_slug: str
    rating: float
    reviews: int
    specs: list[ProductSpecOut]
    features: list[ProductFeatureOut]
    supported_bike_models: list[str]
    stock_quantity: int
    stock_status: str
    inventory_tracking: bool
    variant_stock_tracking: bool
    enable_disable_status: bool
    featured_product: bool
    is_active: bool


class CheckoutItem(BaseModel):
    product_id: str
    variant_id: int | None = None
    bike_model: str | None = None
    quantity: int = Field(gt=0)


class ShippingAddressIn(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    address: str
    city: str
    state: str
    pincode: str


class CheckoutIn(BaseModel):
    address: ShippingAddressIn
    items: list[CheckoutItem]
    coupon_code: str | None = None
    payment_method: str = "razorpay"


class RazorpayVerifyIn(BaseModel):
    order_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class OrderItemOut(BaseModel):
    name: str
    quantity: int
    unit_price: float
    line_total: float
    color: str | None = None
    bike_model: str | None = None
    variant_sku: str | None = None
    image: str | None = None


class OrderOut(BaseModel):
    order_number: str
    status: str
    payment_status: str
    payment_method: str
    subtotal: float
    discount: float
    shipping: float
    tax: float
    total: float
    items: list[OrderItemOut]
    created_at: str | None = None
