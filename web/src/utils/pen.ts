import type { Pen } from "@/types/pen";

// Số heo trong chuồng = nái đang ở chuồng + heo con còn nuôi (chưa bán)
export const penOccupied = (pen: Pen) =>
  (pen._count?.sows ?? 0) + (pen.piglets ?? 0);
