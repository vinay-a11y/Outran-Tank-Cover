"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const CANONICAL_PRODUCT_ID = "terrain-core-tank-cover";
const LEGACY_PRODUCT_IDS = new Set(["terrain-core", "tank-cover", "himalayan-tank-cover"]);

export type CartItem = {
  lineId: string;
  id: string;
  database_id?: number;
  variant_id: number;
  variant_sku: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number;
  image: string;
  color: string;
  color_hex: string;
  material: string;
  bike_model: string;
  qty: number;
  max_qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "lineId" | "qty"> & { qty?: number }) => void;
  removeItem: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
  discountTotal: () => number;
  shipping: () => number;
  total: () => number;
};

function buildLineId(productId: string, variantId: number, bikeModel: string) {
  return `${productId}:${variantId}:${bikeModel}`;
}

function normalizeLegacyItem(item: CartItem): CartItem {
  const productId = LEGACY_PRODUCT_IDS.has(item.id) ? CANONICAL_PRODUCT_ID : item.id;
  const variantId = item.variant_id ?? 0;
  const bikeModel = item.bike_model ?? "Royal Enfield Himalayan 450";
  return {
    ...item,
    lineId: item.lineId ?? buildLineId(productId, variantId, bikeModel),
    id: productId,
    variant_id: variantId,
    variant_sku: item.variant_sku ?? "",
    color_hex: item.color_hex ?? "#090909",
    bike_model: bikeModel,
    max_qty: item.max_qty ?? 99,
  };
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (incoming) =>
        set((state) => {
          const qty = incoming.qty ?? 1;
          const lineId = buildLineId(incoming.id, incoming.variant_id, incoming.bike_model);
          const cappedQty = Math.min(qty, incoming.max_qty);
          const existing = state.items.find((item) => item.lineId === lineId);
          if (existing) {
            const nextQty = Math.min(existing.qty + cappedQty, existing.max_qty);
            return {
              items: state.items.map((item) =>
                item.lineId === lineId ? { ...item, qty: nextQty } : item
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...incoming,
                lineId,
                qty: cappedQty,
              },
            ],
          };
        }),
      removeItem: (lineId) => set((state) => ({ items: state.items.filter((item) => item.lineId !== lineId) })),
      updateQty: (lineId, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.lineId === lineId
              ? { ...item, qty: Math.max(1, Math.min(qty, item.max_qty)) }
              : item
          ),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.qty, 0),
      discountTotal: () =>
        get().items.reduce((sum, item) => {
          const original = item.compareAt ?? item.price;
          return sum + Math.max(original - item.price, 0) * item.qty;
        }, 0),
      shipping: () => (get().subtotal() >= 999 || get().subtotal() === 0 ? 0 : 199),
      total: () => get().subtotal() + get().shipping(),
    }),
    {
      name: "outran-cart",
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as CartState;
        return {
          ...state,
          items: (state.items ?? []).map(normalizeLegacyItem),
        };
      },
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<CartState>;
        return {
          ...currentState,
          ...state,
          items: (state.items ?? currentState.items).map(normalizeLegacyItem),
        };
      },
    }
  )
);

export function buildCartItemFromProduct(
  product: {
    id: string;
    database_id?: number;
    name: string;
    subtitle: string;
    price: number;
    compareAt?: number | null;
    image: string;
    material: string;
    discounted_price?: number;
  },
  variant: {
    id: number;
    sku: string;
    color: string;
    color_hex: string;
    material: string;
    price: number;
    stock: number;
    images?: Array<{ url: string }>;
  },
  bikeModel: string
): Omit<CartItem, "lineId" | "qty"> {
  const unitPrice = product.discounted_price ?? variant.price ?? product.price;
  return {
    id: product.id,
    database_id: product.database_id,
    variant_id: variant.id,
    variant_sku: variant.sku,
    name: product.name,
    subtitle: product.subtitle,
    price: unitPrice,
    compareAt: product.compareAt ?? undefined,
    image: variant.images?.[0]?.url ?? product.image,
    color: variant.color,
    color_hex: variant.color_hex,
    material: variant.material || product.material,
    bike_model: bikeModel,
    max_qty: Math.max(variant.stock, 1),
  };
}
