"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Minus, Plus } from "lucide-react";
import type { StoreProduct } from "@/lib/api";
import { getDefaultVariant } from "@/lib/api";
import { buildCartItemFromProduct, useCart } from "@/store/cart";

type Props = {
  product: StoreProduct;
  selectedVariantId: number;
  onVariantChange: (variantId: number) => void;
};

export function ProductDetailClient({ product, selectedVariantId, onVariantChange }: Props) {
  const router = useRouter();
  const addItem = useCart((state) => state.addItem);
  const defaultVariant = getDefaultVariant(product);
  const [selectedBike, setSelectedBike] = useState(product.supported_bike_models[0] ?? "Standard");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? defaultVariant;
  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const maxQty = Math.max(selectedVariant?.stock ?? 1, 1);
  const bikeModel = selectedBike || product.supported_bike_models[0] || "Standard";

  function handleAdd(target: "/cart" | "/checkout") {
    if (!selectedVariant || !inStock) return;
    addItem({
      ...buildCartItemFromProduct(product, selectedVariant, bikeModel),
      qty: Math.min(Math.max(quantity, 1), maxQty),
    });
    router.push(target);
  }

  return (
    <>
      <div className="mt-5 border-y border-border-primary py-4">
        <p className="mb-3 text-xs font-black uppercase tracking-[.16em]">Compatible bike</p>
        <div className="flex flex-wrap gap-2">
          {product.supported_bike_models.map((bike) => (
            <button
              key={bike}
              type="button"
              onClick={() => setSelectedBike(bike)}
              className={`border px-3 py-2 text-xs font-black uppercase ${
                selectedBike === bike ? "border-accent-primary bg-accent-primary/10 text-accent-primary" : "border-border-primary"
              }`}
            >
              {bike}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 border-b border-border-primary pb-4">
        <p className="mb-3 text-xs font-black uppercase tracking-[.16em]">Color options</p>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                onVariantChange(variant.id);
                setQuantity(1);
              }}
              className={`flex items-center gap-2 border px-3 py-2 text-xs font-black uppercase ${
                selectedVariantId === variant.id ? "border-accent-primary bg-accent-primary/10" : "border-border-primary"
              }`}
            >
              <span className="h-5 w-5 rounded-full border border-white/70" style={{ backgroundColor: variant.color_hex }} />
              {variant.color}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          {inStock ? `${selectedVariant?.stock ?? 0} in stock` : "Out of stock"}
          {selectedVariant?.stock_status === "low_stock" && inStock ? " · Low stock" : ""}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <p className="text-xs font-black uppercase tracking-[.16em]">Quantity</p>
        <div className="inline-flex border border-border-primary">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-4 py-3" disabled={!inStock}>
            <Minus size={15} />
          </button>
          <span className="border-x border-border-primary px-5 py-3">{quantity}</span>
          <button type="button" onClick={() => setQuantity((value) => Math.min(maxQty, value + 1))} className="px-4 py-3" disabled={!inStock}>
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={() => handleAdd("/cart")}
          disabled={!inStock}
          className="flex items-center justify-center gap-3 bg-accent-primary px-6 py-3.5 text-sm font-black uppercase text-bg-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add to cart <ArrowRight size={17} />
        </button>
        <button
          type="button"
          onClick={() => handleAdd("/checkout")}
          disabled={!inStock}
          className="flex items-center justify-center border border-accent-primary/60 px-6 py-3.5 text-sm font-black uppercase disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buy it now
        </button>
      </div>

      <div className="mt-6 cinematic-panel p-4">
        <p className="text-xs font-black uppercase tracking-[.16em] text-accent-primary">Installation guide</p>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-text-secondary">{product.installation_guide}</p>
      </div>

      <div className="mt-4">
        <p className="text-xs font-black uppercase tracking-[.16em] text-text-secondary">Suitable for</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.supported_bike_models.map((bike) => (
            <span key={bike} className="border border-border-primary px-3 py-1 text-xs uppercase text-text-secondary">
              {bike}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
