import axios from "axios";
import type { CartItem } from "@/store/cart";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const detail = error.response?.data?.detail;
      if (typeof detail === "string") {
        return Promise.reject(new Error(detail));
      }
    }
    return Promise.reject(error);
  }
);

export type UserAccount = {
  id: string;
  email: string;
  google_id: string;
  name: string | null;
  phone_number: string | null;
  profile_image: string | null;
  is_phone_verified: boolean;
  created_at: string | null;
  updated_at: string | null;
  profile_complete: boolean;
};

export type OrderCard = {
  id: number;
  order_number: string;
  product_image: string | null;
  product_name: string;
  variant: string | null;
  quantity: number;
  amount: number;
  payment_status: string;
  order_status: string;
  created_at: string | null;
};

export type WishlistItem = {
  id: number;
  product_id: number;
};

export type SavedAddress = {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export async function googleLogin(credential: string): Promise<UserAccount> {
  const response = await apiClient.post<{ user: UserAccount }>("/auth/google", { credential });
  return response.data.user;
}

export async function getMe(): Promise<UserAccount | null> {
  try {
    const response = await apiClient.get<{ user: UserAccount }>("/auth/me");
    return response.data.user;
  } catch {
    return null;
  }
}

export async function logoutAccount(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function updateProfile(payload: { name: string; phone_number: string }): Promise<UserAccount> {
  const response = await apiClient.patch<{ user: UserAccount }>("/profile", payload);
  return response.data.user;
}

function cartPayload(items: CartItem[]) {
  return {
    items: items.map((item) => ({
      product_id: item.id,
      variant_id: item.variant_id > 0 ? item.variant_id : undefined,
      variant_sku: item.variant_sku,
      bike_model: item.bike_model,
      quantity: item.qty,
    })),
  };
}

export async function mergeCart(items: CartItem[]): Promise<CartItem[]> {
  const response = await apiClient.post<{ items: CartItem[] }>("/cart/merge", cartPayload(items));
  return response.data.items;
}

export async function getCart(): Promise<CartItem[]> {
  const response = await apiClient.get<{ items: CartItem[] }>("/cart");
  return response.data.items;
}

export async function replaceCart(items: CartItem[]): Promise<CartItem[]> {
  const response = await apiClient.put<{ items: CartItem[] }>("/cart", cartPayload(items));
  return response.data.items;
}

export async function getAccountOrders(): Promise<OrderCard[]> {
  const response = await apiClient.get<{ items: OrderCard[] }>("/orders");
  return response.data.items;
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const response = await apiClient.get<{ items: WishlistItem[] }>("/wishlist");
  return response.data.items;
}

export async function addWishlistItem(productId: number): Promise<WishlistItem> {
  const response = await apiClient.post<WishlistItem>("/wishlist", { product_id: productId });
  return response.data;
}

export async function removeWishlistItem(productId: number): Promise<void> {
  await apiClient.delete(`/wishlist/${productId}`);
}

export async function getAddresses(): Promise<SavedAddress[]> {
  const response = await apiClient.get<{ items: SavedAddress[] }>("/address");
  return response.data.items;
}
