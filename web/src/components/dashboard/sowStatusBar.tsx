"use client";

import { useState } from "react";

import type { SowStatus } from "@/types/sow";

// Màu theo trạng thái (cố định theo đối tượng, không theo thứ hạng)
const SEGMENTS: { status: SowStatus; label: string; color: string }[] = [
  { status: "REPLACEMENT", label: "Hậu bị", color: "var(--chart-1)" },
  { status: "AWAITING_BREEDING", label: "Chờ phối", color: "var(--chart-2)" },
  { status: "PREGNANT", label: "Mang thai", color: "var(--chart-3)" },
  { status: "NURSING", label: "Đang nuôi con", color: "var(--chart-4)" },
  { status: "CULLED", label: "Loại thải", color: "var(--fg-subtle)" },
];

interface SowStatusBarProps {
  counts: Record<SowStatus, number>;
}

export function SowStatusBar({ counts }: SowStatusBarProps) {
  const [active, setActive] = useState<SowStatus | null>(null);

  const total = SEGMENTS.reduce((sum, s) => sum + counts[s.status], 0);
  const visible = SEGMENTS.filter((s) => counts[s.status] > 0);

  // Vị trí giữa của từng đoạn (%) để đặt tooltip
  let acc = 0;
  const centers = new Map<SowStatus, number>();
  for (const s of visible) {
    const share = (counts[s.status] / total) * 100;
    centers.set(s.status, acc + share / 2);
    acc += share;
  }
  const activeSegment = SEGMENTS.find((s) => s.status === active);

  return (
    <div className="card p-5">
      <h3 className="text-fg text-sm font-bold">Cơ cấu trạng thái đàn nái</h3>
      <p className="text-fg-muted text-xs">Tổng {total} nái</p>

      {total === 0 ? (
        <p className="text-fg-muted py-12 text-center text-sm">
          Chưa có heo nái nào.
        </p>
      ) : (
        <>
          <div className="relative mt-6">
            <div className="flex h-5 gap-0.5">
              {visible.map((s, i) => (
                <div
                  key={s.status}
                  tabIndex={0}
                  role="img"
                  aria-label={`${s.label}: ${counts[s.status]} nái`}
                  onPointerEnter={() => setActive(s.status)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(s.status)}
                  onBlur={() => setActive(null)}
                  className={`min-w-1 transition-opacity outline-none ${
                    i === 0 ? "rounded-l" : ""
                  } ${i === visible.length - 1 ? "rounded-r" : ""} ${
                    active && active !== s.status ? "opacity-45" : ""
                  }`}
                  style={{
                    flexGrow: counts[s.status],
                    backgroundColor: s.color,
                  }}
                />
              ))}
            </div>

            {activeSegment && (
              <div
                role="tooltip"
                className="bg-surface border-line shadow-pop pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 rounded-lg border p-2.5 text-xs whitespace-nowrap"
                style={{
                  left: `${Math.min(88, Math.max(12, centers.get(activeSegment.status) ?? 50))}%`,
                }}
              >
                <p className="flex items-center gap-2">
                  <span
                    className="h-0.5 w-3 rounded-full"
                    style={{ backgroundColor: activeSegment.color }}
                  />
                  <strong className="text-fg tabular-nums">
                    {counts[activeSegment.status]} nái
                  </strong>
                  <span className="text-fg-muted">
                    {activeSegment.label} (
                    {Math.round((counts[activeSegment.status] / total) * 100)}%)
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Chú giải kèm số liệu: nhãn luôn hiện, không phụ thuộc màu */}
          <ul className="mt-5 space-y-2 text-xs">
            {SEGMENTS.map((s) => (
              <li key={s.status} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-fg-body flex-1">{s.label}</span>
                <strong className="text-fg tabular-nums">
                  {counts[s.status]}
                </strong>
                <span className="text-fg-muted w-10 text-right tabular-nums">
                  {Math.round((counts[s.status] / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
