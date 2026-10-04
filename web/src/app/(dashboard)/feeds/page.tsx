"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { PlusIcon, SearchIcon, WheatAwnIcon } from "@/components/icons";
import { FarmGate, PageHeader } from "@/components/layout";
import {
  ConfirmModal,
  FeedLogFormModal,
  FeedTypeFormModal,
} from "@/components/modals";
import { Table } from "@/components/table";
import { Button, Tabs } from "@/components/ui";
import {
  useAppToast,
  useDebounce,
  useFetchData,
  usePagination,
  useTableActions,
} from "@/hooks";
import type { FeedLogPayload } from "@/schemas/feedLogSchema";
import type { FeedTypePayload } from "@/schemas/feedTypeSchema";
import { feedLogService } from "@/services/feedLogService";
import { feedTypeService } from "@/services/feedTypeService";
import { penService } from "@/services/penService";
import type { Farm } from "@/types/auth";
import type { FeedLog, FeedType } from "@/types/feed";
import type { Pen } from "@/types/pen";
import type { ColumnI } from "@/types/table";
import { formatCurrency, formatDate } from "@/utils/format";

const EMPTY_LOGS: FeedLog[] = [];
const EMPTY_TYPES: FeedType[] = [];
const EMPTY_PENS: Pen[] = [];

type Tab = "logs" | "types";

export default function FeedsPage() {
  return <FarmGate>{(farm) => <FeedsContent farm={farm} />}</FarmGate>;
}

