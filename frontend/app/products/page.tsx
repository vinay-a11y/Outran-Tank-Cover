import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { CinematicHero } from "@/components/cinematic-hero";
import { ProductFiltersPanel } from "@/components/product-filters";
import { TrustBand } from "@/components/trust-band";
import { getProductFilters, getProducts, type ProductQuery } from "@/lib/api";

type SearchParams = Promise<{
  category?: string;
  search?: string;
  bike_model?: string;
  color?: string;
  stock_status?: string;
  sort?: string;
}>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query: ProductQuery = {
    category: params.category,
    search: params.search,
    bike_model: params.bike_model,
    color: params.color,
    stock_status: params.stock_status,
    sort: params.sort || "featured",
  };
  const [products, filters] = await Promise.all([getProducts(query), getProductFilters()]);

  return (
    <main>
      <CinematicHero
        eyebrow="Shop"
        title="Tank Covers"
        copy="Precision-fit protection engineered for your bike. Filter by model, color, and availability."
        image="/assets/feature-quick-lock.png"
        compact
      />
      <TrustBand />
      <section className="container-x grid gap-6 py-10 lg:grid-cols-[250px_1fr]">
        <Suspense fallback={<div className="cinematic-panel h-40 animate-pulse p-4" />}>
          <ProductFiltersPanel filters={filters} productCount={products.length} />
        </Suspense>
        <div>
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm uppercase text-text-secondary">Home / Shop / Tank Covers</p>
          </div>
          {products.length === 0 ? (
            <div className="cinematic-panel p-8 text-center">
              <h2 className="font-display text-3xl uppercase">No products match your filters</h2>
              <p className="mt-2 text-text-secondary">Try clearing filters or searching with a different bike model.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
