export interface VaccineType {
  id: number;
  name: string;
  dose: string | null; // liều dùng mặc định
  default_cost: string | null; // Decimal -> chuỗi, chi phí mặc định cho mỗi con (heo con: nhân với số con của đàn)
  step_keys: string[]; // mốc quy trình heo con dùng vaccine này
}
