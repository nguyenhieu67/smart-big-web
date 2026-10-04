"use client";

import { useMemo, useState } from "react";

import { PlusIcon, ReceiptIcon, SearchIcon } from "@/components/icons";
import { SelectField } from "@/components/form";
import { FarmGate, PageHeader } from "@/components/layout";
import {
  ConfirmModal,
  ExpenseCategoryFormModal,
  ExpenseFormModal,
} from "@/components/modals";
import { Table } from "@/components/table";
import { Button, Tabs } from "@/components/ui";
import { SUGGESTED_EXPENSE_CATEGORIES } from "@/constants/expense";
import {
  useAppToast,
  useDebounce,
  useFetchData,
  usePagination,
  useTableActions,
} from "@/hooks";
import { parseApiError } from "@/lib/apiError";
import type { ExpenseCategoryPayload } from "@/schemas/expenseCategorySchema";
import type { ExpensePayload } from "@/schemas/expenseSchema";
import { expenseCategoryService } from "@/services/expenseCategoryService";
import { expenseService } from "@/services/expenseService";
import type { Farm } from "@/types/auth";
import type { Expense, ExpenseCategory } from "@/types/expense";
import type { ColumnI } from "@/types/table";
import { formatCurrency, formatDate } from "@/utils/format";

const EMPTY_EXPENSES: Expense[] = [];
const EMPTY_CATEGORIES: ExpenseCategory[] = [];

type Tab = "expenses" | "categories";

export default function ExpensesPage() {
  return <FarmGate>{(farm) => <ExpensesContent farm={farm} />}</FarmGate>;
}

