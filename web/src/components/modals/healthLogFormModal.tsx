"use client";

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
import type { Sow } from "@/types/sow";
import { toInputDate, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

interface HealthLogFormModalProps {
  log: HealthLog | null; // null = thêm mới
  sows: Sow[];
  onSubmit: (payload: HealthLogPayload) => Promise<void>;
  onClose: () => void;
}

function toFormValues(log: HealthLog | null): HealthLogFormValues {
  if (!log) {
    return {
      log_date: toLocalDateString(),
      category: "VACCINATION",
      sow_id: "",
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
  sows,
  onSubmit,
  onClose,
}: HealthLogFormModalProps) {
  const { formData, handleChange } = useForm<HealthLogFormValues>(
    toFormValues(log),
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: log ? healthLogUpdateSchema : healthLogCreateSchema,
    values: formData,
    onSubmit,
  });

  const sowOptions = sows.map((s) => ({ label: s.code, value: String(s.id) }));
  // API không cho đổi đối tượng (nái / đàn) của một bản ghi sức khỏe
  const targetLabel = log ? (log.sow ? "Nái" : "Đàn") : "Chọn nái *";
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
            size="sm"
          />
        </div>

        {log ? (
          <InputField
            id="target"
            label={targetLabel}
            value={targetValue}
            disabled
            readOnly
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <InputField
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
