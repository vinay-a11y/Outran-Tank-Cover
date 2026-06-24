import Image from "next/image";
import Link from "next/link";
import type { ElementType } from "react";
import { Check, Mail, PackageCheck, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { getOrder } from "@/lib/api";
import { OrderSummary } from "@/components/order-summary";
import { formatINR } from "@/lib/utils";

type SearchParams = Promise<{
  order?: string;
}>;

export default async function OrderSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber ? await getOrder(orderNumber) : null;
  const timeline: Array<[string, ElementType]> = [
    ["Confirmed", Check],
    ["Processing", PackageCheck],
    ["Shipped", Truck],
    ["Delivered", ShieldCheck],
  ];

  return (
    <main className="pt-20">
      <section className="relative min-h-[320px] overflow-hidden">
        <Image src="/assets/success-page.jpeg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/25" />
        <div className="container-x relative z-10 flex min-h-[320px] flex-col justify-center py-10">
          <p className="mb-4 flex items-center gap-3 font-black uppercase tracking-[.14em] text-accent-primary">
            <Check /> Order confirmed
          </p>
          <h1 className="tactical-title max-w-4xl text-5xl uppercase md:text-6xl">Thank you. Your order is confirmed.</h1>
          <p className="mt-4 max-w-xl leading-7 text-text-primary/85">
            {order
              ? `Order ${order.order_number} is paid and queued for fulfillment.`
              : "We received your payment and are preparing your tank cover for dispatch."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex items-center gap-2 bg-accent-primary px-6 py-4 text-sm font-black uppercase text-bg-primary" href="/products">
              Continue shopping <ArrowRight size={16} />
            </Link>
            <Link className="inline-flex items-center gap-2 border border-accent-primary/70 px-6 py-4 text-sm font-black uppercase" href="#order-status">
              Track order
            </Link>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-6 py-10 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          <div>
            <h2 className="font-display text-4xl uppercase">Order #{order?.order_number ?? orderNumber ?? "Processing"}</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Payment: <span className="text-success">{order?.payment_status ?? "Received"}</span> · Method: {order?.payment_method ?? "Razorpay"}
            </p>
          </div>

          <div id="order-status" className="cinematic-panel p-5">
            <h3 className="font-display text-3xl uppercase">Order status</h3>
            <div className="mt-8 grid gap-5 md:grid-cols-4">
              {timeline.map(([label, Icon], index) => (
                <div key={label} className="relative">
                  <div className={`grid h-12 w-12 place-items-center rounded-full border ${index === 0 ? "border-accent-primary bg-accent-primary text-bg-primary" : "border-border-primary"}`}>
                    <Icon size={18} />
                  </div>
                  <p className="mt-4 font-black uppercase">{label}</p>
                  <p className="text-xs text-text-secondary">{index === 0 ? "Confirmed today" : "Updates coming soon"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="cinematic-panel p-5">
            <h3 className="font-display text-3xl uppercase">Items ordered</h3>
            {(order?.items ?? []).length === 0 && (
              <p className="mt-4 text-sm text-text-secondary">Order details will appear once the backend sync completes.</p>
            )}
            {order?.items.map((item) => (
              <div key={`${item.variant_sku}-${item.name}`} className="grid grid-cols-[100px_1fr_auto] gap-5 border-b border-border-primary py-4 last:border-b-0">
                <div className="relative aspect-square overflow-hidden bg-black/30">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div>
                  <p className="font-display text-2xl uppercase">{item.name}</p>
                  <p className="text-sm text-text-secondary">
                    {item.color && <>Color: {item.color}<br /></>}
                    {item.bike_model && <>Bike: {item.bike_model}<br /></>}
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-black">{formatINR(item.line_total)}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid h-max gap-6">
          <div className="cinematic-panel p-5">
            <h2 className="font-display text-3xl uppercase">Order summary</h2>
            <OrderSummary subtotal={order?.subtotal ?? 0} discount={order?.discount ?? 0} shipping={order?.shipping ?? 0} total={order?.total ?? 0} totalLabel="Total paid" />
          </div>
          <div className="cinematic-panel p-5">
            <h2 className="font-display text-3xl uppercase">What happens next?</h2>
            {[
              "We sent you an email with your order details.",
              "We pack your tank cover with care.",
              "Your order ships within 1-2 business days.",
              "Track your order through our support team.",
            ].map((item) => (
              <p key={item} className="mt-4 flex gap-3 text-sm text-text-secondary">
                <Mail className="shrink-0 text-accent-primary" size={18} /> {item}
              </p>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
