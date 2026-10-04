import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...props }: Props) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-fg-body mb-1 block text-xs font-medium"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        className={`bg-surface-muted w-full rounded-lg border p-2.5 text-base focus:ring-2 focus:outline-none sm:text-xs ${
          error
            ? "border-danger focus:ring-danger"
            : "border-line focus:ring-ring"
        }`}
        {...props}
      />
      {error && <p className="text-danger mt-1 text-[11px]">{error}</p>}
    </div>
  );
}
