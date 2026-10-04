interface StatusBadgeProps {
  label: string;
  color?: string;
}

export function StatusBadge({ label, color }: StatusBadgeProps) {
  if (!color) return <span>{label}</span>;

  return (
    <span
      className="rounded-full px-2.5 py-1 font-semibold"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}
