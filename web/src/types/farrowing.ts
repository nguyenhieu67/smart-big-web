export interface Farrowing {
  id: number;
  farrow_date: string; // ISO
  total_born: number; // server tự tính = live_born + dead_born
  live_born: number | null;
  dead_born: number | null;
  weak_born: number | null; // nằm trong số con sống
  avg_birth_weight: string | null; // kg/con, Decimal -> chuỗi
  assist_note: string | null;
  sow_id: number;
  mating_id: number | null;
  sow: { id: number; code: string };
  // đàn heo con do server tự tạo khi có con sống
  pigletBatch: { id: number; code: string; quantity: number | null } | null;
}
