export const formatCurrency = (value: string | number, unit = "VNĐ") => {
  const num = Number(value);
  if (isNaN(num)) return `0 ${unit}`;
  return `${num.toLocaleString("vi-VN")} ${unit}`;
};

export const toLocalDateString = (date: Date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatMonthShort = (month: string) => {
  const [year, m] = month.split("-");
  return `${m}/${year.slice(2)}`;
};

export const formatCompactNumber = (value: number, locale = "vi-VN") =>
  new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const buildSelectOptions = <T extends { id?: number | string }>(
  items: T[],
  getLabel: (item: T) => string,
  placeholderLabel?: string,
) => [
  ...(placeholderLabel ? [{ label: placeholderLabel, value: "" }] : []),
  ...items.map((item) => ({
    label: getLabel(item),
    value: String(item.id ?? ""),
  })),
];

// API trả ngày dạng ISO UTC ("2024-02-15T00:00:00.000Z"): cắt chuỗi để không bị lệch múi giờ
export const toInputDate = (iso: string) => iso.slice(0, 10);

export const formatDate = (iso: string) => {
  const [y, m, d] = toInputDate(iso).split("-");
  return `${d}/${m}/${y}`;
};

export const formatAge = (iso: string, now: Date = new Date()) => {
  const [y, m] = toInputDate(iso).split("-").map(Number);
  const months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (months < 1) return "< 1 tháng";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} tháng`;
  return rest === 0 ? `${years} năm` : `${years} năm ${rest} tháng`;
};
