"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Script from "next/script";
import type { ElementType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { CreditCard, LockKeyhole, Mail, MapPin, Phone, User, ArrowRight } from "lucide-react";
import { createCheckout, verifyPayment, type CheckoutAddress } from "@/lib/api";
import { getAddresses } from "@/lib/auth-api";
import { useAuth } from "@/components/auth-provider";
import { formatINR } from "@/lib/utils";
import { syncCartWithBackend, useCart } from "@/store/cart";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const initialAddress: CheckoutAddress = {
  full_name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
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
  const { user, openLogin } = useAuth();
  const { items, clear, setItems, subtotal, discountTotal, shipping, total } = useCart();
  const [address, setAddress] = useState(initialAddress);
  const [status, setStatus] = useState("");
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function prepareCheckout() {
      if (items.length === 0) {
        setReady(true);
        router.replace("/cart");
        return;
      }
      setStatus("Syncing cart with latest product data...");
      const syncedItems = await syncCartWithBackend(items);
      setItems(syncedItems);
      if (syncedItems.length === 0) {
        setStatus("Your cart items are outdated. Please add products again from the shop.");
      } else {
        setStatus("");
      }
      setReady(true);
    }
    prepareCheckout();
  }, []);

  useEffect(() => {
    if (!user) return;
    async function loadSavedAddress() {
      const saved = await getAddresses().catch((error) => {
        console.error("Failed to load saved addresses:", error);
        return [];
      });
      const latest = saved[0];
      setAddress((current) => ({
        ...current,
        full_name: current.full_name || latest?.full_name || user?.name || "",
        email: current.email || latest?.email || user?.email || "",
        phone: current.phone || latest?.phone || user?.phone_number || "",
        address: current.address || latest?.address || "",
        city: current.city || latest?.city || "",
        state: current.state || latest?.state || "",
        pincode: current.pincode || latest?.pincode || "",
      }));
    }
    loadSavedAddress();
  }, [user]);

  async function submitOrder() {
    if (!user) {
      setStatus("Login is required before checkout.");
      openLogin();
      return;
    }
    if (items.length === 0) {
      setStatus("Your cart is empty. Add a tank cover before checkout.");
      return;
    }
    const missingField = Object.entries(address).find(([, value]) => !value.trim());
    if (missingField) {
      setStatus("Please complete your shipping address before payment.");
      return;
    }

    setLoading(true);
    setStatus("Syncing cart...");
    try {
      const syncedItems = await syncCartWithBackend(items);
      setItems(syncedItems);
      if (syncedItems.length === 0) {
        setStatus("Cart variants are outdated. Clear your cart and add products again.");
        return;
      }

      setStatus("Creating secure order...");
      const order = await createCheckout(address, syncedItems);
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
      const scriptReady = razorpayReady || (await loadRazorpayScript());
      setRazorpayReady(scriptReady);
      if (!scriptReady || !window.Razorpay) {
        setStatus("Razorpay checkout script could not load. Check your connection or ad blocker.");
        return;
      }

      const razorpay = new window.Razorpay({
        key,
        amount: Math.round(order.total * 100),
        currency: "INR",
        name: "OUTRAN",
        description: "OUTRAN Tank Cover Order",
        order_id: order.razorpay_order_id,
        prefill: {
          name: address.full_name,
          email: address.email,
          contact: address.phone,
        },
        handler: async (payment: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStatus("Verifying payment...");
          try {
            await verifyPayment({
              order_id: order.order_id,
              razorpay_order_id: payment.razorpay_order_id,
              razorpay_payment_id: payment.razorpay_payment_id,
              razorpay_signature: payment.razorpay_signature,
            });
            clear();
            router.push(`/order-success?order=${order.order_number}`);
          } catch (verifyError) {
            setStatus(
              verifyError instanceof Error
                ? verifyError.message
                : "Payment verification failed. Contact support if money was debited."
            );
          }
        },
        modal: {
          ondismiss: () => setStatus("Payment window closed. Your order is saved, but payment is pending."),
        },
        theme: { color: "#C97D3A" },
      });
      razorpay.open();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-24 pb-10">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setRazorpayReady(true)}
        onError={() => setStatus("Razorpay checkout script failed to load.")}
      />

      <div className="container-x mb-8">
        <p className="text-sm font-black uppercase tracking-[.18em] text-accent-primary">Checkout</p>
        <h1 className="tactical-title mt-2 text-4xl uppercase md:text-5xl">Secure payment</h1>
        <p className="mt-2 max-w-2xl text-text-secondary">Enter shipping details and pay the final amount. No GST added at checkout.</p>
      </div>

      {!ready ? (
        <div className="container-x cinematic-panel p-8 text-sm text-text-secondary">Preparing checkout...</div>
      ) : (
        <section className="container-x grid gap-6 lg:grid-cols-[1fr_430px]">
          <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
            {!user && (
              <div className="cinematic-panel p-5">
                <p className="text-sm text-text-secondary">Login to continue with secure checkout and save this cart to your account.</p>
                <button onClick={openLogin} className="mt-4 bg-accent-primary px-5 py-3 text-sm font-black uppercase text-bg-primary" type="button">
                  Login
                </button>
              </div>
            )}
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
                <p className="mt-2 text-text-secondary">Supports UPI, cards, net banking, and wallets.</p>
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
                <div key={item.lineId} className="grid grid-cols-[92px_1fr_auto] gap-4">
                  <div className="relative aspect-square overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-black">{item.name}</p>
                    <p className="text-sm text-text-secondary">
                      {item.color} · {item.bike_model}
                      <br />
                      Qty: {item.qty}
                    </p>
                  </div>
                  <p className="font-black">{formatINR(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 border-y border-border-primary py-5 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatINR(subtotal())}</span>
              </div>
              {discountTotal() > 0 && (
                <div className="flex justify-between text-success">
                  <span>Savings</span>
                  <span>-{formatINR(discountTotal())}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping() === 0 ? "FREE" : formatINR(shipping())}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <span className="font-black">Total Amount</span>
              <span className="text-3xl font-black text-accent-primary">{formatINR(total())}</span>
            </div>
            <button
              onClick={submitOrder}
              disabled={loading || items.length === 0}
              className="mt-6 flex w-full items-center justify-center gap-3 bg-accent-primary px-6 py-3.5 text-sm font-black uppercase text-bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LockKeyhole size={17} /> {loading ? "Processing..." : "Pay securely"} <ArrowRight size={17} />
            </button>
            {status && <p className="mt-4 text-center text-sm text-text-secondary">{status}</p>}
          </aside>
        </section>
      )}
    </main>
  );
}

function CheckoutBlock({ icon: Icon, title, children }: { icon: ElementType; title: string; children: ReactNode }) {
  return (
    <section className="cinematic-panel p-5">
      <h2 className="mb-4 flex items-center gap-3 font-display text-3xl uppercase">
        <Icon className="text-accent-primary" /> {title}
      </h2>
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
