import { z } from "zod";

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
export const vaccineTypeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên vaccine")
    .max(150, "Tên vaccine tối đa 150 ký tự"),
  dose: z
    .string()
    .trim()
    .max(200, "Liều dùng tối đa 200 ký tự")
    .transform((v) => v || undefined),
  default_cost: z
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
  step_keys: z.array(z.string()),
});

export type VaccineTypeFormValues = z.input<typeof vaccineTypeFormSchema>;
export type VaccineTypePayload = z.output<typeof vaccineTypeFormSchema>;
