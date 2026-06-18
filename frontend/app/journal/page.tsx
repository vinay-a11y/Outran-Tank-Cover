import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";
import { products } from "@/lib/data";

export default function JournalPage() {
  return (
    <main className="pt-28">
      <SectionHeading
        eyebrow="Journal"
        title="Field notes from beyond roads"
        copy="Build logs, rider stories, waterproof testing, and Himalayan 450 setup guides."
      />

      <section className="container-x grid gap-6 pb-16 md:grid-cols-3">
        {[
          "How we tested zero tank wobble",
          "Rain-proofing the Himalayan 450",
          "The founder edition story",
        ].map((title, index) => (
          <article
            key={title}
            className="border border-border-primary bg-surface-card/60"
          >
            <div className="relative aspect-[4/3]">
  <Image
    src={products[0]?.gallery?.[index] || products[0]?.image}
    alt={title}
    fill
    className="object-cover"
  />
</div>

            <div className="p-5">
              <p className="text-xs font-black uppercase text-accent-primary">
                OUTRAN Journal
              </p>

              <h2 className="mt-3 font-display text-4xl uppercase">
                {title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">
                A cinematic field note from the riders building and breaking
                OUTRAN gear before launch.
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}