function FeedsContent({ farm }: { farm: Farm }) {
  // Danh mục loại cám: OWNER/MANAGER thêm sửa, OWNER xóa. Nhật ký cho ăn: ai cũng ghi, OWNER/MANAGER xóa.
  const isManager = farm.role === "OWNER" || farm.role === "MANAGER";
  const canDeleteType = farm.role === "OWNER";

  const router = useRouter();
  const toast = useAppToast();
  const [tab, setTab] = useState<Tab>("logs");

  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([
      feedLogService.list(),
      feedTypeService.list(),
      penService.list(),
    ]),
  );
  const [logs, feedTypes, pens] = data ?? [EMPTY_LOGS, EMPTY_TYPES, EMPTY_PENS];

  const logActions = useTableActions<FeedLog>({
    remove: (log) => feedLogService.remove(log.id),
    deletedMessage: () => "Đã xóa nhật ký cho ăn",
    onDeleted: refetch,
  });
  const typeActions = useTableActions<FeedType>({
    remove: (type) => feedTypeService.remove(type.id),
    deletedMessage: (type) => `Đã xóa loại cám ${type.name}`,
    onDeleted: refetch,
  });

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const filteredLogs = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((l) =>
      [
        l.feedType.name,
        l.feedType.code ?? "",
        l.pen?.name ?? "",
        l.pigletBatch?.code ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [logs, debouncedQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageLogs = filteredLogs.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  // Ghi nhận cám cần có loại cám và chuồng trước
  const handleCreateLog = () => {
    if (feedTypes.length === 0) {
      toast.warning("Bạn cần tạo loại cám trước khi ghi nhận cho ăn");
      if (isManager) setTab("types");
      return;
    }
    if (pens.length === 0) {
      toast.warning("Bạn cần tạo chuồng trước khi ghi nhận cho ăn");
      router.push("/pens");
      return;
    }
    logActions.openCreate();
  };

  async function handleSubmitLog(payload: FeedLogPayload) {
    if (logActions.selectedItem) {
      await feedLogService.update(logActions.selectedItem.id, payload);
      toast.success("Đã cập nhật nhật ký cho ăn");
    } else {
      await feedLogService.create(payload);
      toast.success("Đã ghi nhận cho ăn");
    }
    logActions.closeForm();
    refetch();
  }

  async function handleSubmitType(payload: FeedTypePayload) {
    if (typeActions.selectedItem) {
      await feedTypeService.update(typeActions.selectedItem.id, payload);
      toast.success(`Đã cập nhật loại cám ${payload.name}`);
    } else {
      await feedTypeService.create(payload);
      toast.success(`Đã thêm loại cám ${payload.name}`);
    }
    typeActions.closeForm();
    refetch();
  }

  const logColumns: ColumnI<FeedLog>[] = [
    {
      value: "log_date",
      text: "Ngày",
      className: "text-fg-muted",
      render: (l) => formatDate(l.log_date),
    },
    {
      value: "feed_type",
      text: "Loại Cám",
      className: "text-warning-fg font-bold",
      render: (l) =>
        l.feedType.code
          ? `(${l.feedType.code}) ${l.feedType.name}`
          : l.feedType.name,
    },
    {
      value: "target",
      text: "Chuồng / Đàn",
      className: "font-medium",
      render: (l) => l.pen?.name ?? l.pigletBatch?.code ?? "—",
    },
    {
      value: "quantity_kg",
      text: "Số Lượng",
      className: "font-semibold",
      render: (l) => `${Number(l.quantity_kg)} kg`,
    },
    {
      value: "daily_per_head",
      text: "Lượng Ăn/Con/Ngày",
      render: (l) =>
        l.daily_per_head != null ? `${Number(l.daily_per_head)} kg/con` : "—",
    },
    {
      value: "price_per_kg",
      text: "Đơn Giá / Kg",
      render: (l) => formatCurrency(l.price_per_kg, "đ"),
    },
    {
      value: "total_cost",
      text: "Thành Tiền",
      className: "text-warning-fg font-bold",
      render: (l) => formatCurrency(l.total_cost, "đ"),
    },
    { value: "actions", text: "Thao Tác" },
  ];

  const typeColumns: ColumnI<FeedType>[] = [
    {
      value: "code",
      text: "Mã Cám",
      className: "text-warning-fg font-bold",
      render: (t) => t.code ?? "—",
    },
    { value: "name", text: "Tên Loại Cám", className: "font-medium" },
    {
      value: "default_price_per_kg",
      text: "Giá Mặc Định / Kg",
      render: (t) =>
        t.default_price_per_kg != null
          ? formatCurrency(t.default_price_per_kg, "đ")
          : "—",
    },
    ...(isManager ? [{ value: "actions", text: "Thao Tác" }] : []),
  ];

  const disabled = loading || !!error;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<WheatAwnIcon size="sm" className="text-warning" />}
        title="6. Quản Lý Thức Ăn & Cám"
        description="Định lượng tiêu thụ cám theo chuồng, loại cám và tổng chi phí cám."
        action={
          tab === "logs" ? (
            <Button
              onClick={handleCreateLog}
              disabled={disabled}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Ghi Nhận Cho Ăn
            </Button>
          ) : (
            isManager && (
              <Button
                onClick={typeActions.openCreate}
                disabled={disabled}
                leftIcon={<PlusIcon size="xs" />}
                className="rounded-xl text-xs font-semibold"
              >
                Thêm Loại Cám
              </Button>
            )
          )
        }
      />

      <Tabs
        tabs={[
          { value: "logs", label: "Nhật ký cho ăn" },
          { value: "types", label: "Loại cám" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="card overflow-hidden">
        {tab === "logs" && (
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
                placeholder="Tìm loại cám, chuồng..."
                aria-label="Tìm nhật ký cho ăn"
                className="bg-surface-muted border-line text-fg focus:ring-ring w-full rounded-lg border py-2 pr-3 pl-8 text-base focus:ring-2 focus:outline-none sm:text-xs"
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
        ) : tab === "logs" ? (
          <Table
            columns={logColumns}
            rows={pageLogs}
            height="max-h-130"
            emptyMessage={
              logs.length === 0
                ? "Chưa có nhật ký cho ăn nào."
                : "Không tìm thấy nhật ký phù hợp."
            }
            onEdit={logActions.openEdit}
            onDelete={isManager ? logActions.askDelete : undefined}
            page={currentPage}
            limit={limit}
            total={filteredLogs.length}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        ) : (
          <Table
            columns={typeColumns}
            rows={feedTypes}
            height="max-h-130"
            emptyMessage="Chưa có loại cám nào. Hãy thêm loại cám đầu tiên."
            onEdit={isManager ? typeActions.openEdit : undefined}
            onDelete={canDeleteType ? typeActions.askDelete : undefined}
          />
        )}
      </div>

      {logActions.isFormOpen && (
        <FeedLogFormModal
          key={logActions.selectedItem?.id ?? "new"}
          log={logActions.selectedItem}
          feedTypes={feedTypes}
          pens={pens}
          onSubmit={handleSubmitLog}
          onClose={logActions.closeForm}
        />
      )}

      {typeActions.isFormOpen && (
        <FeedTypeFormModal
          key={typeActions.selectedItem?.id ?? "new"}
          feedType={typeActions.selectedItem}
          onSubmit={handleSubmitType}
          onClose={typeActions.closeForm}
        />
      )}

      {logActions.deleteTarget && (
        <ConfirmModal
          title="Xóa nhật ký cho ăn"
          message="Bạn chắc chắn muốn xóa nhật ký này? Thao tác này không thể hoàn tác."
          confirmLabel="Xóa"
          loading={logActions.deleteLoading}
          onConfirm={logActions.confirmDelete}
          onClose={logActions.cancelDelete}
        />
      )}

      {typeActions.deleteTarget && (
        <ConfirmModal
          title="Xóa loại cám"
          message={
            <>
              Bạn chắc chắn muốn xóa loại cám{" "}
              <strong>{typeActions.deleteTarget.name}</strong>? Thao tác này
              không thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={typeActions.deleteLoading}
          onConfirm={typeActions.confirmDelete}
          onClose={typeActions.cancelDelete}
        />
      )}
    </div>
  );
}
