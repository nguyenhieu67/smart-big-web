import type { PigletStage } from "@/types/piglet";

export const WEAN_AFTER_DAYS = 28; // khớp với API (đàn sinh từ lứa đẻ cai sữa sau 28 ngày)

export const PIGLET_STAGE_OPTIONS: {
  value: PigletStage;
  label: string;
  badge: string;
}[] = [
  { value: "SUCKLING", label: "Bú mẹ", badge: "badge-warning" },
  { value: "WEANED", label: "Cai sữa", badge: "badge-info" },
  { value: "RAISED_FOR_MEAT", label: "Nuôi thịt", badge: "badge-success" },
  { value: "SOLD", label: "Đã bán hết", badge: "badge-muted" },
];

export const PIGLET_STAGE_VALUES = PIGLET_STAGE_OPTIONS.map((o) => o.value) as [
  PigletStage,
  ...PigletStage[],
];

// Heo bán được khi đã cai sữa trở đi HOẶC đủ 1 tháng tuổi vào ngày bán; đàn đã bán hết thì không bán nữa (khớp với API)
export const SELLABLE_STAGES: PigletStage[] = ["WEANED", "RAISED_FOR_MEAT"];
export const MIN_SALE_AGE_MONTHS = 1;
