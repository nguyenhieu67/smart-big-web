"use client";

import axios from "axios";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { useForm, useFormSubmit } from "@/hooks";
import {
  feedLogFormSchema,
  type FeedLogFormValues,
  type FeedLogPayload,
} from "@/schemas/feedLogSchema";
import type { FeedLog, FeedType } from "@/types/feed";
import type { Pen } from "@/types/pen";
import { formatCurrency, toInputDate, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

interface FeedLogFormModalProps {
  log: FeedLog | null; // null = thêm mới
  feedTypes: FeedType[];
  pens: Pen[];
  onSubmit: (payload: FeedLogPayload) => Promise<void>;
  onClose: () => void;
}

const num = (v: string | null | undefined) =>
  v == null ? "" : String(Number(v));

function toFormValues(log: FeedLog | null): FeedLogFormValues {
  if (!log) {
    return {
      log_date: toLocalDateString(),
      feed_type_id: "",
      pen_id: "",
      quantity_kg: "",
      daily_per_head: "",
      price_per_kg: "",
    };
  }
  return {
    log_date: toInputDate(log.log_date),
    feed_type_id: String(log.feed_type_id),
    pen_id: log.pen_id != null ? String(log.pen_id) : "",
    quantity_kg: num(log.quantity_kg),
    daily_per_head: num(log.daily_per_head),
    price_per_kg: num(log.price_per_kg),
  };
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function FeedLogFormModal({
  log,
  feedTypes,
  pens,
  onSubmit,
  onClose,
}: FeedLogFormModalProps) {
  const { formData, handleChange } = useForm<FeedLogFormValues>(
    toFormValues(log),
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: feedLogFormSchema,
    values: formData,
    onSubmit,
    // BE trả 422 FIELD_REQUIRED khi bỏ trống giá mà loại cám chưa có giá mặc định
    mapError: (err) =>
      axios.isAxiosError(err) &&
      err.response?.status === 422 &&
      err.response.data?.error?.code === "FIELD_REQUIRED"
        ? {
            price_per_kg:
              "Loại cám chưa có giá mặc định, vui lòng nhập đơn giá",
          }
        : undefined,
  });

  const feedTypeOptions = feedTypes.map((t) => ({
    label: t.code ? `(${t.code}) ${t.name}` : t.name,
    value: String(t.id),
  }));
  const penOptions = pens.map((p) => ({ label: p.name, value: String(p.id) }));

  const selectedType = feedTypes.find(
    (t) => String(t.id) === formData.feed_type_id,
  );
  const defaultPrice =
    selectedType?.default_price_per_kg != null
      ? Number(selectedType.default_price_per_kg)
      : null;

  // Server tự tính total_cost = quantity_kg * price_per_kg; đây chỉ là bản xem trước
  const quantity = Number(formData.quantity_kg);
  const price = formData.price_per_kg.trim()
    ? Number(formData.price_per_kg)
    : defaultPrice;
  const estimate =
    quantity > 0 && price != null && price > 0 ? quantity * price : null;

  return (
    <Modal
      title={log ? "Cập Nhật Nhật Ký Cho Ăn" : "Ghi Nhận Cho Ăn"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="log_date"
            name="log_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày *"
            value={formData.log_date}
            onChange={handleChange}
            error={errors.log_date}
            size="sm"
          />
          <SelectField
            id="feed_type_id"
            name="feed_type_id"
            label="Loại cám *"
            placeholder="Chọn loại cám"
            options={feedTypeOptions}
            value={formData.feed_type_id}
            onChange={handleChange}
            error={errors.feed_type_id}
            size="sm"
          />
        </div>

        <SelectField
          id="pen_id"
          name="pen_id"
          label="Chuồng sử dụng *"
          placeholder="Chọn chuồng"
          options={penOptions}
          value={formData.pen_id}
          onChange={handleChange}
          error={errors.pen_id}
          size="sm"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
          <InputField
            id="quantity_kg"
            name="quantity_kg"
            type="number"
            min="0"
            step="any"
            label="Số lượng (kg) *"
            value={formData.quantity_kg}
            onChange={handleChange}
            error={errors.quantity_kg}
            size="sm"
          />
          <InputField
            id="daily_per_head"
            name="daily_per_head"
            type="number"
            min="0"
            step="any"
            label="Kg/con/ngày"
            value={formData.daily_per_head}
            onChange={handleChange}
            error={errors.daily_per_head}
            size="sm"
          />
          <InputField
            id="price_per_kg"
            name="price_per_kg"
            type="number"
            min="0"
            step="any"
            label="Đơn giá / kg"
            placeholder={
              defaultPrice != null ? `Mặc định ${defaultPrice}` : "Nhập đơn giá"
            }
            value={formData.price_per_kg}
            onChange={handleChange}
            error={errors.price_per_kg}
            size="sm"
          />
        </div>

        {estimate != null && (
          <p className="bg-surface-muted text-fg-body rounded-lg p-2.5 text-xs">
            Thành tiền ước tính:{" "}
            <strong className="text-fg">{formatCurrency(estimate)}</strong>
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : log ? "Lưu Thay Đổi" : "Lưu Nhật Ký"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
