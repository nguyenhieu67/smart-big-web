import { MIN_SALE_AGE_MONTHS, SELLABLE_STAGES } from "@/constants/piglet";
import type { PigletBatch } from "@/types/piglet";

import { addMonthsToDate, toInputDate } from "./format";

// Ngày đàn chưa cai sữa bắt đầu được bán (đủ 1 tháng tuổi)
export const sellableFrom = (batch: PigletBatch) =>
  addMonthsToDate(toInputDate(batch.birth_date), MIN_SALE_AGE_MONTHS);

// Đã cai sữa trở đi thì bán được; chưa thì phải đủ 1 tháng tuổi vào ngày bán (saleDate dạng "YYYY-MM-DD").
// Đàn đã bán hết thì không bán thêm.
export const isSellable = (batch: PigletBatch, saleDate: string) =>
  batch.stage !== "SOLD" &&
  (SELLABLE_STAGES.includes(batch.stage) || saleDate >= sellableFrom(batch));
