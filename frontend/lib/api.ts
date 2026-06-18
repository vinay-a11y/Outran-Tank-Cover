import type { CartItem } from "@/store/cart";
import { products as fallbackProducts, tankCoverProduct } from "@/lib/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";
const FETCH_TIMEOUT_MS = 5000;

async function fetchWithTimeout(input: string, init?: RequestInit) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<Response>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Request timed out")), FETCH_TIMEOUT_MS);
  });
  try {
    return await Promise.race([fetch(input, init), timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export type VariantImage = {
  url: string;
  alt?: string;
  sort_order?: number;
  is_thumbnail?: boolean;
};

export type ProductVariant = {
  id: number;
  sku: string;
  color: string;
  material: string;
  size: string;
  price: number;
  stock: number;
  color_hex: string;
  is_default: boolean;
  stock_status: string;
  images: VariantImage[];
  name?: string;
  value?: string;
};

export type StoreProduct = {
  id: string;
  product_id: string;
  database_id: number;
  slug: string;
  name: string;
  subtitle: string;
  short_description: string;
  description: string;
  full_description: string;
  installation_guide: string;
  price: number;
  compareAt?: number | null;
  discounted_price: number;
  total_price: number;
  discount_type?: string | null;
  discount_value?: number | null;
  badge: string;
  rating: number;
  reviews: number;
  image: string;
  thumbnail: string;
  gallery: string[];
  colors: ProductVariant[];
  variants: ProductVariant[];
  color: string;
  material: string;
  category: string;
  category_slug: string;
  specs: Array<{ label: string; value: string }>;
  features: Array<{ title: string; copy: string; body?: string }>;
  supported_bike_models: string[];
  stock_quantity: number;
  stock_status: string;
  hsn_code?: string | null;
  sku?: string | null;
  inventory_tracking: boolean;
  variant_stock_tracking: boolean;
  enable_disable_status: boolean;
  featured_product: boolean;
  is_active: boolean;
};

export type ProductFilters = {
  categories: Array<{ name: string; slug: string }>;
  bike_models: string[];
  colors: string[];
  stock_statuses: string[];
  sort_options: Array<{ value: string; label: string }>;
};

export type HomepageData = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    image: string;
    cta_href: string;
    cta_label: string;
  };
  featured_products: StoreProduct[];
  latest_products: StoreProduct[];
  bike_categories: Array<{ name: string; slug: string; description?: string; image_url?: string }>;
  compatibility_highlights: {
    title: string;
    copy: string;
    bike_models: Array<{ name: string; slug: string }>;
  };
  offers: Array<{
    code: string;
    title: string;
    copy: string;
    discount_type: string;
    discount_value: number;
    cta_href: string;
  }>;
  testimonials: Array<{ name: string; rating: number; body: string }>;
};

export type CheckoutAddress = {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type CheckoutResponse = {
  order_id: number;
  order_number: string;
  razorpay_order_id: string | null;
  razorpay_key_id?: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
};

export type OrderData = {
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    color?: string | null;
    bike_model?: string | null;
    variant_sku?: string | null;
    image?: string | null;
  }>;
  created_at?: string | null;
};

export type RazorpayVerifyPayload = {
  order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type ProductQuery = {
  category?: string;
  search?: string;
  bike_model?: string;
  color?: string;
  stock_status?: string;
  sort?: string;
  limit?: number;
  offset?: number;
};

function normalizeVariant(variant: ProductVariant): ProductVariant {
  return {
    ...variant,
    name: variant.color,
    value: variant.color_hex,
  };
}

export function normalizeProduct(product: StoreProduct): StoreProduct {
  const variants = (product.variants ?? product.colors ?? []).map(normalizeVariant);
  const defaultVariant = variants.find((variant) => variant.is_default) ?? variants[0];
  const gallery = defaultVariant?.images?.length
    ? defaultVariant.images.map((image) => image.url)
    : product.gallery?.length
      ? product.gallery
      : [product.image];

  return {
    ...product,
    id: product.slug ?? product.id,
    slug: product.slug ?? product.id,
    compareAt: product.compareAt ?? undefined,
    discounted_price: product.discounted_price ?? product.price,
    total_price: product.total_price ?? product.discounted_price ?? product.price,
    gallery,
    colors: variants,
    variants,
    supported_bike_models: product.supported_bike_models ?? [],
    specs: product.specs ?? [],
    features: product.features?.map((feature) => ({
      title: feature.title,
      copy: feature.copy ?? feature.body ?? "",
    })) ?? [],
    image: defaultVariant?.images?.[0]?.url ?? product.image,
    color: defaultVariant?.color ?? product.color ?? "Stealth Black",
    material: defaultVariant?.material ?? product.material ?? "",
  };
}

function buildQuery(params?: ProductQuery): string {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getProducts(params?: ProductQuery): Promise<StoreProduct[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products${buildQuery(params)}`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Products request failed");
    const products = (await response.json()) as StoreProduct[];
    return products.map(normalizeProduct);
  } catch {
    return fallbackProducts.map((product) => normalizeProduct(product as unknown as StoreProduct));
  }
}

export async function getFeaturedProducts(): Promise<StoreProduct[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/featured`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Featured products request failed");
    return ((await response.json()) as StoreProduct[]).map(normalizeProduct);
  } catch {
    return fallbackProducts.map((product) => normalizeProduct(product as unknown as StoreProduct));
  }
}

export async function getProduct(slug: string): Promise<StoreProduct> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/${slug}`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Product request failed");
    return normalizeProduct((await response.json()) as StoreProduct);
  } catch {
    return normalizeProduct(tankCoverProduct as unknown as StoreProduct);
  }
}

export async function getProductFilters(): Promise<ProductFilters> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/filters`, { next: { revalidate: 300 } });
    if (!response.ok) throw new Error("Filters request failed");
    return response.json();
  } catch {
    return {
      categories: [{ name: "Tank Covers", slug: "tank-covers" }],
      bike_models: ["Royal Enfield Himalayan 450"],
      colors: ["Stealth Black", "Black / Orange Stitch", "Trail Green"],
      stock_statuses: ["in_stock", "low_stock", "out_of_stock"],
      sort_options: [
        { value: "featured", label: "Featured" },
        { value: "newest", label: "Newest" },
        { value: "price_asc", label: "Price: Low to High" },
        { value: "price_desc", label: "Price: High to Low" },
      ],
    };
  }
}

