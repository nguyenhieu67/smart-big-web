"use client";

import { InputField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { useForm, useFormSubmit } from "@/hooks";
import {
  buyerFormSchema,
  type BuyerFormValues,
  type BuyerPayload,
} from "@/schemas/buyerSchema";
import type { Buyer } from "@/types/sale";

import { Modal } from "./modal";

interface BuyerFormModalProps {
  buyer: Buyer | null; // null = thêm mới
  onSubmit: (payload: BuyerPayload) => Promise<void>;
  onClose: () => void;
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function BuyerFormModal({
  buyer,
  onSubmit,
  onClose,
}: BuyerFormModalProps) {
  const { formData, handleChange } = useForm<BuyerFormValues>({
    name: buyer?.name ?? "",
    phone: buyer?.phone ?? "",
    note: buyer?.note ?? "",
  });
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: buyerFormSchema,
    values: formData,
    onSubmit,
  });

  return (
    <Modal
      title={buyer ? "Cập Nhật Người Mua" : "Thêm Người Mua"}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <InputField
          id="name"
          name="name"
          label="Tên người mua / thương lái *"
          placeholder="Ví dụ: Anh Hùng - lái Biên Hòa"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          size="sm"
        />
        <InputField
          id="phone"
          name="phone"
          type="tel"
          label="Số điện thoại"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          size="sm"
        />
        <InputField
          id="note"
          name="note"
          label="Ghi chú"
          value={formData.note}
          onChange={handleChange}
          error={errors.note}
          size="sm"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : buyer ? "Lưu Thay Đổi" : "Lưu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
