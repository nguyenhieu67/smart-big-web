// Ảnh minh họa màn hình cho trang hướng dẫn: vẽ bằng code theo đúng màu / bố cục của app,
// số trong vòng tròn đỏ khớp với số bước ở bên cạnh.

export interface MockField {
  label: string;
  value?: string;
  select?: boolean; // ô chọn (có mũi tên)
  mark?: number;
}

export interface MockProps {
  title: string; // tên trang hiện ở thanh tiêu đề
  // thanh trên cùng của app (menu, chọn trại, chuông, đăng xuất)
  topbar?: { menu?: number; farm?: number; actions?: number };
  tabs?: { labels: string[]; active: number; mark?: number };
  action?: { label: string; mark?: number; disabled?: boolean };
  stats?: {
    label: string;
    value: string;
    tone?: "success" | "danger" | "teal";
  }[];
  table?: { columns: string[]; rows: string[][]; mark?: number };
  cards?: {
    title: string;
    lines: string[];
    badge?: string;
    mark?: number; // số ở góc thẻ
    button?: { label: string; mark?: number; disabled?: boolean };
  }[];
  dialog?: {
    title: string;
    fields: MockField[];
    submit: string;
    mark?: number; // số ở nút lưu
    note?: string;
    noteMark?: number;
  };
}

function Mark({ n }: { n?: number }) {
  if (!n) return null;
  return (
    <span className="bg-danger absolute -top-2 -right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white shadow">
      {n}
    </span>
  );
}

const TONE = {
  success: "text-success",
  danger: "text-danger",
  teal: "text-teal",
} as const;

