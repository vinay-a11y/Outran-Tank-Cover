import { Mail, MapPin, Phone } from "lucide-react";
import type { ElementType } from "react";
import { StaticPage } from "@/components/static-page";

export default function ContactPage() {
  const contactItems: Array<[string, string, ElementType]> = [
    ["Email", "support@outran.in", Mail],
    ["Phone", "+91 98765 43210", Phone],
    ["Base", "Bangalore, India", MapPin]
  ];

  return (
    <StaticPage eyebrow="Contact" title="Talk to the crew.">
      <div className="grid gap-4 md:grid-cols-3">
        {contactItems.map(([label, value, Icon]) => (
          <div key={label} className="border border-border-primary p-6">
            <Icon className="text-accent-primary" />
            <p className="mt-5 font-black uppercase text-text-primary">{label}</p>
            <p>{value}</p>
          </div>
        ))}
      </div>
      <form className="grid gap-4">
        <input className="border border-border-primary bg-black/30 p-4 outline-none" placeholder="Name" />
        <input className="border border-border-primary bg-black/30 p-4 outline-none" placeholder="Email" />
        <textarea className="min-h-36 border border-border-primary bg-black/30 p-4 outline-none" placeholder="Message" />
        <button className="w-max bg-accent-primary px-7 py-4 font-black uppercase text-bg-primary" type="button">Send message</button>
      </form>
    </StaticPage>
  );
}
