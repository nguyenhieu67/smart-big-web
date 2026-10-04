import { z } from "zod";

export const buyerFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên người mua")
    .max(150, "Tên tối đa 150 ký tự"),
  phone: z
    .string()
    .trim()
    .max(20, "Số điện thoại tối đa 20 ký tự")
    .refine((v) => /^[0-9+\s().-]*$/.test(v), "Số điện thoại không hợp lệ")
    .transform((v) => v || undefined),
  note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform((v) => v || undefined),
});

export type BuyerFormValues = z.input<typeof buyerFormSchema>;
export type BuyerPayload = z.output<typeof buyerFormSchema>;
