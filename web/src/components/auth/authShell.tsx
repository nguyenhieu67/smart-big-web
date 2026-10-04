export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-page flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="bg-brand-gradient shadow-primary/30 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl text-white shadow-lg">
            🐷
          </div>
          <h1 className="text-fg text-xl font-bold">
            SmartPig{" "}
            <span className="bg-primary-soft text-primary ml-1 rounded-full px-2 py-0.5 text-xs font-semibold">
              PRO
            </span>
          </h1>
          <p className="text-fg-muted mt-1 text-xs">
            Hệ thống quản lý chăn nuôi heo toàn diện
          </p>
        </div>

        <div className="border-line bg-surface rounded-2xl border p-6 shadow-sm">
          <h2 className="text-fg text-base font-bold">{title}</h2>
          <p className="text-fg-muted mt-1 mb-5 text-xs">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
