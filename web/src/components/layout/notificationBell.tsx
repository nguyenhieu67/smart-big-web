"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { BellIcon } from "@/components/icons";
import { useClickOutside } from "@/hooks";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationTone } from "@/utils/notifications";

const DOT: Record<NotificationTone, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  info: "bg-info",
};

// Link có query (mở sẵn form / chi tiết): thêm dấu thời gian để bấm lại cùng một thông báo vẫn mở lại được
const withNonce = (href: string) =>
  href.includes("?") ? `${href}&t=${Date.now()}` : href;

interface NotificationBellProps {
  farmId: string | undefined;
}

// Chuông thông báo: số ở góc là số thông báo chưa đọc, bấm mở danh sách, bấm vào từng thông báo để tới trang chi tiết
export function NotificationBell({ farmId }: NotificationBellProps) {
  const router = useRouter();
  const { isOpen, setIsOpen, ref } = useClickOutside<HTMLDivElement>();
  const { items, readKeys, unreadCount, markRead, markAllRead } =
    useNotifications(farmId);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={
          unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"
        }
        aria-expanded={isOpen}
        className="text-shell-fg hover:bg-shell-hover relative cursor-pointer rounded-lg p-2 transition-colors hover:text-white"
      >
        <BellIcon size="md" />
        {unreadCount > 0 && (
          <span className="bg-danger absolute top-0 right-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="bg-surface border-line shadow-pop text-fg fixed top-16 right-3 left-3 z-50 overflow-hidden rounded-2xl border sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-2 sm:w-96">
          <div className="border-line-soft flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-bold">
              Thông báo
              {unreadCount > 0 && (
                <span className="text-fg-muted ml-1.5 text-xs font-medium">
                  ({unreadCount} chưa đọc)
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-primary cursor-pointer text-xs font-semibold hover:underline"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          <ul className="divide-line-soft max-h-[60vh] divide-y overflow-y-auto">
            {items.length === 0 ? (
              <li className="text-fg-muted px-4 py-8 text-center text-sm">
                Không có thông báo nào.
              </li>
            ) : (
              items.map((item) => {
                const unread = !readKeys.has(item.key);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        markRead(item.key);
                        setIsOpen(false);
                        router.push(withNonce(item.href));
                      }}
                      className={`hover:bg-surface-hover flex gap-3 px-4 py-3 transition-colors ${
                        unread ? "bg-primary-soft/40" : ""
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? DOT[item.tone] : "bg-line"}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-sm ${unread ? "font-bold" : "font-medium"}`}
                        >
                          {item.title}
                        </span>
                        <span className="text-fg-muted mt-0.5 block text-xs">
                          {item.detail}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>

          <Link
            href="/calendar"
            onClick={() => setIsOpen(false)}
            className="text-primary border-line-soft block border-t px-4 py-2.5 text-center text-xs font-semibold hover:underline"
          >
            Xem lịch & cảnh báo
          </Link>
        </div>
      )}
    </div>
  );
}
