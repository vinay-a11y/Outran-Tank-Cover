import { Star } from "lucide-react";
import { AddToCartActions } from "@/components/add-to-cart-actions";
import { ProductGallery } from "@/components/product-gallery";
import { getProduct } from "@/lib/api";
import { productFeatures, specs, tankCoverProduct } from "@/lib/data";
import { formatINR } from "@/lib/utils";

export function generateStaticParams() {
  return [{ slug: tankCoverProduct.slug }];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const detailSpecs = product.specs?.length ? product.specs.map((item) => [item.label, item.value] as const) : specs;
  const detailFeatures = product.features?.length ? product.features.map((item) => [item.title, item.copy] as const) : productFeatures;

  return (
    <main className="pt-20">
      <section className="container-x grid gap-8 pb-10 lg:grid-cols-[1.18fr_.82fr]">
        <div>
          <p className="mb-4 text-xs uppercase text-text-secondary">Home / Shop / {product.category} / {product.name}</p>
          <ProductGallery images={product.gallery} alt={product.name} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-max">
          <p className="mb-3 inline-flex border border-accent-primary/60 px-3 py-1 text-xs font-black uppercase tracking-[.16em] text-badge-founder">{product.badge}</p>
          <h1 className="tactical-title text-5xl uppercase md:text-6xl">{product.name}</h1>
          <p className="font-display text-3xl uppercase text-text-primary/80">{product.subtitle}</p>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-4xl font-black text-accent-primary">{formatINR(product.price)}</p>
            {product.compareAt && <p className="pb-1 text-lg text-text-secondary line-through">{formatINR(product.compareAt)}</p>}
          </div>
          <p className="mt-2 text-sm text-text-secondary">Inclusive of all taxes. Free shipping on prepaid orders.</p>
          <div className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
            {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={17} fill="#C97D3A" className="text-accent-primary" />)}
            <span className="ml-2">{product.rating} ({product.reviews} reviews)</span>
          </div>
          <p className="mt-5 leading-7 text-text-secondary">{product.description}</p>
          <div className="mt-5 border-y border-border-primary py-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[.16em]">Color options</p>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <button key={color.sku} className="flex items-center gap-2 border border-border-primary px-3 py-2 text-xs font-black uppercase">
                  <span className="h-5 w-5 rounded-full border border-white/70" style={{ backgroundColor: color.value }} />
                  {color.name}
                </button>
              ))}
            </div>
          </div>
          <AddToCartActions product={{
            id: product.id,
            name: product.name,
            subtitle: product.subtitle,
            price: product.price,
            image: product.image,
            color: product.color,
            material: product.material
          }} />
        </aside>
      </section>

      <section className="container-x grid gap-5 border-y border-border-primary py-6 md:grid-cols-3 lg:grid-cols-6">
        {detailFeatures.map(([title, copy]) => (
          <div key={title} className="border-r border-border-primary pr-5 last:border-r-0">
            <p className="font-black uppercase">{title}</p>
            <p className="mt-2 text-xs leading-5 text-text-secondary">{copy}</p>
          </div>
        ))}
      </section>

      <section className="container-x grid gap-5 py-10 lg:grid-cols-[1fr_.75fr]">
        <div className="cinematic-panel grid gap-5 p-5 md:grid-cols-[.6fr_1fr]">
          <div>
            <h2 className="tactical-title text-4xl uppercase">Built by riders. Tested in the wild.</h2>
            <p className="mt-4 leading-7 text-text-secondary">Every OUTRAN tank cover goes through rough-road checks, rain exposure, and tank-fit testing before it reaches a rider.</p>
          </div>
          <div className="overflow-hidden">
            <ProductGallery images={product.gallery.slice(1)} alt="OUTRAN tank cover detail" />
          </div>
        </div>
        <div className="cinematic-panel p-5">
          <h2 className="font-display text-3xl uppercase">Product details</h2>
          <div className="mt-4">
            {detailSpecs.map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 border-b border-border-primary py-3 text-sm">
                <span className="text-text-secondary">{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
