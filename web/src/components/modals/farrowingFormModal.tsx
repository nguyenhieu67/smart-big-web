"use client";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { useForm, useFormSubmit } from "@/hooks";
import {
  farrowingCreateSchema,
  farrowingUpdateSchema,
  type FarrowingFormValues,
  type FarrowingPayload,
} from "@/schemas/farrowingSchema";
import type { Farrowing } from "@/types/farrowing";
import type { Sow } from "@/types/sow";
import { toInputDate, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

interface FarrowingFormModalProps {
  farrowing: Farrowing | null; // null = thêm mới
  sows: Sow[];
  onSubmit: (payload: FarrowingPayload) => Promise<void>;
  onClose: () => void;
}

const num = (v: number | null | undefined) => (v == null ? "0" : String(v));

function toFormValues(farrowing: Farrowing | null): FarrowingFormValues {
  if (!farrowing) {
    return {
      sow_id: "",
      farrow_date: toLocalDateString(),
      live_born: "",
      dead_born: "0",
      weak_born: "0",
      avg_birth_weight: "",
      assist_note: "",
    };
  }
  return {
    sow_id: String(farrowing.sow_id),
    farrow_date: toInputDate(farrowing.farrow_date),
    live_born: num(farrowing.live_born),
    dead_born: num(farrowing.dead_born),
    weak_born: num(farrowing.weak_born),
    avg_birth_weight:
      farrowing.avg_birth_weight != null
        ? String(Number(farrowing.avg_birth_weight))
        : "",
    assist_note: farrowing.assist_note ?? "",
  };
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function FarrowingFormModal({
  farrowing,
  sows,
  onSubmit,
  onClose,
}: FarrowingFormModalProps) {
  const { formData, handleChange } = useForm<FarrowingFormValues>(
    toFormValues(farrowing),
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: farrowing ? farrowingUpdateSchema : farrowingCreateSchema,
    values: formData,
    onSubmit,
  });

  // Chỉ nái đang mang thai mới ghi nhận đẻ được
  const sowOptions = sows
    .filter((s) => s.status === "PREGNANT")
    .map((s) => ({ label: `${s.code} - ${s.breed}`, value: String(s.id) }));

  // Server tự tính total_born = sống + chết; đây chỉ là bản xem trước
  const live = Number(formData.live_born) || 0;
  const dead = Number(formData.dead_born) || 0;

  return (
    <Modal
      title={farrowing ? "Cập Nhật Ca Sinh" : "Ghi Nhận Nái Sinh Sản"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          {farrowing ? (
            <InputField
              id="sow"
              label="Nái mẹ"
              value={farrowing.sow.code}
              disabled
              readOnly
              size="sm"
            />
          ) : (
            <SelectField
              id="sow_id"
              name="sow_id"
              label="Mã nái mẹ *"
              placeholder="Chọn nái"
              options={sowOptions}
              value={formData.sow_id}
              onChange={handleChange}
              error={errors.sow_id}
              size="sm"
            />
          )}
          <InputField
            id="farrow_date"
            name="farrow_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày sinh *"
            value={formData.farrow_date}
            onChange={handleChange}
            error={errors.farrow_date}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
          <InputField
            id="live_born"
            name="live_born"
            type="number"
            min="0"
            max="40"
            step="1"
            label="Số con sống *"
            value={formData.live_born}
            onChange={handleChange}
            error={errors.live_born}
            size="sm"
          />
          <InputField
            id="dead_born"
            name="dead_born"
            type="number"
            min="0"
            max="40"
            step="1"
            label="Số con chết"
            value={formData.dead_born}
            onChange={handleChange}
            error={errors.dead_born}
            size="sm"
          />
          <InputField
            id="weak_born"
            name="weak_born"
            type="number"
            min="0"
            max="40"
            step="1"
            label="Số con yếu"
            value={formData.weak_born}
            onChange={handleChange}
            error={errors.weak_born}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="avg_birth_weight"
            name="avg_birth_weight"
            type="number"
            min="0"
            step="any"
            label="TL sơ sinh TB (kg/con)"
            value={formData.avg_birth_weight}
            onChange={handleChange}
            error={errors.avg_birth_weight}
            size="sm"
          />
          <InputField
            id="assist_note"
            name="assist_note"
            label="Hỗ trợ sinh / khó đẻ"
            placeholder="Ví dụ: Đẻ tự nhiên, tiêm oxytocin"
            value={formData.assist_note}
            onChange={handleChange}
            error={errors.assist_note}
            size="sm"
          />
        </div>

        <div className="bg-surface-muted text-fg-body space-y-1 rounded-lg p-2.5 text-xs">
          <p>
            Tổng sinh: <strong className="text-fg">{live + dead} con</strong>{" "}
            (con yếu nằm trong số con sống)
          </p>
          {!farrowing && (
            <p className="text-fg-muted">
              Khi lưu: nái chuyển sang &quot;Đang nuôi con&quot;, tăng số lứa
              thêm 1, và tự tạo đàn heo con nếu có con sống.
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Đang lưu..."
              : farrowing
                ? "Lưu Thay Đổi"
                : "Lưu Ca Sinh"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
