"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Star } from "lucide-react";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/store/cart";

type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  badge: string;
  rating: number;
  reviews: number;
  color?: string;
  material?: string;
};

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((state) => state.addItem);

  return (
    <motion.article whileHover={{ y: -3 }} className="group overflow-hidden border border-border-primary bg-surface-card/70">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[16/9] overflow-hidden">
        <Image src={product.image} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
        <span className="absolute left-3 top-3 border border-accent-primary/70 bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-badge-founder">
          {product.badge}
        </span>
      </Link>
      <div className="p-3.5">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-[1.65rem] uppercase leading-none">{product.name}</h3>
          <p className="font-display text-base uppercase text-text-primary/80">{product.subtitle}</p>
        </Link>
        <p className="mt-2 text-lg font-black text-accent-primary">{formatINR(product.price)}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-text-secondary">
            <Star size={15} fill="#C97D3A" className="text-accent-primary" /> {product.rating} ({product.reviews})
          </span>
          <button onClick={() => addItem(product.id, {
            id: product.id,
            name: product.name,
            subtitle: product.subtitle,
            price: product.price,
            image: product.image,
            color: product.color ?? "Stealth Black",
            material: product.material ?? "1000D Waterproof Fabric"
          })} aria-label={`Add ${product.name} to cart`} className="border border-accent-primary/70 p-2 text-accent-primary hover:bg-accent-primary hover:text-bg-primary">
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
