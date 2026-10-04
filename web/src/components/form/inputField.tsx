import { FormGroup, SIZE_STYLES, type FieldSize } from "./formGroup";

export interface InputFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  size?: FieldSize;
  ref?: React.Ref<HTMLInputElement>;
}

export function InputField({
  label,
  icon,
  id,
  error,
  size = "md",
  className = "",
  ...props
}: InputFieldProps) {
  const borderStyles = error
    ? "border-danger focus:border-danger focus:ring-danger"
    : "border-line focus:border-ring focus:ring-ring";

  return (
    <FormGroup label={label} htmlFor={id} error={error}>
      <div className="relative">
        {icon && (
          <div className="text-fg-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {icon}
          </div>
        )}
        <input
          id={id}
          aria-invalid={!!error}
          className={`block w-full ${
            icon ? "pl-10" : "px-3"
          } bg-surface text-fg placeholder:text-fg-subtle rounded-xl border pr-3 transition-colors focus:ring-1 focus:outline-none ${SIZE_STYLES[size]} ${borderStyles} ${className}`}
          {...props}
        />
      </div>
    </FormGroup>
  );
}
