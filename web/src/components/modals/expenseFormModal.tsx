"use client";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { useForm, useFormSubmit } from "@/hooks";
import {
  expenseFormSchema,
  type ExpenseFormValues,
  type ExpensePayload,
} from "@/schemas/expenseSchema";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { toInputDate, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

interface ExpenseFormModalProps {
  expense: Expense | null; // null = thêm mới
  categories: ExpenseCategory[];
  onSubmit: (payload: ExpensePayload) => Promise<void>;
  onClose: () => void;
}

function toFormValues(expense: Expense | null): ExpenseFormValues {
  if (!expense) {
    return {
      expense_date: toLocalDateString(),
      category_id: "",
      amount: "",
      description: "",
    };
  }
  return {
    expense_date: toInputDate(expense.expense_date),
    category_id: String(expense.category_id),
    amount: String(Number(expense.amount)),
    description: expense.description ?? "",
  };
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function ExpenseFormModal({
  expense,
  categories,
  onSubmit,
  onClose,
}: ExpenseFormModalProps) {
  const { formData, handleChange } = useForm<ExpenseFormValues>(
    toFormValues(expense),
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: expenseFormSchema,
    values: formData,
    onSubmit,
  });

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: String(c.id),
  }));

  return (
    <Modal
      title={expense ? "Cập Nhật Chi Phí" : "Ghi Nhận Chi Phí Mới"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        {(expense?.feed_log_id != null || expense?.health_log_id != null) && (
          <p className="bg-surface-muted text-fg-muted rounded-lg p-2.5 text-xs">
            Khoản chi này tự sinh từ nhật ký{" "}
            {expense.feed_log_id != null ? "cho ăn" : "sức khỏe"}. Khi bạn sửa
            nhật ký đó, số tiền ở đây sẽ được cập nhật theo.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="expense_date"
            name="expense_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày chi *"
            value={formData.expense_date}
            onChange={handleChange}
            error={errors.expense_date}
            size="sm"
          />
          <SelectField
            id="category_id"
            name="category_id"
            label="Danh mục chi phí *"
            placeholder="Chọn danh mục"
            options={categoryOptions}
            value={formData.category_id}
            onChange={handleChange}
            error={errors.category_id}
            size="sm"
          />
        </div>

        <InputField
          id="amount"
          name="amount"
          type="number"
          min="0"
          step="any"
          label="Số tiền chi (VNĐ) *"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          size="sm"
        />
        <InputField
          id="description"
          name="description"
          label="Nội dung"
          placeholder="Nội dung thanh toán..."
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          size="sm"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Đang lưu..."
              : expense
                ? "Lưu Thay Đổi"
                : "Lưu Chi Phí"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
