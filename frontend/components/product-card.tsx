"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { StoreProduct } from "@/lib/api";
import { getDefaultVariant } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { buildCartItemFromProduct, useCart } from "@/store/cart";

export function ProductCard({ product }: { product: StoreProduct }) {
  const addItem = useCart((state) => state.addItem);
  const variant = getDefaultVariant(product);
  const price = product.discounted_price ?? product.total_price ?? product.price;
  const bikeModel = product.supported_bike_models[0] ?? "Royal Enfield Himalayan 450";

  return (
    <motion.article whileHover={{ y: -3 }} className="group overflow-hidden border border-border-primary bg-surface-card/70">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[16/9] overflow-hidden">
        <Image src={product.thumbnail || product.image} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
        {product.badge && (
          <span className="absolute left-3 top-3 border border-accent-primary/70 bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-badge-founder">
            {product.badge}
          </span>
        )}
        {product.stock_status === "out_of_stock" && (
          <span className="absolute right-3 top-3 bg-black/70 px-2 py-1 text-[10px] font-black uppercase text-text-secondary">Sold out</span>
        )}
      </Link>
      <div className="p-3.5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-[1.65rem] uppercase leading-none">{product.name}</h3>
          <p className="font-display text-base uppercase text-text-primary/80">{product.subtitle}</p>
        </Link>
        <div className="mt-2 flex items-end gap-2">
          <p className="text-lg font-black text-accent-primary">{formatINR(price)}</p>
          {product.compareAt && product.compareAt > price && (
            <p className="text-sm text-text-secondary line-through">{formatINR(product.compareAt)}</p>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-text-secondary">
            <Star size={15} fill="#C97D3A" className="text-accent-primary" /> {product.rating} ({product.reviews})
          </span>
          <button
            onClick={() => {
              if (!variant) return;
              addItem(buildCartItemFromProduct(product, variant, bikeModel));
            }}
            disabled={!variant || variant.stock <= 0}
            aria-label={`Add ${product.name} to cart`}
            className="border border-accent-primary/70 p-2 text-accent-primary hover:bg-accent-primary hover:text-bg-primary disabled:opacity-40"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
