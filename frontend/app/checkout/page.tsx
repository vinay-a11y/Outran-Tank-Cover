"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import type { ElementType, ReactNode } from "react";
import { useState } from "react";
import { CreditCard, LockKeyhole, Mail, MapPin, Phone, User, ArrowRight } from "lucide-react";
import { checkoutSteps } from "@/lib/data";
import { createCheckout, verifyPayment, type CheckoutAddress } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { useCart } from "@/store/cart";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const initialAddress: CheckoutAddress = {
  full_name: "Rohit Sharma",
  phone: "+91 98765 43210",
  email: "rohit.sharma@gmail.com",
  address: "123, Mountain View Road, Koramangala",
  city: "Bangalore",
  state: "Karnataka",
  pincode: "560034"
};

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      setTimeout(() => resolve(Boolean(window.Razorpay)), 2500);
    });
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [status, setStatus] = useState("");
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 199;
  const tax = Math.round(subtotal * .18);
  const total = subtotal + shipping + tax;

  async function submitOrder() {
    if (items.length === 0) {
      setStatus("Add the tank cover to cart before checkout.");
      return;
    }

    setLoading(true);
    setStatus("Creating secure order...");
    try {
      const order = await createCheckout(address, items);
      const key = order.razorpay_key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!key) {
        setStatus("Razorpay key id is missing. Check frontend/.env and backend/.env.");
        return;
      }
      if (!order.razorpay_order_id) {
        setStatus("Backend did not create a Razorpay order. Check backend Razorpay keys.");
        return;
      }
      setStatus("Opening Razorpay checkout...");
      const scriptReady = razorpayReady || await loadRazorpayScript();
      setRazorpayReady(scriptReady);
      if (!scriptReady || !window.Razorpay) {
        setStatus("Razorpay checkout script could not load. Check internet connection, ad blocker, or browser blocking settings.");
        return;
      }

      const razorpay = new window.Razorpay({
        key,
        amount: Math.round(order.total * 100),
        currency: "INR",
        name: "OUTRAN",
        description: "Terrain Core Tank Cover",
        order_id: order.razorpay_order_id,
        prefill: {
          name: address.full_name,
          email: address.email,
          contact: address.phone
        },
        handler: async (payment: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("Verifying payment...");
          await verifyPayment({
            order_id: order.order_id,
            razorpay_order_id: payment.razorpay_order_id,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_signature: payment.razorpay_signature
          });
          clear();
          router.push(`/order-success?order=${order.order_number}`);
        },
        modal: {
          ondismiss: () => setStatus("Payment window closed. Your order is saved, but payment is pending.")
        },
        theme: { color: "#C97D3A" }
      });
      razorpay.open();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-20">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
        onError={() => setStatus("Razorpay checkout script failed to load. Check internet or browser blocking settings.")}
      />
      <section className="relative overflow-hidden">
        <Image src="/assets/checkout-page.jpeg" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-black/35" />
        <div className="container-x relative z-10 py-10">
          <p className="text-sm font-black uppercase tracking-[.18em] text-accent-primary">Checkout</p>
          <h1 className="tactical-title mt-3 max-w-4xl text-5xl uppercase md:text-7xl">Secure your gear. We&apos;ll handle <span className="orange-text">the rest.</span></h1>
          <div className="mt-7 grid gap-3 md:grid-cols-4">
            {checkoutSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 border-t border-border-primary pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-accent-primary text-accent-primary">0{index + 1}</span>
                <span className="font-black">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x grid gap-6 py-10 lg:grid-cols-[1fr_430px]">
        <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
          <CheckoutBlock icon={MapPin} title="Shipping details">
            <div className="grid gap-4 md:grid-cols-2">
              <Field icon={User} label="Full Name" value={address.full_name} onChange={(value) => setAddress({ ...address, full_name: value })} />
              <Field icon={Phone} label="Phone Number" value={address.phone} onChange={(value) => setAddress({ ...address, phone: value })} />
            </div>
            <Field icon={Mail} label="Email Address" value={address.email} onChange={(value) => setAddress({ ...address, email: value })} />
            <Field icon={MapPin} label="Address" value={address.address} onChange={(value) => setAddress({ ...address, address: value })} />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="City" value={address.city} onChange={(value) => setAddress({ ...address, city: value })} />
              <Field label="State" value={address.state} onChange={(value) => setAddress({ ...address, state: value })} />
              <Field label="Pincode" value={address.pincode} onChange={(value) => setAddress({ ...address, pincode: value })} />
            </div>
          </CheckoutBlock>

          <CheckoutBlock icon={CreditCard} title="Payment method">
            <div className="border border-accent-primary bg-accent-primary/10 p-4 text-sm">
              <p className="font-black uppercase text-accent-primary">Razorpay secure checkout</p>
              <p className="mt-2 text-text-secondary">Supports UPI, cards, net banking, and wallets through your Razorpay account.</p>
            </div>
          </CheckoutBlock>
        </form>

        <aside className="cinematic-panel h-max p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl uppercase">Order summary</h2>
            <span className="text-sm text-text-secondary">{items.length} items</span>
          </div>
          <div className="mt-5 grid gap-4">
            {items.length === 0 && <p className="text-sm text-text-secondary">Your cart is empty.</p>}
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-[92px_1fr_auto] gap-4">
                <div className="relative aspect-square overflow-hidden"><Image src={item.image} alt={item.name} fill className="object-cover" /></div>
                <div>
                  <p className="font-black">{item.name}</p>
                  <p className="text-sm text-text-secondary">{item.subtitle}<br />{item.color}<br />Qty: {item.qty}</p>
                </div>
                <p className="font-black">{formatINR(item.price * item.qty)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 border-y border-border-primary py-5 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : formatINR(shipping)}</span></div>
            <div className="flex justify-between"><span>Tax (GST 18%)</span><span>{formatINR(tax)}</span></div>
          </div>
          <div className="mt-6 flex justify-between">
            <span className="font-black">Total Amount</span>
            <span className="text-3xl font-black text-accent-primary">{formatINR(total)}</span>
          </div>
          <button onClick={submitOrder} disabled={loading || items.length === 0} className="mt-6 flex w-full items-center justify-center gap-3 bg-accent-primary px-6 py-3.5 text-sm font-black uppercase text-bg-primary disabled:cursor-not-allowed disabled:opacity-50">
            <LockKeyhole size={17} /> {loading ? "Creating order..." : "Pay securely"} <ArrowRight size={17} />
          </button>
          {status && <p className="mt-4 text-center text-sm text-text-secondary">{status}</p>}
          <p className="mt-5 text-center text-xs text-text-secondary">By placing this order, you agree to our Terms & Conditions and Privacy Policy.</p>
        </aside>
      </section>
    </main>
  );
}

function CheckoutBlock({ icon: Icon, title, children }: { icon: ElementType; title: string; children: ReactNode }) {
  return (
    <section className="cinematic-panel p-5">
      <h2 className="mb-4 flex items-center gap-3 font-display text-3xl uppercase"><Icon className="text-accent-primary" /> {title}</h2>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Field({ label, value, onChange, icon: Icon }: { label: string; value: string; onChange: (value: string) => void; icon?: ElementType }) {
  return (
    <label className="block border border-border-primary bg-black/20 px-4 py-3">
      <span className="mb-2 block text-xs text-text-secondary">{label}</span>
      <span className="flex items-center justify-between gap-3">
        <input className="min-w-0 flex-1 bg-transparent outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
        {Icon && <Icon size={18} className="text-text-secondary" />}
      </span>
    </label>
  );
}
