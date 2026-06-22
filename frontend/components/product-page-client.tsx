"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { StoreProduct } from "@/lib/api";
import { ProductGallery } from "@/components/product-gallery";
import { ProductDetailClient } from "@/components/product-detail-client";
import { formatINR } from "@/lib/utils";

export function ProductPageClient({ product }: { product: StoreProduct }) {
  const defaultVariant = product.variants.find((variant) => variant.is_default) ?? product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? 0);
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? defaultVariant;
  const gallery = selectedVariant?.images?.length
    ? selectedVariant.images.map((image) => image.url)
    : product.gallery;
  const unitPrice = product.discounted_price ?? selectedVariant?.price ?? product.price;

  return (
    <div>
      <p className="mb-4 text-xs uppercase text-text-secondary">
        Home / Shop / {product.category} / {product.name}
      </p>
      <div className="grid items-start gap-8 lg:grid-cols-[1.18fr_.82fr]">
        <div>
          <ProductGallery images={gallery} alt={product.name} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-max">
        {product.badge && (
          <p className="mb-3 inline-flex border border-accent-primary/60 px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-badge-founder">
            {product.badge}
          </p>
        )}
        <h1 className="tactical-title text-5xl uppercase md:text-6xl">{product.name}</h1>
        <p className="font-display text-3xl uppercase text-text-primary/80">{product.subtitle}</p>
        <div className="mt-4 flex items-end gap-3">
          <p className="text-4xl font-black text-accent-primary">{formatINR(unitPrice)}</p>
          {product.compareAt && product.compareAt > unitPrice && (
            <p className="pb-1 text-lg text-text-secondary line-through">{formatINR(product.compareAt)}</p>
          )}
        </div>
        <p className="mt-2 text-sm text-text-secondary">Free shipping on prepaid orders over ₹999. No GST added at checkout.</p>
        <div className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} size={17} fill="#C97D3A" className="text-accent-primary" />
          ))}
          <span className="ml-2">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>
        <p className="mt-5 leading-7 text-text-secondary">{product.short_description || product.description}</p>
        <ProductDetailClient
          product={product}
          selectedVariantId={selectedVariantId}
          onVariantChange={setSelectedVariantId}
        />
      </aside>
      </div>
    </div>
  );
}
