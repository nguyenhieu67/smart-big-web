import type { Metadata } from "next";
import Link from "next/link";

import { ScreenMock } from "@/components/guide/screenMock";
import { FileLinesIcon } from "@/components/icons";
import { PageHeader } from "@/components/layout";
import { GUIDE_FAQ, GUIDE_SECTIONS } from "@/constants/guide";

export const metadata: Metadata = { title: "Hướng dẫn sử dụng - SmartPig" };

export default function GuidePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={<FileLinesIcon size="sm" className="text-info" />}
        title="Hướng Dẫn Sử Dụng"
        description="Các bước làm việc với hệ thống, từ tạo chuồng, thêm nái đến theo dõi tiêm vaccine, bán heo và xem lợi nhuận."
      />

      <nav
        aria-label="Mục lục hướng dẫn"
        className="card grid grid-cols-1 gap-x-6 gap-y-1 p-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {GUIDE_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="text-fg-body hover:text-primary rounded-lg px-2 py-1.5 text-sm transition-colors"
          >
            {section.title}
          </a>
        ))}
        <a
          href="#hoi-dap"
          className="text-fg-body hover:text-primary rounded-lg px-2 py-1.5 text-sm transition-colors"
        >
          Câu hỏi thường gặp
        </a>
      </nav>

      {GUIDE_SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="card scroll-mt-20 space-y-4 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="text-fg text-lg font-bold">{section.title}</h2>
            {section.href && (
              <Link
                href={section.href}
                className="bg-primary-soft text-primary-soft-fg rounded-xl px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
              >
                Mở trang này
              </Link>
            )}
          </div>
          <p className="text-fg-body text-sm leading-relaxed">
            {section.intro}
          </p>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:items-start">
            <ol className="space-y-3">
              {section.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="bg-danger mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-fg-body text-sm leading-relaxed">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>

            {section.figure && <ScreenMock {...section.figure} />}
          </div>

          {section.tips && section.tips.length > 0 && (
            <div className="bg-info-soft rounded-xl p-4">
              <p className="text-info-fg mb-1.5 text-xs font-bold uppercase">
                Lưu ý
              </p>
              <ul className="text-fg-body list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                {section.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ))}

      <section id="hoi-dap" className="card scroll-mt-20 space-y-3 p-5">
        <h2 className="text-fg text-lg font-bold">Câu hỏi thường gặp</h2>
        <div className="space-y-2">
          {GUIDE_FAQ.map((item) => (
            <details
              key={item.q}
              className="bg-surface-muted border-line rounded-xl border p-3"
            >
              <summary className="text-fg cursor-pointer text-sm font-semibold">
                {item.q}
              </summary>
              <p className="text-fg-body mt-2 text-sm leading-relaxed">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
