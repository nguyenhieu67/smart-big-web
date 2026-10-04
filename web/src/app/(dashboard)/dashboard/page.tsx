"use client";

import Link from "next/link";
import { useMemo } from "react";

import { AlertList } from "@/components/dashboard/alertList";
import { FinancialChart } from "@/components/dashboard/financialChart";
import { SowStatusBar } from "@/components/dashboard/sowStatusBar";
import {
  BabyCarriageIcon,
  CalenDarDaysIcon,
  GaugeHighIcon,
  NotesMedicalIcon,
  PawIcon,
  PiggyBankIcon,
  RotateIcon,
  SackDollarIcon,
  SyringeIcon,
} from "@/components/icons";
import { FarmGate, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import { useFetchData } from "@/hooks";
import { expenseService } from "@/services/expenseService";
import { healthLogService } from "@/services/healthLogService";
import { matingService } from "@/services/matingService";
import { pigletBatchService } from "@/services/pigletBatchService";
import { reminderService } from "@/services/reminderService";
import { saleService } from "@/services/saleService";
import { sowService } from "@/services/sowService";
import {
  computeDashboard,
  SOON_DAYS,
  type DashboardSource,
} from "@/utils/dashboard";
import { formatCurrency } from "@/utils/format";

const EMPTY: DashboardSource = {
  sows: [],
  matings: [],
  batches: [],
  healthLogs: [],
  sales: [],
  expenses: [],
  reminders: [],
};

export default function DashboardPage() {
  return <FarmGate>{() => <DashboardContent />}</FarmGate>;
}

function DashboardContent() {
  const { data, loading, error, refetch } = useFetchData(
    async (): Promise<DashboardSource> => {
      const [sows, matings, batches, healthLogs, sales, expenses, reminders] =
        await Promise.all([
          sowService.list(),
          matingService.list(),
          pigletBatchService.list(),
          healthLogService.list(),
          saleService.list(),
          expenseService.list(),
          reminderService.list(),
        ]);
      return { sows, matings, batches, healthLogs, sales, expenses, reminders };
    },
  );

  const m = useMemo(() => computeDashboard(data ?? EMPTY), [data]);

  // Dây chuyền sản xuất khép kín: mỗi ô dẫn tới trang quản lý tương ứng
  const pipeline = [
    {
      href: "/sows",
      label: "1. Heo Nái",
      value: m.sowActive,
      note: "Tổng đàn nái",
      tone: "text-white",
      noteTone: "text-pink-400",
    },
    {
      href: "/matings",
      label: "2. Phối Giống",
      value: m.pendingMatings,
      note: "Mới phối / chờ khám thai",
      tone: "text-purple-300",
      noteTone: "text-purple-400",
    },
    {
      href: "/gestation",
      label: "3. Mang Thai",
      value: m.pregnant,
      note: `${m.soonFarrow} nái sắp đẻ`,
      tone: "text-indigo-300",
      noteTone: "text-indigo-400",
    },
    {
      href: "/farrowings",
      label: "4. Đang Nuôi Con",
      value: m.nursing,
      note: "Nái đang nuôi heo con",
      tone: "text-rose-300",
      noteTone: "text-rose-400",
    },
    {
      href: "/piglets",
      label: "5. Heo Con & Thịt",
      value: m.pigletTotal,
      note: `${m.soonWeanHeads} con sắp cai sữa`,
      tone: "text-amber-300",
      noteTone: "text-amber-400",
    },
    {
      href: "/sales",
      label: "6. Xuất Bán",
      value: m.sellableHeads,
      note: "Con đủ điều kiện bán",
      tone: "text-emerald-400",
      noteTone: "text-emerald-300",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<GaugeHighIcon size="sm" className="text-primary" />}
        title="Báo Cáo Tổng Quan Trang Trại"
        description="Tình trạng đàn heo, sinh sản, sức khỏe và kinh doanh của trang trại."
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={refetch}
            disabled={loading}
            leftIcon={<RotateIcon size="xs" />}
          >
            Làm mới
          </Button>
        }
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
          <section className="bg-shell border-shell-line rounded-2xl border p-5 text-white shadow-md">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="text-xs font-bold tracking-wider text-pink-400 uppercase">
                Mô hình sản xuất khép kín
              </span>
              <span className="text-shell-fg-muted text-xs">
                Bấm vào ô để xem chi tiết
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3 lg:grid-cols-6">
              {pipeline.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-white/30 hover:bg-white/10"
                >
                  <div className="text-shell-fg-muted mb-1 text-[11px]">
                    {p.label}
                  </div>
                  <div className={`text-xl font-extrabold ${p.tone}`}>
                    {p.value}
                  </div>
                  <div className={`mt-0.5 text-[10px] ${p.noteTone}`}>
                    {p.note}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card flex items-center justify-between p-5">
              <div>
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  Tổng heo nái
                </p>
                <h3 className="text-fg mt-1 text-2xl font-black">
                  {m.sowActive}
                </h3>
                <p className="text-success-fg mt-1 text-xs font-medium">
                  {m.pregnant} nái mang thai
                </p>
              </div>
              <div className="bg-primary-soft text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <PiggyBankIcon size="md" />
              </div>
            </div>

            <div className="card flex items-center justify-between p-5">
              <div>
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  Heo con & đàn nuôi
                </p>
                <h3 className="text-fg mt-1 text-2xl font-black">
                  {m.pigletTotal}
                </h3>
                <p className="text-warning-fg mt-1 text-xs font-medium">
                  {m.soonWeanHeads} con sắp cai sữa
                </p>
              </div>
              <div className="bg-warning-soft text-warning-fg flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <PawIcon size="md" />
              </div>
            </div>

            <div className="card flex items-center justify-between p-5">
              <div>
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  Sức khỏe & cảnh báo
                </p>
                <h3 className="text-fg mt-1 text-2xl font-black">
                  {m.inTreatment} đang điều trị
                </h3>
                <p className="text-danger mt-1 text-xs font-medium">
                  {m.deathsThisMonth} heo chết / loại thải tháng này
                </p>
              </div>
              <div className="bg-danger-soft text-danger-fg flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <NotesMedicalIcon size="md" />
              </div>
            </div>

            <div className="card flex items-center justify-between p-5">
              <div className="min-w-0">
                <p className="text-fg-muted text-xs font-semibold tracking-wider uppercase">
                  Lợi nhuận tháng này
                </p>
                <h3
                  className={`mt-1 truncate text-xl font-black ${m.monthProfit < 0 ? "text-danger" : "text-success"}`}
                >
                  {formatCurrency(m.monthProfit, "đ")}
                </h3>
                <p className="text-fg-muted mt-1 truncate text-xs font-medium">
                  Doanh thu: {formatCurrency(m.monthRevenue, "đ")}
                </p>
              </div>
              <div className="bg-success-soft text-success-fg flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <SackDollarIcon size="md" />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FinancialChart months={m.months} />
            </div>
            <SowStatusBar counts={m.statusCounts} />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AlertList
              title={`Nái sắp sinh (${SOON_DAYS} ngày tới)`}
              icon={<BabyCarriageIcon size="xs" className="text-danger" />}
              events={m.farrowAlerts}
              emptyText="Chưa có nái nào sắp sinh trong 7 ngày tới."
              allHref="/gestation"
            />
            <AlertList
              title="Việc cần làm sắp đến hạn"
              icon={<SyringeIcon size="xs" className="text-success" />}
              events={m.taskAlerts}
              emptyText="Không có việc nào đến hạn trong 7 ngày tới."
              allHref="/calendar"
            />
          </section>

          <p className="text-fg-muted flex items-center gap-1.5 text-[11px]">
            <CalenDarDaysIcon size="2xs" />
            Số liệu tính từ dữ liệu hiện có của trại; tháng hiện tại tính từ
            ngày 1 đến hôm nay.
          </p>
        </>
      )}
    </div>
  );
}
