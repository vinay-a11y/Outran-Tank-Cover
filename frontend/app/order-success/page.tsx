import Image from "next/image";
import Link from "next/link";
import type { ElementType } from "react";
import { Check, Mail, PackageCheck, Truck, ShieldCheck } from "lucide-react";
import { tankCoverProduct } from "@/lib/data";
import { formatINR } from "@/lib/utils";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const subtotal = tankCoverProduct.price;
  const timeline: Array<[string, ElementType]> = [
    ["Confirmed", Check],
    ["Processing", PackageCheck],
    ["Shipped", Truck],
    ["Delivered", ShieldCheck]
  ];

  return (
    <main className="pt-20">
      <section className="relative min-h-[330px] overflow-hidden">
        <Image src="/assets/success-page.jpeg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/20" />
        <div className="container-x relative z-10 flex min-h-[330px] flex-col justify-center">
          <p className="mb-4 flex items-center gap-3 font-black uppercase tracking-[.14em] text-accent-primary"><Check /> Order confirmed</p>
          <h1 className="tactical-title max-w-5xl text-5xl uppercase md:text-7xl">Thank you. Your gear is on the way!</h1>
          <p className="mt-4 max-w-xl leading-7 text-text-primary/85">We&apos;ve received your tank cover order and are getting it ready. You will receive an email confirmation shortly.</p>
          <Link className="mt-8 w-max border border-accent-primary/70 px-6 py-4 text-sm font-black uppercase" href="/products">Back to product</Link>
        </div>
      </section>

      <section className="container-x grid gap-6 py-10 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <div>
            <h2 className="font-display text-4xl uppercase">Order #{order ?? "Processing"}</h2>
            <p className="mt-2 text-sm text-text-secondary">Payment: <span className="text-success">Received</span> · Method: Razorpay</p>
          </div>
          <div className="cinematic-panel p-5">
            <h3 className="font-display text-3xl uppercase">Order status</h3>
            <div className="mt-8 grid gap-5 md:grid-cols-4">
              {timeline.map(([label, Icon], index) => (
                <div key={label} className="relative">
                  <div className={`grid h-12 w-12 place-items-center rounded-full border ${index === 0 ? "border-accent-primary bg-accent-primary text-bg-primary" : "border-border-primary"}`}>
                    <Icon size={18} />
                  </div>
                  <p className="mt-4 font-black uppercase">{label}</p>
                  <p className="text-xs text-text-secondary">{index === 0 ? "Confirmed today" : "Your order is moving"}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="cinematic-panel p-5">
            <h3 className="font-display text-3xl uppercase">Item ordered</h3>
            <div className="grid grid-cols-[100px_1fr_auto] gap-5 border-b border-border-primary py-4">
              <div className="relative aspect-square overflow-hidden"><Image src={tankCoverProduct.image} alt={tankCoverProduct.name} fill className="object-cover" /></div>
              <div><p className="font-display text-2xl uppercase">{tankCoverProduct.name}</p><p className="text-sm text-text-secondary">{tankCoverProduct.subtitle}<br />Color: {tankCoverProduct.color}</p></div>
              <p className="font-black">{formatINR(tankCoverProduct.price)}</p>
            </div>
          </div>
        </div>

        <aside className="grid h-max gap-6">
          <div className="cinematic-panel p-5">
            <h2 className="font-display text-3xl uppercase">Order summary</h2>
            <div className="mt-5 grid gap-3 border-b border-border-primary pb-5 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>FREE</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatINR(Math.round(subtotal * .18))}</span></div>
            </div>
            <div className="mt-5 flex justify-between"><span className="font-black uppercase">Order total</span><span className="text-3xl font-black text-accent-primary">{formatINR(subtotal + Math.round(subtotal * .18))}</span></div>
          </div>
          <div className="cinematic-panel p-5">
            <h2 className="font-display text-3xl uppercase">What happens next?</h2>
            {["We sent you an email with your order details.", "We pack your tank cover with care.", "Your order ships within 1-2 business days.", "Track your order in real time."].map((item) => (
              <p key={item} className="mt-4 flex gap-3 text-sm text-text-secondary"><Mail className="text-accent-primary" size={18} /> {item}</p>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
