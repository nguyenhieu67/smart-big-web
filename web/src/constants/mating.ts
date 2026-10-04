import type { MatingResult } from "@/types/mating";

export const GESTATION_DAYS = 114; // khớp với API

export const MATING_RESULT_OPTIONS: {
  value: MatingResult;
  label: string;
  badge: string;
}[] = [
  { value: "RECENTLY_MATED", label: "Mới phối", badge: "badge-purple" },
  { value: "SUCCESSFULLY", label: "Đã đậu thai", badge: "badge-success" },
  { value: "FAILED", label: "Không đậu", badge: "badge-danger" },
];

export const MATING_RESULT_VALUES = MATING_RESULT_OPTIONS.map(
  (o) => o.value,
) as [MatingResult, ...MatingResult[]];
