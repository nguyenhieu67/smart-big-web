import type { Expense } from "@/types/expense";
import type { HealthLog } from "@/types/healthLog";
import type { Mating } from "@/types/mating";
import type { PigletBatch } from "@/types/piglet";
import type { Reminder } from "@/types/reminder";
import type { Sale } from "@/types/sale";
import type { Sow, SowStatus } from "@/types/sow";

import { buildAutoEvents, daysUntil, type CalendarEvent } from "./calendar";
import { addMonthsToDate, toInputDate, toLocalDateString } from "./format";
import { isSellable } from "./piglet";

export const SOON_DAYS = 7;

export interface DashboardSource {
  sows: Sow[];
  matings: Mating[];
  batches: PigletBatch[];
  healthLogs: HealthLog[];
  sales: Sale[];
  expenses: Expense[];
  reminders: Reminder[];
}

export interface MonthPoint {
  key: string; // "YYYY-MM"
  label: string; // "T10"
  revenue: number;
  expense: number;
}

export interface DashboardMetrics {
  sowActive: number; // nái chưa loại thải
  statusCounts: Record<SowStatus, number>;
  pendingMatings: number; // lần phối đang chờ kiểm tra thai
  pregnant: number;
  soonFarrow: number;
  nursing: number;
  pigletTotal: number; // heo con còn nuôi (chưa bán)
  soonWeanHeads: number; // con thuộc đàn sắp / đã đến hạn cai sữa
  sellableHeads: number; // con đủ điều kiện bán hôm nay
  inTreatment: number;
  deathsThisMonth: number;
  monthRevenue: number;
  monthExpense: number;
  monthProfit: number;
  months: MonthPoint[]; // 6 tháng gần nhất, cũ -> mới
  farrowAlerts: CalendarEvent[]; // nái sắp đẻ trong 7 ngày (kể cả quá hạn)
  taskAlerts: CalendarEvent[]; // các việc khác đến hạn trong 7 ngày (kể cả quá hạn)
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function computeDashboard(src: DashboardSource): DashboardMetrics {
  const today = toLocalDateString();
  const monthKey = today.slice(0, 7);

  const statusCounts: Record<SowStatus, number> = {
    REPLACEMENT: 0,
    AWAITING_BREEDING: 0,
    PREGNANT: 0,
    NURSING: 0,
    CULLED: 0,
  };
  for (const s of src.sows) statusCounts[s.status] += 1;

  const liveBatches = src.batches.filter((b) => b.stage !== "SOLD");

  // 6 tháng gần nhất (tháng hiện tại ở cuối)
  const months: MonthPoint[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const key = addMonthsToDate(`${monthKey}-01`, -i).slice(0, 7);
    months.push({
      key,
      label: `T${Number(key.slice(5))}`,
      revenue: 0,
      expense: 0,
    });
  }
  const bucket = (key: string) => months.find((m) => m.key === key);
  for (const s of src.sales) {
    const m = bucket(toInputDate(s.sale_date).slice(0, 7));
    if (m) m.revenue += Number(s.total_revenue);
  }
  for (const e of src.expenses) {
    const m = bucket(toInputDate(e.expense_date).slice(0, 7));
    if (m) m.expense += Number(e.amount);
  }
  const current = bucket(monthKey)!;

  // Việc đến hạn: tự sinh từ dữ liệu + nhắc việc nhập tay chưa xong
  const manual: CalendarEvent[] = src.reminders
    .filter((r) => !r.is_done)
    .map((r) => ({
      key: `reminder-${r.id}`,
      type: r.type,
      title: r.title,
      target: r.sow?.code ?? r.pigletBatch?.code ?? "",
      date: toInputDate(r.due_date),
      reminder: r,
    }));
  const soon = [...buildAutoEvents(src), ...manual]
    .filter((e) => daysUntil(e.date, today) <= SOON_DAYS)
    .sort((a, b) => a.date.localeCompare(b.date));
  const farrowAlerts = soon.filter((e) => e.type === "FARROW");

  return {
    sowActive: src.sows.length - statusCounts.CULLED,
    statusCounts,
    pendingMatings: src.matings.filter((m) => m.result === "RECENTLY_MATED")
      .length,
    pregnant: statusCounts.PREGNANT,
    soonFarrow: farrowAlerts.length,
    nursing: statusCounts.NURSING,
    pigletTotal: sum(liveBatches.map((b) => b.quantity ?? 0)),
    soonWeanHeads: sum(
      liveBatches
        .filter(
          (b) =>
            b.stage === "SUCKLING" &&
            b.target_wean_date &&
            daysUntil(toInputDate(b.target_wean_date), today) <= SOON_DAYS,
        )
        .map((b) => b.quantity ?? 0),
    ),
    sellableHeads: sum(
      liveBatches
        .filter((b) => isSellable(b, today))
        .map((b) => b.quantity ?? 0),
    ),
    inTreatment: src.healthLogs.filter((h) => h.status === "IN_TREATMENT")
      .length,
    deathsThisMonth: src.healthLogs.filter(
      (h) =>
        h.category === "DEATH" && toInputDate(h.log_date).startsWith(monthKey),
    ).length,
    monthRevenue: current.revenue,
    monthExpense: current.expense,
    monthProfit: current.revenue - current.expense,
    months,
    farrowAlerts,
    taskAlerts: soon.filter((e) => e.type !== "FARROW"),
  };
}
