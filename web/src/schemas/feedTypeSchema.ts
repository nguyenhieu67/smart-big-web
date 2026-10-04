import { z } from "zod";

export const feedTypeFormSchema = z.object({
  code: z
    .string()
    .trim()
    .max(50, "Mã cám tối đa 50 ký tự")
    .transform((v) => v || undefined),
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên loại cám")
    .max(150, "Tên loại cám tối đa 150 ký tự"),
  default_price_per_kg: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(
      z
        .number("Giá phải là số")
        .positive("Giá phải lớn hơn 0")
        .max(9999999999.99, "Giá quá lớn")
        .optional(),
    ),
});

export type FeedTypeFormValues = z.input<typeof feedTypeFormSchema>;
export type FeedTypePayload = z.output<typeof feedTypeFormSchema>;
