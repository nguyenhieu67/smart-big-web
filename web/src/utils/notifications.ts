import { CARE_STEPS } from "@/constants/pigletCare";
import type { HealthLog } from "@/types/healthLog";
import type { Mating } from "@/types/mating";
import type { PigletBatch } from "@/types/piglet";
import type { Reminder, ReminderType } from "@/types/reminder";
import type { Sale } from "@/types/sale";
import type { Sow } from "@/types/sow";

import { buildAutoEvents, daysUntil } from "./calendar";
import { addDaysToDate, toInputDate, toLocalDateString } from "./format";

export type NotificationTone = "danger" | "warning" | "info";

export interface AppNotification {
  key: string; // đổi khi nội dung đổi (vd. thêm mũi quá hạn) để thông báo hiện lại như mới
  title: string;
  detail: string;
  href: string; // trang chi tiết của thông báo
  tone: NotificationTone;
  date: string; // "YYYY-MM-DD", để sắp xếp
}

const SOON_DAYS = 7; // báo trước 7 ngày
const VACCINE_STEPS = CARE_STEPS.filter((s) => s.category === "VACCINATION");
const TRACK_UNTIL_DAY = Math.max(...VACCINE_STEPS.map((s) => s.maxDay)) + 5;

const relativeLabel = (date: string) => {
  const days = daysUntil(date);
  if (days < 0) return `Quá ${-days} ngày`;
  if (days === 0) return "Hôm nay";
  return `Còn ${days} ngày`;
};

// Trang xem chi tiết theo loại việc
const EVENT_HREF: Record<ReminderType, string> = {
  MATING_CHECK: "/matings",
  FARROW: "/gestation",
  VACCINE: "/health",
  WEAN: "/piglets",
  SALE: "/sales",
};

export interface NotificationSource {
  sows: Sow[];
  matings: Mating[];
  batches: PigletBatch[];
  healthLogs: HealthLog[];
  reminders: Reminder[];
  sales: Sale[];
}

// Gom các việc cần chú ý thành danh sách thông báo (mỗi việc / mỗi đàn một thông báo)
export function buildNotifications(
  source: NotificationSource,
): AppNotification[] {
  const today = toLocalDateString();
  const items: AppNotification[] = [];

  // 1. Nái sắp đẻ (đã đậu thai, còn không quá 7 ngày hoặc đã quá ngày dự kiến)
  for (const sow of source.sows.filter((s) => s.status === "PREGNANT")) {
    const mating = source.matings
      .filter((m) => m.sow_id === sow.id && m.result !== "FAILED")
      .sort((a, b) => b.mating_date.localeCompare(a.mating_date))[0];
    if (!mating || mating.result !== "SUCCESSFULLY") continue;
    const expected = toInputDate(mating.expected_farrow_date);
    const days = daysUntil(expected);
    if (days > SOON_DAYS) continue;
    items.push({
      key: `farrow-${mating.id}`,
      title: `Nái ${sow.code} sắp đẻ`,
      detail:
        days < 0
          ? `Đã quá ${-days} ngày so với ngày dự kiến sinh`
          : days === 0
            ? "Dự kiến sinh hôm nay"
            : `Còn ${days} ngày đến ngày dự kiến sinh`,
      href: `/farrowings?sow=${sow.id}`,
      tone: days <= 0 ? "danger" : "warning",
      date: expected,
    });
  }

  // 2. Đàn heo con có mũi vaccine đến hạn / quá hạn (không tính heo đã bán hoặc đang chờ bán)
  const logsByBatch = new Map<number, Set<string>>();
  for (const log of source.healthLogs) {
    if (log.batch_id == null) continue;
    const set = logsByBatch.get(log.batch_id) ?? new Set<string>();
    if (log.care_step) set.add(log.care_step);
    set.add(log.name); // nhật ký cũ chưa có care_step khớp theo tên mũi
    logsByBatch.set(log.batch_id, set);
  }
  for (const batch of source.batches) {
    if (batch.stage === "SOLD" || batch.pen?.status != null) continue;
    const age = -daysUntil(toInputDate(batch.birth_date));
    if (age < 0 || age > TRACK_UNTIL_DAY) continue;
    const done = logsByBatch.get(batch.id);
    let due = 0;
    let overdue = 0;
    for (const step of VACCINE_STEPS) {
      if (done?.has(step.id) || done?.has(step.task)) continue;
      if (age > step.maxDay) overdue += 1;
      else if (age >= step.minDay) due += 1;
    }
    if (due + overdue === 0) continue;
    items.push({
      key: `vaccine-${batch.id}-${due}-${overdue}`,
      title: `Đàn ${batch.code} cần tiêm vaccine`,
      detail: [
        overdue > 0 ? `${overdue} mũi quá hạn` : "",
        due > 0 ? `${due} mũi đến hạn` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      href: `/piglet-care?batch=${batch.id}`,
      tone: overdue > 0 ? "danger" : "warning",
      date: today,
    });
  }

  // 3. Việc khác trong lịch (cai sữa, kiểm tra thai, lịch tiêm hẹn, nhắc việc tự thêm): quá hạn hoặc trong 7 ngày tới.
  // Ngày dự kiến đẻ đã có thông báo riêng ở trên nên bỏ qua.
  const earliest = addDaysToDate(today, -30);
  const events = [
    ...buildAutoEvents(source).filter((e) => e.type !== "FARROW"),
    ...source.reminders
      .filter((r) => !r.is_done)
      .map((r) => ({
        key: `reminder-${r.id}`,
        type: r.type,
        title: r.title,
        target: r.sow?.code ?? r.pigletBatch?.code ?? "",
        date: toInputDate(r.due_date),
        manual: true,
      })),
  ];
  for (const e of events) {
    const days = daysUntil(e.date);
    if (days > SOON_DAYS || e.date < earliest) continue;
    items.push({
      key: `event-${e.key}-${e.date}`,
      title: e.title,
      detail: `${relativeLabel(e.date)} (${e.date.split("-").reverse().join("/")})`,
      href: "manual" in e ? "/calendar" : EVENT_HREF[e.type],
      tone: days < 0 ? "danger" : days <= 1 ? "warning" : "info",
      date: e.date,
    });
  }

  // 4. Giao hàng hôm nay hoặc ngày mai
  for (const sale of source.sales) {
    if (!sale.shipping_date) continue;
    const date = toInputDate(sale.shipping_date);
    const days = daysUntil(date);
    if (days < 0 || days > 1) continue;
    items.push({
      key: `ship-${sale.id}-${date}`,
      title: days === 0 ? "Giao hàng hôm nay" : "Giao hàng ngày mai",
      detail: `${sale.pigletBatch.code} · ${sale.quantity} con`,
      href: "/sales",
      tone: "warning",
      date,
    });
  }

  const rank: Record<NotificationTone, number> = {
    danger: 0,
    warning: 1,
    info: 2,
  };
  return items.sort(
    (a, b) => rank[a.tone] - rank[b.tone] || a.date.localeCompare(b.date),
  );
}
