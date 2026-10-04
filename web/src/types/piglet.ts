export type PigletStage = "SUCKLING" | "WEANED" | "RAISED_FOR_MEAT" | "SOLD";

export interface PigletBatch {
  id: number;
  code: string;
  birth_date: string; // ISO
  quantity: number | null;
  avg_weight: string | null; // kg/con, Decimal -> chuỗi
  stage: PigletStage;
  health: string | null;
  target_wean_date: string | null;
  farrowing_id: number | null; // null nếu đàn nhập từ ngoài
  sow_id: number | null;
  pen_id: number | null;
  sow: { id: number; code: string } | null;
  pen: { id: number; name: string } | null;
}
