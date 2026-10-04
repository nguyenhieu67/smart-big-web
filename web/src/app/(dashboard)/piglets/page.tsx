"use client";

import { useMemo, useState } from "react";

import { PawIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { SelectField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import { ConfirmModal, PigletBatchFormModal } from "@/components/modals";
import { Table } from "@/components/table";
import { Button } from "@/components/ui";
import { PIGLET_STAGE_OPTIONS } from "@/constants/piglet";
import {
  useAppToast,
  useDebounce,
  useFetchData,
  usePagination,
  useTableActions,
} from "@/hooks";
import type { PigletBatchPayload } from "@/schemas/pigletBatchSchema";
import { penService } from "@/services/penService";
import { pigletBatchService } from "@/services/pigletBatchService";
import { sowService } from "@/services/sowService";
import type { Farm } from "@/types/auth";
import type { Pen } from "@/types/pen";
import type { PigletBatch } from "@/types/piglet";
import type { Sow } from "@/types/sow";
import type { ColumnI } from "@/types/table";
import { dueDateTone, formatDate } from "@/utils/format";

const EMPTY_BATCHES: PigletBatch[] = [];
const EMPTY_SOWS: Sow[] = [];
const EMPTY_PENS: Pen[] = [];

const STAGE_FILTER_OPTIONS = [
  { value: "", label: "Tất cả giai đoạn" },
  ...PIGLET_STAGE_OPTIONS.map(({ value, label }) => ({ value, label })),
];

export default function PigletsPage() {
  return <FarmGate>{(farm) => <PigletsContent farm={farm} />}</FarmGate>;
}

function PigletsContent({ farm }: { farm: Farm }) {
  // Đàn heo con: ai cũng thêm và sửa, OWNER/MANAGER xóa
  const canDelete = farm.role === "OWNER" || farm.role === "MANAGER";

  const toast = useAppToast();
  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([
      pigletBatchService.list(),
      sowService.list(),
      penService.list(),
    ]),
  );
  const [batches, sows, pens] = data ?? [EMPTY_BATCHES, EMPTY_SOWS, EMPTY_PENS];

  const actions = useTableActions<PigletBatch>({
    remove: (b) => pigletBatchService.remove(b.id),
    deletedMessage: (b) => `Đã xóa đàn ${b.code}`,
    onDeleted: refetch,
  });

  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return batches.filter((b) => {
      if (stageFilter && b.stage !== stageFilter) return false;
      if (!q) return true;
      return `${b.code} ${b.sow?.code ?? ""} ${b.pen?.name ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [batches, debouncedQuery, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  async function handleSubmit(payload: PigletBatchPayload) {
    if (actions.selectedItem) {
      await pigletBatchService.update(actions.selectedItem.id, payload);
      toast.success(`Đã cập nhật đàn ${payload.code}`);
    } else {
      await pigletBatchService.create(payload);
      toast.success(`Đã tạo đàn ${payload.code}`);
    }
    actions.closeForm();
    refetch();
  }

  const columns: ColumnI<PigletBatch>[] = [
    {
      value: "code",
      text: "Mã Đàn",
      className: "text-warning-fg font-bold",
    },
    {
      value: "birth_date",
      text: "Ngày Sinh",
      render: (b) => formatDate(b.birth_date),
    },
    {
      value: "sow",
      text: "Nái Mẹ",
      className: "text-primary font-medium",
      render: (b) => b.sow?.code ?? "—",
    },
    {
      value: "quantity",
      text: "Số Lượng Hiện Tại",
      className: "text-center font-bold",
      render: (b) => (b.quantity != null ? `${b.quantity} con` : "—"),
    },
    {
      value: "avg_weight",
      text: "TL Trung Bình",
      className: "text-center font-semibold",
      render: (b) =>
        b.avg_weight != null ? `${Number(b.avg_weight)} kg` : "—",
    },
    {
      value: "stage",
      text: "Giai Đoạn",
      render: (b) => {
        const stage = PIGLET_STAGE_OPTIONS.find((o) => o.value === b.stage);
        return (
          <span className={`badge ${stage?.badge ?? "badge-muted"}`}>
            {stage?.label ?? b.stage}
          </span>
        );
      },
    },
    {
      value: "health",
      text: "Sức Khỏe",
      className: "text-success font-medium",
      render: (b) => b.health || "—",
    },
    {
      value: "target_wean_date",
      text: "Dự Kiến Cai Sữa",
      render: (b) =>
        b.target_wean_date ? (
          // Chỉ cảnh báo đến hạn khi đàn còn bú mẹ
          <span
            className={
              b.stage === "SUCKLING"
                ? dueDateTone(b.target_wean_date)
                : "text-fg-muted"
            }
          >
            {formatDate(b.target_wean_date)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      value: "pen",
      text: "Chuồng",
      render: (b) => b.pen?.name ?? "—",
    },
    { value: "actions", text: "Thao Tác" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<PawIcon size="sm" className="text-warning" />}
        title="5. Quản Lý Đàn Heo Con & Cai Sữa"
        description="Theo dõi đàn heo con, trọng lượng, giai đoạn, sức khỏe và ngày dự kiến cai sữa."
        action={
          <Button
            onClick={actions.openCreate}
            disabled={loading || !!error}
            leftIcon={<PlusIcon size="xs" />}
            className="rounded-xl text-xs font-semibold"
          >
            Tạo Đàn Heo Mới
          </Button>
        }
      />

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
              placeholder="Tìm mã đàn, nái mẹ, chuồng..."
              aria-label="Tìm đàn heo con"
              className="bg-surface-muted border-line text-fg focus:ring-ring w-full rounded-lg border py-2 pr-3 pl-8 text-base focus:ring-2 focus:outline-none sm:text-xs"
            />
          </div>
          <div className="w-full sm:w-52">
            <SelectField
              label=""
              options={STAGE_FILTER_OPTIONS}
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
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
              batches.length === 0
                ? "Chưa có đàn heo con nào."
                : "Không tìm thấy đàn phù hợp."
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
        <PigletBatchFormModal
          key={actions.selectedItem?.id ?? "new"}
          batch={actions.selectedItem}
          sows={sows}
          pens={pens}
          onSubmit={handleSubmit}
          onClose={actions.closeForm}
        />
      )}

      {actions.deleteTarget && (
        <ConfirmModal
          title="Xóa đàn heo"
          message={
            <>
              Bạn chắc chắn muốn xóa đàn{" "}
              <strong>{actions.deleteTarget.code}</strong>? Thao tác này không
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
