"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShoppingBag, Truck } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getAccountOrders } from "@/lib/auth-api";
import { formatINR } from "@/lib/utils";

export default function OrdersPage() {
  const { user, loading, openLogin } = useAuth();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getAccountOrders,
    enabled: Boolean(user),
  });
  if (loading || isLoading) {
    return (
      <main className="container-x pt-24 pb-10">
        <div className="mt-6 grid gap-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="cinematic-panel h-32 animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container-x grid min-h-[70vh] place-items-center pt-24 pb-10 text-center">
        <div>
          <h1 className="font-display text-5xl uppercase">Login required</h1>
          <p className="mt-2 text-text-secondary">Your orders stay locked to your account.</p>
          <button onClick={openLogin} className="mt-5 bg-accent-primary px-6 py-3 text-sm font-black uppercase text-bg-primary">
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-x pt-24 pb-10">
      <section className="scroll-reveal-soft border-b border-border-primary pb-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-accent-primary">Account</p>
            <h1 className="tactical-title mt-2 text-4xl uppercase md:text-5xl">Orders</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">Simple order history for your OUTRAN purchases.</p>
          </div>
          <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-primary px-4 py-3 text-xs font-black uppercase text-bg-primary">
            Shop gear <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="scroll-reveal grid gap-4 py-7">
          {orders.length === 0 && (
            <div className="cinematic-panel p-7 text-center">
              <ShoppingBag className="mx-auto text-accent-primary" size={30} />
              <h2 className="mt-3 font-display text-3xl uppercase">No orders yet</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">Select your bike, choose compatible gear, and your orders will show here.</p>
              <Link href="/products" className="mt-5 inline-flex rounded-md bg-accent-primary px-5 py-3 text-sm font-black uppercase text-bg-primary">
                Start shopping
              </Link>
            </div>
          )}

          {orders.map((order) => (
            <article key={order.id} className="group overflow-hidden rounded-md border border-border-primary bg-black/28">
              <div className="grid gap-4 p-4 sm:grid-cols-[104px_1fr] md:grid-cols-[112px_1fr_auto] md:items-center">
                <div className="relative aspect-[4/3] overflow-hidden rounded bg-black/35">
                  {order.product_image ? (
                    <Image src={order.product_image} alt={order.product_name} fill className="object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full place-items-center text-accent-primary">
                      <Truck size={34} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded border border-accent-primary/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-accent-primary">
                      Order {order.order_number}
                    </span>
                    <StatusPill label={order.payment_status} tone={order.payment_status === "paid" ? "success" : "warn"} />
                    <StatusPill label={order.order_status} />
                  </div>
                  <h3 className="mt-3 font-display text-2xl uppercase leading-none md:text-3xl">{order.product_name}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    Variant: {order.variant ?? "Standard"} · Quantity: {order.quantity}
                    <br />
                    Placed: {order.created_at ? new Date(order.created_at).toLocaleString("en-IN") : "Recent"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 md:grid md:min-w-40">
                  <p className="text-2xl font-black text-accent-primary md:text-right">{formatINR(order.amount)}</p>
                  <Link href={`/order-success?order=${order.order_number}`} className="inline-flex items-center justify-center gap-2 rounded bg-accent-primary px-3 py-2 text-[10px] font-black uppercase text-bg-primary">
                    Details <ArrowRight size={13} />
                  </Link>
                  <Link href="/products" className="inline-flex items-center justify-center gap-2 rounded border border-border-primary px-3 py-2 text-[10px] font-black uppercase transition hover:border-accent-primary hover:text-accent-primary">
                    Buy again <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
}

function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warn" }) {
  const toneClass = tone === "success" ? "border-success/70 text-success" : tone === "warn" ? "border-accent-primary/70 text-accent-primary" : "border-border-primary text-text-secondary";
  return <span className={`border px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] ${toneClass}`}>{label}</span>;
}
