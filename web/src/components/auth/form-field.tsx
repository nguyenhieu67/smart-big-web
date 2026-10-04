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
        className="mb-1 block text-xs font-medium text-slate-700"
      >
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        className={`w-full rounded-lg border bg-slate-50 p-2.5 text-xs focus:ring-2 focus:outline-none ${
          error
            ? "border-rose-400 focus:ring-rose-400"
            : "border-slate-200 focus:ring-pink-500"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
