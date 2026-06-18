"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getProducts, type StoreProduct } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal, discountTotal, shipping, total } = useCart();
  const [recommended, setRecommended] = useState<StoreProduct[]>([]);

  useEffect(() => {
    getProducts().then(setRecommended).catch(() => setRecommended([]));
  }, []);

  return (
    <main className="pt-20">
      <section className="relative min-h-[300px] overflow-hidden">
        <Image src="/assets/cart-page.jpeg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-black/60" />
        <div className="container-x relative z-10 flex min-h-[300px] flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-[.18em] text-accent-primary">Your cart</p>
          <h1 className="tactical-title mt-3 text-5xl uppercase md:text-7xl">Gear up. Ride out.</h1>
          <p className="mt-3 text-text-primary/80">Review your selections. Quantities and totals update live.</p>
        </div>
      </section>

      <section className="container-x grid gap-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="cinematic-panel p-5">
          {items.length === 0 && (
            <div className="grid min-h-52 place-items-center text-center">
              <div>
                <h2 className="font-display text-4xl uppercase">Your cart is empty</h2>
                <p className="mt-2 text-text-secondary">Browse tank covers and add your preferred color variant.</p>
                <Link href="/products" className="mt-5 inline-flex bg-accent-primary px-5 py-3 text-sm font-black uppercase text-bg-primary">
                  Shop tank covers
                </Link>
              </div>
            </div>
          )}
          {items.map((item) => (
            <div key={item.lineId} className="grid gap-4 border-b border-border-primary py-4 md:grid-cols-[150px_1fr_auto_auto] md:items-center">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div>
                <h2 className="font-display text-3xl uppercase">{item.name}</h2>
                <p className="text-text-secondary">{item.subtitle}</p>
                <p className="mt-3 text-sm text-text-secondary">
                  Color: {item.color}
                  <br />
                  Bike: {item.bike_model}
                  <br />
                  SKU: {item.variant_sku}
                </p>
              </div>
              <div className="inline-flex h-max border border-border-primary">
                <button onClick={() => updateQty(item.lineId, item.qty - 1)} className="px-4 py-3" disabled={item.qty <= 1}>
                  <Minus size={15} />
                </button>
                <span className="border-x border-border-primary px-5 py-3">{item.qty}</span>
                <button onClick={() => updateQty(item.lineId, item.qty + 1)} className="px-4 py-3" disabled={item.qty >= item.max_qty}>
                  <Plus size={15} />
                </button>
              </div>
              <div className="text-right">
                <p className="font-black">{formatINR(item.price * item.qty)}</p>
                <button onClick={() => removeItem(item.lineId)} className="mt-4 inline-flex items-center gap-2 text-sm text-accent-primary">
                  <Trash2 size={15} /> Remove
                </button>
              </div>
            </div>
          ))}
          <Link href="/products" className="mt-5 inline-flex border border-border-primary px-5 py-3 text-sm font-black uppercase">
            Continue shopping
          </Link>
        </div>
        <aside className="cinematic-panel h-max p-5">
          <h2 className="font-display text-3xl uppercase">Order summary</h2>
          <div className="mt-5 grid gap-3 border-b border-border-primary pb-5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} lines)</span>
              <span>{formatINR(subtotal())}</span>
            </div>
            {discountTotal() > 0 && (
              <div className="flex justify-between text-success">
                <span>Product savings</span>
                <span>-{formatINR(discountTotal())}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping() === 0 ? "FREE" : formatINR(shipping())}</span>
            </div>
          </div>
          <div className="mt-6 flex justify-between">
            <span className="font-black uppercase">Order total</span>
            <span className="text-3xl font-black text-accent-primary">{formatINR(total())}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 flex items-center justify-center gap-3 bg-accent-primary px-6 py-3.5 text-sm font-black uppercase text-bg-primary"
          >
            Proceed to checkout <ArrowRight size={17} />
          </Link>
        </aside>
      </section>

      {recommended.length > 0 && (
        <section className="container-x pb-10">
          <h2 className="tactical-title mb-5 text-4xl uppercase">You may also like</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {recommended.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
