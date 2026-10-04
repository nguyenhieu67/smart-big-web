"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { MoneyBillTrendUpIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { FarmGate, PageHeader } from "@/components/layout";
import {
  BuyerFormModal,
  ConfirmModal,
  SaleFormModal,
} from "@/components/modals";
import { Table } from "@/components/table";
import { Button, Tabs } from "@/components/ui";
import { MIN_SALE_AGE_MONTHS } from "@/constants/piglet";
import {
  useAppToast,
  useDebounce,
  useFetchData,
  usePagination,
  useTableActions,
} from "@/hooks";
import type { BuyerPayload } from "@/schemas/buyerSchema";
import type { SalePayload } from "@/schemas/saleSchema";
import { buyerService } from "@/services/buyerService";
import { penService } from "@/services/penService";
import { pigletBatchService } from "@/services/pigletBatchService";
import { saleService } from "@/services/saleService";
import type { Farm } from "@/types/auth";
import type { Pen } from "@/types/pen";
import type { PigletBatch } from "@/types/piglet";
import type { Buyer, Sale } from "@/types/sale";
import type { ColumnI } from "@/types/table";
import { formatCurrency, formatDate, toLocalDateString } from "@/utils/format";
import { isSellable } from "@/utils/piglet";

const EMPTY_SALES: Sale[] = [];
const EMPTY_BUYERS: Buyer[] = [];
const EMPTY_BATCHES: PigletBatch[] = [];
const EMPTY_PENS: Pen[] = [];

type Tab = "sales" | "buyers";

export default function SalesPage() {
  return <FarmGate>{(farm) => <SalesContent farm={farm} />}</FarmGate>;
}

