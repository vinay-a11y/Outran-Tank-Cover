import type { CartItem } from "@/store/cart";
import { products as fallbackProducts, tankCoverProduct } from "@/lib/data";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export type StoreProduct = typeof tankCoverProduct & {
  database_id?: number;
  specs?: Array<{ label: string; value: string }>;
  features?: Array<{ title: string; copy: string; body?: string }>;
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
  total: number;
};

export type RazorpayVerifyPayload = {
  order_id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

function normalizeProduct(product: StoreProduct): StoreProduct {
  const rawColors = (product.colors ?? []) as Array<{
    name?: string;
    value?: string;
    sku: string;
    color?: string;
    color_hex?: string;
  }>;

  return {
    ...product,
    id: product.slug,
    compareAt: product.compareAt ?? undefined,
    gallery: product.gallery?.length ? product.gallery : [product.image],
    colors: rawColors.length
      ? rawColors.map((color) => ({
          name: color.name ?? color.color ?? "Stealth Black",
          value: color.value ?? color.color_hex ?? "#090909",
          sku: color.sku
        }))
      : tankCoverProduct.colors,
    features: product.features?.map((feature) => ({
      title: feature.title,
      copy: feature.copy ?? feature.body ?? ""
    }))
  };
}

export async function getProducts(): Promise<StoreProduct[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Products request failed");
    const products = (await response.json()) as StoreProduct[];
    return products.map(normalizeProduct);
  } catch {
    return fallbackProducts;
  }
}

export async function getProduct(slug: string): Promise<StoreProduct> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${slug}`, { next: { revalidate: 60 } });
    if (!response.ok) throw new Error("Product request failed");
    return normalizeProduct((await response.json()) as StoreProduct);
  } catch {
    return tankCoverProduct;
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
        quantity: item.qty
      }))
    })
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
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Payment verification failed" }));
    throw new Error(error.detail ?? "Payment verification failed");
  }

  return response.json();
}
