import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";
import { CinematicHero } from "@/components/cinematic-hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { TrustBand } from "@/components/trust-band";
import { getHomepage, getProducts } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export default async function HomePage() {
  const [homepage, products] = await Promise.all([getHomepage(), getProducts()]);
  const hero = homepage?.hero;
  const featured = homepage?.featured_products?.length ? homepage.featured_products : products.filter((product) => product.featured_product);
  const latest = homepage?.latest_products?.length ? homepage.latest_products : products;
  const heroProduct = featured[0] ?? latest[0];

  return (
    <main>
      <CinematicHero
        eyebrow={hero?.eyebrow ?? "Terrain Core"}
        title={hero?.title?.replace(/\.$/, "") ?? "Built for the ride"}
        highlight="beyond roads."
        copy={hero?.subtitle ?? "Precision fit tank cover systems tested in the wild."}
        image={hero?.image ?? "/assets/Hero.png"}
      >
        <Link href={hero?.cta_href ?? "/products"} className="inline-flex items-center gap-3 bg-accent-primary px-5 py-3 text-sm font-black uppercase text-bg-primary">
          {hero?.cta_label ?? "Shop tank covers"} <ArrowRight size={18} />
        </Link>
        <Link href="/products" className="inline-flex items-center gap-3 border border-accent-primary/60 px-5 py-3 text-sm font-black uppercase text-text-primary">
          Browse catalog
        </Link>
      </CinematicHero>

      <TrustBand />

      {heroProduct && (
        <section className="py-6">
          <div className="container-x grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[320px] overflow-hidden border border-border-primary">
              <Image src={heroProduct.image} alt={heroProduct.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/60" />
              <div className="absolute bottom-0 left-0 max-w-xl p-5">
                <p className="text-xs font-black uppercase tracking-[.18em] text-accent-primary">{heroProduct.category}</p>
                <h2 className="tactical-title mt-2 text-4xl uppercase md:text-5xl">{heroProduct.name}</h2>
                <p className="font-display text-2xl uppercase text-text-primary/80">{heroProduct.subtitle}</p>
                <p className="mt-2 text-2xl font-black text-accent-primary">{formatINR(heroProduct.discounted_price ?? heroProduct.price)}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/products/${heroProduct.slug}`} className="bg-accent-primary px-5 py-2.5 text-sm font-black uppercase text-bg-primary">
                    View details
                  </Link>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(homepage?.bike_categories ?? []).slice(0, 3).map((category) => (
                <Link key={category.slug} href={`/products?category=${category.slug}`} className="relative min-h-[152px] overflow-hidden border border-border-primary bg-black/30">
                  {category.image_url && <Image src={category.image_url} alt={category.name} fill className="object-cover opacity-70" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/15" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="max-w-44 text-sm font-black uppercase tracking-[.12em]">{category.name}</p>
                    <p className="mt-2 max-w-56 text-xs leading-5 text-text-secondary">{category.description}</p>
                  </div>
                </Link>
              ))}
              <div className="border border-border-primary bg-surface-card/55 p-4">
                <p className="text-xs font-black uppercase tracking-[.18em] text-accent-primary">{homepage?.compatibility_highlights.title ?? "Fits your ride"}</p>
                <p className="tactical-title mt-2 text-4xl uppercase">Compatibility</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{homepage?.compatibility_highlights.copy}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="py-8">
          <SectionHeading eyebrow="Featured" title="Trail-proven tank covers" />
          <div className="container-x grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="border-y border-border-primary py-8">
          <SectionHeading eyebrow="Latest" title="New arrivals" copy="Fresh drops and restocked colorways from the OUTRAN workshop." />
          <div className="container-x grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {latest.map((product) => (
              <ProductCard key={`latest-${product.id}`} product={product} />
            ))}
          </div>
        </section>
      )}

      {(homepage?.offers ?? []).length > 0 && (
        <section className="container-x py-8">
          <div className="grid gap-4 md:grid-cols-3">
            {homepage!.offers.map((offer) => (
              <Link key={offer.code} href={offer.cta_href} className="cinematic-panel p-5 transition hover:border-accent-primary/60">
                <p className="text-xs font-black uppercase tracking-[.18em] text-accent-primary">{offer.title}</p>
                <p className="mt-3 font-display text-3xl uppercase">{offer.code}</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{offer.copy}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(homepage?.testimonials ?? []).length > 0 && (
        <section className="py-8">
          <SectionHeading eyebrow="Rider proof" title="Trusted on real rides" />
          <div className="container-x grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {homepage!.testimonials.map((testimonial) => (
              <article key={testimonial.name + testimonial.body.slice(0, 12)} className="cinematic-panel p-5">
                <div className="flex gap-1 text-accent-primary">
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} size={16} fill="#C97D3A" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-text-secondary">&ldquo;{testimonial.body}&rdquo;</p>
                <p className="mt-4 text-xs font-black uppercase">{testimonial.name}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="container-x mb-8 border border-border-primary bg-radial-ember p-5 md:p-8">
        <ShieldCheck className="text-accent-primary" size={34} />
        <h2 className="tactical-title mt-4 text-5xl uppercase">Not just gear. It&apos;s a mindset.</h2>
        <p className="mt-3 max-w-2xl leading-7 text-text-secondary">Join the OUTRAN crew for founder drops, field stories, and early access to rugged motorcycle systems.</p>
      </section>
    </main>
  );
}
