"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Bike, CheckCircle2, Search, SlidersHorizontal, X } from "lucide-react";
import type { ProductFilters } from "@/lib/api";

type Props = {
  filters: ProductFilters;
  productCount: number;
};

export function ProductFiltersPanel({ filters, productCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const current = {
    category: searchParams.get("category") ?? "",
    bike_model: searchParams.get("bike_model") ?? "",
    color: searchParams.get("color") ?? "",
    stock_status: searchParams.get("stock_status") ?? "",
    search: searchParams.get("search") ?? "",
    sort: searchParams.get("sort") ?? "featured",
  };

  useEffect(() => setSearch(current.search), [current.search]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("offset");
    startTransition(() => router.push(productUrl(params)));
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            updateParam("search", search.trim());
          }}
          className="flex overflow-hidden rounded border border-border-primary bg-black/20 focus-within:border-accent-primary"
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Bike, model, color..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <button type="submit" aria-label="Apply product search" className="grid w-10 place-items-center bg-surface-elevated text-accent-primary hover:bg-accent-primary hover:text-bg-primary">
            <Search size={16} />
          </button>
        </form>
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
            checked={current.color.toLowerCase() === color.toLowerCase()}
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
      <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase text-accent-primary">
        <X size={14} />
        Clear filters
      </Link>
    </aside>
  );
}

const bikeVisuals: Record<string, string> = {
  "Royal Enfield Himalayan 450": "/assets/feature-quick-lock.png",
  "Royal Enfield Himalayan 411": "/assets/feature-waterproof.png",
  "Royal Enfield Scram 411": "/assets/feature-terrain-fit.png",
};

export function BikeSelector({
  bikes,
  selectedBike,
  productCount,
  filters,
}: {
  bikes: string[];
  selectedBike: string;
  productCount: number;
  filters?: ProductFilters;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const currentColor = searchParams.get("color") ?? "";
  const currentStock = searchParams.get("stock_status") ?? "";
  const currentSort = searchParams.get("sort") ?? "featured";
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("offset");
    startTransition(() => router.push(productUrl(params)));
  }

  function selectBike(bike: string) {
    updateParam("bike_model", bike);
  }

  return (
    <div className="overflow-hidden rounded-md border border-border-primary bg-black/35">
      <div className="grid gap-3 p-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex gap-3">
          <div className="grid h-8 w-8 shrink-0 place-items-center border border-accent-primary/70 text-accent-primary">
            <Bike size={17} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.16em] text-accent-primary">Select your bike</p>
            <h2 className="font-display text-xl uppercase leading-none md:text-2xl">Compatible products</h2>
            <p className="mt-1 text-xs text-text-secondary">
              {selectedBike ? `${productCount} products ready for ${selectedBike}` : "Choose a model and the shop will filter every product for that bike."}
            </p>
          </div>
        </div>
        <button onClick={() => startTransition(() => router.push("/products"))} className="inline-flex items-center justify-center gap-2 rounded border border-border-primary px-3 py-2 text-[11px] font-black uppercase transition hover:border-accent-primary hover:text-accent-primary">
          <SlidersHorizontal size={15} /> Clear filters
        </button>
      </div>
      <div className="flex snap-x gap-2 overflow-x-auto border-t border-border-primary p-3 scrollbar-hide">
        <button
          onClick={() => selectBike("")}
          className={`grid h-20 w-32 shrink-0 snap-start place-items-center rounded border px-3 py-2 text-center text-[11px] font-black uppercase transition ${!selectedBike ? "border-accent-primary bg-accent-primary text-bg-primary" : "border-border-primary text-text-secondary hover:border-accent-primary"}`}
        >
          All Bikes
        </button>
        {bikes.map((bike) => (
          <button
            key={bike}
            onClick={() => selectBike(bike)}
            className={`group relative h-20 w-48 shrink-0 snap-start overflow-hidden rounded border text-left transition ${selectedBike === bike ? "border-accent-primary" : "border-border-primary hover:border-accent-primary"}`}
          >
            <Image src={bikeVisuals[bike] ?? "/assets/Hero.png"} alt={bike} fill className="object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/34 to-transparent" />
            <span className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
              <span className="font-display text-lg uppercase leading-none text-text-primary">{bike.replace("Royal Enfield ", "")}</span>
              {selectedBike === bike && <CheckCircle2 className="shrink-0 text-accent-primary" size={15} />}
            </span>
          </button>
        ))}
      </div>
      {filters && (
        <div className="grid gap-2 border-t border-border-primary p-3 md:grid-cols-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateParam("search", search.trim());
            }}
            className="flex rounded border border-border-primary bg-black/24 px-2.5 py-1.5 focus-within:border-accent-primary"
          >
            <label className="min-w-0 flex-1">
              <span className="mb-0.5 block text-[9px] font-black uppercase tracking-[.12em] text-accent-primary">Filter</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search gear" className="w-full bg-transparent text-xs font-black uppercase outline-none placeholder:text-text-secondary" />
            </label>
            <button type="submit" className="grid w-8 place-items-center text-accent-primary" aria-label="Search products">
              <Search size={15} />
            </button>
          </form>
          <CompactSelect label="Color" value={currentColor} onChange={(value) => updateParam("color", value)} options={filters.colors.map((color) => ({ value: color, label: color }))} />
          <CompactSelect label="Stock" value={currentStock} onChange={(value) => updateParam("stock_status", value)} options={filters.stock_statuses.map((status) => ({ value: status, label: status.replace("_", " ") }))} />
          <CompactSelect label="Sort" value={currentSort} onChange={(value) => updateParam("sort", value)} options={filters.sort_options.map((option) => ({ value: option.value, label: option.label }))} />
        </div>
      )}
      {pending && <p className="px-3 pb-3 text-xs text-text-secondary">Finding compatible gear...</p>}
    </div>
  );
}

export function ActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entries = ["search", "bike_model", "color", "category", "stock_status"]
    .map((key) => [key, searchParams.get(key)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

  if (!entries.length) return null;

  function remove(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("offset");
    router.push(productUrl(params));
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
      <span className="mr-1 text-xs font-black uppercase text-text-secondary">Active</span>
      {entries.map(([key, value]) => (
        <button
          key={key}
          onClick={() => remove(key)}
          className="inline-flex items-center gap-2 rounded border border-accent-primary/60 bg-accent-primary/10 px-3 py-2 text-xs font-bold capitalize text-text-primary transition hover:bg-accent-primary hover:text-bg-primary"
        >
          {key.replace("_", " ")}: {value} <X size={13} />
        </button>
      ))}
      <Link href="/products" className="px-2 py-2 text-xs font-black uppercase text-accent-primary hover:text-text-primary">Clear all</Link>
    </div>
  );
}

function productUrl(params: URLSearchParams) {
  const query = params.toString();
  return query ? `/products?${query}` : "/products";
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

function CompactSelect({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void }) {
  return (
    <label className="block rounded border border-border-primary bg-black/24 px-2.5 py-1.5">
      <span className="mb-0.5 block text-[9px] font-black uppercase tracking-[.12em] text-accent-primary">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-xs font-black uppercase outline-none">
        <option value="">{label === "Sort" ? "Featured" : `All ${label}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
