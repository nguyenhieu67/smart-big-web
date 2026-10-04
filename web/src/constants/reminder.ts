import type { ComponentType } from "react";

import {
  BabyCarriageIcon,
  DnaIcon,
  PawIcon,
  SackDollarIcon,
  SyringeIcon,
} from "@/components/icons";
import type { BaseIconProps } from "@/components/icons/baseIcon";
import type { ReminderType } from "@/types/reminder";

// Class viết đầy đủ để Tailwind quét được (không ghép chuỗi động)
export const REMINDER_TYPE_OPTIONS: {
  value: ReminderType;
  label: string;
  legend: string;
  icon: ComponentType<BaseIconProps>;
  soft: string; // nền + chữ của ô icon
  dot: string; // chấm màu ở chú giải
}[] = [
  {
    value: "MATING_CHECK",
    label: "Kiểm tra thai / động dục",
    legend: "Lịch phối & kiểm tra thai",
    icon: DnaIcon,
    soft: "bg-purple-soft text-purple-fg",
    dot: "bg-purple",
  },
  {
    value: "FARROW",
    label: "Dự kiến đẻ",
    legend: "Lịch nái đẻ (dự sinh 114 ngày)",
    icon: BabyCarriageIcon,
    soft: "bg-danger-soft text-danger-fg",
    dot: "bg-danger",
  },
  {
    value: "VACCINE",
    label: "Tiêm vaccine / sắt",
    legend: "Lịch tiêm vaccine, tiêm sắt",
    icon: SyringeIcon,
    soft: "bg-success-soft text-success-fg",
    dot: "bg-success",
  },
  {
    value: "WEAN",
    label: "Cai sữa",
    legend: "Lịch cai sữa heo con",
    icon: PawIcon,
    soft: "bg-warning-soft text-warning-fg",
    dot: "bg-warning",
  },
  {
    value: "SALE",
    label: "Xuất bán",
    legend: "Lịch dự kiến bán heo",
    icon: SackDollarIcon,
    soft: "bg-info-soft text-info-fg",
    dot: "bg-info",
  },
];

export const REMINDER_TYPE_VALUES = REMINDER_TYPE_OPTIONS.map(
  (o) => o.value,
) as [ReminderType, ...ReminderType[]];

// Số ngày sau phối để kiểm tra thai (theo bản mẫu)
export const MATING_CHECK_AFTER_DAYS = 18;
// Việc tự sinh quá hạn bao nhiêu ngày thì thôi không nhắc nữa (tránh nhắc mãi việc đã xong)
export const AUTO_OVERDUE_DAYS = 14;
