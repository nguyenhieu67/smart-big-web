export interface Pen {
  id: number;
  name: string;
  capacity: number;
  subname: string | null;
  description: string | null;
  // chỉ có ở danh sách (GET /pens): số nái đang ở chuồng
  _count?: { sows: number };
}
