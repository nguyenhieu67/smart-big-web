import { z } from "zod";

import { toLocalDateString } from "@/utils/format";

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
export const expenseFormSchema = z.object({
  expense_date: z
    .string()
    .min(1, "Vui lòng chọn ngày chi")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
      "Ngày chi không hợp lệ",
    )
    .refine((v) => v <= toLocalDateString(), "Ngày chi không được ở tương lai"),
  category_id: z.string().min(1, "Vui lòng chọn danh mục chi phí"),
  amount: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số tiền")
    .transform(Number)
    .pipe(
      z
        .number("Số tiền phải là số")
        .positive("Số tiền phải lớn hơn 0")
        .max(999999999999.99, "Số tiền quá lớn"),
    ),
  description: z
    .string()
    .trim()
    .max(500, "Nội dung tối đa 500 ký tự")
    .transform((v) => v || undefined),
});

export type ExpenseFormValues = z.input<typeof expenseFormSchema>;
export type ExpensePayload = z.output<typeof expenseFormSchema>;