export async function getHomepage(): Promise<HomepageData | null> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/homepage`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Homepage request failed");
    const data = (await response.json()) as HomepageData;
    return {
      ...data,
      featured_products: data.featured_products.map(normalizeProduct),
      latest_products: data.latest_products.map(normalizeProduct),
    };
  } catch {
    return null;
  }
}

export async function getOrder(orderNumber: string): Promise<OrderData | null> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${orderNumber}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function createCheckout(address: CheckoutAddress, items: CartItem[]): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address,
      payment_method: "razorpay",
      items: items.map((item) => ({
        product_id: item.id,
        variant_id: item.variant_id,
        bike_model: item.bike_model,
        quantity: item.qty,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Checkout failed" }));
    throw new Error(error.detail ?? "Checkout failed");
  }

  return response.json();
}

export async function verifyPayment(payload: RazorpayVerifyPayload): Promise<{ status: "paid" }> {
  const response = await fetch(`${API_BASE_URL}/orders/verify-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Payment verification failed" }));
    throw new Error(error.detail ?? "Payment verification failed");
  }

  return response.json();
}

export function getVariantGallery(variant?: ProductVariant): string[] {
  if (!variant?.images?.length) return [];
  return variant.images.map((image) => image.url);
}

export function getDefaultVariant(product: StoreProduct): ProductVariant | undefined {
  return product.variants.find((variant) => variant.is_default) ?? product.variants[0];
}
