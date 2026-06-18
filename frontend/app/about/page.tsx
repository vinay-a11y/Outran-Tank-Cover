import Image from "next/image";
import { StaticPage } from "@/components/static-page";

export default function AboutPage() {
  return (
    <StaticPage eyebrow="About OUTRAN" title="Riders first. Gear second.">
      <p>OUTRAN builds tactical motorcycle systems for ADV riders who expect their gear to survive rain, dust, heat, and bad roads without looking like a normal accessory store product.</p>
      <div className="relative aspect-[16/8] overflow-hidden border border-border-primary">
        <Image src="/assets/checkout-page.jpeg" alt="OUTRAN riders testing in the wild" fill className="object-cover" />
      </div>
      <p>Every product starts with field use: fuel stop access, zero wobble mounting, waterproof textile choices, and simple repairable hardware. The Himalayan 450 tank cover is the first system in that larger OUTRAN ecosystem.</p>
    </StaticPage>
  );
}
