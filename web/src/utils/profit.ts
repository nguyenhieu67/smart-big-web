import type { Expense } from "@/types/expense";
import type { Farrowing } from "@/types/farrowing";
import type { HealthLog } from "@/types/healthLog";
import type { PigletBatch } from "@/types/piglet";
import type { Sale } from "@/types/sale";
import type { Sow } from "@/types/sow";

import { toInputDate } from "./format";

export interface DateRange {
  from: string; // "YYYY-MM-DD", rỗng = không giới hạn
  to: string;
}

// Ngày (ISO từ API) nằm trong khoảng đã chọn
export const inRange = (iso: string, { from, to }: DateRange) => {
  const date = toInputDate(iso);
  return (!from || date >= from) && (!to || date <= to);
};

export interface ProfitSummary {
  revenue: number;
  expense: number;
  profit: number;
  margin: number | null; // % lợi nhuận trên doanh thu, null khi chưa có doanh thu
}

export function summarize(sales: Sale[], expenses: Expense[]): ProfitSummary {
  const revenue = sales.reduce((sum, s) => sum + Number(s.total_revenue), 0);
  const expense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const profit = revenue - expense;
  return {
    revenue,
    expense,
    profit,
    margin: revenue > 0 ? (profit / revenue) * 100 : null,
  };
}

export interface MonthRow {
  id: string; // "YYYY-MM"
  month: string; // "MM/YYYY"
  revenue: number;
  expense: number;
  profit: number;
}

// Doanh thu / chi phí gom theo tháng, tháng mới nhất lên đầu
export function byMonth(sales: Sale[], expenses: Expense[]): MonthRow[] {
  const map = new Map<string, { revenue: number; expense: number }>();
  const bucket = (key: string) => {
    const row = map.get(key) ?? { revenue: 0, expense: 0 };
    map.set(key, row);
    return row;
  };
  for (const s of sales) {
    bucket(toInputDate(s.sale_date).slice(0, 7)).revenue += Number(
      s.total_revenue,
    );
  }
  for (const e of expenses) {
    bucket(toInputDate(e.expense_date).slice(0, 7)).expense += Number(e.amount);
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([id, v]) => ({
      id,
      month: `${id.slice(5)}/${id.slice(0, 4)}`,
      ...v,
      profit: v.revenue - v.expense,
    }));
}

export interface SowProfitRow {
  id: number;
  code: string;
  breed: string;
  farrowings: number; // số lứa đẻ trong khoảng đã chọn
  liveBorn: number;
  soldHeads: number;
  revenue: number;
  healthCost: number; // chi phí thuốc / vaccine ghi trực tiếp cho nái và các đàn con của nái
  net: number; // doanh thu - chi phí trực tiếp
}

// Hiệu quả theo từng nái: doanh thu từ các đàn con của nái; chi phí chỉ tính phần ghi trực tiếp cho nái / đàn con
// (cám, điện, nước, nhân công dùng chung nên không phân bổ).
export function bySow(args: {
  sows: Sow[];
  batches: PigletBatch[];
  sales: Sale[];
  farrowings: Farrowing[];
  healthLogs: HealthLog[];
}): SowProfitRow[] {
  const batchSow = new Map<number, number>();
  for (const b of args.batches) {
    if (b.sow_id != null) batchSow.set(b.id, b.sow_id);
  }

  const rows = new Map<number, SowProfitRow>(
    args.sows.map((s) => [
      s.id,
      {
        id: s.id,
        code: s.code,
        breed: s.breed,
        farrowings: 0,
        liveBorn: 0,
        soldHeads: 0,
        revenue: 0,
        healthCost: 0,
        net: 0,
      },
    ]),
  );

  for (const f of args.farrowings) {
    const row = rows.get(f.sow_id);
    if (!row) continue;
    row.farrowings += 1;
    row.liveBorn += f.live_born ?? 0;
  }
  for (const s of args.sales) {
    const sowId = batchSow.get(s.batch_id);
    const row = sowId != null ? rows.get(sowId) : undefined;
    if (!row) continue;
    row.soldHeads += s.quantity;
    row.revenue += Number(s.total_revenue);
  }
  for (const h of args.healthLogs) {
    const sowId =
      h.sow_id ?? (h.batch_id != null ? batchSow.get(h.batch_id) : undefined);
    const row = sowId != null ? rows.get(sowId) : undefined;
    if (row) row.healthCost += Number(h.cost);
  }

  return [...rows.values()]
    .map((r) => ({ ...r, net: r.revenue - r.healthCost }))
    .sort((a, b) => b.net - a.net);
}
