import { z } from "zod";

import { PIGLET_STAGE_VALUES } from "@/constants/piglet";
import { toLocalDateString } from "@/utils/format";

const isoDate = (v: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
export const pigletBatchFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập mã đàn")
      .max(50, "Mã đàn tối đa 50 ký tự"),
    birth_date: z
      .string()
      .min(1, "Vui lòng chọn ngày sinh")
      .refine(isoDate, "Ngày sinh không hợp lệ")
      .refine(
        (v) => v <= toLocalDateString(),
        "Ngày sinh không được ở tương lai",
      ),
    quantity: z
      .string()
      .trim()
      .transform((v) => (v === "" ? undefined : Number(v)))
      .pipe(
        z
          .number("Số lượng phải là số")
          .int("Số lượng phải là số nguyên")
          .min(0, "Số lượng không được âm")
          .max(100000, "Số lượng tối đa 100.000")
          .optional(),
      ),
    avg_weight: z
      .string()
      .trim()
      .transform((v) => (v === "" ? undefined : Number(v)))
      .pipe(
        z
          .number("Trọng lượng phải là số")
          .positive("Trọng lượng phải lớn hơn 0")
          .max(9999.99, "Trọng lượng tối đa 9999.99 kg")
          .optional(),
      ),
    stage: z.enum(PIGLET_STAGE_VALUES, "Vui lòng chọn giai đoạn"),
    health: z
      .string()
      .trim()
      .max(100, "Sức khỏe tối đa 100 ký tự")
      .transform((v) => v || undefined),
    target_wean_date: z
      .string()
      .refine((v) => v === "" || isoDate(v), "Ngày không hợp lệ")
      .transform((v) => v || undefined),
    // Nái gốc chỉ chọn khi tạo (API không cho đổi khi sửa và sẽ bỏ qua)
    sow_id: z.string().transform((v) => v || undefined),
    pen_id: z.string().transform((v) => v || undefined),
  })
  .refine((d) => !d.target_wean_date || d.target_wean_date >= d.birth_date, {
    message: "Ngày cai sữa dự kiến phải sau hoặc bằng ngày sinh",
    path: ["target_wean_date"],
  });

export type PigletBatchFormValues = z.input<typeof pigletBatchFormSchema>;
export type PigletBatchPayload = z.output<typeof pigletBatchFormSchema>;
