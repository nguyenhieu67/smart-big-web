import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowsSpinIcon,
  BabyCarriageIcon,
  CalculatorIcon,
  ChevronUpIcon,
  HeartPulseIcon,
  PawIcon,
  PiggyBankIcon,
  TruckFieldIcon,
} from "@/components/icons";
import type { BaseIconProps } from "@/components/icons/baseIcon";

export const metadata: Metadata = { title: "Quy trình chăn nuôi - SmartPig" };

type Tone =
  "primary" | "purple" | "indigo" | "danger" | "warning" | "success" | "teal";

// Class viết đầy đủ để Tailwind quét được (không ghép chuỗi động)
const TONES: Record<
  Tone,
  { border: string; badge: string; icon: string; button: string }
> = {
  primary: {
    border: "border-l-primary",
    badge: "bg-primary-soft text-primary-soft-fg",
    icon: "text-primary/60",
    button: "bg-primary-soft text-primary-soft-fg",
  },
  purple: {
    border: "border-l-purple",
    badge: "bg-purple-soft text-purple-fg",
    icon: "text-purple/60",
    button: "bg-purple-soft text-purple-fg",
  },
  indigo: {
    border: "border-l-indigo",
    badge: "bg-indigo-soft text-indigo-fg",
    icon: "text-indigo/60",
    button: "bg-indigo-soft text-indigo-fg",
  },
  danger: {
    border: "border-l-danger",
    badge: "bg-danger-soft text-danger-fg",
    icon: "text-danger/60",
    button: "bg-danger-soft text-danger-fg",
  },
  warning: {
    border: "border-l-warning",
    badge: "bg-warning-soft text-warning-fg",
    icon: "text-warning/60",
    button: "bg-warning-soft text-warning-fg",
  },
  success: {
    border: "border-l-success",
    badge: "bg-success-soft text-success-fg",
    icon: "text-success/60",
    button: "bg-success-soft text-success-fg",
  },
  teal: {
    border: "border-l-teal",
    badge: "bg-teal-soft text-teal-fg",
    icon: "text-teal/60",
    button: "bg-teal-soft text-teal-fg",
  },
};

interface StepAction {
  label: string;
  href: string;
  tone: Tone;
  showArrow?: boolean;
}

interface Step {
  badge: string;
  title: string;
  description: string;
  icon: React.ComponentType<BaseIconProps>;
  tone: Tone;
  actions: StepAction[];
}

const STEPS: Step[] = [
  {
    badge: "BƯỚC 1",
    title: "Quản Lý Heo Nái",
    description:
      "Theo dõi mã tag, nguồn gốc, giống (Landrace, Yorkshire, Duroc), ngày sinh, thể trạng, lịch sử đẻ.",
    icon: PiggyBankIcon,
    tone: "primary",
    actions: [
      {
        label: "Vào Quản Lý Heo Nái",
        href: "/sows",
        tone: "primary",
        showArrow: true,
      },
    ],
  },
  {
    badge: "BƯỚC 2 & 3",
    title: "Phối Giống & Mang Thai",
    description:
      "Ghi nhận động dục, ngày phối, đực/tinh phối. Tự động tính ngày dự kiến sinh (114 ngày), lên lịch tiêm vaccine mang thai.",
    icon: BabyCarriageIcon,
    tone: "purple",
    actions: [
      { label: "Phối Giống", href: "/matings", tone: "purple" },
      { label: "Thai Kỳ", href: "/gestation", tone: "indigo" },
    ],
  },
  {
    badge: "BƯỚC 4",
    title: "Sinh Sản (Nái Đẻ)",
    description:
      "Ghi nhận số con sơ sinh, số con sống, con chết, con dị tật, trọng lượng sơ sinh trung bình, can thiệp hộ sinh.",
    icon: HeartPulseIcon,
    tone: "danger",
    actions: [
      {
        label: "Vào Quản Lý Sinh Sản",
        href: "/farrowings",
        tone: "danger",
        showArrow: true,
      },
    ],
  },
  {
    badge: "BƯỚC 5",
    title: "Chăm Sóc Heo Con & Cai Sữa",
    description:
      "Theo dõi tiêm sắt (ngày 3, 10), bấm răng, cắt đuôi, theo dõi trọng lượng tăng trưởng, chuyển giai đoạn cai sữa (21-28 ngày).",
    icon: PawIcon,
    tone: "warning",
    actions: [
      {
        label: "Quản Lý Đàn Heo Con",
        href: "/piglets",
        tone: "warning",
        showArrow: true,
      },
    ],
  },
  {
    badge: "BƯỚC 6 & 7",
    title: "Nuôi Thịt & Xuất Bán",
    description:
      "Phân chuồng nuôi thịt, quản lý cám/dinh dưỡng, tiêm phòng vaccine dịch tả, xuất bán theo ký, lập phiếu thu tiền.",
    icon: TruckFieldIcon,
    tone: "success",
    actions: [
      {
        label: "Quản Lý Bán Heo",
        href: "/sales",
        tone: "success",
        showArrow: true,
      },
    ],
  },
  {
    badge: "BƯỚC 8",
    title: "Tính Doanh Thu & Lợi Nhuận",
    description:
      "Tổng hợp chi phí điện, nước, cám, thuốc, nhân công. Phân tích lợi nhuận theo từng lứa đẻ của heo nái.",
    icon: CalculatorIcon,
    tone: "teal",
    actions: [
      {
        label: "Xem Lợi Nhuận",
        href: "/profit",
        tone: "teal",
        showArrow: true,
      },
    ],
  },
];

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="text-fg flex items-center text-xl font-bold">
          <ArrowsSpinIcon size="sm" className="text-info mr-2 shrink-0" />
          Quy Trình Quản Lý Sản Xuất Chăn Nuôi Heo
        </h2>
        <p className="text-fg-muted mt-1 text-xs">
          Sơ đồ luồng chăn nuôi chuẩn từ quản lý nái đến khi bán thành phẩm
          &amp; tối ưu lợi nhuận.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {STEPS.map(
          ({ badge, title, description, icon: Icon, tone, actions }) => {
            const styles = TONES[tone];
            return (
              <div
                key={badge}
                className={`bg-surface shadow-card space-y-3 rounded-2xl border-l-4 p-5 ${styles.border}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles.badge}`}
                  >
                    {badge}
                  </span>
                  <Icon size="lg" className={styles.icon} />
                </div>
                <h3 className="text-fg text-base font-bold">{title}</h3>
                <p className="text-fg-body text-xs leading-relaxed">
                  {description}
                </p>
                <div className="flex gap-2">
                  {actions.map((action) => (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-center text-xs font-semibold transition hover:opacity-80 ${TONES[action.tone].button}`}
                    >
                      {action.label}
                      {action.showArrow && (
                        <ChevronUpIcon size="2xs" className="rotate-90" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}
