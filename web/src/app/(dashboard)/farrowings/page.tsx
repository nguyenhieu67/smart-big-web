"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { HeartPulseIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { FarmGate, PageHeader } from "@/components/layout";
import { ConfirmModal, FarrowingFormModal } from "@/components/modals";
import { Table } from "@/components/table";
import { Button } from "@/components/ui";
import {
  useAppToast,
  useDebounce,
  useFetchData,
  usePagination,
  useTableActions,
} from "@/hooks";
import type { FarrowingPayload } from "@/schemas/farrowingSchema";
import { farrowingService } from "@/services/farrowingService";
import { sowService } from "@/services/sowService";
import type { Farm } from "@/types/auth";
import type { Farrowing } from "@/types/farrowing";
import type { Sow } from "@/types/sow";
import type { ColumnI } from "@/types/table";
import { formatDate } from "@/utils/format";

const EMPTY_FARROWINGS: Farrowing[] = [];
const EMPTY_SOWS: Sow[] = [];

export default function FarrowingsPage() {
  return <FarmGate>{(farm) => <FarrowingsContent farm={farm} />}</FarmGate>;
}

function FarrowingsContent({ farm }: { farm: Farm }) {
  // Nhật ký sinh sản: ai cũng thêm và sửa, OWNER/MANAGER xóa
  const canDelete = farm.role === "OWNER" || farm.role === "MANAGER";

  const router = useRouter();
  const toast = useAppToast();

  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([farrowingService.list(), sowService.list()]),
  );
  const [farrowings, sows] = data ?? [EMPTY_FARROWINGS, EMPTY_SOWS];

  const actions = useTableActions<Farrowing>({
    remove: (f) => farrowingService.remove(f.id),
    deletedMessage: (f) => `Đã xóa ca sinh của nái ${f.sow.code}`,
    onDeleted: refetch,
  });

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return farrowings;
    return farrowings.filter((f) =>
      `${f.sow.code} ${f.pigletBatch?.code ?? ""}`.toLowerCase().includes(q),
    );
  }, [farrowings, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  // Chỉ nái đang mang thai mới ghi nhận đẻ; phối giống thành công mới chuyển nái sang mang thai
  const handleCreate = () => {
    if (!sows.some((s) => s.status === "PREGNANT")) {
      toast.warning("Chưa có nái nào đang mang thai để ghi nhận ca sinh");
      router.push("/matings");
      return;
    }
    actions.openCreate();
  };

  async function handleSubmit(payload: FarrowingPayload) {
    if (actions.selectedItem) {
      await farrowingService.update(actions.selectedItem.id, payload);
      toast.success("Đã cập nhật ca sinh");
    } else {
      await farrowingService.create(payload);
      toast.success("Đã ghi nhận ca sinh");
    }
    actions.closeForm();
    refetch();
  }

  const columns: ColumnI<Farrowing>[] = [
    {
      value: "sow",
      text: "Mã Nái Mẹ",
      className: "text-danger font-bold",
      render: (f) => f.sow.code,
    },
    {
      value: "farrow_date",
      text: "Ngày Sinh",
      className: "font-medium",
      render: (f) => formatDate(f.farrow_date),
    },
    {
      value: "batch",
      text: "Mã Đàn Khởi Tạo",
      render: (f) =>
        f.pigletBatch ? (
          <span className="badge badge-warning">{f.pigletBatch.code}</span>
        ) : (
          "—"
        ),
    },
    {
      value: "total_born",
      text: "Tổng Sinh",
      className: "text-center font-bold",
    },
    {
      value: "live_born",
      text: "Sống",
      className: "text-success text-center font-bold",
      render: (f) => f.live_born ?? 0,
    },
    {
      value: "dead_born",
      text: "Chết",
      className: "text-danger text-center font-bold",
      render: (f) => f.dead_born ?? 0,
    },
    {
      value: "weak_born",
      text: "Con Yếu",
      className: "text-warning text-center font-bold",
      render: (f) => f.weak_born ?? 0,
    },
    {
      value: "avg_birth_weight",
      text: "TL Sơ Sinh TB",
      className: "text-center",
      render: (f) =>
        f.avg_birth_weight != null ? `${Number(f.avg_birth_weight)} kg` : "—",
    },
    {
      value: "assist_note",
      text: "Ghi Chú Hỗ Trợ Sinh",
      className: "text-fg-muted",
      render: (f) => f.assist_note || "—",
    },
    { value: "actions", text: "Thao Tác" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<HeartPulseIcon size="sm" className="text-danger" />}
        title="4. Quản Lý Sinh Sản (Nái Đẻ)"
        description="Ghi nhận kết quả sinh sản: số con sống, con chết, con yếu và hỗ trợ sinh."
        action={
          <Button
            onClick={handleCreate}
            disabled={loading || !!error}
            leftIcon={<PlusIcon size="xs" />}
            className="rounded-xl text-xs font-semibold"
          >
            Ghi Nhận Ca Sinh
          </Button>
        }
      />

      <div className="card overflow-hidden">
        <div className="border-line-soft border-b p-4">
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
              placeholder="Tìm mã nái, mã đàn..."
              aria-label="Tìm ca sinh"
              className="bg-surface-muted border-line text-fg focus:ring-ring w-full rounded-lg border py-2 pr-3 pl-8 text-base focus:ring-2 focus:outline-none sm:text-xs"
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
              farrowings.length === 0
                ? "Chưa có ca sinh nào."
                : "Không tìm thấy ca sinh phù hợp."
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
        <FarrowingFormModal
          key={actions.selectedItem?.id ?? "new"}
          farrowing={actions.selectedItem}
          sows={sows}
          onSubmit={handleSubmit}
          onClose={actions.closeForm}
        />
      )}

      {actions.deleteTarget && (
        <ConfirmModal
          title="Xóa ca sinh"
          message={
            <>
              Bạn chắc chắn muốn xóa ca sinh của nái{" "}
              <strong>{actions.deleteTarget.sow.code}</strong>? Số lứa của nái
              sẽ giảm 1 và đàn heo con sinh ra từ ca này cũng bị xóa.
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
