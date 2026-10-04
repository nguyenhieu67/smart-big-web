import { z } from "zod";

// Form giữ mọi giá trị dạng chuỗi; schema kiểm tra rồi đổi sang kiểu API.
// Tên field trùng body của API để lỗi từ BE gắn đúng ô nhập.
export const penFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên chuồng")
    .max(100, "Tên chuồng tối đa 100 ký tự"),
  capacity: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập sức chứa")
    .transform(Number)
    .pipe(
      z
        .number("Sức chứa phải là số")
        .int("Sức chứa phải là số nguyên")
        .positive("Sức chứa phải lớn hơn 0")
        .max(10000, "Sức chứa tối đa 10.000 con"),
    ),
  // Để trống thì gửi null để xóa giá trị cũ (PATCH bỏ qua field undefined)
  subname: z
    .string()
    .trim()
    .max(100, "Tên phụ tối đa 100 ký tự")
    .transform((v) => v || null),
  description: z
    .string()
    .trim()
    .max(255, "Mô tả tối đa 255 ký tự")
    .transform((v) => v || null),
});

export type PenFormValues = z.input<typeof penFormSchema>;
export type PenPayload = z.output<typeof penFormSchema>;