export function ScreenMock({
  title,
  topbar,
  tabs,
  action,
  stats,
  table,
  cards,
  dialog,
}: MockProps) {
  return (
    <figure
      className={`border-line bg-surface-muted relative overflow-hidden rounded-2xl border shadow-sm select-none ${dialog ? (tabs ? "min-h-92.5" : "min-h-82.5") : ""}`}
      aria-label={`Minh họa màn hình ${title}`}
    >
      <div className="bg-surface border-line flex items-center gap-1.5 border-b px-3 py-2">
        <span className="bg-danger/70 h-2 w-2 rounded-full" />
        <span className="bg-warning/70 h-2 w-2 rounded-full" />
        <span className="bg-success/70 h-2 w-2 rounded-full" />
        <span className="text-fg-muted ml-2 truncate text-[10px] font-medium">
          {title}
        </span>
      </div>

      {topbar && (
        <div className="bg-shell flex items-center justify-between gap-2 px-3 py-2.5 text-white">
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="block rounded bg-white/10 px-1.5 py-0.5 text-[11px]">
                ☰
              </span>
              <Mark n={topbar.menu} />
            </div>
            <span className="text-[11px] font-bold">SmartPig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="block rounded bg-white/10 px-2 py-0.5 text-[10px]">
                Trại của tôi ▾
              </span>
              <Mark n={topbar.farm} />
            </div>
            <div className="relative flex items-center gap-1.5 text-[11px]">
              <span>🔔</span>
              <span>⎋</span>
              <Mark n={topbar.actions} />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-fg truncate text-xs font-bold">{title}</p>
          {action && (
            <div className="relative shrink-0">
              <span
                className={`bg-primary block rounded-lg px-2.5 py-1 text-[10px] font-semibold text-white ${action.disabled ? "opacity-50" : ""}`}
              >
                + {action.label}
              </span>
              <Mark n={action.mark} />
            </div>
          )}
        </div>

        {tabs && (
          <div className="relative w-fit max-w-full">
            <div className="bg-surface border-line flex gap-1 overflow-hidden rounded-lg border p-0.5">
              {tabs.labels.map((label, i) => (
                <span
                  key={label}
                  className={`rounded-md px-2 py-1 text-[10px] font-semibold whitespace-nowrap ${
                    i === tabs.active
                      ? "bg-primary text-white"
                      : "text-fg-muted"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
            <Mark n={tabs.mark} />
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-surface border-line rounded-lg border p-2"
              >
                <p className="text-fg-muted text-[9px]">{s.label}</p>
                <p
                  className={`mt-0.5 text-[11px] font-black ${TONE[s.tone ?? "success"]}`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {cards && (
          <div className="grid grid-cols-2 gap-2">
            {cards.map((c) => (
              <div
                key={c.title}
                className="bg-surface border-line relative space-y-1.5 rounded-lg border p-2.5"
              >
                <Mark n={c.mark} />
                <div className="flex items-start justify-between gap-1">
                  <p className="text-fg text-[10px] font-bold">{c.title}</p>
                  {c.badge && (
                    <span className="badge badge-warning px-1.5! py-0! text-[9px]!">
                      {c.badge}
                    </span>
                  )}
                </div>
                {c.lines.map((line) => (
                  <p key={line} className="text-fg-muted text-[9px]">
                    {line}
                  </p>
                ))}
                {c.button && (
                  <div className="relative">
                    <span
                      className={`bg-danger block rounded-md py-1 text-center text-[9px] font-semibold text-white ${c.button.disabled ? "opacity-40" : ""}`}
                    >
                      {c.button.label}
                    </span>
                    <Mark n={c.button.mark} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {table && (
          <div className="bg-surface border-line relative overflow-hidden rounded-lg border">
            <div
              className="bg-surface-muted text-fg-muted grid gap-1 px-2 py-1.5 text-[9px] font-bold uppercase"
              style={{
                gridTemplateColumns: `repeat(${table.columns.length}, minmax(0, 1fr))`,
              }}
            >
              {table.columns.map((c) => (
                <span key={c} className="truncate">
                  {c}
                </span>
              ))}
            </div>
            {table.rows.map((row, i) => (
              <div
                key={i}
                className="border-line-soft text-fg-body grid gap-1 border-t px-2 py-1.5 text-[10px]"
                style={{
                  gridTemplateColumns: `repeat(${table.columns.length}, minmax(0, 1fr))`,
                }}
              >
                {row.map((cell, j) => (
                  <span
                    key={j}
                    className={`truncate ${j === 0 ? "text-fg font-semibold" : ""}`}
                  >
                    {cell}
                  </span>
                ))}
              </div>
            ))}
            <Mark n={table.mark} />
          </div>
        )}
      </div>

      {dialog && (
        <div
          className="bg-overlay absolute inset-x-0 bottom-0 flex items-center justify-center p-3"
          style={{ top: tabs ? 96 : 66 }}
        >
          <div className="bg-surface border-line w-full max-w-xs space-y-2 rounded-xl border p-3 shadow-lg">
            <p className="text-fg border-line-soft border-b pb-1.5 text-[11px] font-bold">
              {dialog.title}
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              {dialog.fields.map((f) => (
                <div key={f.label} className="relative min-w-0">
                  <p className="text-fg-muted text-[9px]">{f.label}</p>
                  <div className="border-line bg-surface text-fg flex items-center justify-between rounded-md border px-1.5 py-1 text-[10px]">
                    <span className="truncate">{f.value ?? " "}</span>
                    {f.select && <span className="text-fg-subtle">▾</span>}
                  </div>
                  <Mark n={f.mark} />
                </div>
              ))}
            </div>
            {dialog.note && (
              <div className="relative">
                <p className="bg-surface-muted text-fg-body rounded-md p-1.5 text-[9px]">
                  {dialog.note}
                </p>
                <Mark n={dialog.noteMark} />
              </div>
            )}
            <div className="flex justify-end gap-1.5 pt-0.5">
              <span className="bg-surface-hover text-fg-body rounded-md px-2 py-1 text-[9px]">
                Hủy
              </span>
              <div className="relative">
                <span className="bg-primary block rounded-md px-2 py-1 text-[9px] font-semibold text-white">
                  {dialog.submit}
                </span>
                <Mark n={dialog.mark} />
              </div>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}
