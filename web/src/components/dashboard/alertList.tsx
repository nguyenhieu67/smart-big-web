import Link from "next/link";

import { REMINDER_TYPE_OPTIONS } from "@/constants/reminder";
import type { ReminderType } from "@/types/reminder";
import { daysUntil, type CalendarEvent } from "@/utils/calendar";
import { formatDate } from "@/utils/format";

const HREF: Record<ReminderType, string> = {
  FARROW: "/farrowings",
  VACCINE: "/health",
  WEAN: "/piglets",
  MATING_CHECK: "/matings",
  SALE: "/sales",
};

function relative(date: string) {
  const days = daysUntil(date);
  if (days < 0) return { text: `Quá ${-days} ngày`, tone: "text-danger" };
  if (days === 0) return { text: "Hôm nay", tone: "text-warning-fg" };
  return { text: `Còn ${days} ngày`, tone: "text-fg-muted" };
}

interface AlertListProps {
  title: string;
  icon: React.ReactNode;
  events: CalendarEvent[];
  emptyText: string;
  allHref: string;
}

export function AlertList({
  title,
  icon,
  events,
  emptyText,
  allHref,
}: AlertListProps) {
  return (
    <div className="card p-5">
      <div className="border-line-soft mb-3 flex items-center justify-between gap-2 border-b pb-3">
        <h3 className="text-fg flex items-center gap-2 text-sm font-bold">
          {icon}
          {title}
        </h3>
        <Link
          href={allHref}
          className="text-primary text-xs font-semibold hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="text-fg-muted py-6 text-center text-xs">{emptyText}</p>
      ) : (
        <ul className="space-y-2.5">
          {events.slice(0, 5).map((event) => {
            const option = REMINDER_TYPE_OPTIONS.find(
              (o) => o.value === event.type,
            );
            const Icon = option?.icon;
            const rel = relative(event.date);
            return (
              <li
                key={event.key}
                className="bg-surface-muted border-line flex items-center justify-between gap-3 rounded-xl border p-3 text-xs"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  {Icon && (
                    <span className={`shrink-0 rounded-lg p-2 ${option.soft}`}>
                      <Icon size="xs" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-fg truncate font-bold">{event.title}</p>
                    <p className="text-fg-muted text-[11px]">
                      {formatDate(event.date)} ·{" "}
                      <span className={`font-semibold ${rel.tone}`}>
                        {rel.text}
                      </span>
                    </p>
                  </div>
                </div>
                <Link
                  href={HREF[event.type]}
                  className="bg-primary-soft text-primary-soft-fg shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold hover:opacity-80"
                >
                  Xử lý
                </Link>
              </li>
            );
          })}
          {events.length > 5 && (
            <li className="text-fg-muted text-center text-[11px]">
              và {events.length - 5} việc khác
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
