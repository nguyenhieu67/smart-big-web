export interface FormGroupProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

export const SIZE_STYLES = {
  sm: "py-1.5 text-base sm:text-xs",
  md: "py-2.5 text-base sm:text-sm",
};

export type FieldSize = keyof typeof SIZE_STYLES;

export function FormGroup({ label, htmlFor, error, children }: FormGroupProps) {
  return (
    <div>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-fg-body mb-1 block text-sm font-semibold"
        >
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-danger mt-1 text-xs">{error}</p>}
    </div>
  );
}
