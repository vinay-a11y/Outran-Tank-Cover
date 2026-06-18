export function SectionHeading({ eyebrow, title, copy }: { eyebrow?: string; title: string; copy?: string }) {
  return (
    <div className="container-x mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-black uppercase tracking-[.18em] text-accent-primary">{eyebrow}</p>}
        <h2 className="tactical-title text-4xl uppercase md:text-6xl">{title}</h2>
      </div>
      {copy && <p className="max-w-md text-sm leading-6 text-text-secondary">{copy}</p>}
    </div>
  );
}
