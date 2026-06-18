"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { ProductFilters } from "@/lib/api";

type Props = {
  filters: ProductFilters;
  productCount: number;
};

export function ProductFiltersPanel({ filters, productCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = {
    category: searchParams.get("category") ?? "",
    bike_model: searchParams.get("bike_model") ?? "",
    color: searchParams.get("color") ?? "",
    stock_status: searchParams.get("stock_status") ?? "",
    search: searchParams.get("search") ?? "",
    sort: searchParams.get("sort") ?? "featured",
  };

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`/products?${params.toString()}`));
  }

  function toggleValue(key: string, value: string) {
    updateParam(key, current[key as keyof typeof current] === value ? "" : value);
  }

  return (
    <aside className="cinematic-panel h-max p-4">
      <div className="flex items-center justify-between border-b border-border-primary pb-3">
        <h2 className="font-display text-2xl uppercase">Filters</h2>
        <span className="text-xs font-black uppercase text-accent-primary">{productCount} products</span>
      </div>

      <div className="border-b border-border-primary py-4">
        <p className="mb-3 text-xs font-black uppercase">Search</p>
        <input
          defaultValue={current.search}
          onBlur={(event) => updateParam("search", event.target.value.trim())}
          placeholder="Search tank covers..."
          className="w-full border border-border-primary bg-black/30 px-3 py-2 text-sm outline-none"
        />
      </div>

      <FilterGroup title="Category">
        {filters.categories.map((category) => (
          <FilterCheckbox
            key={category.slug}
            label={category.name}
            checked={current.category === category.slug}
            onChange={() => toggleValue("category", category.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Bike model">
        {filters.bike_models.map((bike) => (
          <FilterCheckbox
            key={bike}
            label={bike}
            checked={current.bike_model === bike}
            onChange={() => toggleValue("bike_model", bike)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Color">
        {filters.colors.map((color) => (
          <FilterCheckbox
            key={color}
            label={color}
            checked={current.color === color}
            onChange={() => toggleValue("color", color)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Stock">
        {filters.stock_statuses.map((status) => (
          <FilterCheckbox
            key={status}
            label={status.replace("_", " ")}
            checked={current.stock_status === status}
            onChange={() => toggleValue("stock_status", status)}
          />
        ))}
      </FilterGroup>

      <div className="pt-4">
        <label className="mb-2 block text-xs font-black uppercase">Sort</label>
        <select
          value={current.sort}
          onChange={(event) => updateParam("sort", event.target.value)}
          className="w-full border border-border-primary bg-black/40 px-3 py-2.5 text-sm uppercase"
        >
          {filters.sort_options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {pending && <p className="mt-3 text-xs text-text-secondary">Updating results...</p>}
      <Link href="/products" className="mt-4 inline-flex text-xs font-black uppercase text-accent-primary">
        Clear filters
      </Link>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border-primary py-4">
      <p className="mb-3 text-xs font-black uppercase">{title}</p>
      <div className="grid gap-2.5">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 text-sm text-text-secondary">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-accent-primary" />
      {label}
    </label>
  );
}
