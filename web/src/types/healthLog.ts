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
  sow_id: number | null;
  batch_id: number | null;
  sow: { id: number; code: string } | null;
  pigletBatch: { id: number; code: string } | null;
}
