const SIZE_MAP = {
  "2xs": 12,
  xs: 14,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  "2xl": 48,
};

export type IconSize = keyof typeof SIZE_MAP | number;

export interface BaseIconProps extends React.SVGProps<SVGSVGElement> {
  size?: IconSize;
}

export const BaseIcon = ({
  size = "md",
  children,
  viewBox = "0 0 640 640",
  ...props
}: BaseIconProps) => {
  const pixelSize =
    typeof size === "number" ? size : (SIZE_MAP[size] ?? SIZE_MAP.md);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={pixelSize}
      width={pixelSize}
      viewBox={viewBox}
      fill="currentColor"
      {...props}
    >
      {children}
    </svg>
  );
};
