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
  home?: boolean;
  footer?: ReactNode;
};

export function CinematicHero({ eyebrow, title, highlight, copy, image, children, compact, home, footer }: Props) {
  return (
    <section className={cn("hero-photo-section relative overflow-hidden", home ? "hero-photo-section--home" : "pt-20", compact && "hero-photo-section--compact")}>
      <div className="image-vignette absolute inset-x-0 top-0 h-full bg-black">
        <Image
          src={image}
          alt=""
          fill
          priority
        className={cn("object-cover", home ? "object-[66%_center]" : "object-center", !home && !compact && "md:object-contain")}
          sizes="100vw"
        />
      </div>
      <div className={cn("container-x hero-photo-content relative z-10 flex items-center", home && "hero-photo-content--home", compact && "hero-photo-content--compact")}>
        <div className="max-w-3xl">
          <p className="mb-3 flex items-center gap-3 text-xs font-black uppercase tracking-[.18em] text-accent-primary md:text-sm">
            {eyebrow}
            {home && <span className="h-px w-14 bg-accent-primary" />}
          </p>
          <h1 className={cn("tactical-title uppercase text-text-primary drop-shadow-[0_5px_24px_rgba(0,0,0,.55)]", home ? "text-[clamp(2.85rem,5.15vw,5.65rem)]" : "text-[clamp(2.4rem,4.8vw,5.1rem)]")}>
            {title}
            {highlight && (
              <>
                {" "}
                <span className={cn("orange-text", home && "block")}>{highlight}</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-text-primary/90 md:text-base">{copy}</p>
          {children && <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{children}</div>}
        </div>
      </div>
      {footer && <div className="container-x hero-photo-footer relative z-10">{footer}</div>}
    </section>
  );
}