function SalesContent({ farm }: { farm: Farm }) {
  // Phiếu bán và người mua: OWNER/MANAGER thêm sửa, OWNER xóa, STAFF chỉ xem
  const canWrite = farm.role === "OWNER" || farm.role === "MANAGER";
  const canDelete = farm.role === "OWNER";

  const router = useRouter();
  const toast = useAppToast();
  const [tab, setTab] = useState<Tab>("sales");

  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([
      saleService.list(),
      buyerService.list(),
      pigletBatchService.list(),
      penService.list(),
    ]),
  );
  const [sales, buyers, batches, pens] = data ?? [
    EMPTY_SALES,
    EMPTY_BUYERS,
    EMPTY_BATCHES,
    EMPTY_PENS,
  ];

  const saleActions = useTableActions<Sale>({
    remove: (s) => saleService.remove(s.id),
    deletedMessage: (s) => `Đã xóa phiếu bán đàn ${s.pigletBatch.code}`,
    onDeleted: refetch,
  });
  const buyerActions = useTableActions<Buyer>({
    remove: (b) => buyerService.remove(b.id),
    deletedMessage: (b) => `Đã xóa người mua ${b.name}`,
    onDeleted: refetch,
  });

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((s) =>
      `${s.pigletBatch.code} ${s.buyer?.name ?? ""}`.toLowerCase().includes(q),
    );
  }, [sales, debouncedQuery]);

  const totalRevenue = useMemo(
    () => filtered.reduce((sum, s) => sum + Number(s.total_revenue), 0),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  // Chỉ bán đàn đã cai sữa trở đi hoặc đủ 1 tháng tuổi; chưa có đàn nào đủ điều kiện thì sang trang đàn heo
  const handleCreateSale = () => {
    const today = toLocalDateString();
    if (!batches.some((b) => isSellable(b, today))) {
      toast.warning(
        `Chưa có đàn nào đủ điều kiện bán (đã cai sữa hoặc đủ ${MIN_SALE_AGE_MONTHS} tháng tuổi)`,
      );
      router.push("/piglets");
      return;
    }
    saleActions.openCreate();
  };

  async function handleSubmitSale(payload: SalePayload) {
    if (saleActions.selectedItem) {
      await saleService.update(saleActions.selectedItem.id, payload);
      toast.success("Đã cập nhật phiếu bán");
    } else {
      await saleService.create(payload);
      toast.success("Đã tạo phiếu bán heo");
    }
    saleActions.closeForm();
    refetch();
  }

  async function handleSubmitBuyer(payload: BuyerPayload) {
    if (buyerActions.selectedItem) {
      await buyerService.update(buyerActions.selectedItem.id, payload);
      toast.success(`Đã cập nhật ${payload.name}`);
    } else {
      await buyerService.create(payload);
      toast.success(`Đã thêm ${payload.name}`);
    }
    buyerActions.closeForm();
    refetch();
  }

  const saleColumns: ColumnI<Sale>[] = [
    {
      value: "sale_date",
      text: "Ngày Bán",
      className: "text-fg-muted",
      render: (s) => formatDate(s.sale_date),
    },
    {
      value: "shipping_date",
      text: "Ngày Vận Chuyển",
      className: "text-fg-muted",
      render: (s) => (s.shipping_date ? formatDate(s.shipping_date) : "—"),
    },
    {
      value: "batch",
      text: "Đàn / Con Bán",
      className: "text-fg font-bold",
      render: (s) => s.pigletBatch.code,
    },
    {
      value: "buyer",
      text: "Người Mua",
      className: "text-fg-body",
      render: (s) => s.buyer?.name ?? "—",
    },
    {
      value: "quantity",
      text: "Số Lượng",
      className: "text-center font-bold",
      render: (s) => `${s.quantity} con`,
    },
    {
      value: "total_weight_kg",
      text: "Tổng Trọng Lượng",
      className: "text-center font-semibold",
      render: (s) => `${Number(s.total_weight_kg)} kg`,
    },
    {
      value: "price_per_kg",
      text: "Giá / Kg",
      render: (s) => formatCurrency(s.price_per_kg, "đ"),
    },
    {
      value: "total_revenue",
      text: "Tổng Tiền",
      className: "text-success font-bold",
      render: (s) => formatCurrency(s.total_revenue, "đ"),
    },
    ...(canWrite || canDelete ? [{ value: "actions", text: "Thao Tác" }] : []),
  ];

  const buyerColumns: ColumnI<Buyer>[] = [
    { value: "name", text: "Tên Người Mua", className: "text-fg font-bold" },
    {
      value: "phone",
      text: "Số Điện Thoại",
      render: (b) => b.phone || "—",
    },
    {
      value: "note",
      text: "Ghi Chú",
      className: "text-fg-muted",
      render: (b) => b.note || "—",
    },
    ...(canWrite || canDelete ? [{ value: "actions", text: "Thao Tác" }] : []),
  ];

  const disabled = loading || !!error;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<MoneyBillTrendUpIcon size="sm" className="text-success" />}
        title="10. Quản Lý Bán Heo & Hóa Đơn"
        description="Lịch sử bán heo, số lượng, trọng lượng, đơn giá và người mua."
        action={
          canWrite &&
          (tab === "sales" ? (
            <Button
              onClick={handleCreateSale}
              disabled={disabled}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Tạo Phiếu Bán Heo
            </Button>
          ) : (
            <Button
              onClick={buyerActions.openCreate}
              disabled={disabled}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Thêm Người Mua
            </Button>
          ))
        }
      />

      <Tabs
        tabs={[
          { value: "sales", label: "Phiếu bán heo" },
          { value: "buyers", label: "Người mua" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "sales" && !loading && !error && (
        <div className="grid grid-cols-2 gap-4 sm:max-w-lg">
          <div className="card p-4">
            <p className="text-fg-muted text-xs">Số phiếu bán</p>
            <p className="text-fg mt-1 text-2xl font-black">
              {filtered.length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-fg-muted text-xs">Tổng doanh thu</p>
            <p className="text-success mt-1 text-lg font-black sm:text-2xl">
              {formatCurrency(totalRevenue, "đ")}
            </p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {tab === "sales" && (
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
                placeholder="Tìm mã đàn, người mua..."
                aria-label="Tìm phiếu bán"
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
        ) : tab === "sales" ? (
          <Table
            columns={saleColumns}
            rows={pageRows}
            height="max-h-130"
            emptyMessage={
              sales.length === 0
                ? "Chưa có phiếu bán nào."
                : "Không tìm thấy phiếu bán phù hợp."
            }
            onEdit={canWrite ? saleActions.openEdit : undefined}
            onDelete={canDelete ? saleActions.askDelete : undefined}
            page={currentPage}
            limit={limit}
            total={filtered.length}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        ) : (
          <Table
            columns={buyerColumns}
            rows={buyers}
            height="max-h-130"
            emptyMessage="Chưa có người mua nào."
            onEdit={canWrite ? buyerActions.openEdit : undefined}
            onDelete={canDelete ? buyerActions.askDelete : undefined}
          />
        )}
      </div>

      {saleActions.isFormOpen && (
        <SaleFormModal
          key={saleActions.selectedItem?.id ?? "new"}
          sale={saleActions.selectedItem}
          batches={batches}
          buyers={buyers}
          pens={pens}
          onSubmit={handleSubmitSale}
          onClose={saleActions.closeForm}
        />
      )}

      {buyerActions.isFormOpen && (
        <BuyerFormModal
          key={buyerActions.selectedItem?.id ?? "new"}
          buyer={buyerActions.selectedItem}
          onSubmit={handleSubmitBuyer}
          onClose={buyerActions.closeForm}
        />
      )}

      {saleActions.deleteTarget && (
        <ConfirmModal
          title="Xóa phiếu bán"
          message={
            <>
              Bạn chắc chắn muốn xóa phiếu bán đàn{" "}
              <strong>{saleActions.deleteTarget.pigletBatch.code}</strong>? Số
              con đã tách sẽ được gộp lại đàn gốc, hoặc cả đàn quay về chuồng
              trước đó.
            </>
          }
          confirmLabel="Xóa"
          loading={saleActions.deleteLoading}
          onConfirm={saleActions.confirmDelete}
          onClose={saleActions.cancelDelete}
        />
      )}

      {buyerActions.deleteTarget && (
        <ConfirmModal
          title="Xóa người mua"
          message={
            <>
              Bạn chắc chắn muốn xóa người mua{" "}
              <strong>{buyerActions.deleteTarget.name}</strong>? Thao tác này
              không thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={buyerActions.deleteLoading}
          onConfirm={buyerActions.confirmDelete}
          onClose={buyerActions.cancelDelete}
        />
      )}
    </div>
  );
}
