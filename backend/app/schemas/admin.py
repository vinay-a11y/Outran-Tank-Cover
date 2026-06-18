from pydantic import BaseModel, Field


class VariantImageIn(BaseModel):
    url: str
    alt: str = ""
    sort_order: int = 0
    is_thumbnail: bool = False


class ProductVariantIn(BaseModel):
    sku: str
    color: str
    color_hex: str = "#090909"
    material: str
    size: str
    price: float
    stock: int = 0
    is_default: bool = False
    images: list[VariantImageIn] = []


class ProductImageIn(BaseModel):
    url: str
    alt: str = ""
    sort_order: int = 0
    is_thumbnail: bool = False


class ProductCreateIn(BaseModel):
    name: str
    slug: str
    category_slug: str = "tank-covers"
    short_description: str = ""
    full_description: str = ""
    description: str = ""
    specifications: list[dict[str, str]] = []
    installation_guide: str = ""
    hsn_code: str | None = None
    sku: str | None = None
    product_code: str | None = None
    price: float
    compare_at_price: float | None = None
    discount_type: str | None = None
    discount_value: float | None = None
    inventory_tracking: bool = True
    variant_stock_tracking: bool = True
    supported_bike_models: list[str] = []
    is_active: bool = True
    is_featured: bool = False
    images: list[ProductImageIn] = []
    variants: list[ProductVariantIn] = Field(default_factory=list)


class ProductUpdateIn(BaseModel):
    name: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    description: str | None = None
    specifications: list[dict[str, str]] | None = None
    installation_guide: str | None = None
    hsn_code: str | None = None
    sku: str | None = None
    product_code: str | None = None
    price: float | None = None
    compare_at_price: float | None = None
    discount_type: str | None = None
    discount_value: float | None = None
    inventory_tracking: bool | None = None
    variant_stock_tracking: bool | None = None
    supported_bike_models: list[str] | None = None
    is_active: bool | None = None
    is_featured: bool | None = None
    images: list[ProductImageIn] | None = None
    variants: list[ProductVariantIn] | None = None
