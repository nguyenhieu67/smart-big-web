export interface Pen {
  id: number;
  name: string;
  capacity: number;
  subname: string | null;
  description: string | null;
  // chỉ có ở danh sách (GET /pens): số nái đang ở chuồng
  _count?: { sows: number };
  // chỉ có ở danh sách: số heo con còn nuôi (chưa bán) đang ở chuồng
  piglets?: number;
}
