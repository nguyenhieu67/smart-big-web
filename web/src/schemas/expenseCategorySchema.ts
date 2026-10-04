import { z } from "zod";

export const expenseCategoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập tên danh mục")
    .max(100, "Tên danh mục tối đa 100 ký tự"),
});

export type ExpenseCategoryFormValues = z.input<
  typeof expenseCategoryFormSchema
>;
export type ExpenseCategoryPayload = z.output<typeof expenseCategoryFormSchema>;
