"use client";

import { useMemo, useState } from "react";

import { PawIcon, SearchIcon } from "@/components/icons";
import { SelectField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import { Modal } from "@/components/modals/modal";
import {
  VaccinateModal,
  type VaccinatePayload,
} from "@/components/modals/vaccinateModal";
import { Table } from "@/components/table";
import { Button } from "@/components/ui";
import { CARE_STEPS, type CareStep } from "@/constants/pigletCare";
import { useAppToast, useDebounce, useFetchData, usePagination } from "@/hooks";
import { parseApiError } from "@/lib/apiError";
import { healthLogService } from "@/services/healthLogService";
import { pigletBatchService } from "@/services/pigletBatchService";
import { vaccineTypeService } from "@/services/vaccineTypeService";
import type { Farm } from "@/types/auth";
import type { HealthLog } from "@/types/healthLog";
import type { PigletBatch } from "@/types/piglet";
import type { ColumnI } from "@/types/table";
import type { VaccineType } from "@/types/vaccine";
import {
  formatCurrency,
  formatDate,
  toInputDate,
  toLocalDateString,
} from "@/utils/format";

const EMPTY_BATCHES: PigletBatch[] = [];
const EMPTY_LOGS: HealthLog[] = [];
const EMPTY_VACCINES: VaccineType[] = [];

const DAY_MS = 24 * 60 * 60 * 1000;
// Chỉ theo dõi các mũi vaccine (không gồm tiêm sắt, chăm sóc, cai sữa)
const VACCINE_STEPS = CARE_STEPS.filter((s) => s.category === "VACCINATION");
const TRACK_UNTIL_DAY = Math.max(...VACCINE_STEPS.map((s) => s.maxDay)) + 5; // đàn quá tuổi này thì thôi theo dõi

type StepState = "done" | "overdue" | "due" | "upcoming";

const STATE_BADGE: Record<StepState, { label: string; badge: string }> = {
  done: { label: "Đã tiêm", badge: "badge-success" },
  overdue: { label: "Quá hạn", badge: "badge-danger" },
  due: { label: "Đến hạn", badge: "badge-warning" },
  upcoming: { label: "Chưa đến", badge: "badge-muted" },
};

const overdueOf = (v: BatchView) =>
  v.urgent.filter((s) => s.state === "overdue").length;
const dueOf = (v: BatchView) =>
  v.urgent.filter((s) => s.state === "due").length;

const FILTER_OPTIONS = [
  { value: "", label: "Tất cả đàn" },
  { value: "overdue", label: "Có mũi quá hạn" },
  { value: "due", label: "Có mũi đến hạn" },
  { value: "clear", label: "Không có mũi cần tiêm" },
];

const ageInDays = (birthDate: string) =>
  Math.round(
    (Date.parse(toLocalDateString()) - Date.parse(toInputDate(birthDate))) /
      DAY_MS,
  );

interface StepView {
  step: CareStep;
  state: StepState;
  log: HealthLog | null; // bản ghi sức khỏe khi đã đánh dấu
  daysToStart: number; // còn bao nhiêu ngày nữa đến hạn (chỉ dùng khi chưa đến)
}

interface BatchView {
  id: number; // để dùng làm key của bảng
  batch: PigletBatch;
  age: number;
  steps: StepView[];
  doneCount: number;
  urgent: StepView[]; // mũi đến hạn hoặc quá hạn chưa tiêm
}

export default function PigletCarePage() {
  return <FarmGate>{(farm) => <PigletCareContent farm={farm} />}</FarmGate>;
}

function PigletCareContent({ farm }: { farm: Farm }) {
  // Ghi nhận: ai cũng làm; bỏ đánh dấu (xóa bản ghi sức khỏe): OWNER/MANAGER
  const canUndo = farm.role === "OWNER" || farm.role === "MANAGER";
  const toast = useAppToast();
  const [pending, setPending] = useState("");

  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([
      pigletBatchService.list(),
      healthLogService.list(),
      vaccineTypeService.list(),
    ]),
  );
  const [batches, healthLogs, vaccineTypes] = data ?? [
    EMPTY_BATCHES,
    EMPTY_LOGS,
    EMPTY_VACCINES,
  ];
  // Mũi đang ghi nhận (mở modal nhập vaccine, liều, chi phí)
  const [injecting, setInjecting] = useState<{
    batch: PigletBatch;
    step: CareStep;
  } | null>(null);

  const views = useMemo<BatchView[]>(() => {
    // đàn -> (mốc / tên mũi -> bản ghi sức khỏe của đàn đó)
    const logsByBatch = new Map<number, Map<string, HealthLog>>();
    for (const log of healthLogs) {
      if (log.batch_id == null) continue;
      const byKey = logsByBatch.get(log.batch_id) ?? new Map();
      // Khớp theo mốc quy trình (care_step); bản ghi cũ chưa có mốc thì khớp theo tên mũi
      for (const k of [log.care_step, log.name]) {
        if (k && !byKey.has(k)) byKey.set(k, log);
      }
      logsByBatch.set(log.batch_id, byKey);
    }

    return (
      batches
        // Không theo dõi heo đã bán hoặc đang chờ bán (ở chuồng chờ bán): đàn tách ra khi bán một phần cùng quy trình
        // vaccine với đàn gốc nên chỉ theo dõi đàn gốc, tránh lặp quy trình
        .filter((b) => b.stage !== "SOLD" && b.pen?.status == null)
        .map((batch) => {
          const age = ageInDays(batch.birth_date);
          const logs = logsByBatch.get(batch.id);

          const steps = VACCINE_STEPS.map<StepView>((step) => {
            const log = logs?.get(step.id) ?? logs?.get(step.task) ?? null;
            const state: StepState = log
              ? "done"
              : age > step.maxDay
                ? "overdue"
                : age >= step.minDay
                  ? "due"
                  : "upcoming";
            return { step, state, log, daysToStart: step.minDay - age };
          });

          return {
            id: batch.id,
            batch,
            age,
            steps,
            doneCount: steps.filter((s) => s.state === "done").length,
            urgent: steps.filter(
              (s) => s.state === "overdue" || s.state === "due",
            ),
          };
        })
        .filter((v) => v.age >= 0 && v.age <= TRACK_UNTIL_DAY)
        .sort(
          (a, b) =>
            overdueOf(b) - overdueOf(a) || dueOf(b) - dueOf(a) || a.age - b.age,
        )
    );
  }, [batches, healthLogs]);

  const overdueCount = views.reduce(
    (n, v) => n + v.urgent.filter((s) => s.state === "overdue").length,
    0,
  );
  const dueCount = views.reduce(
    (n, v) => n + v.urgent.filter((s) => s.state === "due").length,
    0,
  );

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return views.filter((v) => {
      if (filter === "overdue" && overdueOf(v) === 0) return false;
      if (filter === "due" && dueOf(v) === 0) return false;
      if (filter === "clear" && v.urgent.length > 0) return false;
      if (!q) return true;
      return `${v.batch.code} ${v.batch.sow?.code ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [views, debouncedQuery, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );
  const selected = views.find((v) => v.id === selectedId) ?? null;

  const columns: ColumnI<BatchView>[] = [
    {
      value: "code",
      text: "Mã Đàn",
      className: "text-warning-fg font-bold",
      render: (v) => v.batch.code,
    },
    { value: "sow", text: "Nái Mẹ", render: (v) => v.batch.sow?.code ?? "—" },
    {
      value: "birth_date",
      text: "Ngày Sinh",
      render: (v) => formatDate(v.batch.birth_date),
    },
    {
      value: "age",
      text: "Tuổi (Ngày)",
      className: "text-center font-semibold",
      render: (v) => v.age,
    },
    {
      value: "quantity",
      text: "Số Con",
      className: "text-center",
      render: (v) => v.batch.quantity ?? 0,
    },
    {
      value: "progress",
      text: "Đã Tiêm",
      className: "text-center font-semibold",
      render: (v) => `${v.doneCount}/${v.steps.length}`,
    },
    {
      value: "due",
      text: "Đến Hạn",
      className: "text-center",
      render: (v) =>
        dueOf(v) > 0 ? (
          <span className="badge badge-warning">{dueOf(v)} mũi</span>
        ) : (
          "—"
        ),
    },
    {
      value: "overdue",
      text: "Quá Hạn",
      className: "text-center",
      render: (v) =>
        overdueOf(v) > 0 ? (
          <span className="badge badge-danger">{overdueOf(v)} mũi</span>
        ) : (
          "—"
        ),
    },
  ];

  async function run(key: string, action: () => Promise<void>) {
    setPending(key);
    try {
      await action();
      refetch();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setPending("");
    }
  }

  async function submitInjection(payload: VaccinatePayload) {
    if (!injecting) return;
    const { batch, step } = injecting;
    await healthLogService.createForBatch({
      batch_id: batch.id,
      category: "VACCINATION",
      status: "COMPLETED",
      care_step: step.id,
      ...payload,
    });
    toast.success(`Đã ghi nhận mũi tiêm cho đàn ${batch.code}`);
    setInjecting(null);
    refetch();
  }

  const undo = (batch: PigletBatch, step: CareStep, log: HealthLog) =>
    run(`${batch.id}:${step.id}`, async () => {
      await healthLogService.remove(log.id);
      toast.success(`Đã bỏ đánh dấu cho đàn ${batch.code}`);
    });

  const renderStep = (batch: PigletBatch, view: StepView) => {
    const { step, state, log, daysToStart } = view;
    const key = `${batch.id}:${step.id}`;
    const badge = STATE_BADGE[state];

    return (
      <li
        key={step.id}
        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="min-w-0 space-y-0.5">
          <p className="text-fg-muted text-xs font-bold">{step.age}</p>
          <p className="text-fg-body text-sm">{step.task}</p>
          {state === "done" && log && (
            <p className="text-success text-[11px]">
              Đã tiêm ngày {formatDate(log.log_date)}
              {log.vaccineType ? ` · ${log.vaccineType.name}` : ""}
              {Number(log.cost) > 0
                ? ` · ${formatCurrency(log.cost, "đ")}`
                : ""}
            </p>
          )}
          {state === "upcoming" && (
            <p className="text-fg-muted text-[11px]">
              Còn {daysToStart} ngày nữa đến hạn
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className={`badge ${badge.badge}`}>{badge.label}</span>
          {state !== "done" && (
            <Button
              size="sm"
              variant={state === "upcoming" ? "secondary" : "success"}
              disabled={pending === key}
              onClick={() => setInjecting({ batch, step })}
            >
              {pending === key ? "Đang lưu..." : "Đã tiêm"}
            </Button>
          )}
          {state === "done" && log && canUndo && (
            <Button
              size="sm"
              variant="text"
              disabled={pending === key}
              onClick={() => undo(batch, step, log)}
            >
              Bỏ đánh dấu
            </Button>
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<PawIcon size="sm" className="text-warning" />}
        title="Theo Dõi Tiêm Vaccine Heo Con"
        description={`Tiến độ tiêm vaccine của từng đàn heo con mới sinh (đến ${TRACK_UNTIL_DAY} ngày tuổi), theo bảng quy trình chuẩn.`}
        action={
          <Button href="/vaccine-schedule" variant="outline" size="sm">
            Xem bảng quy trình
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
          <div className="grid grid-cols-3 gap-3 sm:max-w-xl sm:gap-4">
            <div className="card p-4">
              <p className="text-fg-muted text-xs">Đàn đang theo dõi</p>
              <p className="text-fg mt-1 text-2xl font-black">{views.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-fg-muted text-xs">Mũi đến hạn</p>
              <p className="text-warning mt-1 text-2xl font-black">
                {dueCount}
              </p>
            </div>
            <div className="card p-4">
              <p className="text-fg-muted text-xs">Mũi quá hạn</p>
              <p className="text-danger mt-1 text-2xl font-black">
                {overdueCount}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-line-soft flex flex-col items-center justify-between gap-3 border-b p-4 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <SearchIcon
                  size="2xs"
                  className="text-fg-subtle pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    onPageChange(1);
                  }}
                  placeholder="Tìm mã đàn, mã nái..."
                  aria-label="Tìm đàn heo con"
                  className="bg-surface-muted border-line text-fg focus:ring-ring w-full rounded-lg border py-2 pr-3 pl-8 text-base focus:ring-2 focus:outline-none sm:text-xs"
                />
              </div>
              <div className="w-full sm:w-52">
                <SelectField
                  label=""
                  options={FILTER_OPTIONS}
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    onPageChange(1);
                  }}
                  size="sm"
                />
              </div>
            </div>
            <p className="text-fg-muted border-line-soft border-b px-4 py-2 text-xs">
              Bấm vào một đàn để xem lịch tiêm vaccine chi tiết.
            </p>
            <Table
              columns={columns}
              rows={pageRows}
              height="max-h-130"
              emptyMessage={
                views.length === 0
                  ? "Chưa có đàn heo con nào trong thời gian theo dõi vaccine."
                  : "Không tìm thấy đàn phù hợp."
              }
              onRowClick={(v) => setSelectedId(v.id)}
              page={currentPage}
              limit={limit}
              total={filtered.length}
              onPageChange={onPageChange}
              onLimitChange={onLimitChange}
            />
          </div>

          {selected && (
            <Modal
              title={`Lịch tiêm vaccine - ${selected.batch.code}`}
              maxWidth="max-w-2xl"
              onClose={() => setSelectedId(null)}
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-fg-muted text-xs">
                    Nái mẹ: {selected.batch.sow?.code ?? "—"} · Sinh{" "}
                    {formatDate(selected.batch.birth_date)} ·{" "}
                    {selected.batch.quantity ?? 0} con
                  </p>
                  <span className="badge badge-indigo shrink-0">
                    {selected.age} ngày tuổi
                  </span>
                </div>

                <div>
                  <div className="text-fg-muted mb-1 flex justify-between text-[11px]">
                    <span>
                      Đã tiêm {selected.doneCount}/{selected.steps.length} mũi
                    </span>
                    <span className="text-success font-bold">
                      {Math.round(
                        (selected.doneCount / selected.steps.length) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="bg-surface-hover h-2 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round((selected.doneCount / selected.steps.length) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <ul className="divide-line-soft divide-y">
                  {selected.steps.map((v) => renderStep(selected.batch, v))}
                </ul>
              </div>
            </Modal>
          )}

          {injecting && (
            <VaccinateModal
              key={`${injecting.batch.id}:${injecting.step.id}`}
              batchCode={injecting.batch.code}
              heads={injecting.batch.quantity ?? 1}
              step={injecting.step}
              vaccineTypes={vaccineTypes}
              onSubmit={submitInjection}
              onClose={() => setInjecting(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
