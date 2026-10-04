"use client";

import axios from "axios";

import { InputField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { useForm, useFormSubmit } from "@/hooks";
import {
  feedTypeFormSchema,
  type FeedTypeFormValues,
  type FeedTypePayload,
} from "@/schemas/feedTypeSchema";
import type { FeedType } from "@/types/feed";

import { Modal } from "./modal";

interface FeedTypeFormModalProps {
  feedType: FeedType | null; // null = thêm mới
  onSubmit: (payload: FeedTypePayload) => Promise<void>;
  onClose: () => void;
}

function toFormValues(feedType: FeedType | null): FeedTypeFormValues {
  return {
    code: feedType?.code ?? "",
    name: feedType?.name ?? "",
    default_price_per_kg:
      feedType?.default_price_per_kg != null
        ? String(Number(feedType.default_price_per_kg))
        : "",
  };
}

// Parent render modal này có `key` theo từng loại cám nên state luôn khởi tạo mới mỗi lần mở
export function FeedTypeFormModal({
  feedType,
  onSubmit,
  onClose,
}: FeedTypeFormModalProps) {
  const { formData, handleChange } = useForm<FeedTypeFormValues>(
    toFormValues(feedType),
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: feedTypeFormSchema,
    values: formData,
    onSubmit,
    // BE trả 409 "Duplicate entry." khi trùng (farm_id, code)
    mapError: (err) =>
      axios.isAxiosError(err) && err.response?.status === 409
        ? { code: "Mã cám đã tồn tại trong trại này" }
        : undefined,
  });

  return (
    <Modal
      title={feedType ? "Cập Nhật Loại Cám" : "Thêm Loại Cám"}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="code"
            name="code"
            label="Mã cám"
            placeholder="Ví dụ: C55"
            value={formData.code}
            onChange={handleChange}
            error={errors.code}
            size="sm"
          />
          <InputField
            id="name"
            name="name"
            label="Tên loại cám *"
            placeholder="Ví dụ: Cám nái chửa"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            size="sm"
          />
        </div>
        <InputField
          id="default_price_per_kg"
          name="default_price_per_kg"
          type="number"
          min="0"
          step="any"
          label="Giá mặc định / kg (VNĐ)"
          placeholder="Dùng khi ghi nhận cám mà không nhập đơn giá"
          value={formData.default_price_per_kg}
          onChange={handleChange}
          error={errors.default_price_per_kg}
          size="sm"
        />

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Đang lưu..."
              : feedType
                ? "Lưu Thay Đổi"
                : "Lưu Loại Cám"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
