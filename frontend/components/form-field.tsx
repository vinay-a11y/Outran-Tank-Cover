import type { ElementType } from "react";

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ElementType;
  type?: string;
};

export function FormField({ label, value, onChange, icon: Icon, type = "text" }: FormFieldProps) {
  return (
    <label className="block rounded-md border border-border-primary bg-black/15 px-4 py-3 focus-within:border-accent-primary">
      <span className="mb-2 block text-xs font-black uppercase text-text-secondary">{label}</span>
      <span className="flex items-center justify-between gap-3">
        <input
          type={type}
          className="min-w-0 flex-1 bg-transparent outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {Icon && <Icon size={18} className="text-text-secondary" />}
      </span>
    </label>
  );
}
