"use client";

import axios from "axios";
import Link from "next/link";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { SOW_BREED_SUGGESTIONS, SOW_STATUS_OPTIONS } from "@/constants/sow";
import { useForm, useFormSubmit } from "@/hooks";
import {
  sowFormSchema,
  type SowFormValues,
  type SowPayload,
} from "@/schemas/sowSchema";
import type { Pen } from "@/types/pen";
import type { Sow } from "@/types/sow";
import { toInputDate } from "@/utils/format";

import { Modal } from "./modal";

interface SowFormModalProps {
  sow: Sow | null; // null = thêm mới
  pens: Pen[];
  onSubmit: (payload: SowPayload) => Promise<void>;
  onClose: () => void;
}

function toFormValues(sow: Sow | null): SowFormValues {
  if (!sow) {
    return {
      code: "NAI-",
      breed: "",
      birth_date: "",
      weight: "",
      origin: "",
      health: "",
      parity_count: "0",
      status: "REPLACEMENT",
      pen_id: "",
    };
  }
  return {
    code: sow.code,
    breed: sow.breed,
    birth_date: toInputDate(sow.birth_date),
    weight: String(Number(sow.weight)),
    origin: sow.origin ?? "",
    health: sow.health ?? "",
    parity_count: String(sow.parity_count),
    status: sow.status,
    pen_id: String(sow.pen_id),
  };
}

// Parent render modal này có `key` theo từng nái nên state luôn khởi tạo mới mỗi lần mở
export function SowFormModal({
  sow,
  pens,
  onSubmit,
  onClose,
}: SowFormModalProps) {
  const { formData, handleChange } = useForm<SowFormValues>(toFormValues(sow));
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: sowFormSchema,
    values: formData,
    onSubmit,
    // BE trả 409 "Duplicate entry." khi trùng (farm_id, code)
    mapError: (err) =>
      axios.isAxiosError(err) && err.response?.status === 409
        ? { code: "Mã nái đã tồn tại trong trại này" }
        : undefined,
  });

  const penOptions = pens.map((p) => ({ label: p.name, value: String(p.id) }));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Modal
      title={sow ? "Cập Nhật Heo Nái" : "Thêm Nái Mới Vào Đàn"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="code"
            name="code"
            label="Mã heo nái *"
            placeholder="Ví dụ: NAI-026"
            value={formData.code}
            onChange={handleChange}
            error={errors.code}
            size="sm"
          />
          <div>
            <InputField
              id="breed"
              name="breed"
              label="Giống heo *"
              list="sow-breeds"
              placeholder="Chọn hoặc nhập giống"
              value={formData.breed}
              onChange={handleChange}
              error={errors.breed}
              size="sm"
            />
            <datalist id="sow-breeds">
              {SOW_BREED_SUGGESTIONS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="birth_date"
            name="birth_date"
            type="date"
            max={today}
            label="Ngày sinh *"
            value={formData.birth_date}
            onChange={handleChange}
            error={errors.birth_date}
            size="sm"
          />
          <InputField
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            min="0"
            label="Trọng lượng (kg) *"
            value={formData.weight}
            onChange={handleChange}
            error={errors.weight}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="origin"
            name="origin"
            label="Nguồn gốc"
            placeholder="Ví dụ: CP Vietnam"
            value={formData.origin}
            onChange={handleChange}
            error={errors.origin}
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
          <SelectField
            id="pen_id"
            name="pen_id"
            label="Vị trí chuồng *"
            placeholder="Chọn chuồng"
            options={penOptions}
            value={formData.pen_id}
            onChange={handleChange}
            error={errors.pen_id}
            size="sm"
          />
          <SelectField
            id="status"
            name="status"
            label="Trạng thái"
            options={SOW_STATUS_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={formData.status}
            onChange={handleChange}
            error={errors.status}
            size="sm"
          />
        </div>

        <InputField
          id="parity_count"
          name="parity_count"
          type="number"
          min="0"
          step="1"
          label="Số lứa đã đẻ"
          value={formData.parity_count}
          onChange={handleChange}
          error={errors.parity_count}
          size="sm"
        />

        {pens.length === 0 && (
          <p className="border-warning-line bg-warning-soft text-warning-fg rounded-lg border p-2.5 text-xs">
            Trại chưa có chuồng nào. Hãy tạo chuồng trước khi thêm nái (
            <Link href="/pens" className="font-semibold underline">
              Quản lý chuồng trại
            </Link>
            ).
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang lưu..." : sow ? "Lưu Thay Đổi" : "Lưu Nái Mới"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
