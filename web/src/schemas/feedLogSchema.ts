import { z } from "zod";

import { toLocalDateString } from "@/utils/format";

const optionalPositive = (label: string, max: number, maxMessage: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(
      z
        .number(`${label} phải là số`)
        .positive(`${label} phải lớn hơn 0`)
        .max(max, maxMessage)
        .optional(),
    );

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
export const feedLogFormSchema = z.object({
  log_date: z
    .string()
    .min(1, "Vui lòng chọn ngày")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
      "Ngày không hợp lệ",
    )
    .refine((v) => v <= toLocalDateString(), "Ngày không được ở tương lai"),
  feed_type_id: z.string().min(1, "Vui lòng chọn loại cám"),
  pen_id: z.string().min(1, "Vui lòng chọn chuồng"),
  quantity_kg: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số lượng")
    .transform(Number)
    .pipe(
      z
        .number("Số lượng phải là số")
        .positive("Số lượng phải lớn hơn 0")
        .max(99999999.99, "Số lượng quá lớn"),
    ),
  daily_per_head: optionalPositive(
    "Lượng ăn",
    9999.99,
    "Lượng ăn tối đa 9999.99 kg/con/ngày",
  ),
  // bỏ trống: API lấy giá mặc định của loại cám
  price_per_kg: optionalPositive("Đơn giá", 9999999999.99, "Đơn giá quá lớn"),
});

export type FeedLogFormValues = z.input<typeof feedLogFormSchema>;
export type FeedLogPayload = z.output<typeof feedLogFormSchema>;
