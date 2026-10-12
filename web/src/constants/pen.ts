// Chuồng đẻ tự tạo có sức chứa = nái mẹ + heo con sống + số chỗ dư này (khớp với API)
export const FARROWING_PEN_SPARE = 5;

// Loại chuồng của chuồng chờ bán ("Chuồng chờ bán-01", "-02"...), khớp với API
export const HOLDING_PEN_SUBNAME = "Chuồng chờ bán";

export const PEN_STATUS_LABELS = {
  EMPTY: { label: "Trống", badge: "badge-success" },
  AWAITING_SALE: { label: "Đang chờ bán", badge: "badge-warning" },
} as const;

// Giá trị đặc biệt của ô chọn chuồng: để hệ thống tự chọn / tạo chuồng (rỗng = giữ chuồng hiện tại)
export const AUTO_PEN = "__new__";
