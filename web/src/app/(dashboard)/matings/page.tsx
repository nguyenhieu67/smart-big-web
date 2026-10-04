"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DnaIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { SelectField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import {
  BoarFormModal,
  ConfirmModal,
  MatingFormModal,
} from "@/components/modals";
import { Table } from "@/components/table";
import { Button, Tabs } from "@/components/ui";
import { MATING_RESULT_OPTIONS } from "@/constants/mating";
import {
  useAppToast,
  useDebounce,
  useFetchData,
  usePagination,
  useTableActions,
} from "@/hooks";
import type { BoarPayload } from "@/schemas/boarSchema";
import type { MatingPayload } from "@/schemas/matingSchema";
import { boarService } from "@/services/boarService";
import { matingService } from "@/services/matingService";
import { sowService } from "@/services/sowService";
import type { Farm } from "@/types/auth";
import type { Boar, Mating } from "@/types/mating";
import type { Sow } from "@/types/sow";
import type { ColumnI } from "@/types/table";
import { formatDate } from "@/utils/format";

const EMPTY_MATINGS: Mating[] = [];
const EMPTY_BOARS: Boar[] = [];
const EMPTY_SOWS: Sow[] = [];

const RESULT_FILTER_OPTIONS = [
  { value: "", label: "Tất cả kết quả" },
  ...MATING_RESULT_OPTIONS.map(({ value, label }) => ({ value, label })),
];

type Tab = "matings" | "boars";

export default function MatingsPage() {
  return <FarmGate>{(farm) => <MatingsContent farm={farm} />}</FarmGate>;
}

