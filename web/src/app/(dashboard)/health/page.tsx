"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PlusIcon, SearchIcon, SyringeIcon } from "@/components/icons";
import { SelectField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import { ConfirmModal, HealthLogFormModal } from "@/components/modals";
import { Table } from "@/components/table";
import { Button } from "@/components/ui";
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
import type { HealthLogPayload } from "@/schemas/healthLogSchema";
import { healthLogService } from "@/services/healthLogService";
import { sowService } from "@/services/sowService";
import type { Farm } from "@/types/auth";
import type { HealthLog } from "@/types/healthLog";
import type { Sow } from "@/types/sow";
import type { ColumnI } from "@/types/table";
import {
  formatCurrency,
  formatDate,
  toInputDate,
  toLocalDateString,
} from "@/utils/format";

const EMPTY_LOGS: HealthLog[] = [];
const EMPTY_SOWS: Sow[] = [];

const CATEGORY_FILTER_OPTIONS = [
  { value: "", label: "Tất cả phân loại" },
  ...HEALTH_CATEGORY_OPTIONS.map(({ value, label }) => ({ value, label })),
];

const DAY_MS = 24 * 60 * 60 * 1000;

// Lịch tiếp theo: quá hạn (đỏ), trong 7 ngày tới (vàng), còn lại bình thường
function nextDateTone(nextDate: string) {
  const today = toLocalDateString();
  const date = toInputDate(nextDate);
  if (date < today) return "text-danger font-semibold";
  const days = (Date.parse(date) - Date.parse(today)) / DAY_MS;
  return days <= 7 ? "text-warning-fg font-semibold" : "text-indigo-fg";
}

export default function HealthPage() {
  return <FarmGate>{(farm) => <HealthContent farm={farm} />}</FarmGate>;
}

function HealthContent({ farm }: { farm: Farm }) {
  // Nhật ký sức khỏe: ai cũng ghi và sửa, OWNER/MANAGER xóa
  const canDelete = farm.role === "OWNER" || farm.role === "MANAGER";

  const router = useRouter();
  const toast = useAppToast();

  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([healthLogService.list(), sowService.list()]),
  );
  const [logs, sows] = data ?? [EMPTY_LOGS, EMPTY_SOWS];

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
    return logs.filter((l) => {
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
  }, [logs, debouncedQuery, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  // Bản ghi sức khỏe gắn với một nái nên cần có nái trước
  const handleCreate = () => {
    if (sows.length === 0) {
      toast.warning("Bạn cần thêm nái trước khi ghi nhận sức khỏe");
      router.push("/sows");
      return;
    }
    actions.openCreate();
  };

  async function handleSubmit(payload: HealthLogPayload) {
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
      text: "Heo / Đàn",
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
          <span className={nextDateTone(l.next_date)}>
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

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<SyringeIcon size="sm" className="text-success" />}
        title="7 & 8. Quản Lý Thuốc, Vaccine & Sức Khỏe"
        description="Lịch tiêm phòng, nhật ký điều trị heo bệnh, chẩn đoán, thuốc sử dụng và theo dõi heo chết/loại thải."
        action={
          <Button
            onClick={handleCreate}
            disabled={loading || !!error}
            leftIcon={<PlusIcon size="xs" />}
            className="rounded-xl text-xs font-semibold"
          >
            Ghi Nhận Sức Khỏe
          </Button>
        }
      />

      <div className="card overflow-hidden">
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
              placeholder="Tìm nái, tên thuốc, triệu chứng..."
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

        {loading ? (
          <p className="text-fg-muted p-6 text-center text-sm">Đang tải...</p>
        ) : error ? (
          <div className="space-y-3 p-6 text-center">
            <p className="text-danger text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Thử lại
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            rows={pageRows}
            height="max-h-130"
            emptyMessage={
              logs.length === 0
                ? "Chưa có nhật ký sức khỏe nào."
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
          sows={sows}
          onSubmit={handleSubmit}
          onClose={actions.closeForm}
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
