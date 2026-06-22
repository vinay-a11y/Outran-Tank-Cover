"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { StoreProduct } from "@/lib/api";
import { getDefaultVariant } from "@/lib/api";
import { addWishlistItem, getWishlist, removeWishlistItem } from "@/lib/auth-api";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { buildCartItemFromProduct, useCart } from "@/store/cart";

export function ProductCard({ product, selectedBike = "" }: { product: StoreProduct; selectedBike?: string }) {
  const addItem = useCart((state) => state.addItem);
  const [selectedVariant, setSelectedVariant] = useState(() => getDefaultVariant(product));
  const [toast, setToast] = useState("");
  const { user, openLogin } = useAuth();
  const queryClient = useQueryClient();
  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: Boolean(user),
  });
  const variant = selectedVariant ?? getDefaultVariant(product);
  const price = product.discounted_price ?? product.total_price ?? product.price;
  const bikeModel = product.supported_bike_models.includes(selectedBike)
    ? selectedBike
    : product.supported_bike_models[0] ?? "Royal Enfield Himalayan 450";
  const wished = wishlist.some((item) => item.product_id === product.database_id);
  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (wished) {
        await removeWishlistItem(product.database_id);
      } else {
        await addWishlistItem(product.database_id);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return (
    <motion.article whileHover={{ y: -3 }} className="group overflow-hidden rounded-sm border border-border-primary bg-surface-card/70">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image src={variant?.images?.[0]?.url || product.thumbnail || product.image} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 20vw" />
        {product.stock_status === "out_of_stock" && (
          <span className="absolute right-3 top-3 bg-black/70 px-2 py-1 text-[10px] font-black uppercase text-text-secondary">Sold out</span>
        )}
      </Link>
      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-[1.3rem] uppercase leading-tight">{product.name}</h3>
          <p className="font-display text-sm uppercase text-text-primary/80">{product.subtitle}</p>
        </Link>
        <p className="mt-1 text-[10px] font-black uppercase tracking-[.12em] text-text-secondary">
          Fits: {product.supported_bike_models.join(" · ")}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex gap-1" aria-label="Available colors">
            {product.variants.slice(0, 5).map((item) => (
              <button
                key={item.sku}
                title={item.color}
                onClick={() => setSelectedVariant(item)}
                aria-label={`Select ${item.color}`}
                className={`h-4 w-4 rounded-full border shadow-sm transition ${variant?.sku === item.sku ? "border-accent-primary ring-2 ring-accent-primary/45" : "border-white/40"}`}
                style={{ backgroundColor: item.color_hex || "#111111" }}
              />
            ))}
          </div>
          <span className="text-[10px] font-black uppercase text-success">{product.stock_status.replace("_", " ")}</span>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <p className="text-base font-black text-accent-primary">{formatINR(price)}</p>
          {product.compareAt && product.compareAt > price && (
            <p className="text-xs text-text-secondary line-through">{formatINR(product.compareAt)}</p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Star size={14} fill="#C97D3A" className="text-accent-primary" /> {product.rating} ({product.reviews})
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => {
                if (!user) return openLogin();
                wishlistMutation.mutate();
              }}
              aria-label={`${wished ? "Remove" : "Add"} ${product.name} wishlist`}
              className={`border px-2 py-1 transition ${wished ? "border-accent-primary bg-accent-primary text-bg-primary" : "border-border-primary text-text-primary hover:border-accent-primary hover:text-accent-primary"}`}
            >
              <Heart size={14} fill={wished ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => {
                if (!variant) return;
                addItem(buildCartItemFromProduct(product, variant, bikeModel));
                setToast(`${variant.color} added to cart`);
                window.setTimeout(() => setToast(""), 1800);
              }}
              disabled={!variant || variant.stock <= 0}
              aria-label={`Add ${product.name} to cart`}
              className="border border-accent-primary/70 px-2 py-1 text-accent-primary hover:bg-accent-primary hover:text-bg-primary disabled:opacity-40"
            >
              <ShoppingBag size={14} />
            </button>
          </div>
        </div>
        {toast && <p className="mt-2 rounded border border-success/40 bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">{toast}</p>}
      </div>
    </motion.article>
  );
}
