"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ZoomIn } from "lucide-react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const gallery = useMemo(() => (images.length ? images : ["/assets/feature-quick-lock.png"]), [images]);
  const [active, setActive] = useState(gallery[0]);

  useEffect(() => {
    setActive(gallery[0]);
  }, [gallery]);

  return (
    <div className="grid gap-3">
      <div className="relative aspect-[16/10] overflow-hidden border border-border-primary bg-black">
        <Image src={active} alt={alt} fill priority className="object-contain p-2" sizes="(max-width: 1024px) 100vw, 58vw" />
        <div className="absolute left-4 top-4 border border-accent-primary/70 bg-black/60 px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-accent-primary">
          Product view
        </div>
        <button aria-label="Zoom image" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/45">
          <ZoomIn size={18} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {gallery.map((image, index) => (
          <button
            key={`${image}-${index}`}
            onClick={() => setActive(image)}
            className={`relative aspect-[4/3] overflow-hidden border bg-black ${active === image ? "border-accent-primary" : "border-border-primary"}`}
            aria-label={`Show product image ${index + 1}`}
          >
            <Image src={image} alt="" fill className="object-cover" sizes="25vw" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductGallerySwitcher({
  variants,
  selectedVariantId,
  onVariantChange,
  alt,
}: {
  variants: Array<{ id: number; color: string; images: Array<{ url: string }> }>;
  selectedVariantId: number;
  onVariantChange: (variantId: number) => void;
  alt: string;
}) {
  const selected = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const gallery = selected?.images?.map((image) => image.url) ?? [];

  return (
    <div className="grid gap-4">
      <ProductGallery images={gallery} alt={alt} />
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => onVariantChange(variant.id)}
            className={`border px-3 py-1.5 text-[10px] font-black uppercase ${
              selectedVariantId === variant.id ? "border-accent-primary text-accent-primary" : "border-border-primary"
            }`}
          >
            {variant.color}
          </button>
        ))}
      </div>
    </div>
  );
}
