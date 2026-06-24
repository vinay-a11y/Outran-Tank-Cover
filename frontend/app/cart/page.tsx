"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { OrderSummary } from "@/components/order-summary";
import { ProductCard } from "@/components/product-card";
import { getProducts, type StoreProduct } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { syncCartWithBackend, useCart } from "@/store/cart";

export default function CartPage() {
  const { items, updateQty, removeItem, setItems, subtotal, discountTotal, shipping, total } = useCart();
  const [recommended, setRecommended] = useState<StoreProduct[]>([]);
  const [syncing, setSyncing] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [products, syncedItems] = await Promise.all([
          getProducts(),
          syncCartWithBackend(items),
        ]);
        setRecommended(products);
        if (syncedItems.length !== items.length || syncedItems.some((item, index) => item.variant_id !== items[index]?.variant_id)) {
          setItems(syncedItems);
        }
      } catch {
        setRecommended([]);
      } finally {
        setSyncing(false);
      }
    }
    load();
  }, []);

  return (
    <main className="pt-24 pb-10">
      <div className="container-x mb-8">
        <p className="text-sm font-black uppercase tracking-[.18em] text-accent-primary">Your cart</p>
        <h1 className="tactical-title mt-2 text-4xl uppercase md:text-5xl">Review your gear</h1>
        <p className="mt-2 text-text-secondary">Quantities, variants, and totals update live from the catalog.</p>
      </div>

      <section className="container-x grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="cinematic-panel p-5">
          {syncing && <p className="mb-4 text-sm text-text-secondary">Refreshing cart variants from server...</p>}
          {items.length === 0 && !syncing && (
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
                  Compatible bike: {item.bike_model}
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
          <OrderSummary subtotal={subtotal()} discount={discountTotal()} shipping={shipping()} total={total()} lineCount={items.length} totalLabel="Order total">
            {items.length > 0 ? (
              <Link
                href="/checkout"
                className="mt-6 flex items-center justify-center gap-3 bg-accent-primary px-6 py-3.5 text-sm font-black uppercase text-bg-primary"
              >
                Proceed to checkout <ArrowRight size={17} />
              </Link>
            ) : (
              <span className="mt-6 flex items-center justify-center gap-3 bg-accent-primary/35 px-6 py-3.5 text-sm font-black uppercase text-bg-primary/60">
                Add items to checkout
              </span>
            )}
          </OrderSummary>
        </aside>
      </section>

      {recommended.length > 0 && (
        <section className="container-x pt-10">
          <h2 className="tactical-title mb-5 text-4xl uppercase">More tank covers</h2>
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
