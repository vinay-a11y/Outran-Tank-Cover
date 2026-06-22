"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Facebook, Headphones, Heart, Instagram, Menu, Search, ShieldCheck, ShoppingBag, Truck, User, UserCircle, X, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { navItems, serviceItems } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useAuth } from "@/components/auth-provider";
import { getWishlist } from "@/lib/auth-api";

const desktopNavItems: Array<{ label: string; href: string; menu?: boolean }> = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Orders", href: "/orders" }
];

const searchSuggestions = [
  "Himalayan 450",
  "Himalayan 411",
  "Scram 411",
  "Stealth Black",
  "Trail Green",
  "Sand Storm",
  "Rally Red",
];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const upwardDistance = useRef(0);
  const items = useCart((state) => state.items);
  const { user, openLogin } = useAuth();
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const { data: wishlist = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: Boolean(user),
  });

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY < 24) {
        setNavHidden(false);
        upwardDistance.current = 0;
      } else if (delta > 6) {
        setNavHidden(true);
        upwardDistance.current = 0;
      } else if (delta < -6) {
        upwardDistance.current += Math.abs(delta);
        if (upwardDistance.current > 90) {
          setNavHidden(false);
        }
      }

      lastScrollY.current = currentY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = buildSearchParams(searchQuery);
    setSearchOpen(false);
    setOpen(false);
    router.push(params ? `/products?${params}` : "/products");
  }

  function openProtectedPage() {
    setOpen(false);
    openLogin();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: navHidden && !open ? -88 : 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50"
      >
        <div className="hidden h-7 border-b border-white/10 bg-black/95 text-text-primary/90 backdrop-blur-xl lg:block">
          <div className="container-x flex h-full items-center justify-between text-[10px] font-semibold">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2"><Truck size={12} className="text-accent-primary" /> FREE SHIPPING above ₹999</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={12} className="text-accent-primary" /> 1 YEAR WARRANTY</span>
              <span className="inline-flex items-center gap-2"><Headphones size={12} className="text-accent-primary" /> SUPPORT 24/7</span>
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-5 text-text-primary">
              <Instagram size={14} aria-label="Instagram" />
              <Facebook size={13} aria-label="Facebook" />
              <Youtube size={15} aria-label="YouTube" />
            </div>
          </div>
        </div>
        <div className="container-x pt-2 lg:pt-0">
          <div className="pointer-events-auto flex min-h-[52px] items-center justify-between gap-3 rounded-md border border-white/18 bg-black/82 px-3 py-1.5 shadow-tactical backdrop-blur-xl lg:h-[50px] lg:px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5 transition hover:scale-[1.02]" aria-label="OUTRAN home">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded bg-white">
              <Image src="/assets/outran-logo.svg" alt="" fill className="object-contain" priority />
            </span>
            <span className="hidden leading-none sm:block">
              <span className="block text-xs font-black uppercase tracking-[.08em] text-text-primary">OUTRAN SYSTEM</span>
              <span className="mt-0.5 block text-[8px] font-black uppercase tracking-[.14em] text-text-secondary">BUILT TO RIDE SAFE</span>
            </span>
          </Link>
          <nav className="hidden flex-1 items-stretch justify-center gap-5 self-stretch text-[10px] font-black uppercase text-text-primary xl:flex">
            {desktopNavItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-1 transition-colors hover:text-accent-primary",
                    active && "text-accent-primary after:absolute after:inset-x-0 after:bottom-[-2px] after:h-0.5 after:rounded-full after:bg-accent-primary"
                  )}
                >
                  {item.label}
                  {item.menu && <ChevronDown size={13} />}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <form
              onSubmit={submitSearch}
              className={`hidden h-8 items-center overflow-hidden rounded-md border border-white/30 bg-black/92 shadow-sm transition-all duration-300 md:flex ${
                searchOpen ? "w-[min(270px,28vw)]" : "w-8"
              }`}
            >
              <button
                aria-label="Search products"
                type="button"
                onClick={() => setSearchOpen((value) => !value)}
                className="grid h-8 w-8 shrink-0 place-items-center text-text-primary hover:text-accent-primary"
              >
                <Search size={15} />
              </button>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Bike, model, color..."
                list="site-search-suggestions"
                className="min-w-0 flex-1 bg-transparent py-1.5 pr-3 text-[11px] outline-none placeholder:text-text-secondary"
              />
              <datalist id="site-search-suggestions">
                {searchSuggestions.map((item) => <option key={item} value={item} />)}
              </datalist>
            </form>
            <Link
              href={user ? "/products?sort=featured" : "#"}
              onClick={(event) => {
                if (!user) {
                  event.preventDefault();
                  openLogin();
                }
              }}
              aria-label="Wishlist"
              className="relative hidden h-8 w-8 place-items-center rounded-md border border-white/30 bg-black/92 text-text-primary transition hover:border-accent-primary hover:text-accent-primary md:grid"
            >
              <Heart size={15} />
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-accent-primary text-[9px] font-black text-bg-primary">{wishlist.length}</span>
            </Link>
            <Link
              href="/cart"
              aria-label={`Cart with ${count} items`}
              className="relative hidden h-8 items-center gap-2 rounded-md border border-accent-primary/80 bg-accent-primary px-3 text-[10px] font-black uppercase text-bg-primary shadow-glow transition hover:-translate-y-0.5 hover:bg-accent-hover md:inline-flex"
            >
              <ShoppingBag size={14} /> <span className="hidden lg:inline">Cart</span>
              <span className="grid h-4 min-w-4 place-items-center rounded bg-text-primary px-1 text-[9px] text-bg-primary">{count}</span>
            </Link>
            {user ? (
              <div className="hidden items-center gap-1 rounded-md border border-white/30 bg-black/92 p-0.5 shadow-tactical backdrop-blur-xl lg:flex">
                <Link
                  href="/profile"
                  className={cn("flex h-7 items-center gap-1.5 rounded px-2 text-[10px] font-black uppercase transition hover:bg-white/8 hover:text-accent-primary", pathname === "/profile" && "bg-white/8 text-accent-primary")}
                >
                  <UserCircle size={14} /> Profile
                </Link>
                <Link
                  href="/orders"
                  className={cn("flex h-7 items-center rounded px-2 text-[10px] font-black uppercase transition hover:bg-white/8 hover:text-accent-primary", pathname.startsWith("/orders") && "bg-white/8 text-accent-primary")}
                >
                  Orders
                </Link>
              </div>
            ) : (
              <button onClick={openLogin} className="hidden h-8 items-center gap-2 rounded-md border border-white/30 bg-black/92 px-3 text-[10px] font-black uppercase transition hover:border-accent-primary hover:bg-white/8 hover:text-accent-primary md:inline-flex">
                <User size={14} /> Login
              </button>
            )}
            <button aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-md border border-white/22 p-2.5 text-text-primary xl:hidden">
              <Menu size={18} />
            </button>
          </div>
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
            className="fixed inset-0 z-[80] bg-bg-primary/95 p-6 backdrop-blur-xl xl:hidden"
          >
            <div className="flex items-center justify-between">
              <Image src="/assets/outran-logo.svg" alt="OUTRAN" width={142} height={56} />
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-3">
                <X />
              </button>
            </div>
            <div className="mt-12 grid gap-3">
              {navItems.map((item) => item.href === "/orders" && !user ? (
                <button key={item.href} onClick={openProtectedPage} className="border-b border-border-primary py-3 text-left font-display text-4xl uppercase">
                  {item.label}
                </button>
              ) : (
                <Link key={item.href} onClick={() => setOpen(false)} className="border-b border-border-primary py-3 font-display text-4xl uppercase" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
            <form onSubmit={submitSearch} className="mt-10 border border-border-primary bg-bg-secondary/75 p-3">
              <label className="mb-2 block text-xs font-black uppercase tracking-[.14em] text-accent-primary">Search gear</label>
              <div className="flex items-center gap-2">
                <Search size={19} className="text-text-secondary" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Himalayan black, 411, orange..."
                  className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-text-secondary"
                />
              </div>
            </form>
            <Link onClick={() => setOpen(false)} href="/cart" className="mt-12 flex items-center justify-between border border-accent-primary px-5 py-4 font-black uppercase text-accent-primary">
              Cart <span>{count}</span>
            </Link>
            {user ? (
              <div className="mt-4 grid gap-3">
                <Link onClick={() => setOpen(false)} href="/profile" className="border border-border-primary px-5 py-4 font-black uppercase">
                  Profile
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  openLogin();
                }}
                className="mt-4 border border-border-primary px-5 py-4 text-left font-black uppercase"
              >
                Login
              </button>
            )}
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
            <p className="mt-4 max-w-xs text-sm text-text-secondary">OUTRAN SYSTEM gear built to ride safe on every road and trail.</p>
          </div>
          <FooterList title="Shop" items={["Tank Covers", "Tail Packs", "Saddle Bags", "Accessories"]} />
          <FooterList title="Support" items={["Shipping", "Returns", "Warranty", "FAQs"]} />
        </div>
        <div className="container-x flex flex-col justify-between gap-3 border-t border-border-primary py-6 text-xs uppercase text-text-secondary md:flex-row">
          <span>© 2026 OUTRAN. All rights reserved.</span>
          <span>Built in India 🇮🇳</span>
        </div>
      </footer>

      {count > 0 && (
        <Link href="/checkout" className="fixed inset-x-3 bottom-3 z-50 flex items-center justify-center gap-2 bg-accent-primary px-5 py-4 text-sm font-black uppercase text-bg-primary shadow-glow md:hidden">
          Checkout Gear <ShoppingBag size={17} />
        </Link>
      )}
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

function buildSearchParams(query: string) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return "";

  const normalized = cleanQuery
    .toLowerCase()
    .replace(/himalyian|himaliyan|himalyan/g, "himalayan")
    .replace(/[^a-z0-9\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = normalized.split(" ").filter(Boolean);
  const colors = ["black", "orange", "green", "sand", "red"];
  const color = colors.find((entry) => words.includes(entry));
  const modelNumbers = words.filter((word) => word === "411" || word === "450");
  const params = new URLSearchParams();

  if (color) params.set("color", color);

  const hasHimalayan = words.includes("himalayan");
  const hasScram = words.includes("scram");
  let search = words.filter((word) => !colors.includes(word)).join(" ");

  if (hasHimalayan && modelNumbers.length > 1) {
    search = "himalayan";
  } else if (hasHimalayan && modelNumbers.length === 1) {
    search = `himalayan ${modelNumbers[0]}`;
  } else if (hasScram && modelNumbers.length === 1) {
    search = `scram ${modelNumbers[0]}`;
  }

  if (search) params.set("search", search);
  params.set("sort", "featured");
  return params.toString();
}
