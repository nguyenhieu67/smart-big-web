export type ReminderType =
  "MATING_CHECK" | "FARROW" | "VACCINE" | "WEAN" | "SALE";

export interface Reminder {
  id: number;
  type: ReminderType;
  title: string;
  due_date: string; // ISO
  is_done: boolean;
  sow_id: number | null;
  batch_id: number | null;
  sow: { id: number; code: string } | null;
  pigletBatch: { id: number; code: string } | null;
}
