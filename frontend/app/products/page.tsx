import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ActiveFilters, BikeSelector } from "@/components/product-filters";
import { getProductFilters, getProducts, type ProductQuery } from "@/lib/api";

type SearchParams = Promise<{
  category?: string;
  search?: string;
  bike_model?: string;
  color?: string;
  stock_status?: string;
  sort?: string;
  page?: string;
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
    limit: 9,
    offset: (Math.max(Number(params.page || "1"), 1) - 1) * 9,
  };
  const [products, filters] = await Promise.all([getProducts(query), getProductFilters()]);
  const currentPage = Math.max(Number(params.page || "1"), 1);

  return (
    <main className="pt-20">
      <section className="container-x scroll-reveal-soft pt-7">
        <Suspense fallback={<div className="cinematic-panel h-28 animate-pulse" />}>
          <BikeSelector bikes={filters.bike_models} selectedBike={params.bike_model ?? ""} productCount={products.length} filters={filters} />
        </Suspense>
      </section>
      <section className="container-x scroll-reveal py-8">
       
        <div>
          <div className="mb-5 flex items-center justify-between">
            <div>
              {params.bike_model && (
                <p className="mt-1 text-sm font-semibold text-accent-primary">Showing gear compatible with {params.bike_model}</p>
              )}
            </div>
          </div>
          <Suspense fallback={null}>
            <ActiveFilters />
          </Suspense>
          {products.length === 0 ? (
            <div className="cinematic-panel p-8 text-center">
              <h2 className="font-display text-3xl uppercase">No products match your filters</h2>
              <p className="mt-2 text-text-secondary">Try clearing filters or searching with a different bike model.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} selectedBike={params.bike_model ?? ""} />
              ))}
            </div>
          )}
          <Pagination currentPage={currentPage} hasNext={products.length === 9} params={params} />
        </div>
      </section>
    </main>
  );
}

function Pagination({ currentPage, hasNext, params }: { currentPage: number; hasNext: boolean; params: Record<string, string | undefined> }) {
  const previous = buildPageHref(params, currentPage - 1);
  const next = buildPageHref(params, currentPage + 1);
  if (currentPage === 1 && !hasNext) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      {currentPage > 1 ? (
        <a href={previous} className="rounded border border-border-primary px-4 py-3 text-xs font-black uppercase hover:border-accent-primary">Previous</a>
      ) : (
        <span className="rounded border border-border-primary/40 px-4 py-3 text-xs font-black uppercase text-text-secondary/50">Previous</span>
      )}
      <span className="rounded bg-accent-primary px-4 py-3 text-xs font-black uppercase text-bg-primary">Page {currentPage}</span>
      {hasNext ? (
        <a href={next} className="rounded border border-border-primary px-4 py-3 text-xs font-black uppercase hover:border-accent-primary">Next</a>
      ) : (
        <span className="rounded border border-border-primary/40 px-4 py-3 text-xs font-black uppercase text-text-secondary/50">Next</span>
      )}
    </div>
  );
}

function buildPageHref(params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") search.set(key, value);
  });
  if (page > 1) search.set("page", String(page));
  const query = search.toString();
  return query ? `/products?${query}` : "/products";
}
