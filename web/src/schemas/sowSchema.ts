import { z } from "zod";

import { SOW_STATUS_VALUES } from "@/constants/sow";

const today = () => new Date().toISOString().slice(0, 10);

// Form giữ mọi giá trị dạng chuỗi; schema này kiểm tra rồi đổi sang đúng kiểu API (number, optional...)
// Tên field trùng với body của API để lỗi từ BE gắn thẳng vào đúng ô nhập.
export const sowFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã nái")
    .max(50, "Mã nái tối đa 50 ký tự"),
  breed: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập giống heo")
    .max(100, "Giống heo tối đa 100 ký tự"),
  birth_date: z
    .string()
    .min(1, "Vui lòng chọn ngày sinh")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
      "Ngày sinh không hợp lệ",
    )
    .refine((v) => v <= today(), "Ngày sinh không được ở tương lai"),
  weight: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập trọng lượng")
    .transform(Number)
    .pipe(
      z
        .number("Trọng lượng phải là số")
        .positive("Trọng lượng phải lớn hơn 0")
        .max(9999.99, "Trọng lượng tối đa 9999.99 kg"),
    ),
  origin: z
    .string()
    .trim()
    .max(150, "Nguồn gốc tối đa 150 ký tự")
    .transform((v) => v || undefined),
  health: z
    .string()
    .trim()
    .max(50, "Tình trạng sức khỏe tối đa 50 ký tự")
    .transform((v) => v || undefined),
  parity_count: z
    .string()
    .trim()
    .transform((v) => (v === "" ? 0 : Number(v)))
    .pipe(
      z
        .number("Số lứa đẻ phải là số")
        .int("Số lứa đẻ phải là số nguyên")
        .min(0, "Số lứa đẻ không được âm"),
    ),
  status: z.enum(SOW_STATUS_VALUES, "Trạng thái không hợp lệ"),
  pen_id: z.string().min(1, "Vui lòng chọn chuồng"),
});

export type SowFormValues = z.input<typeof sowFormSchema>;
export type SowPayload = z.output<typeof sowFormSchema>;
