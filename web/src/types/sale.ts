import type { PigletStage } from "@/types/piglet";

export interface Buyer {
  id: number;
  name: string;
  phone: string | null;
  note: string | null;
}

export interface Sale {
  id: number;
  sale_date: string; // ISO
  shipping_date: string | null; // ngày vận chuyển
  quantity: number; // số con
  total_weight_kg: string; // Decimal -> chuỗi
  price_per_kg: string;
  total_revenue: string; // server tự tính = total_weight_kg * price_per_kg
  batch_id: number;
  buyer_id: number | null;
  pigletBatch: {
    id: number;
    code: string;
    quantity: number | null;
    stage: PigletStage;
  };
  buyer: { id: number; name: string; phone: string | null } | null;
}
