"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { tankCoverProduct } from "@/lib/data";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/store/cart";

export default function CartPage() {
  const { items, updateQty, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <main className="pt-20">
      <section className="relative min-h-[300px] overflow-hidden">
        <Image src="/assets/cart-page.jpeg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/45 to-black/60" />
        <div className="container-x relative z-10 flex min-h-[300px] flex-col justify-center">
          <p className="text-sm font-black uppercase tracking-[.18em] text-accent-primary">Your cart</p>
          <h1 className="tactical-title mt-3 text-5xl uppercase md:text-7xl">Gear up. Ride out.</h1>
          <p className="mt-3 text-text-primary/80">Review your tank cover. Confirm your journey.</p>
        </div>
      </section>

      <section className="container-x grid gap-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="cinematic-panel p-5">
          {items.length === 0 && (
            <div className="grid min-h-52 place-items-center text-center">
              <div>
                <h2 className="font-display text-4xl uppercase">Your cart is empty</h2>
                <p className="mt-2 text-text-secondary">Add the Terrain Core Tank Cover to start checkout.</p>
                <Link href="/products/terrain-core-tank-cover" className="mt-5 inline-flex bg-accent-primary px-5 py-3 text-sm font-black uppercase text-bg-primary">View tank cover</Link>
              </div>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="grid gap-4 border-b border-border-primary py-4 md:grid-cols-[150px_1fr_auto_auto] md:items-center">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div>
                <p className="mb-3 inline-flex border border-accent-primary/60 px-2 py-1 text-[10px] uppercase text-badge-founder">Founders Edition</p>
                <h2 className="font-display text-3xl uppercase">{item.name}</h2>
                <p className="text-text-secondary">{item.subtitle}</p>
                <p className="mt-3 text-sm text-text-secondary">Color: {item.color}<br />Material: {item.material}</p>
              </div>
              <div className="inline-flex h-max border border-border-primary">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-4 py-3"><Minus size={15} /></button>
                <span className="border-x border-border-primary px-5 py-3">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-4 py-3"><Plus size={15} /></button>
              </div>
              <div className="text-right">
                <p className="font-black">{formatINR(item.price * item.qty)}</p>
                <button onClick={() => removeItem(item.id)} className="mt-4 inline-flex items-center gap-2 text-sm text-accent-primary"><Trash2 size={15} /> Remove</button>
              </div>
            </div>
          ))}
          <Link href="/products" className="mt-5 inline-flex border border-border-primary px-5 py-3 text-sm font-black uppercase">Continue shopping</Link>
        </div>
        <aside className="cinematic-panel h-max p-5">
          <h2 className="font-display text-3xl uppercase">Order summary</h2>
          <div className="mt-5 grid gap-3 border-b border-border-primary pb-5 text-sm">
            <div className="flex justify-between"><span>Subtotal ({items.length} items)</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>FREE</span></div>
            <div className="flex justify-between"><span>Tax (Inclusive)</span><span>{formatINR(Math.round(subtotal * .18))}</span></div>
          </div>
          <div className="mt-6 flex justify-between">
            <span className="font-black uppercase">Order total</span>
            <span className="text-3xl font-black text-accent-primary">{formatINR(subtotal)}</span>
          </div>
          <Link href="/checkout" className="mt-6 flex items-center justify-center gap-3 bg-accent-primary px-6 py-3.5 text-sm font-black uppercase text-bg-primary">Proceed to checkout <ArrowRight size={17} /></Link>
        </aside>
      </section>

      <section className="container-x pb-10">
        <h2 className="tactical-title mb-5 text-4xl uppercase">Built for the ride</h2>
        <div className="grid gap-5 md:grid-cols-3">
          <ProductCard product={tankCoverProduct} />
        </div>
      </section>
    </main>
  );
}
