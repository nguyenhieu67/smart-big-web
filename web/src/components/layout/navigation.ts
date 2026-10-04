import type { ComponentType } from "react";

import {
  BabyCarriageIcon,
  CalenDarDaysIcon,
  ChartLineIcon,
  ChartPieIcon,
  DnaIcon,
  HeartPulseIcon,
  MoneyBillTrendUpIcon,
  PawIcon,
  PiggyBankIcon,
  ArrowsSpinIcon,
  ReceiptIcon,
  SyringeIcon,
  WarehouseIcon,
  WheatAwnIcon,
} from "@/components/icons";
import type { BaseIconProps } from "@/components/icons/baseIcon";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<BaseIconProps>;
  // Sidebar luôn tối ở cả 2 theme nên icon dùng sắc 400 của Tailwind
  iconColor: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Tổng Quan",
    items: [
      {
        label: "Dashboard Báo Cáo",
        href: "/dashboard",
        icon: ChartPieIcon,
        iconColor: "text-pink-400",
      },
      {
        label: "Quy Trình Chăn Nuôi",
        href: "/workflow",
        icon: ArrowsSpinIcon,
        iconColor: "text-cyan-400",
      },
    ],
  },
  {
    title: "Đàn Heo & Sinh Sản",
    items: [
      {
        label: "1. Quản Lý Heo Nái",
        href: "/sows",
        icon: PiggyBankIcon,
        iconColor: "text-pink-500",
      },
      {
        label: "2. Quản Lý Phối Giống",
        href: "/matings",
        icon: DnaIcon,
        iconColor: "text-purple-400",
      },
      {
        label: "3. Quản Lý Thai Kỳ",
        href: "/gestation",
        icon: BabyCarriageIcon,
        iconColor: "text-indigo-400",
      },
      {
        label: "4. Quản Lý Sinh Sản",
        href: "/farrowings",
        icon: HeartPulseIcon,
        iconColor: "text-rose-400",
      },
      {
        label: "5. Đàn Heo Con & Cai Sữa",
        href: "/piglets",
        icon: PawIcon,
        iconColor: "text-amber-400",
      },
    ],
  },
  {
    title: "Vận Hành & Sức Khỏe",
    items: [
      {
        label: "6. Thức Ăn & Dinh Dưỡng",
        href: "/feeds",
        icon: WheatAwnIcon,
        iconColor: "text-yellow-500",
      },
      {
        label: "7-8. Vaccine & Sức Khỏe",
        href: "/health",
        icon: SyringeIcon,
        iconColor: "text-emerald-400",
      },
      {
        label: "9. Quản Lý Chuồng Trại",
        href: "/pens",
        icon: WarehouseIcon,
        iconColor: "text-blue-400",
      },
    ],
  },
  {
    title: "Tài Chính & Kinh Doanh",
    items: [
      {
        label: "10. Quản Lý Bán Heo",
        href: "/sales",
        icon: MoneyBillTrendUpIcon,
        iconColor: "text-emerald-400",
      },
      {
        label: "11. Chi Phí Vận Hành",
        href: "/expenses",
        icon: ReceiptIcon,
        iconColor: "text-rose-400",
      },
      {
        label: "12. Doanh Thu & Lợi Nhuận",
        href: "/profit",
        icon: ChartLineIcon,
        iconColor: "text-teal-400",
      },
    ],
  },
  {
    title: "Tiện Ích",
    items: [
      {
        label: "14. Lịch & Cảnh Báo Sắp Tới",
        href: "/calendar",
        icon: CalenDarDaysIcon,
        iconColor: "text-sky-400",
      },
    ],
  },
];
