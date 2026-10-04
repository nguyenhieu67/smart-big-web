import {
  AUTO_OVERDUE_DAYS,
  MATING_CHECK_AFTER_DAYS,
} from "@/constants/reminder";
import type { HealthLog } from "@/types/healthLog";
import type { Mating } from "@/types/mating";
import type { PigletBatch } from "@/types/piglet";
import type { Reminder, ReminderType } from "@/types/reminder";
import type { Sow } from "@/types/sow";

import { addDaysToDate, toInputDate, toLocalDateString } from "./format";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CalendarEvent {
  key: string;
  type: ReminderType;
  title: string;
  target: string; // mã nái / đàn
  date: string; // "YYYY-MM-DD"
  reminder?: Reminder; // có giá trị khi là nhắc việc nhập tay
}

// Số ngày từ hôm nay đến ngày của việc (âm = quá hạn)
export const daysUntil = (date: string, today = toLocalDateString()) =>
  Math.round((Date.parse(date) - Date.parse(today)) / DAY_MS);

// Việc tự sinh từ dữ liệu trại (API chưa có job tạo nhắc việc):
// dự kiến đẻ, kiểm tra thai sau phối, tiêm tiếp theo, cai sữa. Việc quá hạn lâu thì bỏ qua.
export function buildAutoEvents(args: {
  sows: Sow[];
  matings: Mating[];
  batches: PigletBatch[];
  healthLogs: HealthLog[];
}): CalendarEvent[] {
  const today = toLocalDateString();
  const earliest = addDaysToDate(today, -AUTO_OVERDUE_DAYS);
  const events: CalendarEvent[] = [];
  const add = (event: CalendarEvent) => {
    if (event.date >= earliest) events.push(event);
  };

  // Dự kiến đẻ: nái đang mang thai + lần phối gần nhất chưa bị "không đậu"
  for (const sow of args.sows.filter((s) => s.status === "PREGNANT")) {
    const mating = args.matings
      .filter((m) => m.sow_id === sow.id && m.result !== "FAILED")
      .sort((a, b) => b.mating_date.localeCompare(a.mating_date))[0];
    if (!mating) continue;
    add({
      key: `farrow-${mating.id}`,
      type: "FARROW",
      title: `Nái ${sow.code} dự kiến đẻ`,
      target: sow.code,
      date: toInputDate(mating.expected_farrow_date),
    });
  }

  // Kiểm tra thai: các lần phối còn ở trạng thái "mới phối"
  for (const m of args.matings.filter((m) => m.result === "RECENTLY_MATED")) {
    add({
      key: `check-${m.id}`,
      type: "MATING_CHECK",
      title: `Kiểm tra thai nái ${m.sow.code} (${MATING_CHECK_AFTER_DAYS} ngày sau phối)`,
      target: m.sow.code,
      date: addDaysToDate(toInputDate(m.mating_date), MATING_CHECK_AFTER_DAYS),
    });
  }

  // Tiêm / điều trị tiếp theo (bỏ qua bản ghi heo chết / loại thải)
  for (const h of args.healthLogs) {
    if (!h.next_date || h.category === "DEATH") continue;
    const target = h.sow?.code ?? h.pigletBatch?.code ?? "";
    add({
      key: `health-${h.id}`,
      type: "VACCINE",
      title: `${h.name}${target ? ` - ${target}` : ""}`,
      target,
      date: toInputDate(h.next_date),
    });
  }

  // Cai sữa: đàn còn bú mẹ có ngày cai sữa dự kiến
  for (const b of args.batches) {
    if (b.stage !== "SUCKLING" || !b.target_wean_date) continue;
    add({
      key: `wean-${b.id}`,
      type: "WEAN",
      title: `Cai sữa đàn ${b.code}`,
      target: b.code,
      date: toInputDate(b.target_wean_date),
    });
  }

  return events;
}

export interface EventGroup {
  id: "overdue" | "today" | "week" | "later";
  label: string;
  events: CalendarEvent[];
}

// Gom theo mức khẩn cấp, trong mỗi nhóm xếp theo ngày gần nhất
export function groupEvents(events: CalendarEvent[]): EventGroup[] {
  const groups: EventGroup[] = [
    { id: "overdue", label: "Quá hạn", events: [] },
    { id: "today", label: "Hôm nay", events: [] },
    { id: "week", label: "7 ngày tới", events: [] },
    { id: "later", label: "Sắp tới", events: [] },
  ];
  for (const event of [...events].sort((a, b) =>
    a.date.localeCompare(b.date),
  )) {
    const days = daysUntil(event.date);
    const index = days < 0 ? 0 : days === 0 ? 1 : days <= 7 ? 2 : 3;
    groups[index].events.push(event);
  }
  return groups.filter((g) => g.events.length > 0);
}
