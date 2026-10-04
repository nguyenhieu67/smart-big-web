import { z } from "zod";

import { AUTO_PEN } from "@/constants/pen";
import { toLocalDateString } from "@/utils/format";

const count = (label: string, required: boolean) =>
  z
    .string()
    .trim()
    .pipe(required ? z.string().min(1, `Vui lòng nhập ${label}`) : z.string())
    // số con bỏ trống (không bắt buộc) tính là 0
    .transform((v) => (v === "" ? 0 : Number(v)))
    .pipe(
      z
        .number(`${label[0].toUpperCase()}${label.slice(1)} phải là số`)
        .int(`${label[0].toUpperCase()}${label.slice(1)} phải là số nguyên`)
        .min(0, `${label[0].toUpperCase()}${label.slice(1)} không được âm`)
        .max(40, `${label[0].toUpperCase()}${label.slice(1)} tối đa 40`),
    );

// Form giữ mọi giá trị dạng chuỗi; tên field trùng body API để lỗi từ BE gắn đúng ô nhập
const farrowingBase = z.object({
  sow_id: z.string(),
  pen_id: z.string(),
  farrow_date: z
    .string()
    .min(1, "Vui lòng chọn ngày đẻ")
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
      "Ngày đẻ không hợp lệ",
    )
    .refine((v) => v <= toLocalDateString(), "Ngày đẻ không được ở tương lai"),
  live_born: count("số con sống", true),
  dead_born: count("số con chết", false),
  weak_born: count("số con yếu", false),
  avg_birth_weight: z
    .string()
    .trim()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .pipe(
      z
        .number("Trọng lượng phải là số")
        .positive("Trọng lượng phải lớn hơn 0")
        .max(99.99, "Trọng lượng tối đa 99.99 kg")
        .optional(),
    ),
  assist_note: z
    .string()
    .trim()
    .max(500, "Ghi chú tối đa 500 ký tự")
    .transform((v) => v || undefined),
});

const weakRule = {
  check: (d: { live_born: number; weak_born: number }) =>
    d.weak_born <= d.live_born,
  params: {
    message: "Số con yếu không được lớn hơn số con sống",
    path: ["weak_born"],
  },
};

// pen_id của form -> body API: AUTO_PEN thành create_pen, id thành pen_id, rỗng thì bỏ
type FarrowingBody = Omit<z.output<typeof farrowingBase>, "pen_id"> & {
  pen_id?: string;
  create_pen?: boolean;
};

const toBody = ({
  pen_id,
  ...rest
}: z.output<typeof farrowingBase>): FarrowingBody => {
  if (pen_id === AUTO_PEN) return { ...rest, create_pen: true };
  return pen_id ? { ...rest, pen_id } : rest;
};

// Sửa: không đổi nái/chuồng nên sow_id, pen_id có thể trống (API cũng bỏ qua khi PATCH)
export const farrowingUpdateSchema = farrowingBase
  .refine(weakRule.check, weakRule.params)
  .transform(toBody);

export const farrowingCreateSchema = farrowingBase
  .extend({ sow_id: z.string().min(1, "Vui lòng chọn nái") })
  .refine(weakRule.check, weakRule.params)
  .transform(toBody);

export type FarrowingFormValues = z.input<typeof farrowingCreateSchema>;
export type FarrowingPayload = FarrowingBody;
