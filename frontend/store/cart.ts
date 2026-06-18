"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tankCoverProduct } from "@/lib/data";

const CANONICAL_PRODUCT_ID = "terrain-core-tank-cover";
const LEGACY_PRODUCT_IDS = new Set(["terrain-core", "tank-cover", "himalayan-tank-cover"]);

export type CartItem = {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  color: string;
  material: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (id: string, product?: Omit<CartItem, "qty">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
};

const starterItems: CartItem[] = [];

function normalizeCartItem(item: CartItem): CartItem {
  if (!LEGACY_PRODUCT_IDS.has(item.id)) {
    return item;
  }
  return {
    ...item,
    id: CANONICAL_PRODUCT_ID,
    name: tankCoverProduct.name,
    subtitle: tankCoverProduct.subtitle,
    image: tankCoverProduct.image,
    color: item.color || tankCoverProduct.color,
    material: item.material || tankCoverProduct.material
  };
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: starterItems,
      addItem: (id, incomingProduct) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          if (existing) {
            return { items: state.items.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)) };
          }
          const product = incomingProduct ?? tankCoverProduct;
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                name: product.name,
                subtitle: product.subtitle,
                price: product.price,
                image: product.image,
                color: product.color,
                material: product.material,
                qty: 1
              }
            ]
          };
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, qty: Math.max(1, qty) } : item))
        })),
      clear: () => set({ items: [] })
    }),
    {
      name: "outran-cart",
      version: 2,
      migrate: (persistedState) => {
        const state = persistedState as CartState;
        return {
          ...state,
          items: (state.items ?? []).map(normalizeCartItem)
        };
      },
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<CartState>;
        return {
          ...currentState,
          ...state,
          items: (state.items ?? currentState.items).map(normalizeCartItem)
        };
      }
    }
  )
);
