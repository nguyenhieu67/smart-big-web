export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="border-danger-line bg-danger-soft text-danger-fg rounded-lg border p-2.5 text-xs"
    >
      {children}
    </div>
  );
}
