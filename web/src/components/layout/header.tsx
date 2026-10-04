"use client";

import Link from "next/link";

import {
  BarsIcon,
  BellIcon,
  PiggyBankIcon,
  RightToBracketIcon,
} from "@/components/icons";
import { useAuth } from "@/providers/authProvider";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, farms, activeFarm, setActiveFarm, logout } = useAuth();

  return (
    <header className="bg-shell border-shell-line z-50 flex h-16 shrink-0 items-center justify-between border-b px-4 text-white lg:px-6">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Mở menu"
          className="text-shell-fg cursor-pointer p-1 hover:text-white lg:hidden"
        >
          <BarsIcon size="md" />
        </button>

        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="bg-brand-gradient shadow-primary/30 flex items-center justify-center rounded-xl p-2 text-white shadow-lg">
            <PiggyBankIcon size="md" />
          </div>
          <div className="hidden sm:block">
            <h1 className="flex items-center text-lg leading-tight font-bold tracking-tight">
              SmartPig
              <span className="ml-2 rounded-full border border-pink-500/30 bg-pink-500/20 px-2 py-0.5 text-xs font-semibold text-pink-300">
                PRO
              </span>
            </h1>
            <p className="text-shell-fg-muted hidden text-xs sm:block">
              Hệ Thống Quản Lý Chăn Nuôi Heo Nái &amp; Thịt Toàn Diện
            </p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        {farms.length > 0 && (
          <select
            value={activeFarm?.id ?? ""}
            onChange={(e) => setActiveFarm(e.target.value)}
            aria-label="Chọn trang trại"
            className="bg-shell-input border-shell-line max-w-32 cursor-pointer truncate rounded-lg border px-3 py-2 text-xs text-white focus:outline-none sm:max-w-56"
          >
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
        )}

        <Link
          href="/calendar"
          aria-label="Cảnh báo việc cần làm"
          className="text-shell-fg hover:bg-shell-hover rounded-lg p-2 transition-colors hover:text-white"
        >
          <BellIcon size="md" />
        </Link>

        <div className="border-shell-line flex items-center space-x-1 border-l pl-2 sm:space-x-2 sm:pl-3">
          <span className="text-shell-fg hidden max-w-48 truncate text-xs md:block">
            {user?.email}
          </span>
          <button
            type="button"
            onClick={logout}
            aria-label="Đăng xuất"
            title="Đăng xuất"
            className="text-shell-fg hover:bg-shell-hover cursor-pointer rounded-lg p-2 transition-colors hover:text-white"
          >
            <RightToBracketIcon size="sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
