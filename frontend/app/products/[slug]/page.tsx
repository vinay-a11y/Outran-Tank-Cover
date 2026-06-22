import { ProductPageClient } from "@/components/product-page-client";
import { ProductGallery } from "@/components/product-gallery";
import { getProduct, getProducts } from "@/lib/api";
import { productFeatures, specs } from "@/lib/data";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  const detailSpecs = product.specs?.length ? product.specs.map((item) => [item.label, item.value] as const) : specs;
  const detailFeatures = product.features?.length ? product.features.map((item) => [item.title, item.copy] as const) : productFeatures;

  return (
    <main className="pt-20">
      <section className="container-x pb-10">
        <ProductPageClient product={product} />
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
            <p className="mt-4 leading-7 text-text-secondary">{product.full_description || product.description}</p>
          </div>
          <div className="overflow-hidden">
            <ProductGallery images={product.gallery.slice(1)} alt="OUTRAN tank cover detail" />
          </div>
        </div>
        <div className="cinematic-panel p-5">
          <h2 className="font-display text-3xl uppercase">Specifications</h2>
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
