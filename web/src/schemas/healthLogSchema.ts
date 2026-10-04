import { z } from "zod";

import {
  HEALTH_CATEGORY_VALUES,
  TREATMENT_STATUS_VALUES,
} from "@/constants/healthLog";
import { toLocalDateString } from "@/utils/format";

const isoDate = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
const healthLogBase = z.object({
  log_date: z
    .string()
    .min(1, "Vui lòng chọn ngày ghi nhận")
    .refine(isoDate, "Ngày không hợp lệ")
    .refine((v) => v <= toLocalDateString(), "Ngày không được ở tương lai"),
  category: z.enum(HEALTH_CATEGORY_VALUES, "Vui lòng chọn phân loại"),
  sow_id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên thuốc / vaccine / triệu chứng")
    .max(200, "Tối đa 200 ký tự"),
  dose: z
    .string()
    .trim()
    .max(200, "Tối đa 200 ký tự")
    .transform((v) => v || undefined),
  status: z.enum(TREATMENT_STATUS_VALUES, "Vui lòng chọn trạng thái"),
  cost: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(
      z
        .number("Chi phí phải là số")
        .min(0, "Chi phí không được âm")
        .max(999999999999.99, "Chi phí quá lớn")
        .optional(),
    ),
  next_date: z
    .string()
    .refine((v) => v === "" || isoDate(v), "Ngày không hợp lệ")
    .transform((v) => v || undefined),
});

const nextAfterLog = {
  check: (d: { log_date: string; next_date?: string }) =>
    !d.next_date || d.next_date >= d.log_date,
  params: {
    message: "Ngày tiếp theo phải sau hoặc bằng ngày ghi nhận",
    path: ["next_date"],
  },
};

// Sửa: không đổi đối tượng nên sow_id có thể trống (bản ghi của đàn heo con, API cũng bỏ qua sow_id khi PATCH)
export const healthLogUpdateSchema = healthLogBase.refine(
  nextAfterLog.check,
  nextAfterLog.params,
);

export const healthLogCreateSchema = healthLogBase
  .extend({ sow_id: z.string().min(1, "Vui lòng chọn nái") })
  .refine(nextAfterLog.check, nextAfterLog.params);

export type HealthLogFormValues = z.input<typeof healthLogCreateSchema>;
export type HealthLogPayload = z.output<typeof healthLogCreateSchema>;
