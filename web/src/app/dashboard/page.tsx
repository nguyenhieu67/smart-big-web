"use client";

import { useAuth } from "@/providers/auth-provider";

export default function Dashboard() {
  const { user, farms, activeFarm, setActiveFarm, logout, loading } = useAuth();

  if (loading)
    return <div className="p-6 text-xs text-slate-500">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <header className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-base font-bold text-slate-800">Dashboard</h1>
          <p className="text-xs text-slate-500">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activeFarm?.id ?? ""}
            onChange={(e) => setActiveFarm(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <button
            onClick={logout}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Đăng xuất
          </button>
        </div>
      </header>
    </div>
  );
}
