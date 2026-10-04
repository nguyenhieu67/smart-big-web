export interface FeedType {
  id: number;
  code: string | null;
  name: string;
  default_price_per_kg: string | null; // Decimal -> chuỗi
}

export interface FeedLog {
  id: number;
  log_date: string; // ISO
  quantity_kg: string;
  daily_per_head: string | null;
  price_per_kg: string;
  total_cost: string; // server tự tính = quantity_kg * price_per_kg
  feed_type_id: number;
  pen_id: number | null;
  batch_id: number | null;
  feedType: { id: number; code: string | null; name: string };
  pen: { id: number; name: string } | null;
  pigletBatch: { id: number; code: string } | null;
}
