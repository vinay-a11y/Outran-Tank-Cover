"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CartItem } from "@/store/cart";
import { useCart } from "@/store/cart";

export function AddToCartActions({ product }: { product: Omit<CartItem, "qty"> }) {
  const addItem = useCart((state) => state.addItem);

  return (
    <div className="mt-5 grid gap-3">
      <Link onClick={() => addItem(product.id, product)} href="/cart" className="flex items-center justify-center gap-3 bg-accent-primary px-6 py-3.5 text-sm font-black uppercase text-bg-primary">
        Add to cart <ArrowRight size={17} />
      </Link>
      <Link onClick={() => addItem(product.id, product)} href="/checkout" className="flex items-center justify-center border border-accent-primary/60 px-6 py-3.5 text-sm font-black uppercase">
        Buy it now
      </Link>
    </div>
  );
}
