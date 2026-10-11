"use client";

import { useState } from "react";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import type { CareStep } from "@/constants/pigletCare";
import { useForm } from "@/hooks";
import { parseApiError } from "@/lib/apiError";
import type { VaccineType } from "@/types/vaccine";
import { formatCurrency, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

export interface VaccinatePayload {
  log_date: string;
  vaccine_type_id?: number;
  name: string;
  dose?: string;
  cost?: number;
}

interface VaccinateModalProps {
  batchCode: string;
  heads: number; // số con của đàn, chi phí tổng = chi phí / con × số con
  step: CareStep;
  vaccineTypes: VaccineType[];
  onSubmit: (payload: VaccinatePayload) => Promise<void>;
  onClose: () => void;
}

interface FormValues extends Record<string, unknown> {
  log_date: string;
  vaccine_type_id: string;
  dose: string;
  cost: string;
}

const costOf = (v: VaccineType | undefined) =>
  v?.default_cost != null ? String(Number(v.default_cost)) : "";

// Ghi nhận một mũi tiêm trong quy trình: vaccine chọn sẵn theo mốc, liều và chi phí lấy từ danh mục nhưng sửa được
export function VaccinateModal({
  batchCode,
  heads,
  step,
  vaccineTypes,
  onSubmit,
  onClose,
}: VaccinateModalProps) {
  const preset = vaccineTypes.find((v) => v.step_keys.includes(step.id));
  const { formData, handleChange, setFormData } = useForm<FormValues>({
    log_date: toLocalDateString(),
    vaccine_type_id: preset ? String(preset.id) : "",
    dose: preset?.dose ?? "",
    cost: costOf(preset),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Đổi vaccine thì điền lại liều và chi phí mặc định của vaccine đó
  const handleVaccineChange = (e: { target: { value: string } }) => {
    const vaccine = vaccineTypes.find((v) => String(v.id) === e.target.value);
    setFormData((prev) => ({
      ...prev,
      vaccine_type_id: e.target.value,
      ...(vaccine ? { dose: vaccine.dose ?? "", cost: costOf(vaccine) } : {}),
    }));
  };

  const perHeadNumber = Number(formData.cost);
  const totalCost =
    formData.cost.trim() === "" || Number.isNaN(perHeadNumber)
      ? 0
      : Math.round(perHeadNumber * heads * 100) / 100;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const next: Record<string, string> = {};
    if (!formData.log_date) next.log_date = "Vui lòng chọn ngày tiêm";
    else if (formData.log_date > toLocalDateString())
      next.log_date = "Ngày tiêm không được ở tương lai";
    const cost =
      formData.cost.trim() === "" ? undefined : Number(formData.cost);
    if (cost !== undefined && (Number.isNaN(cost) || cost < 0))
      next.cost = "Chi phí phải là số không âm";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const vaccine = vaccineTypes.find(
      (v) => String(v.id) === formData.vaccine_type_id,
    );
    setSubmitting(true);
    try {
      await onSubmit({
        log_date: formData.log_date,
        vaccine_type_id: vaccine?.id,
        name: vaccine?.name ?? step.task, // không chọn vaccine thì ghi theo tên mốc
        dose: formData.dose.trim() || undefined,
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
      title={`Ghi nhận tiêm - ${batchCode}`}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <p className="bg-surface-muted text-fg-body rounded-lg p-2.5 text-xs">
          <strong>{step.age}:</strong> {step.task}
        </p>

        <SelectField
          id="vaccine_type_id"
          name="vaccine_type_id"
          label="Vaccine"
          placeholder="Không chọn (ghi theo tên mốc)"
          options={[
            { value: "", label: "Không chọn (ghi theo tên mốc)" },
            ...vaccineTypes.map((v) => ({
              value: String(v.id),
              label: v.name,
            })),
          ]}
          value={formData.vaccine_type_id}
          onChange={handleVaccineChange}
          size="sm"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="log_date"
            name="log_date"
            type="date"
            max={toLocalDateString()}
            label="Ngày tiêm *"
            value={formData.log_date}
            onChange={handleChange}
            error={errors.log_date}
            size="sm"
          />
          <InputField
            id="dose"
            name="dose"
            label="Liều dùng"
            placeholder="Ví dụ: 2 ml / con"
            value={formData.dose}
            onChange={handleChange}
            error={errors.dose}
            size="sm"
          />
        </div>

        <InputField
          id="cost"
          name="cost"
          type="number"
          min="0"
          step="any"
          label="Chi phí / con (VNĐ)"
          value={formData.cost}
          onChange={handleChange}
          error={errors.cost}
          size="sm"
        />
        <p className="bg-surface-muted text-fg-body rounded-lg p-2.5 text-xs">
          Số con của đàn: <strong>{heads}</strong> · Tổng chi phí:{" "}
          <strong className="text-danger">
            {formatCurrency(totalCost, "đ")}
          </strong>
        </p>
        <p className="text-fg-muted -mt-2 text-xs">
          Chi phí tính theo từng con (lấy từ danh mục vaccine, sửa được cho lần
          tiêm này) rồi nhân với số con của đàn. Tổng chi phí tự ghi vào sổ chi
          phí (danh mục &quot;Thuốc / Vaccine&quot;).
        </p>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" variant="success" disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu Mũi Tiêm"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
