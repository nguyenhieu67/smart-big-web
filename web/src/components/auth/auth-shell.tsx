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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-2xl text-white shadow-lg shadow-pink-500/30">
            🐷
          </div>
          <h1 className="text-xl font-bold text-slate-800">
            SmartPig{" "}
            <span className="ml-1 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-semibold text-pink-600">
              PRO
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Hệ thống quản lý chăn nuôi heo toàn diện
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <p className="mt-1 mb-5 text-xs text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