function ExpensesContent({ farm }: { farm: Farm }) {
  // Chi phí và danh mục: OWNER/MANAGER thêm sửa, OWNER xóa, STAFF chỉ xem
  const canWrite = farm.role === "OWNER" || farm.role === "MANAGER";
  const canDelete = farm.role === "OWNER";

  const toast = useAppToast();
  const [tab, setTab] = useState<Tab>("expenses");
  const [seeding, setSeeding] = useState(false);

  const { data, loading, error, refetch } = useFetchData(() =>
    Promise.all([expenseService.list(), expenseCategoryService.list()]),
  );
  const [expenses, categories] = data ?? [EMPTY_EXPENSES, EMPTY_CATEGORIES];

  const expenseActions = useTableActions<Expense>({
    remove: (e) => expenseService.remove(e.id),
    deletedMessage: () => "Đã xóa khoản chi phí",
    onDeleted: refetch,
  });
  const categoryActions = useTableActions<ExpenseCategory>({
    remove: (c) => expenseCategoryService.remove(c.id),
    deletedMessage: (c) => `Đã xóa danh mục ${c.name}`,
    onDeleted: refetch,
  });

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { page, limit, onPageChange, onLimitChange } = usePagination(10);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return expenses.filter((e) => {
      if (categoryFilter && String(e.category_id) !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return `${e.category.name} ${e.description ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [expenses, debouncedQuery, categoryFilter]);

  const totalAmount = useMemo(
    () => filtered.reduce((sum, e) => sum + Number(e.amount), 0),
    [filtered],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const categoryFilterOptions = [
    { value: "", label: "Tất cả danh mục" },
    ...categories.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  // Chi phí thuộc một danh mục nên cần có danh mục trước
  const handleCreateExpense = () => {
    if (categories.length === 0) {
      toast.warning("Bạn cần tạo danh mục chi phí trước khi ghi nhận chi phí");
      setTab("categories");
      return;
    }
    expenseActions.openCreate();
  };

  async function handleSubmitExpense(payload: ExpensePayload) {
    if (expenseActions.selectedItem) {
      await expenseService.update(expenseActions.selectedItem.id, payload);
      toast.success("Đã cập nhật chi phí");
    } else {
      await expenseService.create(payload);
      toast.success("Đã ghi nhận chi phí");
    }
    expenseActions.closeForm();
    refetch();
  }

  async function handleSubmitCategory(payload: ExpenseCategoryPayload) {
    if (categoryActions.selectedItem) {
      await expenseCategoryService.update(
        categoryActions.selectedItem.id,
        payload,
      );
      toast.success(`Đã cập nhật danh mục ${payload.name}`);
    } else {
      await expenseCategoryService.create(payload);
      toast.success(`Đã thêm danh mục ${payload.name}`);
    }
    categoryActions.closeForm();
    refetch();
  }

  // Tạo nhanh các danh mục gợi ý cho trại mới
  async function seedCategories() {
    setSeeding(true);
    try {
      await Promise.all(
        SUGGESTED_EXPENSE_CATEGORIES.map((name) =>
          expenseCategoryService.create({ name }),
        ),
      );
      toast.success("Đã thêm các danh mục gợi ý");
      refetch();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setSeeding(false);
    }
  }

  const expenseColumns: ColumnI<Expense>[] = [
    {
      value: "expense_date",
      text: "Ngày Chi",
      className: "text-fg-muted",
      render: (e) => formatDate(e.expense_date),
    },
    {
      value: "category",
      text: "Danh Mục Chi Phí",
      className: "text-danger-fg font-bold",
      render: (e) => e.category.name,
    },
    {
      value: "description",
      text: "Nội Dung",
      className: "text-fg-body",
      render: (e) => (
        <>
          {e.description || "—"}
          {(e.feed_log_id != null || e.health_log_id != null) && (
            <span className="badge badge-info ml-2">
              {e.feed_log_id != null ? "Tự động: cho ăn" : "Tự động: sức khỏe"}
            </span>
          )}
        </>
      ),
    },
    {
      value: "amount",
      text: "Số Tiền",
      className: "text-danger text-right font-bold",
      render: (e) => formatCurrency(e.amount, "đ"),
    },
    ...(canWrite || canDelete ? [{ value: "actions", text: "Thao Tác" }] : []),
  ];

  const categoryColumns: ColumnI<ExpenseCategory>[] = [
    { value: "name", text: "Tên Danh Mục", className: "text-fg font-bold" },
    ...(canWrite || canDelete ? [{ value: "actions", text: "Thao Tác" }] : []),
  ];

  const disabled = loading || !!error;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<ReceiptIcon size="sm" className="text-danger" />}
        title="11. Sổ Sách Quản Lý Chi Phí"
        description="Phân loại toàn bộ chi phí: con giống, thức ăn, thuốc, điện, nước, nhân công, chuồng trại, vận chuyển."
        action={
          canWrite &&
          (tab === "expenses" ? (
            <Button
              onClick={handleCreateExpense}
              disabled={disabled}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Ghi Nhận Chi Phí
            </Button>
          ) : (
            <Button
              onClick={categoryActions.openCreate}
              disabled={disabled}
              leftIcon={<PlusIcon size="xs" />}
              className="rounded-xl text-xs font-semibold"
            >
              Thêm Danh Mục
            </Button>
          ))
        }
      />

      <Tabs
        tabs={[
          { value: "expenses", label: "Sổ chi phí" },
          { value: "categories", label: "Danh mục" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "expenses" && !loading && !error && (
        <div className="grid grid-cols-2 gap-4 sm:max-w-lg">
          <div className="card p-4">
            <p className="text-fg-muted text-xs">Số khoản chi</p>
            <p className="text-fg mt-1 text-2xl font-black">
              {filtered.length}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-fg-muted text-xs">Tổng chi phí</p>
            <p className="text-danger mt-1 text-lg font-black sm:text-2xl">
              {formatCurrency(totalAmount, "đ")}
            </p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {tab === "expenses" && (
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
                placeholder="Tìm danh mục, nội dung..."
                aria-label="Tìm chi phí"
                className="bg-surface-muted border-line text-fg focus:ring-ring w-full rounded-lg border py-2 pr-3 pl-8 text-base focus:ring-2 focus:outline-none sm:text-xs"
              />
            </div>
            <div className="w-full sm:w-52">
              <SelectField
                label=""
                options={categoryFilterOptions}
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
        ) : tab === "expenses" ? (
          <Table
            columns={expenseColumns}
            rows={pageRows}
            height="max-h-130"
            emptyMessage={
              expenses.length === 0
                ? "Chưa có khoản chi phí nào."
                : "Không tìm thấy khoản chi phù hợp."
            }
            onEdit={canWrite ? expenseActions.openEdit : undefined}
            onDelete={canDelete ? expenseActions.askDelete : undefined}
            page={currentPage}
            limit={limit}
            total={filtered.length}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        ) : (
          <>
            <Table
              columns={categoryColumns}
              rows={categories}
              height="max-h-130"
              emptyMessage="Chưa có danh mục chi phí nào."
              onEdit={canWrite ? categoryActions.openEdit : undefined}
              onDelete={canDelete ? categoryActions.askDelete : undefined}
            />
            {categories.length === 0 && canWrite && (
              <div className="border-line-soft border-t p-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={seedCategories}
                  disabled={seeding}
                >
                  {seeding ? "Đang thêm..." : "Thêm các danh mục gợi ý"}
                </Button>
                <p className="text-fg-muted mt-2 text-xs">
                  {SUGGESTED_EXPENSE_CATEGORIES.join(", ")}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {expenseActions.isFormOpen && (
        <ExpenseFormModal
          key={expenseActions.selectedItem?.id ?? "new"}
          expense={expenseActions.selectedItem}
          categories={categories}
          onSubmit={handleSubmitExpense}
          onClose={expenseActions.closeForm}
        />
      )}

      {categoryActions.isFormOpen && (
        <ExpenseCategoryFormModal
          key={categoryActions.selectedItem?.id ?? "new"}
          category={categoryActions.selectedItem}
          onSubmit={handleSubmitCategory}
          onClose={categoryActions.closeForm}
        />
      )}

      {expenseActions.deleteTarget && (
        <ConfirmModal
          title="Xóa khoản chi phí"
          message={
            <>
              Bạn chắc chắn muốn xóa khoản chi{" "}
              <strong>
                {formatCurrency(expenseActions.deleteTarget.amount, "đ")}
              </strong>{" "}
              ({expenseActions.deleteTarget.category.name})? Thao tác này không
              thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={expenseActions.deleteLoading}
          onConfirm={expenseActions.confirmDelete}
          onClose={expenseActions.cancelDelete}
        />
      )}

      {categoryActions.deleteTarget && (
        <ConfirmModal
          title="Xóa danh mục"
          message={
            <>
              Bạn chắc chắn muốn xóa danh mục{" "}
              <strong>{categoryActions.deleteTarget.name}</strong>? Thao tác này
              không thể hoàn tác.
            </>
          }
          confirmLabel="Xóa"
          loading={categoryActions.deleteLoading}
          onConfirm={categoryActions.confirmDelete}
          onClose={categoryActions.cancelDelete}
        />
      )}
    </div>
  );
}
