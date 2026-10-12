export type HealthCategory =
  "VACCINATION" | "TREATMENT" | "IRON_INJECTION" | "DEATH";

export type TreatmentStatus = "COMPLETED" | "IN_TREATMENT" | "RECOVERED";

export interface HealthLog {
  id: number;
  log_date: string; // ISO
  category: HealthCategory;
  name: string;
  dose: string | null;
  status: TreatmentStatus;
  cost: string;
  next_date: string | null;
  head_count: number | null; // số con chết (nhật ký chết của đàn heo con)
  sow_id: number | null;
  batch_id: number | null;
  vaccine_type_id: number | null;
  care_step: string | null; // mốc quy trình heo con đã hoàn thành
  sow: { id: number; code: string } | null;
  pigletBatch: { id: number; code: string } | null;
  vaccineType: { id: number; name: string } | null;
}
