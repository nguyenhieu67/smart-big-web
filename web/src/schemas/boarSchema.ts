import { z } from "zod";

export const boarFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập mã heo đực / tinh")
    .max(50, "Mã tối đa 50 ký tự"),
  breed: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập giống")
    .max(100, "Giống tối đa 100 ký tự"),
});

export type BoarFormValues = z.input<typeof boarFormSchema>;
export type BoarPayload = z.output<typeof boarFormSchema>;
