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
  batch_id: z.string(),
  vaccine_type_id: z.string(), // vaccine chọn từ danh mục, trống = nhập tay
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

// Bỏ các id trống khỏi body gửi API (API ép chuỗi rỗng thành id 0 và báo lỗi)
const pickIds = <T extends { vaccine_type_id: string }>({
  vaccine_type_id,
  ...rest
}: T) => ({ ...rest, ...(vaccine_type_id ? { vaccine_type_id } : {}) });

// Sửa: không đổi đối tượng nên sow_id / batch_id bỏ qua (API cũng bỏ qua khi PATCH)
export const healthLogUpdateSchema = healthLogBase
  .refine(nextAfterLog.check, nextAfterLog.params)
  .transform(pickIds);

// Thêm mới: chọn đúng một đối tượng (nái hoặc đàn heo con); trường còn lại bỏ khỏi body gửi API
export const healthLogCreateSchema = healthLogBase
  .refine(nextAfterLog.check, nextAfterLog.params)
  .refine((d) => d.sow_id !== "" || d.batch_id !== "", {
    message: "Vui lòng chọn nái hoặc đàn heo con",
    path: ["sow_id"],
  })
  .transform(({ sow_id, batch_id, ...rest }) => ({
    ...pickIds(rest),
    ...(sow_id ? { sow_id } : {}),
    ...(batch_id ? { batch_id } : {}),
  }));

export type HealthLogFormValues = z.input<typeof healthLogCreateSchema>;
export type HealthLogPayload = z.output<typeof healthLogCreateSchema>;
