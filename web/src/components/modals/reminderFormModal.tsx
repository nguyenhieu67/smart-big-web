"use client";

import { InputField, SelectField } from "@/components/form";
import { Button, FormAlert } from "@/components/ui";
import { REMINDER_TYPE_OPTIONS } from "@/constants/reminder";
import { useForm, useFormSubmit } from "@/hooks";
import {
  reminderFormSchema,
  type ReminderFormValues,
  type ReminderPayload,
} from "@/schemas/reminderSchema";
import type { PigletBatch } from "@/types/piglet";
import type { Reminder } from "@/types/reminder";
import type { Sow } from "@/types/sow";
import { toInputDate, toLocalDateString } from "@/utils/format";

import { Modal } from "./modal";

interface ReminderFormModalProps {
  reminder: Reminder | null; // null = thêm mới
  sows: Sow[];
  batches: PigletBatch[];
  onSubmit: (payload: ReminderPayload) => Promise<void>;
  onClose: () => void;
}

const NONE = { label: "— Không chọn —", value: "" };

function toFormValues(reminder: Reminder | null): ReminderFormValues {
  if (!reminder) {
    return {
      type: "VACCINE",
      title: "",
      due_date: toLocalDateString(),
      sow_id: "",
      batch_id: "",
    };
  }
  return {
    type: reminder.type,
    title: reminder.title,
    due_date: toInputDate(reminder.due_date),
    sow_id: reminder.sow_id != null ? String(reminder.sow_id) : "",
    batch_id: reminder.batch_id != null ? String(reminder.batch_id) : "",
  };
}

// Parent render modal này có `key` theo từng bản ghi nên state luôn khởi tạo mới mỗi lần mở
export function ReminderFormModal({
  reminder,
  sows,
  batches,
  onSubmit,
  onClose,
}: ReminderFormModalProps) {
  const { formData, handleChange } = useForm<ReminderFormValues>(
    toFormValues(reminder),
  );
  const { errors, formError, submitting, handleSubmit } = useFormSubmit({
    schema: reminderFormSchema,
    values: formData,
    onSubmit,
  });

  const sowOptions = [
    NONE,
    ...sows.map((s) => ({ label: s.code, value: String(s.id) })),
  ];
  const batchOptions = [
    NONE,
    ...batches.map((b) => ({ label: b.code, value: String(b.id) })),
  ];

  return (
    <Modal
      title={reminder ? "Cập Nhật Nhắc Việc" : "Thêm Nhắc Việc"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-2">
        {formError && <FormAlert>{formError}</FormAlert>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <SelectField
            id="type"
            name="type"
            label="Loại nhắc việc *"
            options={REMINDER_TYPE_OPTIONS.map(({ value, label }) => ({
              value,
              label,
            }))}
            value={formData.type}
            onChange={handleChange}
            error={errors.type}
            size="sm"
          />
          <InputField
            id="due_date"
            name="due_date"
            type="date"
            label="Ngày cần làm *"
            value={formData.due_date}
            onChange={handleChange}
            error={errors.due_date}
            size="sm"
          />
        </div>

        <InputField
          id="title"
          name="title"
          label="Nội dung *"
          placeholder="Ví dụ: Tiêm vaccine dịch tả cho đàn DAN-201"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          size="sm"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <SelectField
            id="sow_id"
            name="sow_id"
            label="Nái liên quan"
            options={sowOptions}
            value={formData.sow_id}
            onChange={handleChange}
            error={errors.sow_id}
            size="sm"
          />
          <SelectField
            id="batch_id"
            name="batch_id"
            label="Đàn liên quan"
            options={batchOptions}
            value={formData.batch_id}
            onChange={handleChange}
            error={errors.batch_id}
            size="sm"
          />
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting
              ? "Đang lưu..."
              : reminder
                ? "Lưu Thay Đổi"
                : "Lưu Nhắc Việc"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
