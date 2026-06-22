import Link from "next/link";
import Image from "next/image";
import { Bike, Play, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { CinematicHero } from "@/components/cinematic-hero";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { TrustBand } from "@/components/trust-band";
import { CrewSignupForm } from "@/components/crew-signup-form";
import { getHomepage } from "@/lib/api";

export default async function HomePage() {
  let homepage;
  try {
    homepage = await getHomepage();
  } catch {
    return (
      <main className="container-x flex min-h-[60vh] flex-col justify-center pt-24">
        <p className="text-sm font-black uppercase tracking-[.18em] text-accent-primary">OUTRAN Storefront</p>
        <h1 className="tactical-title mt-3 text-5xl uppercase">Backend unavailable</h1>
        <p className="mt-3 max-w-xl text-text-secondary">Start the API server to load products, compatibility, and homepage content.</p>
      </main>
    );
  }
  const { hero, featured_products: featured, compatibility_highlights: compatibility, offers, testimonials } = homepage;
  const bikeImages: Record<string, string> = {
    "Royal Enfield Himalayan 450": "/assets/feature-quick-lock.png",
    "Royal Enfield Himalayan 411": "/assets/feature-waterproof.png",
    "Royal Enfield Scram 411": "/assets/feature-terrain-fit.png",
  };

  return (
    <main>
      <CinematicHero
        eyebrow="Premium accessories"
        title="Built for the"
        highlight="ride beyond"
        copy="High quality tank covers and accessories for Royal Enfield riders."
        image="/assets/Hero.png"
        home
        footer={<TrustBand variant="hero" />}
      >
        <Link href={hero.cta_href} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-accent-primary px-5 py-3 text-sm font-black uppercase tracking-[.04em] text-bg-primary shadow-glow transition hover:-translate-y-0.5 hover:bg-accent-hover sm:w-auto">
          <ShoppingBag size={16} /> Shop now
        </Link>
        <Link href="/products" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-white/60 bg-black/18 px-5 py-3 text-sm font-black uppercase tracking-[.04em] text-text-primary backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-accent-primary hover:text-accent-primary sm:w-auto">
          <Bike size={16} /> Choose your bike
        </Link>
      </CinematicHero>

      <section className="scroll-reveal border-y border-border-primary py-8 md:py-10">
        <div className="container-x">
          <SectionHeading
            eyebrow="Compatibility"
            title={compatibility.title}
            copy={compatibility.copy}
          />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {compatibility.bike_models.map((bike) => (
              <Link
                key={bike.slug}
                href={`/products?bike_model=${encodeURIComponent(bike.name)}`}
                className="group relative min-h-56 overflow-hidden rounded-md border border-border-primary transition hover:border-accent-primary"
              >
                <Image src={bikeImages[bike.name] ?? "/assets/Hero.png"} alt={bike.name} fill className="object-cover transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="font-display text-3xl uppercase leading-none">{bike.name.replace("Royal Enfield ", "")}</p>
                  <p className="mt-2 text-sm text-text-secondary">Shop tank covers built for this model</p>
                  <p className="mt-3 text-xs font-black uppercase text-accent-primary group-hover:underline">Browse compatible gear</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="scroll-reveal py-8 md:py-12">
          <SectionHeading eyebrow="Featured" title="Trail-proven tank covers" copy="All models loaded live from the OUTRAN catalog." />
          <div className="container-x grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="container-x scroll-reveal grid gap-5 py-8 md:grid-cols-[1.1fr_.9fr] md:py-12">
        <div className="relative min-h-72 overflow-hidden rounded-md border border-border-primary bg-black/45">
          <Image src="/assets/story-rain-tested.png" alt="OUTRAN tank cover video preview" fill className="object-cover opacity-70" />
          <div className="absolute inset-0 grid place-items-center bg-black/35">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-primary text-bg-primary shadow-glow">
              <Play size={24} fill="currentColor" />
            </div>
          </div>
        </div>
        <div className="rounded-md border border-border-primary bg-black/24 p-5 md:p-7">
          <p className="text-xs font-black uppercase tracking-[.16em] text-accent-primary">Video ready</p>
          <h2 className="tactical-title mt-2 text-3xl uppercase md:text-5xl">Add your tank cover video here</h2>
          <p className="mt-3 text-sm leading-7 text-text-secondary">Use this space for install clips, rain tests, fit demos, and real bike walkarounds.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-black uppercase text-accent-primary">
            <span className="rounded border border-border-primary px-3 py-2">Install demo</span>
            <span className="rounded border border-border-primary px-3 py-2">Waterproof test</span>
            <span className="rounded border border-border-primary px-3 py-2">Ride proof</span>
          </div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="container-x scroll-reveal border-y border-border-primary py-8 md:py-10">
          <div className="grid gap-px overflow-hidden rounded-md border border-border-primary bg-border-primary md:grid-cols-3">
            {offers.map((offer) => (
              <Link key={offer.code} href={offer.cta_href} className="bg-bg-primary p-5 transition hover:bg-surface-card">
                <p className="text-xs font-black uppercase tracking-[.18em] text-accent-primary">{offer.title}</p>
                <p className="mt-3 font-display text-2xl uppercase">{offer.code}</p>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{offer.copy}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="scroll-reveal py-8 md:py-12">
          <SectionHeading eyebrow="Rider proof" title="Trusted on real rides" />
          <div className="container-x grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
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

      <section className="container-x scroll-reveal mb-10 rounded-md border border-border-primary bg-radial-ember p-5 sm:p-6 md:p-8">
        <ShieldCheck className="text-accent-primary" size={30} />
        <h2 className="tactical-title mt-4 text-3xl uppercase sm:text-4xl">Join the OUTRAN crew</h2>
        <p className="mt-3 max-w-2xl leading-7 text-text-secondary">Drop your number for ride updates, new product videos, and early access to rugged motorcycle systems.</p>
        <CrewSignupForm />
      </section>
    </main>
  );
}
