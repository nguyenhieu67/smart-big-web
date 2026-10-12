"use client";

import { useState } from "react";

import { InputField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { useForm } from "@/hooks";
import { parseApiError } from "@/lib/apiError";
import type { PigletBatch } from "@/types/piglet";
import { formatCurrency, toInputDate, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

export interface DeathPayload {
  log_date: string;
  head_count: number;
  reason?: string;
  cost?: number;
}

interface DeathFormModalProps {
  batch: PigletBatch;
  onSubmit: (payload: DeathPayload) => Promise<void>;
  onClose: () => void;
}

interface FormValues extends Record<string, unknown> {
  log_date: string;
  head_count: string;
  reason: string;
  cost: string;
}

// Ghi nhận con chết của đàn: tự trừ số lượng đàn và lưu nhật ký "Chết / loại thải" (xóa nhật ký thì số con được cộng lại)
export function DeathFormModal({
  batch,
  onSubmit,
  onClose,
}: DeathFormModalProps) {
  const quantity = batch.quantity ?? 0;
  const { formData, handleChange } = useForm<FormValues>({
    log_date: toLocalDateString(),
    head_count: "1",
    reason: "",
    cost: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const count = Number(formData.head_count);
  const validCount = Number.isInteger(count) && count >= 1 && count <= quantity;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const next: Record<string, string> = {};
    if (!Number.isInteger(count) || count < 1)
      next.head_count = "Số con chết phải là số nguyên từ 1";
    else if (count > quantity) next.head_count = `Đàn chỉ có ${quantity} con`;
    if (!formData.log_date) next.log_date = "Vui lòng chọn ngày";
    else if (formData.log_date > toLocalDateString())
      next.log_date = "Ngày không được ở tương lai";
    else if (formData.log_date < toInputDate(batch.birth_date))
      next.log_date = "Ngày không được trước ngày sinh của đàn";
    const cost =
      formData.cost.trim() === "" ? undefined : Number(formData.cost);
    if (cost !== undefined && (Number.isNaN(cost) || cost < 0))
      next.cost = "Chi phí phải là số không âm";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        log_date: formData.log_date,
        head_count: count,
        reason: formData.reason.trim() || undefined,
        cost,
      });
    } catch (err) {
      const { message, fields } = parseApiError(err);
      setErrors(fields);
      setFormError(Object.values(fields).join(". ") || message);
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={`Ghi nhận con chết - ${batch.code}`}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="head_count"
            name="head_count"
            type="number"
            min="1"
            max={quantity}
            step="1"
            label="Số con chết *"
            value={formData.head_count}
            onChange={handleChange}
            error={errors.head_count}
            size="sm"
          />
          <InputField
            id="log_date"
            name="log_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày ghi nhận *"
            value={formData.log_date}
            onChange={handleChange}
            error={errors.log_date}
            size="sm"
          />
        </div>
        <InputField
          id="reason"
          name="reason"
          label="Lý do / chẩn đoán"
          placeholder="Ví dụ: Tiêu chảy, đè chết..."
          value={formData.reason}
          onChange={handleChange}
          error={errors.reason}
          size="sm"
        />
        <InputField
          id="cost"
          name="cost"
          type="number"
          min="0"
          step="any"
          label="Chi phí xử lý (VNĐ)"
          value={formData.cost}
          onChange={handleChange}
          error={errors.cost}
          size="sm"
        />

        <p className="bg-surface-muted text-fg-body rounded-lg p-2.5 text-xs">
          Số con hiện tại: <strong>{quantity}</strong> · Sau khi ghi nhận còn:{" "}
          <strong className="text-danger">
            {validCount ? quantity - count : "—"}
          </strong>{" "}
          con
          {formData.cost.trim() !== "" && Number(formData.cost) > 0 && (
            <> · Chi phí: {formatCurrency(Number(formData.cost), "đ")}</>
          )}
        </p>
        <p className="text-fg-muted -mt-2 text-xs">
          Số lượng của đàn tự giảm và được lưu thành nhật ký &quot;Chết / loại
          thải&quot; trong trang Thuốc, Vaccine &amp; Sức Khỏe. Xóa nhật ký đó
          thì số con được cộng lại.
        </p>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" variant="danger" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Ghi Nhận Con Chết"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
