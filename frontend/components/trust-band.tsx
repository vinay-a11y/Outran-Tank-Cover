import { trustItems } from "@/lib/data";

export function TrustBand() {
  return (
    <section className="border-y border-border-primary bg-black/25">
      <div className="container-x grid gap-0 md:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item.title} className="border-b border-border-primary py-4 md:border-b-0 md:border-r md:px-5">
            <item.icon className="mb-3 text-text-primary" size={26} />
            <h3 className="text-sm font-black uppercase">{item.title}</h3>
            <p className="mt-1.5 text-sm leading-6 text-text-secondary">{item.copy}</p>
            <p className="mt-2 text-xs font-black uppercase text-accent-primary">Explore -</p>
          </div>
        ))}
      </div>
    </section>
  );
}
