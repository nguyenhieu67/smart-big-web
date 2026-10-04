"use client";

import axios from "axios";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { PIGLET_STAGE_OPTIONS, WEAN_AFTER_DAYS } from "@/constants/piglet";
import { useForm, useFormSubmit } from "@/hooks";
import {
  pigletBatchFormSchema,
  type PigletBatchFormValues,
  type PigletBatchPayload,
} from "@/schemas/pigletBatchSchema";
import type { Pen } from "@/types/pen";
import type { PigletBatch } from "@/types/piglet";
import type { Sow } from "@/types/sow";
import { addDaysToDate, toInputDate, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

interface PigletBatchFormModalProps {
  batch: PigletBatch | null; // null = thêm mới (đàn nhập từ ngoài)
  sows: Sow[];
  pens: Pen[];
  onSubmit: (payload: PigletBatchPayload) => Promise<void>;
  onClose: () => void;
}

const NONE = { label: "— Không chọn —", value: "" };

function toFormValues(batch: PigletBatch | null): PigletBatchFormValues {
  if (!batch) {
    return {
      code: "",
      birth_date: toLocalDateString(),
      quantity: "",
      avg_weight: "",
      stage: "SUCKLING",
      health: "",
      target_wean_date: addDaysToDate(toLocalDateString(), WEAN_AFTER_DAYS),
      sow_id: "",
      pen_id: "",
    };
  }
  return {
    code: batch.code,
    birth_date: toInputDate(batch.birth_date),
    quantity: batch.quantity != null ? String(batch.quantity) : "",
    avg_weight:
      batch.avg_weight != null ? String(Number(batch.avg_weight)) : "",
    stage: batch.stage,
    health: batch.health ?? "",
    target_wean_date: batch.target_wean_date
      ? toInputDate(batch.target_wean_date)
      : "",
    sow_id: batch.sow_id != null ? String(batch.sow_id) : "",
    pen_id: batch.pen_id != null ? String(batch.pen_id) : "",
  };
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function PigletBatchFormModal({
  batch,
  sows,
  pens,
  onSubmit,
  onClose,
}: PigletBatchFormModalProps) {
  const { formData, handleChange } = useForm<PigletBatchFormValues>(
    toFormValues(batch),
    {
      customHandlers: {
        // Thêm mới: đổi ngày sinh thì tự gợi ý ngày cai sữa, trừ khi người dùng đã tự sửa ô đó
        birth_date: (value, prev) => {
          const next = String(value);
          const suggested = (d: string) =>
            /^\d{4}-\d{2}-\d{2}$/.test(d)
              ? addDaysToDate(d, WEAN_AFTER_DAYS)
              : "";
          if (!batch && prev.target_wean_date === suggested(prev.birth_date)) {
            return { target_wean_date: suggested(next) };
          }
          return {};
        },
      },
    },
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: pigletBatchFormSchema,
    values: formData,
    onSubmit,
    // BE trả 409 "Duplicate entry." khi trùng (farm_id, code)
    mapError: (err) =>
      axios.isAxiosError(err) && err.response?.status === 409
        ? { code: "Mã đàn đã tồn tại trong trại này" }
        : undefined,
  });

  const penOptions = [
    NONE,
    ...pens.map((p) => ({ label: p.name, value: String(p.id) })),
  ];
  const sowOptions = [
    NONE,
    ...sows.map((s) => ({ label: s.code, value: String(s.id) })),
  ];

  return (
    <Modal
      title={batch ? "Cập Nhật Đàn Heo" : "Tạo Đàn Heo Mới"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        {!batch && (
          <p className="bg-surface-muted text-fg-muted rounded-lg p-2.5 text-xs">
            Dùng cho đàn nhập từ ngoài. Đàn sinh ra từ ca sinh được tạo tự động
            ở trang Sinh sản.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="code"
            name="code"
            label="Mã đàn *"
            placeholder="Ví dụ: DAN-201"
            value={formData.code}
            onChange={handleChange}
            error={errors.code}
            size="sm"
          />
          <InputField
            id="birth_date"
            name="birth_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày sinh *"
            value={formData.birth_date}
            onChange={handleChange}
            error={errors.birth_date}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="1"
            label="Số lượng hiện tại (con)"
            value={formData.quantity}
            onChange={handleChange}
            error={errors.quantity}
            size="sm"
          />
          <InputField
            id="avg_weight"
            name="avg_weight"
            type="number"
            min="0"
            step="any"
            label="TL trung bình (kg/con)"
            value={formData.avg_weight}
            onChange={handleChange}
            error={errors.avg_weight}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <SelectField
            id="stage"
            name="stage"
            label="Giai đoạn *"
            options={PIGLET_STAGE_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={formData.stage}
            onChange={handleChange}
            error={errors.stage}
            size="sm"
          />
          <InputField
            id="health"
            name="health"
            label="Sức khỏe"
            placeholder="Ví dụ: Tốt"
            value={formData.health}
            onChange={handleChange}
            error={errors.health}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="target_wean_date"
            name="target_wean_date"
            type="date"
            min={formData.birth_date || undefined}
            label="Dự kiến cai sữa"
            value={formData.target_wean_date}
            onChange={handleChange}
            error={errors.target_wean_date}
            size="sm"
          />
          <SelectField
            id="pen_id"
            name="pen_id"
            label="Chuồng"
            options={penOptions}
            value={formData.pen_id}
            onChange={handleChange}
            error={errors.pen_id}
            size="sm"
          />
        </div>

        {batch ? (
          <InputField
            id="sow"
            label="Nái mẹ"
            value={batch.sow?.code ?? "—"}
            disabled
            readOnly
            size="sm"
          />
        ) : (
          <SelectField
            id="sow_id"
            name="sow_id"
            label="Nái mẹ"
            options={sowOptions}
            value={formData.sow_id}
            onChange={handleChange}
            error={errors.sow_id}
            size="sm"
          />
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : batch ? "Lưu Thay Đổi" : "Tạo Đàn"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
