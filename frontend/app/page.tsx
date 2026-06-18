import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, ShieldCheck } from "lucide-react";
import { CinematicHero } from "@/components/cinematic-hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { TrustBand } from "@/components/trust-band";
import { featureImages, products, riderStories, storyStats } from "@/lib/data";
import { getProducts } from "@/lib/api";
import { formatINR } from "@/lib/utils";

export default async function HomePage() {
  const backendProducts = await getProducts();
  const productList = backendProducts.length ? backendProducts : products;
  const heroProduct = productList[0];

  return (
    <main>
      <CinematicHero
        eyebrow="Terrain Core"
        title="Built for the ride"
        highlight="beyond roads."
        copy="Precision fit tank cover for Himalayan 450. Locked at any speed. Tested in the wild. Built for India."
        image="/assets/Hero.png"
      >
        <Link href="/products/terrain-core-tank-cover" className="inline-flex items-center gap-3 bg-accent-primary px-5 py-3 text-sm font-black uppercase text-bg-primary">
          Shop tank cover <ArrowRight size={18} />
        </Link>
        <button className="inline-flex items-center gap-3 border border-accent-primary/60 px-5 py-3 text-sm font-black uppercase text-text-primary">
          Watch film <Play size={17} />
        </button>
      </CinematicHero>

      <TrustBand />

      <section className="py-6">
        <div className="container-x grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[320px] overflow-hidden border border-border-primary">
            <FallbackImage src={featureImages[0].image} fallback={featureImages[0].fallback} alt={heroProduct.name} className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/60" />
            <div className="absolute bottom-0 left-0 max-w-xl p-5">
              <p className="text-xs font-black uppercase tracking-[.18em] text-accent-primary">Terrain Core</p>
              <h2 className="tactical-title mt-2 text-4xl uppercase md:text-5xl">Tank Cover</h2>
              <p className="font-display text-2xl uppercase text-text-primary/80">For Himalayan 450</p>
              <p className="mt-2 text-2xl font-black text-accent-primary">{formatINR(heroProduct.price)}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/products/terrain-core-tank-cover" className="bg-accent-primary px-5 py-2.5 text-sm font-black uppercase text-bg-primary">View details</Link>
                <Link href="/cart" className="border border-accent-primary/60 px-5 py-2.5 text-sm font-black uppercase">Add to cart</Link>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featureImages.slice(1).map((item) => (
              <div key={item.title} className="relative min-h-[152px] overflow-hidden border border-border-primary bg-black/30">
                <FallbackImage src={item.image} fallback={item.fallback} alt={item.title} className="object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/15" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="max-w-44 text-sm font-black uppercase tracking-[.12em]">{item.title}</p>
                  <p className="mt-2 max-w-56 text-xs leading-5 text-text-secondary">{item.copy}</p>
                </div>
              </div>
            ))}
            <div className="border border-border-primary bg-surface-card/55 p-4">
              <p className="text-xs font-black uppercase tracking-[.18em] text-accent-primary">Built for</p>
              <p className="tactical-title mt-2 text-4xl uppercase">The extremes</p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">Waterproof protection, quick locks, and trail-proof tank stability in one system.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border-primary py-8">
        <div className="container-x grid gap-6 lg:grid-cols-[.95fr_1fr_.45fr]">
          <div className="relative min-h-[300px] overflow-hidden">
            <Image src="/assets/checkout-page.jpeg" alt="Rider testing OUTRAN gear" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <button className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/60 bg-black/35">
              <Play />
            </button>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[.18em] text-accent-primary">Built by riders</p>
            <h2 className="tactical-title mt-3 text-5xl uppercase">Tested in the wild. Trusted by thousands.</h2>
            <p className="mt-4 leading-7 text-text-secondary">Every OUTRAN product goes through real-world testing across India&apos;s toughest terrains. We do not just make gear, we live it.</p>
            <Link href="/about" className="mt-5 text-sm font-black uppercase text-accent-primary">Our story -</Link>
          </div>
          <div className="grid gap-4">
            {storyStats.map(([value, label]) => (
              <div key={label} className="border border-border-primary p-4">
                <p className="font-display text-3xl uppercase text-text-primary">{value}</p>
                <p className="text-xs font-black uppercase text-text-secondary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <SectionHeading eyebrow="OUTRAN community" title="Real riders. Real stories." copy="Swipe-style field notes, mountain rides, tank closeups, and rider proof from the crew." />
        <div className="container-x grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {riderStories.map((story) => (
            <div key={story.title} className="group relative aspect-[4/3] overflow-hidden border border-border-primary">
              <FallbackImage src={story.image} fallback={story.fallback} alt={story.title} className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-80" />
              <p className="absolute bottom-3 left-3 text-xs font-black uppercase tracking-[.12em]">{story.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-8">
        <SectionHeading eyebrow="Recommended" title="Gear for the next trail" />
        <div className="container-x grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {productList.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="container-x mb-8 border border-border-primary bg-radial-ember p-5 md:p-8">
        <ShieldCheck className="text-accent-primary" size={34} />
        <h2 className="tactical-title mt-4 text-5xl uppercase">Not just gear. It&apos;s a mindset.</h2>
        <p className="mt-3 max-w-2xl leading-7 text-text-secondary">Join the OUTRAN crew for founder drops, field stories, and early access to rugged motorcycle systems.</p>
      </section>
    </main>
  );
}

function FallbackImage({ src, fallback, alt, className }: { src: string; fallback: string; alt: string; className?: string }) {
  return (
    <picture>
      <source srcSet={src} />
      <Image src={fallback} alt={alt} fill className={className} sizes="(max-width: 768px) 100vw, 33vw" />
    </picture>
  );
}
