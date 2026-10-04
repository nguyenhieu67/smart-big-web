"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PiggyBankIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { SelectField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import { ConfirmModal, SowFormModal } from "@/components/modals";
import { Table } from "@/components/table";
import { Button } from "@/components/ui";
import { SOW_STATUS_OPTIONS } from "@/constants/sow";
import {
  useAppToast,
  useDebounce,
  useFetchData,
  usePagination,
  useTableActions,
} from "@/hooks";
import type { SowPayload } from "@/schemas/sowSchema";
import { penService } from "@/services/penService";
import { sowService } from "@/services/sowService";
import type { ColumnI } from "@/types/table";
import type { Farm } from "@/types/auth";
import type { Pen } from "@/types/pen";
import type { Sow } from "@/types/sow";
import { formatAge, formatDate } from "@/utils/format";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  ...SOW_STATUS_OPTIONS.map(({ value, label }) => ({ value, label })),
];

const EMPTY_SOWS: Sow[] = [];
const EMPTY_PENS: Pen[] = [];

export default function SowsPage() {
  return <FarmGate>{(farm) => <SowsContent farm={farm} />}</FarmGate>;
}

function SowsContent({ farm }: { farm: Farm }) {
  const canWrite = farm.role === "OWNER" || farm.role === "MANAGER";
  const canDelete = farm.role === "OWNER";

  const router = useRouter();
  const toast = useAppToast();
  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([sowService.list(), penService.list()]),
  );
  const [sows, pens] = data ?? [EMPTY_SOWS, EMPTY_PENS];

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const actions = useTableActions<Sow>({
    remove: (sow) => sowService.remove(sow.id),
    deletedMessage: (sow) => `Đã xóa nái ${sow.code}`,
    onDeleted: refetch,
  });

  const penNames = useMemo(
    () => new Map(pens.map((p) => [p.id, p.name])),
    [pens],
  );

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return sows.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (!q) return true;
      return [s.code, s.breed, s.origin ?? "", penNames.get(s.pen_id) ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [sows, debouncedQuery, statusFilter, penNames]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const columns: ColumnI<Sow>[] = [
    {
      value: "code",
      text: "Mã Nái",
      className: "text-primary font-bold",
    },
    { value: "breed", text: "Giống", className: "font-medium" },
    {
      value: "birth_date",
      text: "Ngày Sinh / Tuổi",
      render: (s) => (
        <>
          {formatDate(s.birth_date)}
          <span className="text-fg-muted block text-[11px]">
            {formatAge(s.birth_date)}
          </span>
        </>
      ),
    },
    {
      value: "weight",
      text: "Trọng Lượng",
      render: (s) => `${Number(s.weight)} kg`,
    },
    {
      value: "origin",
      text: "Nguồn Gốc",
      className: "text-fg-muted",
      render: (s) => s.origin || "—",
    },
    {
      value: "status",
      text: "Trạng Thái",
      render: (s) => {
        const status = SOW_STATUS_OPTIONS.find((o) => o.value === s.status);
        return (
          <span className={`badge ${status?.badge ?? "badge-muted"}`}>
            {status?.label ?? s.status}
          </span>
        );
      },
    },
    {
      value: "parity_count",
      text: "Lứa Đẻ",
      className: "text-center font-semibold",
    },
    {
      value: "pen",
      text: "Chuồng",
      render: (s) => penNames.get(s.pen_id) ?? "—",
    },
    ...(canWrite || canDelete ? [{ value: "actions", text: "Thao Tác" }] : []),
  ];

  // Nái bắt buộc thuộc một chuồng: chưa có chuồng thì đưa sang trang chuồng để tạo trước
  const handleCreate = () => {
    if (pens.length === 0) {
      toast.warning("Bạn cần tạo chuồng trước khi thêm nái");
      router.push("/pens");
      return;
    }
    actions.openCreate();
  };

  async function handleSubmit(payload: SowPayload) {
    if (actions.selectedItem) {
      await sowService.update(actions.selectedItem.id, payload);
      toast.success(`Đã cập nhật nái ${payload.code}`);
    } else {
      await sowService.create(payload);
      toast.success(`Đã thêm nái ${payload.code}`);
    }
    actions.closeForm();
    refetch();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<PiggyBankIcon size="sm" className="text-primary" />}
        title="1. Quản Lý Đàn Heo Nái"
        description="Danh sách nái sinh sản, giống, thể trạng, chuồng trại và lịch sử đẻ."
        action={
          canWrite && (
            <Button
              onClick={handleCreate}
              disabled={loading || !!error}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Thêm Nái Mới
            </Button>
          )
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
              placeholder="Tìm mã nái, giống, chuồng..."
              aria-label="Tìm kiếm heo nái"
              className="bg-surface-muted border-line text-fg focus:ring-ring w-full rounded-lg border py-2 pr-3 pl-8 text-base focus:ring-2 focus:outline-none sm:text-xs"
            />
          </div>
          <div className="w-full sm:w-52">
            <SelectField
              label=""
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
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
              sows.length === 0
                ? "Chưa có heo nái nào. Hãy thêm nái đầu tiên."
                : "Không tìm thấy heo nái phù hợp."
            }
            onEdit={canWrite ? actions.openEdit : undefined}
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
        <SowFormModal
          key={actions.selectedItem?.id ?? "new"}
          sow={actions.selectedItem}
          pens={pens}
          onSubmit={handleSubmit}
          onClose={actions.closeForm}
        />
      )}

      {actions.deleteTarget && (
        <ConfirmModal
          title="Xóa heo nái"
          message={
            <>
              Bạn chắc chắn muốn xóa nái{" "}
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
