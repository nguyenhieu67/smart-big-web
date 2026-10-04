"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { formatCurrency } from "@/utils/format";
import type { MonthPoint } from "@/utils/dashboard";

const W = 600;
const H = 260;
const PAD = { left: 56, right: 8, top: 12, bottom: 28 };
const BAR_MAX = 24; // cột mảnh, không bao giờ lấp đầy khoảng của nhóm
const BAR_GAP = 2; // khe 2px (màu nền) giữa hai cột liền kề
const TICKS = 4;

const SERIES = [
  { key: "revenue", label: "Doanh thu", color: "var(--chart-1)" },
  { key: "expense", label: "Chi phí", color: "var(--chart-2)" },
] as const;

// Làm tròn trần trục lên số đẹp (1 / 2 / 5 × 10^n)
function niceMax(value: number) {
  if (value <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(value));
  const f = value / exp;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * exp;
}

const oneDecimal = (v: number) =>
  v.toLocaleString("vi-VN", { maximumFractionDigits: 1 });

function axisLabel(value: number) {
  if (value >= 1e9) return `${oneDecimal(value / 1e9)} tỷ`;
  if (value >= 1e6) return `${oneDecimal(value / 1e6)} tr`;
  if (value >= 1e3) return `${oneDecimal(value / 1e3)}k`;
  return String(value);
}

// Cột bo 4px ở đầu dữ liệu, vuông ở đường nền
function barPath(x: number, y: number, w: number, h: number, r = 4) {
  if (h <= 0) return "";
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

export function FinancialChart({ months }: { months: MonthPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const [view, setView] = useState<"chart" | "table">("chart");

  const hasData = months.some((m) => m.revenue > 0 || m.expense > 0);
  const max = niceMax(
    Math.max(...months.flatMap((m) => [m.revenue, m.expense])),
  );
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const groupW = plotW / months.length;
  const barW = Math.min(BAR_MAX, groupW * 0.28);
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH;
  const activeMonth = active != null ? months[active] : null;
  const activeCenterPct =
    active != null ? ((PAD.left + groupW * (active + 0.5)) / W) * 100 : 0;

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-fg text-sm font-bold">
            Doanh thu và chi phí 6 tháng gần nhất
          </h3>
          <p className="text-fg-muted text-xs">Đơn vị: VNĐ</p>
        </div>
        {hasData && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setView(view === "chart" ? "table" : "chart")}
          >
            {view === "chart" ? "Xem dạng bảng" : "Xem biểu đồ"}
          </Button>
        )}
      </div>

      {/* Chú giải luôn hiện khi có từ 2 chuỗi trở lên */}
      <ul className="text-fg-body mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </li>
        ))}
      </ul>

      {!hasData ? (
        <p className="text-fg-muted py-16 text-center text-sm">
          Chưa có doanh thu hoặc chi phí trong 6 tháng gần nhất.
        </p>
      ) : view === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="bg-surface-hover text-fg-muted text-xs uppercase">
              <tr>
                <th className="p-3">Tháng</th>
                <th className="p-3 text-right">Doanh thu</th>
                <th className="p-3 text-right">Chi phí</th>
                <th className="p-3 text-right">Chênh lệch</th>
              </tr>
            </thead>
            <tbody className="divide-line-soft divide-y">
              {months.map((m) => (
                <tr key={m.key} className="text-fg-body tabular-nums">
                  <td className="p-3 font-medium">{m.label}</td>
                  <td className="p-3 text-right">
                    {formatCurrency(m.revenue, "đ")}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(m.expense, "đ")}
                  </td>
                  <td className="p-3 text-right font-semibold">
                    {formatCurrency(m.revenue - m.expense, "đ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Biểu đồ cột doanh thu và chi phí theo tháng"
          >
            {/* lưới ngang mảnh + nhãn trục */}
            {Array.from({ length: TICKS + 1 }, (_, i) => {
              const value = (max / TICKS) * i;
              return (
                <g key={i}>
                  <line
                    x1={PAD.left}
                    x2={W - PAD.right}
                    y1={y(value)}
                    y2={y(value)}
                    stroke="var(--chart-grid)"
                    strokeWidth={1}
                  />
                  <text
                    x={PAD.left - 8}
                    y={y(value)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fontSize={11}
                    fill="var(--fg-muted)"
                    className="tabular-nums"
                  >
                    {axisLabel(value)}
                  </text>
                </g>
              );
            })}

            {months.map((m, i) => {
              const center = PAD.left + groupW * (i + 0.5);
              const dim = active != null && active !== i;
              return (
                <g key={m.key} opacity={dim ? 0.45 : 1}>
                  <path
                    d={barPath(
                      center - BAR_GAP / 2 - barW,
                      y(m.revenue),
                      barW,
                      y(0) - y(m.revenue),
                    )}
                    fill={SERIES[0].color}
                  />
                  <path
                    d={barPath(
                      center + BAR_GAP / 2,
                      y(m.expense),
                      barW,
                      y(0) - y(m.expense),
                    )}
                    fill={SERIES[1].color}
                  />
                  <text
                    x={center}
                    y={H - 8}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--fg-muted)"
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}

            {/* Đường nền */}
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(0)}
              y2={y(0)}
              stroke="var(--line)"
              strokeWidth={1}
            />

            {/* Vùng bắt hover/focus rộng cả nhóm tháng, lớn hơn cột */}
            {months.map((m, i) => (
              <rect
                key={m.key}
                x={PAD.left + groupW * i}
                y={PAD.top}
                width={groupW}
                height={plotH + PAD.bottom}
                fill="transparent"
                tabIndex={0}
                aria-label={`${m.label}: doanh thu ${formatCurrency(m.revenue, "đ")}, chi phí ${formatCurrency(m.expense, "đ")}`}
                onPointerEnter={() => setActive(i)}
                onPointerMove={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="outline-none"
              />
            ))}
          </svg>

          {activeMonth && (
            <div
              role="tooltip"
              className="bg-surface border-line shadow-pop pointer-events-none absolute top-0 z-10 min-w-40 -translate-x-1/2 rounded-lg border p-2.5 text-xs"
              style={{
                left: `${Math.min(86, Math.max(14, activeCenterPct))}%`,
              }}
            >
              <p className="text-fg-muted mb-1.5">{activeMonth.label}</p>
              {SERIES.map((s) => (
                <p key={s.key} className="flex items-center gap-2">
                  <span
                    className="h-0.5 w-3 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <strong className="text-fg tabular-nums">
                    {formatCurrency(activeMonth[s.key], "đ")}
                  </strong>
                  <span className="text-fg-muted">{s.label}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
