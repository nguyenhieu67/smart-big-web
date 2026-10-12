"use client";

import { useRef } from "react";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import {
  HEALTH_CATEGORY_OPTIONS,
  TREATMENT_STATUS_OPTIONS,
} from "@/constants/healthLog";
import { useForm, useFormSubmit } from "@/hooks";
import {
  healthLogCreateSchema,
  healthLogUpdateSchema,
  type HealthLogFormValues,
  type HealthLogPayload,
} from "@/schemas/healthLogSchema";
import type { HealthLog } from "@/types/healthLog";
import type { PigletBatch } from "@/types/piglet";
import type { Sow } from "@/types/sow";
import type { VaccineType } from "@/types/vaccine";
import { formatCurrency, toInputDate, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

interface HealthLogFormModalProps {
  log: HealthLog | null; // null = thêm mới
  target: "sow" | "batch"; // thêm mới cho nái hay cho đàn heo con (khi sửa lấy theo bản ghi)
  sows: Sow[];
  batches: PigletBatch[];
  vaccineTypes: VaccineType[];
  onSubmit: (payload: HealthLogPayload) => Promise<void>;
  onClose: () => void;
}

function toFormValues(log: HealthLog | null): HealthLogFormValues {
  if (!log) {
    return {
      log_date: toLocalDateString(),
      category: "VACCINATION",
      sow_id: "",
      batch_id: "",
      vaccine_type_id: "",
      head_count: "",
      name: "",
      dose: "",
      status: "COMPLETED",
      cost: "",
      next_date: "",
    };
  }
  return {
    log_date: toInputDate(log.log_date),
    category: log.category,
    sow_id: log.sow_id != null ? String(log.sow_id) : "",
    batch_id: log.batch_id != null ? String(log.batch_id) : "",
    vaccine_type_id:
      log.vaccine_type_id != null ? String(log.vaccine_type_id) : "",
    head_count: log.head_count != null ? String(log.head_count) : "",
    name: log.name,
    dose: log.dose ?? "",
    status: log.status,
    cost: String(Number(log.cost)),
    next_date: log.next_date ? toInputDate(log.next_date) : "",
  };
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function HealthLogFormModal({
  log,
  target,
  sows,
  batches,
  vaccineTypes,
  onSubmit,
  onClose,
}: HealthLogFormModalProps) {
  // Chi phí vaccine trong danh mục tính theo con: nhật ký của đàn nhân với số con của đàn, của nái là 1 con
  const headsOf = (batchId: string) =>
    batchId
      ? (batches.find((b) => String(b.id) === batchId)?.quantity ?? 1)
      : 1;
  const totalCost = (vaccine: VaccineType | undefined, batchId: string) =>
    vaccine?.default_cost != null
      ? String(
          Math.round(Number(vaccine.default_cost) * headsOf(batchId) * 100) /
            100,
        )
      : null;

  const { formData, handleChange, setFormData } = useForm<HealthLogFormValues>(
    toFormValues(log),
    {
      // Đổi đàn khi đã chọn vaccine từ danh mục -> tính lại chi phí theo số con của đàn mới
      customHandlers: {
        batch_id: (value, prev) => {
          const vaccine = vaccineTypes.find(
            (v) => String(v.id) === prev.vaccine_type_id,
          );
          const cost = totalCost(vaccine, String(value));
          return cost != null ? { cost } : {};
        },
      },
    },
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const selectedVaccine = vaccineTypes.find(
    (v) => String(v.id) === formData.vaccine_type_id,
  );

  // Chọn vaccine từ danh mục thì điền sẵn tên, liều và chi phí mặc định (vẫn sửa được)
  const handleVaccineChange = (e: {
    target: { name?: string; value: string };
  }) => {
    const vaccine = vaccineTypes.find((v) => String(v.id) === e.target.value);
    if (!vaccine) {
      // Chọn "Nhập tay": xóa tên thuốc đang điền sẵn và đưa con trỏ vào ô tên để gõ
      setFormData((prev) => ({ ...prev, vaccine_type_id: "", name: "" }));
      setTimeout(() => nameRef.current?.focus(), 0);
      return;
    }
    setFormData((prev) => ({
      ...prev,
      vaccine_type_id: e.target.value,
      ...(vaccine
        ? {
            name: vaccine.name,
            dose: vaccine.dose ?? prev.dose,
            cost: totalCost(vaccine, prev.batch_id) ?? prev.cost,
            category: "VACCINATION" as const,
          }
        : {}),
    }));
  };

  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: log ? healthLogUpdateSchema : healthLogCreateSchema,
    values: formData,
    onSubmit,
  });

  const sowOptions = sows.map((s) => ({ label: s.code, value: String(s.id) }));
  const batchOptions = batches
    .filter((b) => b.stage !== "SOLD")
    .map((b) => ({ label: b.code, value: String(b.id) }));
  // API không cho đổi đối tượng (nái / đàn) của một bản ghi sức khỏe
  const targetLabel = log
    ? log.sow
      ? "Nái"
      : "Đàn"
    : target === "batch"
      ? "Chọn đàn heo con *"
      : "Chọn nái *";
  const targetValue = log ? (log.sow?.code ?? log.pigletBatch?.code ?? "") : "";

  return (
    <Modal
      title={log ? "Cập Nhật Nhật Ký Sức Khỏe" : "Ghi Nhận Sức Khỏe / Vaccine"}
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
            label="Ngày ghi nhận *"
            value={formData.log_date}
            onChange={handleChange}
            error={errors.log_date}
            size="sm"
          />
          <SelectField
            id="category"
            name="category"
            label="Phân loại *"
            options={HEALTH_CATEGORY_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            // Nhật ký chết của đàn đã trừ số con nên không đổi phân loại (xóa rồi ghi lại)
            disabled={
              !!log && log.category === "DEATH" && log.head_count != null
            }
            size="sm"
          />
        </div>

        {/* Chết / loại thải của đàn heo con: nhập số con chết, tự trừ vào số lượng đàn */}
        {formData.category === "DEATH" &&
          (log ? log.batch_id != null : target === "batch") && (
            <InputField
              id="head_count"
              name="head_count"
              type="number"
              min="1"
              step="1"
              label="Số con chết *"
              value={formData.head_count}
              onChange={handleChange}
              error={errors.head_count}
              disabled={!!log}
              size="sm"
            />
          )}

        {log ? (
          <InputField
            id="target"
            label={targetLabel}
            value={targetValue}
            disabled
            readOnly
            size="sm"
          />
        ) : target === "batch" ? (
          <SelectField
            id="batch_id"
            name="batch_id"
            label={targetLabel}
            placeholder="Chọn đàn heo con"
            options={batchOptions}
            value={formData.batch_id}
            onChange={handleChange}
            error={errors.batch_id ?? errors.sow_id}
            size="sm"
          />
        ) : (
          <SelectField
            id="sow_id"
            name="sow_id"
            label={targetLabel}
            placeholder="Chọn nái"
            options={sowOptions}
            value={formData.sow_id}
            onChange={handleChange}
            error={errors.sow_id}
            size="sm"
          />
        )}

        {vaccineTypes.length > 0 && (
          <SelectField
            id="vaccine_type_id"
            name="vaccine_type_id"
            label="Vaccine trong danh mục"
            placeholder="Nhập tay (không chọn)"
            options={[
              { value: "", label: "Nhập tay (không chọn)" },
              ...vaccineTypes.map((v) => ({
                value: String(v.id),
                label: v.name,
              })),
            ]}
            value={formData.vaccine_type_id}
            onChange={handleVaccineChange}
            error={errors.vaccine_type_id}
            size="sm"
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
            ref={nameRef}
            id="name"
            name="name"
            label="Tên thuốc / vaccine / triệu chứng *"
            placeholder="Ví dụ: Vaccine dịch tả (CSF)"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            size="sm"
          />
          <InputField
            id="dose"
            name="dose"
            label="Liều dùng / chẩn đoán"
            placeholder="Ví dụ: 2 ml / con"
            value={formData.dose}
            onChange={handleChange}
            error={errors.dose}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <SelectField
            id="status"
            name="status"
            label="Trạng thái *"
            options={TREATMENT_STATUS_OPTIONS}
            value={formData.status}
            onChange={handleChange}
            error={errors.status}
            size="sm"
          />
          <InputField
            id="cost"
            name="cost"
            type="number"
            min="0"
            step="any"
            label="Chi phí (VNĐ)"
            value={formData.cost}
            onChange={handleChange}
            error={errors.cost}
            size="sm"
          />
        </div>

        {selectedVaccine?.default_cost != null && (
          <p className="text-fg-muted -mt-2 text-xs">
            Chi phí mặc định {formatCurrency(selectedVaccine.default_cost, "đ")}{" "}
            / con × {headsOf(formData.batch_id)} con (sửa được).
          </p>
        )}
        <p className="text-fg-muted -mt-2 text-xs">
          Nếu có chi phí, khoản chi sẽ tự ghi vào sổ chi phí (danh mục
          &quot;Thuốc / Vaccine&quot;).
        </p>

        <InputField
          id="next_date"
          name="next_date"
          type="date"
          min={formData.log_date || undefined}
          label="Lịch tiêm / điều trị tiếp theo"
          value={formData.next_date}
          onChange={handleChange}
          error={errors.next_date}
          size="sm"
        />

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
