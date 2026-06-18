import Image from "next/image";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  highlight?: string;
  copy: string;
  image: string;
  children?: ReactNode;
  compact?: boolean;
};

export function CinematicHero({ eyebrow, title, highlight, copy, image, children, compact }: Props) {
  return (
    <section className={cn("hero-photo-section relative overflow-hidden pt-16", compact && "hero-photo-section--compact")}>
      <div className="image-vignette absolute inset-x-0 top-16 h-[46vw] bg-black">
        <Image src={image} alt="" fill priority className="object-contain object-center" sizes="100vw" />
      </div>
      <div className={cn("container-x hero-photo-content relative z-10 flex items-center", compact && "hero-photo-content--compact")}>
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-black uppercase tracking-[.18em] text-accent-primary">{eyebrow}</p>
          <h1 className="tactical-title text-[clamp(2.8rem,5.8vw,6rem)] uppercase text-text-primary">
            {title} {highlight && <span className="orange-text">{highlight}</span>}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-text-primary/85 md:text-lg md:leading-8">{copy}</p>
          {children && <div className="mt-6 flex flex-wrap gap-4">{children}</div>}
        </div>
      </div>
    </section>
  );
}
