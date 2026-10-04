import { z } from "zod";

import { MATING_RESULT_VALUES } from "@/constants/mating";
import { toLocalDateString } from "@/utils/format";

const pastDate = (label: string) =>
  z
    .string()
    .min(1, `Vui lòng chọn ${label}`)
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
      `${label[0].toUpperCase()}${label.slice(1)} không hợp lệ`,
    )
    .refine(
      (v) => v <= toLocalDateString(),
      `${label[0].toUpperCase()}${label.slice(1)} không được ở tương lai`,
    );

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
const matingBase = z.object({
  sow_id: z.string(),
  boar_id: z.string().min(1, "Vui lòng chọn heo đực / tinh"),
  heat_date: pastDate("ngày động dục"),
  mating_date: pastDate("ngày phối"),
  mating_count: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số lần phối")
    .transform(Number)
    .pipe(
      z
        .number("Số lần phối phải là số")
        .int("Số lần phối phải là số nguyên")
        .min(1, "Số lần phối tối thiểu là 1")
        .max(10, "Số lần phối tối đa là 10"),
    ),
  result: z.enum(MATING_RESULT_VALUES, "Vui lòng chọn kết quả"),
});

const orderRule = {
  check: (d: { heat_date: string; mating_date: string }) =>
    !d.heat_date || !d.mating_date || d.mating_date >= d.heat_date,
  params: {
    message: "Ngày phối phải sau hoặc bằng ngày động dục",
    path: ["mating_date"],
  },
};

// Sửa: không đổi nái nên sow_id có thể trống (API cũng bỏ qua sow_id khi PATCH)
export const matingUpdateSchema = matingBase.refine(
  orderRule.check,
  orderRule.params,
);

export const matingCreateSchema = matingBase
  .extend({ sow_id: z.string().min(1, "Vui lòng chọn nái") })
  .refine(orderRule.check, orderRule.params);

export type MatingFormValues = z.input<typeof matingCreateSchema>;
export type MatingPayload = z.output<typeof matingCreateSchema>;
