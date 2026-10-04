export interface CheckboxFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children: React.ReactNode;
}

export function CheckboxField({
  id,
  children,
  className = "",
  ...props
}: CheckboxFieldProps) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        className={`border-line bg-surface text-primary focus:ring-ring h-4 w-4 cursor-pointer rounded ${className}`}
        {...props}
      />
      <label
        htmlFor={id}
        className="text-fg-body ml-2 block cursor-pointer text-sm"
      >
        {children}
      </label>
    </div>
  );
}
