"use client";

import { InputField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { useForm, useFormSubmit } from "@/hooks";
import {
  penFormSchema,
  type PenFormValues,
  type PenPayload,
} from "@/schemas/penSchema";
import type { Pen } from "@/types/pen";

import { Modal } from "./modal";

interface PenFormModalProps {
  pen: Pen | null; // null = thêm mới
  onSubmit: (payload: PenPayload) => Promise<void>;
  onClose: () => void;
}

function toFormValues(pen: Pen | null): PenFormValues {
  return {
    name: pen?.name ?? "",
    capacity: pen?.capacity ? String(pen.capacity) : "",
    subname: pen?.subname ?? "",
    description: pen?.description ?? "",
  };
}

// Parent render modal này có `key` theo từng chuồng nên state luôn khởi tạo mới mỗi lần mở
export function PenFormModal({ pen, onSubmit, onClose }: PenFormModalProps) {
  const { formData, handleChange } = useForm<PenFormValues>(toFormValues(pen));
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: penFormSchema,
    values: formData,
    onSubmit,
  });

  return (
    <Modal
      title={pen ? "Cập Nhật Chuồng" : "Thêm Chuồng Mới"}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <InputField
          id="name"
          name="name"
          label="Tên chuồng *"
          placeholder="Ví dụ: Chuồng Nái 01"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          size="sm"
        />
        <InputField
          id="subname"
          name="subname"
          label="Tên phụ / loại chuồng"
          placeholder="Ví dụ: Nái Mang Thai"
          value={formData.subname}
          onChange={handleChange}
          error={errors.subname}
          size="sm"
        />
        <InputField
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          step="1"
          label="Sức chứa tối đa (con) *"
          placeholder="Ví dụ: 12"
          value={formData.capacity}
          onChange={handleChange}
          error={errors.capacity}
          size="sm"
        />
        <InputField
          id="description"
          name="description"
          label="Mô tả"
          placeholder="Ghi chú thêm về chuồng"
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
            {submitting ? "Đang lưu..." : pen ? "Lưu Thay Đổi" : "Lưu Chuồng"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
