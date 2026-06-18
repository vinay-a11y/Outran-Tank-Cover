"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { navItems, serviceItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = useCart((state) => state.items);
  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-black/45 backdrop-blur-xl"
      >
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="relative h-10 w-28" aria-label="OUTRAN home">
            <Image src="/assets/outran-logo.svg" alt="OUTRAN" fill className="object-contain object-left" priority />
          </Link>
          <nav className="hidden items-center gap-10 text-xs font-black uppercase tracking-[.08em] text-text-primary lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={cn("transition hover:text-accent-primary", pathname === item.href && "text-accent-primary underline underline-offset-8")}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button aria-label="Search" className="hidden p-2 text-text-primary hover:text-accent-primary md:inline-flex">
              <Search size={21} />
            </button>
            <Link href="/cart" className="hidden items-center gap-2 border border-accent-primary/55 px-4 py-2.5 text-xs font-black uppercase text-text-primary hover:bg-accent-primary hover:text-bg-primary md:inline-flex">
              <ShoppingBag size={16} /> Cart ({count})
            </Link>
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="p-3 text-text-primary lg:hidden">
              <Menu />
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: .35 }}
            className="fixed inset-0 z-[80] bg-bg-primary/95 p-6 backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Image src="/assets/outran-logo.svg" alt="OUTRAN" width={142} height={56} />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-3">
                <X />
              </button>
            </div>
            <div className="mt-14 grid gap-6">
              {navItems.map((item) => (
                <Link key={item.href} onClick={() => setOpen(false)} className="font-display text-5xl uppercase" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
            <Link onClick={() => setOpen(false)} href="/cart" className="mt-12 flex items-center justify-between border border-accent-primary px-5 py-4 font-black uppercase text-accent-primary">
              Cart <span>{count}</span>
            </Link>
          </motion.aside>
        )}
      </AnimatePresence>

      {children}

      <footer className="border-t border-border-primary bg-black/35">
        <div className="container-x grid gap-8 py-8 md:grid-cols-4">
          {serviceItems.map((item) => (
            <div key={item.title} className="flex items-center gap-4 border-b border-border-primary pb-5 md:border-b-0 md:border-r md:pb-0">
              <item.icon className="text-accent-primary" />
              <div>
                <p className="text-sm font-black uppercase">{item.title}</p>
                <p className="text-sm text-text-secondary">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="container-x grid gap-10 border-t border-border-primary py-10 md:grid-cols-[1.2fr_.7fr_.7fr_1.2fr]">
          <div>
            <Image src="/assets/outran-logo.svg" alt="OUTRAN" width={160} height={64} />
            <p className="mt-4 max-w-xs text-sm text-text-secondary">Premium motorcycle gear for riders who live for the journey beyond roads.</p>
          </div>
          <FooterList title="Shop" items={["Tank Covers", "Tail Packs", "Saddle Bags", "Accessories"]} />
          <FooterList title="Support" items={["Shipping", "Returns", "Warranty", "FAQs"]} />
          <div>
            <p className="font-black uppercase">Join the OUTRAN crew</p>
            <p className="mt-3 text-sm text-text-secondary">Early access. Real stories. Exclusive drops.</p>
            <form className="mt-5 flex border border-border-primary bg-black/30">
              <input className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm outline-none" placeholder="Enter your email" />
              <button className="bg-accent-primary px-5 font-black text-bg-primary" type="button">→</button>
            </form>
          </div>
        </div>
        <div className="container-x flex flex-col justify-between gap-3 border-t border-border-primary py-6 text-xs uppercase text-text-secondary md:flex-row">
          <span>© 2026 OUTRAN. All rights reserved.</span>
          <span>Built in India 🇮🇳</span>
        </div>
      </footer>

      <Link href="/checkout" className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-center gap-2 bg-accent-primary px-5 py-4 text-sm font-black uppercase text-bg-primary shadow-glow md:hidden">
        Checkout Gear <ShoppingBag size={17} />
      </Link>
    </>
  );
}

function FooterList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-black uppercase">{title}</p>
      <div className="mt-4 grid gap-2 text-sm text-text-secondary">
        {items.map((item) => (
          <Link key={item} href="/products" className="hover:text-accent-primary">
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
