import Link from "next/link";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "outline"
  | "text"
  | "gradient"
  | "success"
  | "info";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  href?: string;
  variant?: Variant;
  size?: Size;
  rounded?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-surface-hover text-fg-body hover:bg-line",
  danger: "bg-danger text-white hover:opacity-90",
  outline: "border border-primary text-primary hover:bg-primary-soft",
  text: "text-primary hover:underline",
  gradient: "bg-brand-gradient text-white hover:opacity-90",
  success: "bg-success text-white hover:opacity-90",
  info: "bg-info text-white hover:opacity-90",
};

const SIZE_STYLES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  rounded = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center gap-2 font-medium transition-colors",
    VARIANT_STYLES[variant],
    variant !== "text" && SIZE_STYLES[size],
    rounded ? "rounded-full" : "rounded-md",
    fullWidth && "w-full",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {leftIcon}
      {children && <span>{children}</span>}
      {rightIcon}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...props}>
      {content}
    </button>
  );
}
