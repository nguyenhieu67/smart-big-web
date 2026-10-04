import { z } from "zod";

import { AUTO_PEN } from "@/constants/pen";
import { toLocalDateString } from "@/utils/format";

const positive = (label: string, max: number, maxMessage: string) =>
  z
    .string()
    .trim()
    .min(1, `Vui lòng nhập ${label}`)
    .transform(Number)
    .pipe(
      z
        .number(`${label[0].toUpperCase()}${label.slice(1)} phải là số`)
        .positive(`${label[0].toUpperCase()}${label.slice(1)} phải lớn hơn 0`)
        .max(max, maxMessage),
    );

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
const saleBase = z.object({
  sale_date: z
    .string()
    .min(1, "Vui lòng chọn ngày bán")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
      "Ngày bán không hợp lệ",
    )
    .refine((v) => v <= toLocalDateString(), "Ngày bán không được ở tương lai"),
  shipping_date: z
    .string()
    .refine(
      (v) =>
        v === "" ||
        (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))),
      "Ngày vận chuyển không hợp lệ",
    )
    .transform((v) => v || undefined),
  batch_id: z.string().min(1, "Vui lòng chọn đàn bán"),
  pen_id: z.string(),
  buyer_id: z.string().transform((v) => v || undefined),
  quantity: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số lượng")
    .transform(Number)
    .pipe(
      z
        .number("Số lượng phải là số")
        .int("Số lượng phải là số nguyên")
        .positive("Số lượng phải lớn hơn 0")
        .max(100000, "Số lượng tối đa 100.000"),
    ),
  total_weight_kg: positive(
    "tổng trọng lượng",
    99999999.99,
    "Trọng lượng quá lớn",
  ),
  price_per_kg: positive("đơn giá", 9999999999.99, "Đơn giá quá lớn"),
});

// pen_id của form -> body API: AUTO_PEN thành create_pen, id thành pen_id, rỗng thì bỏ
type SaleBody = Omit<z.output<typeof saleBase>, "pen_id"> & {
  pen_id?: string;
  create_pen?: boolean;
};

export const saleFormSchema = saleBase
  .refine((d) => !d.shipping_date || d.shipping_date >= d.sale_date, {
    message: "Ngày vận chuyển phải sau hoặc bằng ngày bán",
    path: ["shipping_date"],
  })
  .transform(({ pen_id, ...rest }): SaleBody => {
    if (pen_id === AUTO_PEN) return { ...rest, create_pen: true };
    return pen_id ? { ...rest, pen_id } : rest;
  });

export type SaleFormValues = z.input<typeof saleFormSchema>;
export type SalePayload = SaleBody;
