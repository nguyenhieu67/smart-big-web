"use client";

import { useMemo, useState } from "react";

import { ChartLineIcon } from "@/components/icons";
import { InputField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import { Table } from "@/components/table";
import { Button } from "@/components/ui";
import { useFetchData } from "@/hooks";
import { expenseService } from "@/services/expenseService";
import { farrowingService } from "@/services/farrowingService";
import { healthLogService } from "@/services/healthLogService";
import { pigletBatchService } from "@/services/pigletBatchService";
import { saleService } from "@/services/saleService";
import { sowService } from "@/services/sowService";
import type { Expense } from "@/types/expense";
import type { Farrowing } from "@/types/farrowing";
import type { HealthLog } from "@/types/healthLog";
import type { PigletBatch } from "@/types/piglet";
import type { Sale } from "@/types/sale";
import type { Sow } from "@/types/sow";
import type { ColumnI } from "@/types/table";
import { formatCurrency, toLocalDateString } from "@/utils/format";
import {
  byMonth,
  bySow,
  inRange,
  summarize,
  type MonthRow,
  type SowProfitRow,
} from "@/utils/profit";

const EMPTY = {
  sales: [] as Sale[],
  expenses: [] as Expense[],
  batches: [] as PigletBatch[],
  sows: [] as Sow[],
  farrowings: [] as Farrowing[],
  healthLogs: [] as HealthLog[],
};

const money = (value: number) => formatCurrency(value, "đ");
const tone = (value: number) => (value < 0 ? "text-danger" : "text-teal");

export default function ProfitPage() {
  return <FarmGate>{() => <ProfitContent />}</FarmGate>;
}

function ProfitContent() {
  const { data, loading, error, refetch } = useFetchData(async () => {
    const [sales, expenses, batches, sows, farrowings, healthLogs] =
      await Promise.all([
        saleService.list(),
        expenseService.list(),
        pigletBatchService.list(),
        sowService.list(),
        farrowingService.list(),
        healthLogService.list(),
      ]);
    return { sales, expenses, batches, sows, farrowings, healthLogs };
  });
  const source = data ?? EMPTY;

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Mọi số liệu trên trang tính theo khoảng ngày đã chọn (bỏ trống = toàn bộ thời gian)
  const filtered = useMemo(() => {
    const range = { from, to };
    return {
      sales: source.sales.filter((s) => inRange(s.sale_date, range)),
      expenses: source.expenses.filter((e) => inRange(e.expense_date, range)),
      farrowings: source.farrowings.filter((f) =>
        inRange(f.farrow_date, range),
      ),
      healthLogs: source.healthLogs.filter((h) => inRange(h.log_date, range)),
    };
  }, [source, from, to]);

  const summary = useMemo(
    () => summarize(filtered.sales, filtered.expenses),
    [filtered],
  );
  const months = useMemo(
    () => byMonth(filtered.sales, filtered.expenses),
    [filtered],
  );
  const sowRows = useMemo(
    () =>
      bySow({
        sows: source.sows,
        batches: source.batches,
        sales: filtered.sales,
        farrowings: filtered.farrowings,
        healthLogs: filtered.healthLogs,
      }),
    [source, filtered],
  );

  const today = toLocalDateString();
  const setPreset = (range: { from: string; to: string }) => {
    setFrom(range.from);
    setTo(range.to);
  };
  const thisMonth = { from: `${today.slice(0, 8)}01`, to: today };
  const thisYear = { from: `${today.slice(0, 4)}-01-01`, to: today };

  const monthColumns: ColumnI<MonthRow>[] = [
    { value: "month", text: "Tháng", className: "text-fg font-bold" },
    {
      value: "revenue",
      text: "Doanh Thu",
      className: "text-success text-right font-semibold",
      render: (r) => money(r.revenue),
    },
    {
      value: "expense",
      text: "Chi Phí",
      className: "text-danger text-right font-semibold",
      render: (r) => money(r.expense),
    },
    {
      value: "profit",
      text: "Lợi Nhuận",
      className: "text-right font-black",
      render: (r) => <span className={tone(r.profit)}>{money(r.profit)}</span>,
    },
  ];

  const sowColumns: ColumnI<SowProfitRow>[] = [
    {
      value: "code",
      text: "Mã Nái",
      className: "text-primary font-bold",
      render: (r) => (
        <>
          {r.code}
          <span className="text-fg-muted block text-[11px] font-normal">
            {r.breed}
          </span>
        </>
      ),
    },
    {
      value: "farrowings",
      text: "Số Lứa Đẻ",
      className: "text-center font-bold",
    },
    {
      value: "liveBorn",
      text: "Con Sống Sinh Ra",
      className: "text-success text-center font-bold",
    },
    {
      value: "soldHeads",
      text: "Con Đã Bán",
      className: "text-center font-bold",
    },
    {
      value: "revenue",
      text: "Doanh Thu Tạo Ra",
      className: "text-success text-right font-semibold",
      render: (r) => money(r.revenue),
    },
    {
      value: "healthCost",
      text: "Chi Phí Thuốc / Vaccine",
      className: "text-danger text-right",
      render: (r) => money(r.healthCost),
    },
    {
      value: "net",
      text: "Doanh Thu Trừ Chi Phí Trực Tiếp",
      className: "text-right font-black",
      render: (r) => <span className={tone(r.net)}>{money(r.net)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ChartLineIcon size="sm" className="text-teal" />}
        title="12. Phân Tích Doanh Thu, Lợi Nhuận & Hiệu Quả Nái"
        description="Báo cáo tự động từ phiếu bán heo và sổ chi phí: lợi nhuận ròng, theo tháng và theo từng heo nái."
      />

      {loading ? (
        <p className="text-fg-muted p-6 text-center text-sm">Đang tải...</p>
      ) : error ? (
        <div className="card space-y-3 p-6 text-center">
          <p className="text-danger text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            Thử lại
          </Button>
        </div>
      ) : (
        <>
          <div className="card space-y-3 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3 lg:max-w-xl">
              <InputField
                id="from"
                type="date"
                max={to || undefined}
                label="Từ ngày"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                size="sm"
              />
              <InputField
                id="to"
                type="date"
                min={from || undefined}
                label="Đến ngày"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                size="sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreset(thisMonth)}
              >
                Tháng này
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreset(thisYear)}
              >
                Năm nay
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreset({ from: "", to: "" })}
              >
                Toàn bộ thời gian
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-success-soft border-success-line rounded-2xl border p-5">
              <div className="text-success-fg text-xs font-bold uppercase">
                Tổng doanh thu bán heo
              </div>
              <div className="text-success mt-2 text-xl font-black sm:text-2xl">
                {money(summary.revenue)}
              </div>
              <p className="text-success-fg mt-1 text-[11px]">
                {filtered.sales.length} phiếu bán
              </p>
            </div>

            <div className="bg-danger-soft border-danger-line rounded-2xl border p-5">
              <div className="text-danger-fg text-xs font-bold uppercase">
                Tổng chi phí hoạt động
              </div>
              <div className="text-danger mt-2 text-xl font-black sm:text-2xl">
                {money(summary.expense)}
              </div>
              <p className="text-danger-fg mt-1 text-[11px]">
                {filtered.expenses.length} khoản chi (cám, thuốc, điện nước,
                nhân công...)
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                summary.profit < 0
                  ? "bg-danger-soft border-danger-line"
                  : "bg-teal-soft border-teal/30"
              }`}
            >
              <div
                className={`text-xs font-bold uppercase ${summary.profit < 0 ? "text-danger-fg" : "text-teal-fg"}`}
              >
                Lợi nhuận ròng
              </div>
              <div
                className={`mt-2 text-xl font-black sm:text-2xl ${tone(summary.profit)}`}
              >
                {money(summary.profit)}
              </div>
              <p
                className={`mt-1 text-[11px] ${summary.profit < 0 ? "text-danger-fg" : "text-teal-fg"}`}
              >
                {summary.margin != null
                  ? `Biên lợi nhuận ${summary.margin.toFixed(1)}% trên doanh thu`
                  : "Chưa có doanh thu trong khoảng này"}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <h3 className="text-fg border-line-soft border-b p-4 text-sm font-bold">
              Doanh thu, chi phí và lợi nhuận theo tháng
            </h3>
            <Table
              columns={monthColumns}
              rows={months}
              height="max-h-96"
              emptyMessage="Chưa có doanh thu hoặc chi phí trong khoảng này."
            />
          </div>

          <div className="card overflow-hidden">
            <div className="border-line-soft border-b p-4">
              <h3 className="text-fg text-sm font-bold">
                Hiệu quả theo từng heo nái
              </h3>
              <p className="text-fg-muted mt-1 text-xs">
                Doanh thu tính từ các phiếu bán của đàn con do nái sinh ra. Chi
                phí chỉ gồm thuốc / vaccine ghi trực tiếp cho nái và đàn con;
                cám, điện, nước, nhân công dùng chung nên không phân bổ cho từng
                nái.
              </p>
            </div>
            <Table
              columns={sowColumns}
              rows={sowRows}
              height="max-h-130"
              emptyMessage="Chưa có heo nái nào."
            />
          </div>
        </>
      )}
    </div>
  );
}
