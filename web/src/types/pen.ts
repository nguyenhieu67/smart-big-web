export interface Pen {
  id: number;
  name: string;
  capacity: number;
  subname: string | null;
  description: string | null;
  // chỉ dùng cho chuồng chờ bán: EMPTY = trống, AWAITING_SALE = đang có heo chờ bán; chuồng thường là null
  status: "EMPTY" | "AWAITING_SALE" | null;
  // chỉ có ở danh sách (GET /pens): số nái đang ở chuồng
  _count?: { sows: number };
  // chỉ có ở danh sách: số heo con còn nuôi (chưa bán) đang ở chuồng
  piglets?: number;
}
