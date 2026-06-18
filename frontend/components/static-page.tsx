import { CinematicHero } from "@/components/cinematic-hero";

export function StaticPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <main>
      <CinematicHero eyebrow={eyebrow} title={title} copy="Built for the ride beyond roads." image="/assets/hero-page.png" compact />
      <section className="container-x prose prose-invert max-w-4xl py-10 text-text-secondary">
        <div className="grid gap-5 text-base leading-7">{children}</div>
      </section>
    </main>
  );
}
