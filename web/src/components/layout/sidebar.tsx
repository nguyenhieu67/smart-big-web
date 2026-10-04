"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DiagramProjectIcon } from "@/components/icons";
import { useAuth } from "@/providers/authProvider";
import type { FarmRole } from "@/types/auth";

import { NAV_GROUPS } from "./navigation";

const ROLE_LABELS: Record<FarmRole, string> = {
  OWNER: "Chủ trại",
  MANAGER: "Quản lý",
  STAFF: "Nhân viên",
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { activeFarm } = useAuth();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {open && (
        <div
          className="bg-overlay fixed inset-0 top-16 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`bg-shell border-shell-line fixed top-16 bottom-0 left-0 z-40 flex w-64 max-w-[85vw] shrink-0 flex-col border-r transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-shell-deep/60 border-shell-line/80 border-b p-3">
          <div className="mb-1 flex items-center text-[11px] font-bold tracking-wider text-pink-400 uppercase">
            <DiagramProjectIcon size="2xs" className="mr-1.5" />
            Luồng Sản Xuất
          </div>
          <p className="text-shell-fg-muted text-[11px]">
            Nái → Phối → Mang thai → Đẻ → Cai sữa → Bán
          </p>
        </div>

        <nav className="custom-scrollbar text-shell-fg flex-1 space-y-1 overflow-y-auto p-2 text-xs">
          {NAV_GROUPS.map((group, index) => (
            <div key={group.title}>
              <div
                className={`text-shell-fg-muted px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase ${
                  index > 0 ? "mt-2" : ""
                }`}
              >
                {group.title}
              </div>
              {group.items.map(({ href, label, icon: Icon, iconColor }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center space-x-2.5 rounded-lg px-3 py-2.5 text-left transition-all ${
                      active
                        ? "nav-active"
                        : "hover:bg-shell-hover hover:text-white"
                    }`}
                  >
                    <Icon
                      size="sm"
                      className={`w-5 shrink-0 ${active ? "" : iconColor}`}
                    />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="bg-shell-deep/80 border-shell-line text-shell-fg-muted flex items-center justify-between border-t p-3 text-[11px]">
          <div className="min-w-0">
            <p className="text-shell-fg truncate font-medium">
              {activeFarm?.name ?? "Chưa chọn trang trại"}
            </p>
            {activeFarm && (
              <p className="text-[10px]">{ROLE_LABELS[activeFarm.role]}</p>
            )}
          </div>
          <div className="bg-success h-2 w-2 shrink-0 animate-pulse rounded-full" />
        </div>
      </aside>
    </>
  );
}
