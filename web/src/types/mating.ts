export type MatingResult = "RECENTLY_MATED" | "SUCCESSFULLY" | "FAILED";

export interface Boar {
  id: number;
  code: string;
  breed: string;
}

export interface Mating {
  id: number;
  heat_date: string; // ISO
  mating_date: string; // ISO
  mating_count: number;
  result: MatingResult;
  expected_farrow_date: string; // server tự tính = ngày phối + 114 ngày
  sow_id: number;
  boar_id: number;
  sow: { id: number; code: string };
  boar: { id: number; code: string };
}
