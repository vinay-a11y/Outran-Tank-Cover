from pydantic import BaseModel, EmailStr, Field


class ProductImageOut(BaseModel):
    url: str
    alt: str = ""
    media_type: str = "image"
    sort_order: int = 0

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
    database_id: int
    name: str
    slug: str
    subtitle: str
    badge: str
    description: str
    price: float
    compareAt: float | None = None
    image: str
    gallery: list[str]
    images: list[ProductImageOut]
    colors: list[ProductVariantOut]
    color: str
    material: str
    category: str
    rating: float
    reviews: int
    specs: list[ProductSpecOut]
    features: list[ProductFeatureOut]
    is_active: bool


class CheckoutItem(BaseModel):
    product_id: str
    variant_id: int | None = None
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
