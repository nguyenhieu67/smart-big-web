import type { HealthCategory, TreatmentStatus } from "@/types/healthLog";

export const HEALTH_CATEGORY_OPTIONS: {
  value: HealthCategory;
  label: string;
  badge: string;
}[] = [
  { value: "VACCINATION", label: "Tiêm vaccine", badge: "badge-success" },
  { value: "TREATMENT", label: "Điều trị bệnh", badge: "badge-danger" },
  { value: "IRON_INJECTION", label: "Tiêm sắt", badge: "badge-warning" },
  { value: "DEATH", label: "Chết / loại thải", badge: "badge-muted" },
];

export const TREATMENT_STATUS_OPTIONS: {
  value: TreatmentStatus;
  label: string;
}[] = [
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "IN_TREATMENT", label: "Đang điều trị" },
  { value: "RECOVERED", label: "Đã khỏi" },
];

export const HEALTH_CATEGORY_VALUES = HEALTH_CATEGORY_OPTIONS.map(
  (o) => o.value,
) as [HealthCategory, ...HealthCategory[]];

export const TREATMENT_STATUS_VALUES = TREATMENT_STATUS_OPTIONS.map(
  (o) => o.value,
) as [TreatmentStatus, ...TreatmentStatus[]];
