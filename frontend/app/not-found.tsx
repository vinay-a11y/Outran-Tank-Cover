import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CinematicHero } from "@/components/cinematic-hero";

export default function NotFound() {
  return (
    <main>
      <CinematicHero
        eyebrow="404"
        title="Trail Lost."
        highlight="Re-route."
        copy="The page you are looking for moved off the map."
        image="/assets/hero-page.png"
        compact
      >
        <Link className="inline-flex items-center gap-3 bg-accent-primary px-6 py-3.5 text-sm font-black uppercase text-bg-primary" href="/">
          Back home <ArrowRight size={17} />
        </Link>
      </CinematicHero>
    </main>
  );
}
