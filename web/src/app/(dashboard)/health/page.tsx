"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PlusIcon, SearchIcon, SyringeIcon } from "@/components/icons";
import { SelectField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import {
  ConfirmModal,
  HealthLogFormModal,
  VaccineTypeFormModal,
} from "@/components/modals";
import { Table } from "@/components/table";
import { Button, Tabs } from "@/components/ui";
import {
  HEALTH_CATEGORY_OPTIONS,
  TREATMENT_STATUS_OPTIONS,
} from "@/constants/healthLog";
import {
  useAppToast,
  useDebounce,
  useFetchData,
  usePagination,
  useTableActions,
} from "@/hooks";
import { VACCINE_STEPS } from "@/constants/pigletCare";
import type { HealthLogPayload } from "@/schemas/healthLogSchema";
import type { VaccineTypePayload } from "@/schemas/vaccineTypeSchema";
import { healthLogService } from "@/services/healthLogService";
import { pigletBatchService } from "@/services/pigletBatchService";
import { vaccineTypeService } from "@/services/vaccineTypeService";
import { sowService } from "@/services/sowService";
import type { Farm } from "@/types/auth";
import type { HealthLog } from "@/types/healthLog";
import type { PigletBatch } from "@/types/piglet";
import type { Sow } from "@/types/sow";
import type { VaccineType } from "@/types/vaccine";
import type { ColumnI } from "@/types/table";
import { dueDateTone, formatCurrency, formatDate } from "@/utils/format";

const EMPTY_LOGS: HealthLog[] = [];
const EMPTY_SOWS: Sow[] = [];
const EMPTY_BATCHES: PigletBatch[] = [];

const EMPTY_VACCINES: VaccineType[] = [];

type Tab = "sows" | "piglets" | "vaccines";

const CATEGORY_FILTER_OPTIONS = [
  { value: "", label: "Tất cả phân loại" },
  ...HEALTH_CATEGORY_OPTIONS.map(({ value, label }) => ({ value, label })),
];

export default function HealthPage() {
  return <FarmGate>{(farm) => <HealthContent farm={farm} />}</FarmGate>;
}

function HealthContent({ farm }: { farm: Farm }) {
  // Nhật ký sức khỏe: ai cũng ghi và sửa, OWNER/MANAGER xóa
  const canDelete = farm.role === "OWNER" || farm.role === "MANAGER";
  // Danh mục vaccine: OWNER/MANAGER thêm sửa, OWNER xóa
  const isManager = canDelete;
  const canDeleteVaccine = farm.role === "OWNER";

  const router = useRouter();
  const toast = useAppToast();

  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([
      healthLogService.list(),
      sowService.list(),
      pigletBatchService.list(),
      vaccineTypeService.list(),
    ]),
  );
  const [logs, sows, batches, vaccineTypes] = data ?? [
    EMPTY_LOGS,
    EMPTY_SOWS,
    EMPTY_BATCHES,
    EMPTY_VACCINES,
  ];

  // 2 bảng: nhật ký của heo nái (sow_id) và của đàn heo con (batch_id)
  const [tab, setTab] = useState<Tab>("sows");
  const sowLogs = useMemo(() => logs.filter((l) => l.sow_id != null), [logs]);
  const pigletLogs = useMemo(
    () => logs.filter((l) => l.batch_id != null),
    [logs],
  );
  const tabLogs = tab === "sows" ? sowLogs : pigletLogs; // tab vaccine không dùng

  const vaccineActions = useTableActions<VaccineType>({
    remove: (v) => vaccineTypeService.remove(v.id),
    deletedMessage: (v) => `Đã xóa ${v.name}`,
    onDeleted: refetch,
  });

  const actions = useTableActions<HealthLog>({
    remove: (log) => healthLogService.remove(log.id),
    deletedMessage: () => "Đã xóa nhật ký sức khỏe",
    onDeleted: refetch,
  });

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return tabLogs.filter((l) => {
      if (categoryFilter && l.category !== categoryFilter) return false;
      if (!q) return true;
      return [
        l.name,
        l.dose ?? "",
        l.sow?.code ?? "",
        l.pigletBatch?.code ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [tabLogs, debouncedQuery, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  // Bản ghi sức khỏe gắn với một nái hoặc một đàn heo con nên cần có trước
  const handleCreate = () => {
    if (tab === "sows" && sows.length === 0) {
      toast.warning("Bạn cần thêm nái trước khi ghi nhận sức khỏe");
      router.push("/sows");
      return;
    }
    if (tab === "piglets" && !batches.some((b) => b.stage !== "SOLD")) {
      toast.warning("Bạn cần có đàn heo con trước khi ghi nhận sức khỏe");
      router.push("/piglets");
      return;
    }
    actions.openCreate();
  };

  async function handleSubmitVaccine(payload: VaccineTypePayload) {
    if (vaccineActions.selectedItem) {
      await vaccineTypeService.update(vaccineActions.selectedItem.id, payload);
      toast.success(`Đã cập nhật ${payload.name}`);
    } else {
      await vaccineTypeService.create(payload);
      toast.success(`Đã thêm ${payload.name}`);
    }
    vaccineActions.closeForm();
    refetch();
  }

  // Tiêm vaccine nhập tay: tên đã có trong danh mục thì gắn vào, chưa có thì thêm vào danh mục.
  // Thêm danh mục lỗi (vd. thành viên không đủ quyền, trùng tên đã xóa) thì vẫn lưu nhật ký như thường.
  async function linkVaccine(
    payload: HealthLogPayload,
  ): Promise<HealthLogPayload> {
    if (payload.category !== "VACCINATION" || payload.vaccine_type_id) {
      return payload;
    }
    const name = payload.name.trim().toLowerCase();
    const existing = vaccineTypes.find(
      (v) => v.name.trim().toLowerCase() === name,
    );
    if (existing) return { ...payload, vaccine_type_id: String(existing.id) };

    // Chi phí danh mục tính theo con: nhật ký của đàn thì chia cho số con của đàn
    const heads = payload.batch_id
      ? (batches.find((b) => String(b.id) === payload.batch_id)?.quantity ?? 1)
      : 1;
    try {
      const created = await vaccineTypeService.create({
        name: payload.name,
        dose: payload.dose,
        default_cost:
          payload.cost != null && heads > 0
            ? Math.round((payload.cost / heads) * 100) / 100
            : undefined,
        step_keys: [],
      });
      toast.success(`Đã thêm "${created.name}" vào danh mục vaccine`);
      return { ...payload, vaccine_type_id: String(created.id) };
    } catch {
      return payload;
    }
  }

  async function handleSubmit(input: HealthLogPayload) {
    const payload = await linkVaccine(input);
    if (actions.selectedItem) {
      await healthLogService.update(actions.selectedItem.id, payload);
      toast.success("Đã cập nhật nhật ký sức khỏe");
    } else {
      await healthLogService.create(payload);
      toast.success("Đã ghi nhận sức khỏe");
    }
    actions.closeForm();
    refetch();
  }

  const columns: ColumnI<HealthLog>[] = [
    {
      value: "log_date",
      text: "Ngày Ghi Nhận",
      className: "text-fg-muted",
      render: (l) => formatDate(l.log_date),
    },
    {
      value: "target",
      text: tab === "sows" ? "Mã Nái" : "Mã Đàn Heo Con",
      className: "text-fg font-bold",
      render: (l) => l.sow?.code ?? l.pigletBatch?.code ?? "—",
    },
    {
      value: "category",
      text: "Phân Loại",
      render: (l) => {
        const category = HEALTH_CATEGORY_OPTIONS.find(
          (o) => o.value === l.category,
        );
        return (
          <span className={`badge ${category?.badge ?? "badge-muted"}`}>
            {category?.label ?? l.category}
          </span>
        );
      },
    },
    {
      value: "name",
      text: "Tên Vaccine / Thuốc / Triệu Chứng",
      className: "font-semibold",
    },
    {
      value: "dose",
      text: "Liều Dùng / Chẩn Đoán",
      className: "text-fg-muted",
      render: (l) => l.dose || "—",
    },
    {
      value: "status",
      text: "Trạng Thái",
      className: "font-medium",
      render: (l) =>
        TREATMENT_STATUS_OPTIONS.find((o) => o.value === l.status)?.label ??
        l.status,
    },
    {
      value: "next_date",
      text: "Lịch Tiếp Theo",
      render: (l) =>
        l.next_date ? (
          <span className={dueDateTone(l.next_date)}>
            {formatDate(l.next_date)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      value: "cost",
      text: "Chi Phí",
      className: "text-danger font-bold",
      render: (l) => formatCurrency(l.cost, "đ"),
    },
    { value: "actions", text: "Thao Tác" },
  ];

  const vaccineColumns: ColumnI<VaccineType>[] = [
    { value: "name", text: "Tên Vaccine", className: "text-fg font-bold" },
    {
      value: "dose",
      text: "Liều Mặc Định",
      className: "text-fg-muted",
      render: (v) => v.dose || "—",
    },
    {
      value: "default_cost",
      text: "Chi Phí Mặc Định / Con",
      className: "text-danger font-bold",
      render: (v) =>
        v.default_cost != null ? formatCurrency(v.default_cost, "đ") : "—",
    },
    {
      value: "step_keys",
      text: "Dùng Cho Mốc Quy Trình",
      render: (v) => {
        const ages = VACCINE_STEPS.filter((s) =>
          v.step_keys.includes(s.id),
        ).map((s) => s.age);
        return ages.length ? (
          <div className="flex flex-wrap gap-1">
            {ages.map((age) => (
              <span key={age} className="badge badge-info">
                {age}
              </span>
            ))}
          </div>
        ) : (
          "—"
        );
      },
    },
    ...(isManager ? [{ value: "actions", text: "Thao Tác" }] : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<SyringeIcon size="sm" className="text-success" />}
        title="7 & 8. Quản Lý Thuốc, Vaccine & Sức Khỏe"
        description="Lịch tiêm phòng, nhật ký điều trị heo bệnh, chẩn đoán, thuốc sử dụng và theo dõi heo chết/loại thải."
        action={
          tab === "vaccines" ? (
            isManager && (
              <Button
                onClick={vaccineActions.openCreate}
                disabled={loading || !!error}
                leftIcon={<PlusIcon size="xs" />}
                className="rounded-xl text-xs font-semibold"
              >
                Thêm Vaccine
              </Button>
            )
          ) : (
            <Button
              onClick={handleCreate}
              disabled={loading || !!error}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Ghi Nhận Sức Khỏe
            </Button>
          )
        }
      />

      <Tabs
        tabs={[
          { value: "sows", label: `Heo nái (${sowLogs.length})` },
          { value: "piglets", label: `Heo con (${pigletLogs.length})` },
          {
            value: "vaccines",
            label: `Danh mục vaccine (${vaccineTypes.length})`,
          },
        ]}
        value={tab}
        onChange={(value) => {
          setTab(value);
          onPageChange(1);
        }}
      />

      <div className="card overflow-hidden">
        {tab !== "vaccines" && (
          <div className="border-line-soft flex flex-col items-center justify-between gap-3 border-b p-4 sm:flex-row">
            <div className="relative w-full sm:w-72">
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
                placeholder={
                  tab === "sows"
                    ? "Tìm nái, tên thuốc, triệu chứng..."
                    : "Tìm đàn, tên thuốc, triệu chứng..."
                }
                aria-label="Tìm nhật ký sức khỏe"
                className="bg-surface-muted border-line text-fg focus:ring-ring w-full rounded-lg border py-2 pr-3 pl-8 text-base focus:ring-2 focus:outline-none sm:text-xs"
              />
            </div>
            <div className="w-full sm:w-52">
              <SelectField
                label=""
                options={CATEGORY_FILTER_OPTIONS}
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  onPageChange(1);
                }}
                size="sm"
              />
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-fg-muted p-6 text-center text-sm">Đang tải...</p>
        ) : error ? (
          <div className="space-y-3 p-6 text-center">
            <p className="text-danger text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Thử lại
            </Button>
          </div>
        ) : tab === "vaccines" ? (
          <Table
            columns={vaccineColumns}
            rows={vaccineTypes}
            height="max-h-130"
            emptyMessage="Chưa có vaccine nào. Hãy thêm mới."
            onEdit={isManager ? vaccineActions.openEdit : undefined}
            onDelete={canDeleteVaccine ? vaccineActions.askDelete : undefined}
          />
        ) : (
          <Table
            columns={columns}
            rows={pageRows}
            height="max-h-130"
            emptyMessage={
              tabLogs.length === 0
                ? tab === "sows"
                  ? "Chưa có nhật ký sức khỏe nào của heo nái."
                  : "Chưa có nhật ký sức khỏe nào của heo con."
                : "Không tìm thấy nhật ký phù hợp."
            }
            onEdit={actions.openEdit}
            onDelete={canDelete ? actions.askDelete : undefined}
            page={currentPage}
            limit={limit}
            total={filtered.length}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        )}
      </div>

      {actions.isFormOpen && (
        <HealthLogFormModal
          key={actions.selectedItem?.id ?? "new"}
          log={actions.selectedItem}
          target={tab === "sows" ? "sow" : "batch"}
          sows={sows}
          batches={batches}
          vaccineTypes={vaccineTypes}
          onSubmit={handleSubmit}
          onClose={actions.closeForm}
        />
      )}

      {vaccineActions.isFormOpen && (
        <VaccineTypeFormModal
          key={vaccineActions.selectedItem?.id ?? "new"}
          vaccineType={vaccineActions.selectedItem}
          onSubmit={handleSubmitVaccine}
          onClose={vaccineActions.closeForm}
        />
      )}

      {vaccineActions.deleteTarget && (
        <ConfirmModal
          title="Xóa vaccine"
          message={
            <>
              Bạn chắc chắn muốn xóa{" "}
              <strong>{vaccineActions.deleteTarget.name}</strong> khỏi danh mục?
              Các nhật ký đã ghi vẫn giữ nguyên.
            </>
          }
          confirmLabel="Xóa"
          loading={vaccineActions.deleteLoading}
          onConfirm={vaccineActions.confirmDelete}
          onClose={vaccineActions.cancelDelete}
        />
      )}

      {actions.deleteTarget && (
        <ConfirmModal
          title="Xóa nhật ký sức khỏe"
          message={
            <>
              Bạn chắc chắn muốn xóa nhật ký{" "}
              <strong>{actions.deleteTarget.name}</strong>? Thao tác này không
              thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={actions.deleteLoading}
          onConfirm={actions.confirmDelete}
          onClose={actions.cancelDelete}
        />
      )}
    </div>
  );
}
