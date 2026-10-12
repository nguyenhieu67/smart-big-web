import type { Expense } from "@/types/expense";
import type { Farrowing } from "@/types/farrowing";
import type { FeedLog } from "@/types/feed";
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
  healthCost: number; // chi phí thuốc / vaccine ghi trực tiếp cho nái (không gồm đàn con)
  feedCost: number; // cám ghi theo chuồng của nái (chia đều cho các nái cùng chuồng)
  net: number; // doanh thu - chi phí của nái
}

// Hiệu quả theo từng nái: doanh thu từ các đàn con của nái; chi phí gồm thuốc / vaccine ghi cho nái và cám ghi theo chuồng
// (không gắn đàn con) chia đều cho các nái đang ở chuồng đó. Chi phí của đàn con tách riêng ở bảng heo con (byBatch);
// điện, nước, nhân công dùng chung nên không phân bổ.
export function bySow(args: {
  sows: Sow[];
  batches: PigletBatch[];
  sales: Sale[];
  farrowings: Farrowing[];
  healthLogs: HealthLog[];
  feedLogs: FeedLog[];
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
        feedCost: 0,
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
    const row = h.sow_id != null ? rows.get(h.sow_id) : undefined;
    if (row) row.healthCost += Number(h.cost);
  }

  // Cám ghi theo chuồng (không gắn đàn con) chia đều cho các nái đang ở chuồng đó
  const sowsByPen = new Map<number, Sow[]>();
  for (const sow of args.sows) {
    sowsByPen.set(sow.pen_id, [...(sowsByPen.get(sow.pen_id) ?? []), sow]);
  }
  for (const f of args.feedLogs) {
    if (f.batch_id != null || f.pen_id == null) continue;
    const inPen = sowsByPen.get(f.pen_id);
    if (!inPen?.length) continue;
    const share = Number(f.total_cost) / inPen.length;
    for (const sow of inPen) {
      const row = rows.get(sow.id);
      if (row) row.feedCost += share;
    }
  }

  return [...rows.values()]
    .map((r) => ({ ...r, net: r.revenue - r.healthCost - r.feedCost }))
    .sort((a, b) => b.net - a.net);
}

export interface BatchProfitRow {
  id: number; // id đàn gốc
  code: string; // mã đàn gốc
  sowCode: string; // nái mẹ, "—" nếu đàn nhập từ ngoài
  totalHeads: number; // tổng số con của đàn gốc = số con hiện tại + đã bán + đã chết
  currentHeads: number; // số con còn lại
  soldHeads: number;
  deadHeads: number; // số con chết đã ghi nhận
  revenue: number;
  healthCost: number; // thuốc / vaccine ghi cho đàn (gồm các đàn tách ra khi bán)
  feedCost: number; // cám ghi cho đàn (gồm các đàn tách ra khi bán)
  net: number; // doanh thu - thuốc/vaccine - cám của đàn
}

// Hiệu quả theo từng đàn heo con. Khi bán một phần, hệ thống tách phần bán ra thành đàn con (mã -B1, -B2...)
// nên ở đây gộp các đàn tách về đàn gốc: tổng số con = còn lại + đã bán, doanh thu và chi phí cộng dồn.
// `allSales` (không lọc ngày) dùng để biết đàn nào tách từ đàn nào; `sales` (đã lọc ngày) dùng để tính tiền.
export function byBatch(args: {
  batches: PigletBatch[];
  allSales: Sale[];
  sales: Sale[];
  allHealthLogs: HealthLog[]; // không lọc ngày, để tính số con chết
  healthLogs: HealthLog[];
  feedLogs: FeedLog[];
}): BatchProfitRow[] {
  // đàn tách -> đàn nó được tách ra
  const parentOf = new Map<number, number>();
  for (const s of args.allSales) {
    if (s.source_batch_id != null) parentOf.set(s.batch_id, s.source_batch_id);
  }
  // đàn gốc: đi ngược các lần tách (có giới hạn bước để không lặp vô hạn nếu dữ liệu lỗi)
  const rootOf = (id: number) => {
    let current = id;
    for (let i = 0; i < 50 && parentOf.has(current); i += 1) {
      current = parentOf.get(current)!;
    }
    return current;
  };

  const byId = new Map(args.batches.map((b) => [b.id, b]));
  const rows = new Map<number, BatchProfitRow>();
  for (const b of args.batches) {
    const rootId = rootOf(b.id);
    const root = byId.get(rootId) ?? b;
    const row = rows.get(root.id) ?? {
      id: root.id,
      code: root.code,
      sowCode: root.sow?.code ?? "—",
      totalHeads: 0,
      currentHeads: 0,
      soldHeads: 0,
      deadHeads: 0,
      revenue: 0,
      healthCost: 0,
      feedCost: 0,
      net: 0,
    };
    row.totalHeads += b.quantity ?? 0; // đàn gốc còn lại + các đàn đã tách ra
    rows.set(root.id, row);
  }

  const rowOf = (batchId: number) => rows.get(rootOf(batchId));
  // Số con đã bán / còn lại tính trên mọi phiếu (không theo khoảng ngày) để tổng số con luôn khớp
  for (const s of args.allSales) {
    const row = rowOf(s.batch_id);
    if (row) row.soldHeads += s.quantity;
  }
  for (const h of args.allHealthLogs) {
    if (h.category !== "DEATH" || !h.head_count || h.batch_id == null) continue;
    const row = rowOf(h.batch_id);
    if (row) row.deadHeads += h.head_count;
  }
  // Tiền (doanh thu, chi phí) theo khoảng ngày đã chọn
  for (const s of args.sales) {
    const row = rowOf(s.batch_id);
    if (row) row.revenue += Number(s.total_revenue);
  }
  for (const h of args.healthLogs) {
    const row = h.batch_id != null ? rowOf(h.batch_id) : undefined;
    if (row) row.healthCost += Number(h.cost);
  }
  for (const f of args.feedLogs) {
    const row = f.batch_id != null ? rowOf(f.batch_id) : undefined;
    if (row) row.feedCost += Number(f.total_cost);
  }

  return [...rows.values()]
    .map((r) => ({
      ...r,
      // số lượng đàn đã bị trừ con chết nên tổng số con ban đầu = còn lại + đã bán + đã chết
      totalHeads: r.totalHeads + r.deadHeads,
      currentHeads: Math.max(r.totalHeads - r.soldHeads, 0),
      net: r.revenue - r.healthCost - r.feedCost,
    }))
    .sort((a, b) => b.net - a.net);
}
