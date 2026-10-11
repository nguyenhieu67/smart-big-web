import type { HealthCategory } from "@/types/healthLog";

export type CareKind = "care" | "vaccine" | "wean";

export interface CareStep {
  id: string;
  age: string; // nhãn hiển thị
  minDay: number; // tuổi (ngày) bắt đầu đến hạn
  maxDay: number; // tuổi (ngày) cuối của khoảng khuyến nghị; quá mốc này mà chưa làm là quá hạn
  task: string; // cũng là tên bản ghi sức khỏe khi đánh dấu đã làm
  kind: CareKind;
  category: HealthCategory; // phân loại bản ghi sức khỏe khi đánh dấu đã làm
}

export const CARE_KINDS: Record<CareKind, { label: string; badge: string }> = {
  care: { label: "Chăm sóc", badge: "badge-info" },
  vaccine: { label: "Tiêm phòng", badge: "badge-success" },
  wean: { label: "Cai sữa", badge: "badge-warning" },
};

// Lịch phổ biến cho heo con nuôi thịt ở Việt Nam; ngày cụ thể có thể lệch theo hãng vaccine và dịch địa phương
export const CARE_STEPS: CareStep[] = [
  {
    id: "birth",
    age: "Ngay khi sinh",
    minDay: 0,
    maxDay: 1,
    task: "Lau khô, cắt rốn, cho bú sữa đầu trong 1–2 giờ đầu, úm ấm khoảng 30–32°C",
    kind: "care",
    category: "TREATMENT",
  },
  {
    id: "teeth-tail",
    age: "1–3 ngày",
    minDay: 1,
    maxDay: 3,
    task: "Bấm nanh, cắt đuôi",
    kind: "care",
    category: "TREATMENT",
  },
  {
    id: "iron-1",
    age: "3 ngày",
    minDay: 3,
    maxDay: 3,
    task: "Tiêm sắt lần 1, cho uống thuốc phòng cầu trùng (toltrazuril)",
    kind: "vaccine",
    category: "IRON_INJECTION",
  },
  {
    id: "castrate",
    age: "3–7 ngày",
    minDay: 3,
    maxDay: 7,
    task: "Thiến heo đực nuôi thịt",
    kind: "care",
    category: "TREATMENT",
  },
  {
    id: "creep-feed",
    age: "7–10 ngày",
    minDay: 7,
    maxDay: 10,
    task: "Bắt đầu tập ăn cám tập ăn",
    kind: "care",
    category: "TREATMENT",
  },
  {
    id: "iron-2",
    age: "10–12 ngày",
    minDay: 10,
    maxDay: 12,
    task: "Tiêm sắt lần 2 (nếu lần 1 dùng liều thấp)",
    kind: "vaccine",
    category: "IRON_INJECTION",
  },
  {
    id: "mycoplasma",
    age: "7–21 ngày",
    minDay: 7,
    maxDay: 21,
    task: "Vaccine suyễn (Mycoplasma)",
    kind: "vaccine",
    category: "VACCINATION",
  },
  {
    id: "circo",
    age: "14–21 ngày",
    minDay: 14,
    maxDay: 21,
    task: "Vaccine Circo (PCV2); tai xanh (PRRS) nếu vùng có dịch",
    kind: "vaccine",
    category: "VACCINATION",
  },
  {
    id: "wean",
    age: "21–28 ngày",
    minDay: 21,
    maxDay: 28,
    task: "Cai sữa",
    kind: "wean",
    category: "TREATMENT",
  },
  {
    id: "csf-1",
    age: "21–30 ngày",
    minDay: 21,
    maxDay: 30,
    task: "Dịch tả heo cổ điển, mũi 1",
    kind: "vaccine",
    category: "VACCINATION",
  },
  {
    id: "hs-deworm",
    age: "30–45 ngày",
    minDay: 30,
    maxDay: 45,
    task: "Tụ huyết trùng, phó thương hàn; tẩy giun",
    kind: "vaccine",
    category: "VACCINATION",
  },
  {
    id: "fmd-1",
    age: "35–45 ngày",
    minDay: 35,
    maxDay: 45,
    task: "Lở mồm long móng (LMLM), mũi 1",
    kind: "vaccine",
    category: "VACCINATION",
  },
  {
    id: "csf-2",
    age: "50–60 ngày",
    minDay: 50,
    maxDay: 60,
    task: "Dịch tả heo, mũi 2",
    kind: "vaccine",
    category: "VACCINATION",
  },
  {
    id: "fmd-2",
    age: "60–70 ngày",
    minDay: 60,
    maxDay: 70,
    task: "LMLM, mũi 2",
    kind: "vaccine",
    category: "VACCINATION",
  },
];

export const LAST_CARE_DAY = Math.max(...CARE_STEPS.map((s) => s.maxDay));

// Các mốc tiêm vaccine (không gồm chăm sóc, tiêm sắt, cai sữa)
export const VACCINE_STEPS = CARE_STEPS.filter(
  (s) => s.category === "VACCINATION",
);
