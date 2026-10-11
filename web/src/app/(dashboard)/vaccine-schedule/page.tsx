import type { Metadata } from "next";
import Link from "next/link";

import { SyringeIcon } from "@/components/icons";
import { PageHeader } from "@/components/layout";
import { CARE_KINDS, CARE_STEPS } from "@/constants/pigletCare";

export const metadata: Metadata = {
  title: "Quy trình tiêm vaccine heo con - SmartPig",
};

const INJECTION_NOTES = [
  "Chỉ tiêm cho heo khỏe, không tiêm khi heo đang bệnh hoặc đang bị stress (ví dụ ngay ngày cai sữa).",
  "Các loại vaccine nên cách nhau khoảng 5–7 ngày, trừ khi là vaccine kết hợp.",
  "Bảo quản vaccine ở 2–8°C, dùng hết trong ngày sau khi mở chai.",
];

const SELLING_NOTES = [
  {
    title: "Heo con cai sữa",
    detail: "Bán được từ khoảng 21–28 ngày, nặng chừng 6–8 kg.",
  },
  {
    title: "Heo giống",
    detail:
      "Thường bán khoảng 2 tháng tuổi (15–25 kg), sau khi đã tiêm đủ các mũi chính. Bán kèm sổ ghi lịch tiêm sẽ được giá hơn.",
  },
  {
    title: "Heo thịt",
    detail:
      "Xuất chuồng khoảng 5,5–6 tháng tuổi, 90–110 kg. Phải ngưng kháng sinh trước khi bán đúng số ngày ghi trên nhãn thuốc để không bị tồn dư thuốc trong thịt.",
  },
];

export default function VaccineSchedulePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<SyringeIcon size="sm" className="text-success" />}
        title="Quy Trình Tiêm Vaccine Heo Con"
        description="Lịch chăm sóc và tiêm phòng phổ biến cho heo con nuôi thịt, tính theo tuổi heo."
        action={
          <Link
            href="/health"
            className="bg-success-soft text-success-fg rounded-xl px-4 py-2 text-center text-xs font-semibold transition hover:opacity-80"
          >
            Ghi nhận tiêm phòng
          </Link>
        }
      />

      <div className="card overflow-hidden">
        <ul className="divide-line-soft divide-y">
          {CARE_STEPS.map(({ id, age, task, kind }) => (
            <li
              key={id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <span className="text-fg w-32 shrink-0 text-sm font-bold">
                {age}
              </span>
              <p className="text-fg-body flex-1 text-sm">{task}</p>
              <span className={`badge ${CARE_KINDS[kind].badge} self-start`}>
                {CARE_KINDS[kind].label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card space-y-3 p-5">
          <h3 className="text-fg text-base font-bold">Lưu ý khi tiêm</h3>
          <ul className="text-fg-body list-disc space-y-2 pl-5 text-sm">
            {INJECTION_NOTES.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>

        <div className="card space-y-3 p-5">
          <h3 className="text-fg text-base font-bold">Khi nào có thể bán</h3>
          <ul className="space-y-3 text-sm">
            {SELLING_NOTES.map(({ title, detail }) => (
              <li key={title}>
                <strong className="text-fg">{title}:</strong>{" "}
                <span className="text-fg-body">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-warning-soft text-warning-fg rounded-2xl p-4 text-xs leading-relaxed">
        Với dịch tả heo châu Phi (ASF), chỉ dùng vaccine được Cục Thú y cấp
        phép. Tuổi tiêm khác nhau tùy loại, nên hỏi thú y xã hoặc huyện trước
        khi tiêm. Nếu có chuồng trại thật, nên nhờ thú y địa phương điều chỉnh
        lịch này theo dịch bệnh đang lưu hành ở vùng bạn.
      </div>
    </div>
  );
}
