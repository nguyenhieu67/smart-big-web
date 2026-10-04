"use client";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { GESTATION_DAYS, MATING_RESULT_OPTIONS } from "@/constants/mating";
import { SOW_STATUS_OPTIONS } from "@/constants/sow";
import { useForm, useFormSubmit } from "@/hooks";
import {
  matingCreateSchema,
  matingUpdateSchema,
  type MatingFormValues,
  type MatingPayload,
} from "@/schemas/matingSchema";
import type { Boar, Mating } from "@/types/mating";
import type { Sow } from "@/types/sow";
import {
  addDaysToDate,
  formatDate,
  toInputDate,
  toLocalDateString,
} from "@/utils/format";

import { Modal } from "./modal";

interface MatingFormModalProps {
  mating: Mating | null; // null = thêm mới
  sows: Sow[];
  boars: Boar[];
  onSubmit: (payload: MatingPayload) => Promise<void>;
  onClose: () => void;
}

function toFormValues(mating: Mating | null): MatingFormValues {
  if (!mating) {
    return {
      sow_id: "",
      boar_id: "",
      heat_date: "",
      mating_date: toLocalDateString(),
      mating_count: "2",
      result: "RECENTLY_MATED",
    };
  }
  return {
    sow_id: String(mating.sow_id),
    boar_id: String(mating.boar_id),
    heat_date: toInputDate(mating.heat_date),
    mating_date: toInputDate(mating.mating_date),
    mating_count: String(mating.mating_count),
    result: mating.result,
  };
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function MatingFormModal({
  mating,
  sows,
  boars,
  onSubmit,
  onClose,
}: MatingFormModalProps) {
  const { formData, handleChange } = useForm<MatingFormValues>(
    toFormValues(mating),
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: mating ? matingUpdateSchema : matingCreateSchema,
    values: formData,
    onSubmit,
  });

  // Nái đã loại thải không phối được (API trả 409 SOW_CULLED)
  const sowOptions = sows
    .filter((s) => s.status !== "CULLED")
    .map((s) => {
      const status = SOW_STATUS_OPTIONS.find((o) => o.value === s.status);
      return {
        label: `${s.code} (${status?.label ?? s.status})`,
        value: String(s.id),
      };
    });
  const boarOptions = boars.map((b) => ({
    label: `${b.code} - ${b.breed}`,
    value: String(b.id),
  }));

  // Server tự tính ngày dự kiến sinh; đây chỉ là bản xem trước
  const expected = /^\d{4}-\d{2}-\d{2}$/.test(formData.mating_date)
    ? addDaysToDate(formData.mating_date, GESTATION_DAYS)
    : null;

  return (
    <Modal
      title={mating ? "Cập Nhật Phối Giống" : "Ghi Nhận Phối Giống"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          {mating ? (
            <InputField
              id="sow"
              label="Nái phối"
              value={mating.sow.code}
              disabled
              readOnly
              size="sm"
            />
          ) : (
            <SelectField
              id="sow_id"
              name="sow_id"
              label="Chọn nái phối *"
              placeholder="Chọn nái"
              options={sowOptions}
              value={formData.sow_id}
              onChange={handleChange}
              error={errors.sow_id}
              size="sm"
            />
          )}
          <SelectField
            id="boar_id"
            name="boar_id"
            label="Heo đực / Tinh phối *"
            placeholder="Chọn heo đực / tinh"
            options={boarOptions}
            value={formData.boar_id}
            onChange={handleChange}
            error={errors.boar_id}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="heat_date"
            name="heat_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày động dục *"
            value={formData.heat_date}
            onChange={handleChange}
            error={errors.heat_date}
            size="sm"
          />
          <InputField
            id="mating_date"
            name="mating_date"
            type="date"
            min={formData.heat_date || undefined}
            max={toLocalDateString()}
            label="Ngày phối *"
            value={formData.mating_date}
            onChange={handleChange}
            error={errors.mating_date}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="mating_count"
            name="mating_count"
            type="number"
            min="1"
            max="10"
            step="1"
            label="Số lần phối *"
            value={formData.mating_count}
            onChange={handleChange}
            error={errors.mating_count}
            size="sm"
          />
          <SelectField
            id="result"
            name="result"
            label="Kết quả phối"
            options={MATING_RESULT_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={formData.result}
            onChange={handleChange}
            error={errors.result}
            size="sm"
          />
        </div>

        {expected && (
          <p className="bg-surface-muted text-fg-body rounded-lg p-2.5 text-xs">
            Dự kiến sinh ({GESTATION_DAYS} ngày):{" "}
            <strong className="text-danger">{formatDate(expected)}</strong>
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Đang lưu..."
              : mating
                ? "Lưu Thay Đổi"
                : "Lưu Phối Giống"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
