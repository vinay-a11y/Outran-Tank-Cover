import { ProductCard } from "@/components/product-card";
import { CinematicHero } from "@/components/cinematic-hero";
import { TrustBand } from "@/components/trust-band";
import { getProducts } from "@/lib/api";

const filterGroups = {
  "Bike model": ["Himalayan 450"],
  Material: ["1000D Waterproof Fabric"],
  Features: ["100% Waterproof", "Zero Tank Wobble", "Easy fuel cap", "Quick lock buckles"],
  Color: ["Stealth Black", "Black / Orange Stitch", "Trail Green"]
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main>
      <CinematicHero eyebrow="Our product" title="Tank Cover" copy="One focused system for Himalayan 450. Waterproof, stable, and trail-tested." image="/assets/feature-quick-lock.png" compact />
      <TrustBand />
      <section className="container-x grid gap-6 py-10 lg:grid-cols-[250px_1fr]">
        <aside className="cinematic-panel h-max p-4">
          <div className="flex items-center justify-between border-b border-border-primary pb-3">
            <h2 className="font-display text-2xl uppercase">Filters</h2>
            <span className="text-xs font-black uppercase text-accent-primary">1 product</span>
          </div>
          {Object.entries(filterGroups).map(([title, items]) => (
            <div key={title} className="border-b border-border-primary py-4">
              <p className="mb-3 text-xs font-black uppercase">{title}</p>
              <div className="grid gap-2.5">
                {items.map((item, index) => (
                  <label key={item} className="flex items-center justify-between text-sm text-text-secondary">
                    <span className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked className="accent-accent-primary" />
                      {item}
                    </span>
                    <span>{index === 0 ? 1 : ""}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </aside>
        <div>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm uppercase text-text-secondary">Home / Shop / Himalayan 450 Tank Cover</p>
            <select className="border border-border-primary bg-black/40 px-4 py-2.5 text-sm uppercase">
              <option>Featured</option>
            </select>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
