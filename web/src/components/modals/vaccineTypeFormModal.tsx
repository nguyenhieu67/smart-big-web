"use client";

import axios from "axios";

import { InputField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { VACCINE_STEPS } from "@/constants/pigletCare";
import { useForm, useFormSubmit } from "@/hooks";
import {
  vaccineTypeFormSchema,
  type VaccineTypeFormValues,
  type VaccineTypePayload,
} from "@/schemas/vaccineTypeSchema";
import type { VaccineType } from "@/types/vaccine";

import { Modal } from "./modal";

interface VaccineTypeFormModalProps {
  vaccineType: VaccineType | null; // null = thêm mới
  onSubmit: (payload: VaccineTypePayload) => Promise<void>;
  onClose: () => void;
}

function toFormValues(vaccineType: VaccineType | null): VaccineTypeFormValues {
  return {
    name: vaccineType?.name ?? "",
    dose: vaccineType?.dose ?? "",
    default_cost:
      vaccineType?.default_cost != null
        ? String(Number(vaccineType.default_cost))
        : "",
    step_keys: vaccineType?.step_keys ?? [],
  };
}

// Parent render modal này có `key` theo từng vaccine nên state luôn khởi tạo mới mỗi lần mở
export function VaccineTypeFormModal({
  vaccineType,
  onSubmit,
  onClose,
}: VaccineTypeFormModalProps) {
  const { formData, handleChange, setFormData } =
    useForm<VaccineTypeFormValues>(toFormValues(vaccineType));
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: vaccineTypeFormSchema,
    values: formData,
    onSubmit,
    // BE trả 409 "Duplicate entry." khi trùng (farm_id, name)
    mapError: (err) =>
      axios.isAxiosError(err) && err.response?.status === 409
        ? { name: "Tên vaccine đã tồn tại trong trại này" }
        : undefined,
  });

  const toggleStep = (id: string) =>
    setFormData((prev) => ({
      ...prev,
      step_keys: prev.step_keys.includes(id)
        ? prev.step_keys.filter((k) => k !== id)
        : [...prev.step_keys, id],
    }));

  return (
    <Modal
      title={vaccineType ? "Cập Nhật Vaccine" : "Thêm Vaccine"}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <InputField
          id="name"
          name="name"
          label="Tên vaccine *"
          placeholder="Ví dụ: Vaccine dịch tả heo"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          size="sm"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            id="dose"
            name="dose"
            label="Liều dùng mặc định"
            placeholder="Ví dụ: 2 ml / con"
            value={formData.dose}
            onChange={handleChange}
            error={errors.dose}
            size="sm"
          />
          <InputField
            id="default_cost"
            name="default_cost"
            type="number"
            min="0"
            step="any"
            label="Chi phí mặc định / con (VNĐ)"
            value={formData.default_cost}
            onChange={handleChange}
            error={errors.default_cost}
            size="sm"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-fg-body mb-1 text-xs font-medium">
            Dùng cho mốc quy trình heo con
          </legend>
          <p className="text-fg-muted text-xs">
            Khi bấm &quot;Đã tiêm&quot; ở mốc nào, vaccine này được chọn sẵn
            cùng liều và chi phí mặc định.
          </p>
          <div className="space-y-1.5">
            {VACCINE_STEPS.map((step) => (
              <label
                key={step.id}
                className="text-fg-body flex cursor-pointer items-start gap-2 text-xs"
              >
                <input
                  type="checkbox"
                  checked={formData.step_keys.includes(step.id)}
                  onChange={() => toggleStep(step.id)}
                  className="mt-0.5 shrink-0"
                />
                <span>
                  <strong>{step.age}:</strong> {step.task}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Đang lưu..."
              : vaccineType
                ? "Lưu Thay Đổi"
                : "Lưu Vaccine"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
