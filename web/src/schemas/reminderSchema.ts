import { z } from "zod";

import { REMINDER_TYPE_VALUES } from "@/constants/reminder";

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
export const reminderFormSchema = z.object({
  type: z.enum(REMINDER_TYPE_VALUES, "Vui lòng chọn loại nhắc việc"),
  title: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập nội dung nhắc việc")
    .max(200, "Nội dung tối đa 200 ký tự"),
  due_date: z
    .string()
    .min(1, "Vui lòng chọn ngày")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
      "Ngày không hợp lệ",
    ),
  sow_id: z.string().transform((v) => v || undefined),
  batch_id: z.string().transform((v) => v || undefined),
});

export type ReminderFormValues = z.input<typeof reminderFormSchema>;
export type ReminderPayload = z.output<typeof reminderFormSchema>;
