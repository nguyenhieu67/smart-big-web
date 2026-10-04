import type { SowStatus } from "@/types/sow";

export const SOW_STATUS_OPTIONS: {
  value: SowStatus;
  label: string;
  badge: string;
}[] = [
  { value: "REPLACEMENT", label: "Hậu bị", badge: "badge-info" },
  { value: "AWAITING_BREEDING", label: "Chờ phối", badge: "badge-success" },
  { value: "PREGNANT", label: "Mang thai", badge: "badge-indigo" },
  { value: "NURSING", label: "Đang nuôi con", badge: "badge-danger" },
  { value: "CULLED", label: "Loại thải", badge: "badge-muted" },
];

export const SOW_STATUS_VALUES = SOW_STATUS_OPTIONS.map((s) => s.value) as [
  SowStatus,
  ...SowStatus[],
];

export const SOW_BREED_SUGGESTIONS = [
  "Landrace",
  "Yorkshire",
  "Duroc",
  "F1 (Landrace x Yorkshire)",
];