function MatingsContent({ farm }: { farm: Farm }) {
  // Danh mục heo đực/tinh: OWNER/MANAGER thêm sửa, OWNER xóa. Nhật ký phối: ai cũng ghi, OWNER/MANAGER xóa.
  const isManager = farm.role === "OWNER" || farm.role === "MANAGER";
  const canDeleteBoar = farm.role === "OWNER";

  const router = useRouter();
  const toast = useAppToast();
  const [tab, setTab] = useState<Tab>("matings");

  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([matingService.list(), boarService.list(), sowService.list()]),
  );
  const [matings, boars, sows] = data ?? [
    EMPTY_MATINGS,
    EMPTY_BOARS,
    EMPTY_SOWS,
  ];

  const matingActions = useTableActions<Mating>({
    remove: (m) => matingService.remove(m.id),
    deletedMessage: (m) => `Đã xóa lần phối của nái ${m.sow.code}`,
    onDeleted: refetch,
  });
  const boarActions = useTableActions<Boar>({
    remove: (b) => boarService.remove(b.id),
    deletedMessage: (b) => `Đã xóa ${b.code}`,
    onDeleted: refetch,
  });

  const [query, setQuery] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return matings.filter((m) => {
      if (resultFilter && m.result !== resultFilter) return false;
      if (!q) return true;
      return `${m.sow.code} ${m.boar.code}`.toLowerCase().includes(q);
    });
  }, [matings, debouncedQuery, resultFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  // Phối giống cần có nái (chưa loại thải) và heo đực/tinh trước
  const handleCreateMating = () => {
    if (!sows.some((s) => s.status !== "CULLED")) {
      toast.warning("Bạn cần thêm nái trước khi ghi nhận phối giống");
      router.push("/sows");
      return;
    }
    if (boars.length === 0) {
      toast.warning(
        "Bạn cần thêm heo đực / tinh trước khi ghi nhận phối giống",
      );
      if (isManager) setTab("boars");
      return;
    }
    matingActions.openCreate();
  };

  async function handleSubmitMating(payload: MatingPayload) {
    if (matingActions.selectedItem) {
      await matingService.update(matingActions.selectedItem.id, payload);
      toast.success("Đã cập nhật lần phối");
    } else {
      await matingService.create(payload);
      toast.success("Đã ghi nhận phối giống");
    }
    matingActions.closeForm();
    refetch();
  }

  async function handleSubmitBoar(payload: BoarPayload) {
    if (boarActions.selectedItem) {
      await boarService.update(boarActions.selectedItem.id, payload);
      toast.success(`Đã cập nhật ${payload.code}`);
    } else {
      await boarService.create(payload);
      toast.success(`Đã thêm ${payload.code}`);
    }
    boarActions.closeForm();
    refetch();
  }

  const matingColumns: ColumnI<Mating>[] = [
    {
      value: "sow",
      text: "Mã Nái",
      className: "text-purple-fg font-bold",
      render: (m) => m.sow.code,
    },
    {
      value: "heat_date",
      text: "Ngày Động Dục",
      render: (m) => formatDate(m.heat_date),
    },
    {
      value: "mating_date",
      text: "Ngày Phối",
      className: "font-semibold",
      render: (m) => formatDate(m.mating_date),
    },
    { value: "boar", text: "Heo Đực / Tinh Phối", render: (m) => m.boar.code },
    {
      value: "mating_count",
      text: "Số Lần Phối",
      className: "text-center font-semibold",
    },
    {
      value: "result",
      text: "Kết Quả Phối",
      render: (m) => {
        const result = MATING_RESULT_OPTIONS.find((o) => o.value === m.result);
        return (
          <span className={`badge ${result?.badge ?? "badge-muted"}`}>
            {result?.label ?? m.result}
          </span>
        );
      },
    },
    {
      value: "expected_farrow_date",
      text: "Dự Kiến Sinh (114 Ngày)",
      className: "text-danger font-bold",
      render: (m) => formatDate(m.expected_farrow_date),
    },
    { value: "actions", text: "Thao Tác" },
  ];

  const boarColumns: ColumnI<Boar>[] = [
    {
      value: "code",
      text: "Mã Heo Đực / Tinh",
      className: "text-purple-fg font-bold",
    },
    { value: "breed", text: "Giống", className: "font-medium" },
    ...(isManager ? [{ value: "actions", text: "Thao Tác" }] : []),
  ];

  const disabled = loading || !!error;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<DnaIcon size="sm" className="text-purple" />}
        title="2. Quản Lý Phối Giống"
        description="Theo dõi ngày động dục, ngày phối, nguồn tinh đực và ngày dự kiến sinh."
        action={
          tab === "matings" ? (
            <Button
              onClick={handleCreateMating}
              disabled={disabled}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Ghi Nhận Phối Giống
            </Button>
          ) : (
            isManager && (
              <Button
                onClick={boarActions.openCreate}
                disabled={disabled}
                leftIcon={<PlusIcon size="xs" />}
                className="rounded-xl text-xs font-semibold"
              >
                Thêm Heo Đực / Tinh
              </Button>
            )
          )
        }
      />

      <Tabs
        tabs={[
          { value: "matings", label: "Nhật ký phối giống" },
          { value: "boars", label: "Heo đực / tinh" },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="card overflow-hidden">
        {tab === "matings" && (
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
                placeholder="Tìm mã nái, heo đực..."
                aria-label="Tìm lần phối"
                className="bg-surface-muted border-line text-fg focus:ring-ring w-full rounded-lg border py-2 pr-3 pl-8 text-base focus:ring-2 focus:outline-none sm:text-xs"
              />
            </div>
            <div className="w-full sm:w-52">
              <SelectField
                label=""
                options={RESULT_FILTER_OPTIONS}
                value={resultFilter}
                onChange={(e) => {
                  setResultFilter(e.target.value);
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
        ) : tab === "matings" ? (
          <Table
            columns={matingColumns}
            rows={pageRows}
            height="max-h-130"
            emptyMessage={
              matings.length === 0
                ? "Chưa có lần phối nào."
                : "Không tìm thấy lần phối phù hợp."
            }
            onEdit={matingActions.openEdit}
            onDelete={isManager ? matingActions.askDelete : undefined}
            page={currentPage}
            limit={limit}
            total={filtered.length}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        ) : (
          <Table
            columns={boarColumns}
            rows={boars}
            height="max-h-130"
            emptyMessage="Chưa có heo đực / tinh nào. Hãy thêm mới."
            onEdit={isManager ? boarActions.openEdit : undefined}
            onDelete={canDeleteBoar ? boarActions.askDelete : undefined}
          />
        )}
      </div>

      {matingActions.isFormOpen && (
        <MatingFormModal
          key={matingActions.selectedItem?.id ?? "new"}
          mating={matingActions.selectedItem}
          sows={sows}
          boars={boars}
          onSubmit={handleSubmitMating}
          onClose={matingActions.closeForm}
        />
      )}

      {boarActions.isFormOpen && (
        <BoarFormModal
          key={boarActions.selectedItem?.id ?? "new"}
          boar={boarActions.selectedItem}
          onSubmit={handleSubmitBoar}
          onClose={boarActions.closeForm}
        />
      )}

      {matingActions.deleteTarget && (
        <ConfirmModal
          title="Xóa lần phối"
          message={
            <>
              Bạn chắc chắn muốn xóa lần phối của nái{" "}
              <strong>{matingActions.deleteTarget.sow.code}</strong>? Thao tác
              này không thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={matingActions.deleteLoading}
          onConfirm={matingActions.confirmDelete}
          onClose={matingActions.cancelDelete}
        />
      )}

      {boarActions.deleteTarget && (
        <ConfirmModal
          title="Xóa heo đực / tinh"
          message={
            <>
              Bạn chắc chắn muốn xóa{" "}
              <strong>{boarActions.deleteTarget.code}</strong>? Thao tác này
              không thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={boarActions.deleteLoading}
          onConfirm={boarActions.confirmDelete}
          onClose={boarActions.cancelDelete}
        />
      )}
    </div>
  );
}
