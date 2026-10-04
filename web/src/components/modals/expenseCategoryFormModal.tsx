"use client";

import axios from "axios";

import { InputField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { useForm, useFormSubmit } from "@/hooks";
import {
  expenseCategoryFormSchema,
  type ExpenseCategoryFormValues,
  type ExpenseCategoryPayload,
} from "@/schemas/expenseCategorySchema";
import type { ExpenseCategory } from "@/types/expense";

import { Modal } from "./modal";

interface ExpenseCategoryFormModalProps {
  category: ExpenseCategory | null; // null = thêm mới
  onSubmit: (payload: ExpenseCategoryPayload) => Promise<void>;
  onClose: () => void;
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function ExpenseCategoryFormModal({
  category,
  onSubmit,
  onClose,
}: ExpenseCategoryFormModalProps) {
  const { formData, handleChange } = useForm<ExpenseCategoryFormValues>({
    name: category?.name ?? "",
  });
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: expenseCategoryFormSchema,
    values: formData,
    onSubmit,
    // BE trả 409 "Duplicate entry." khi trùng (farm_id, name)
    mapError: (err) =>
      axios.isAxiosError(err) && err.response?.status === 409
        ? { name: "Danh mục đã tồn tại trong trại này" }
        : undefined,
  });

  return (
    <Modal
      title={category ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Chi Phí"}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <InputField
          id="name"
          name="name"
          label="Tên danh mục *"
          placeholder="Ví dụ: Tiền điện"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          size="sm"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : category ? "Lưu Thay Đổi" : "Lưu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
