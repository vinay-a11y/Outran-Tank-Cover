import { Headphones, Medal, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { trustItems } from "@/lib/data";

const heroTrustItems = [
  { icon: Medal, title: "Premium Quality", copy: "Built to last" },
  { icon: ShieldCheck, title: "1 Year Warranty", copy: "On all products" },
  { icon: Truck, title: "Free Shipping", copy: "On orders above ₹999" },
  { icon: RotateCcw, title: "Easy Returns", copy: "Hassle free returns" },
  { icon: Headphones, title: "24/7 Support", copy: "We're always here" }
];

export function TrustBand({ variant = "default" }: { variant?: "default" | "hero" }) {
  if (variant === "hero") {
    return (
      <div className="hero-trust-band grid gap-px overflow-hidden rounded-lg border border-white/18 bg-black/78 p-0 shadow-tactical backdrop-blur-xl lg:grid-cols-5">
        {heroTrustItems.map((item) => (
          <div key={item.title} className="flex min-w-0 items-center gap-3 border-white/18 bg-black/38 px-4 py-4 lg:border-r lg:last:border-r-0">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-accent-primary/68 text-accent-primary">
              <item.icon size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="text-xs font-black uppercase leading-tight">{item.title}</h3>
              <p className="mt-1 text-xs leading-5 text-text-primary/80">{item.copy}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="border-y border-border-primary bg-black/25">
      <div className="container-x grid gap-0 md:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item.title} className="border-b border-border-primary py-4 md:border-b-0 md:border-r md:px-5">
            <item.icon className="mb-3 text-text-primary" size={26} />
            <h3 className="text-sm font-black uppercase">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary">{item.copy}</p>
            <p className="mt-2 text-xs font-black uppercase text-accent-primary">Explore -</p>
          </div>
        ))}
      </div>
    </section>
  );
}
