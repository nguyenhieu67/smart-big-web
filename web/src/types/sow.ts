export type SowStatus =
  "REPLACEMENT" | "AWAITING_BREEDING" | "PREGNANT" | "NURSING" | "CULLED";

export interface Sow {
  id: number;
  code: string;
  breed: string;
  birth_date: string; // ISO
  weight: string; // Decimal -> chuỗi, đơn vị kg
  origin: string | null;
  health: string | null;
  parity_count: number;
  status: SowStatus;
  pen_id: number;
}
