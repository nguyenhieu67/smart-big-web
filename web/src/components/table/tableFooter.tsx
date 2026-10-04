import { AnglesUpIcon, ChevronUpIcon } from "@/components/icons";

interface TableFooterProps {
  page: number;
  limit: number;
  total: number;
  rowsPerPageOptions?: number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const NAV_BUTTON =
  "cursor-pointer rounded p-1 transition hover:bg-line disabled:cursor-not-allowed disabled:opacity-40";

export function TableFooter({
  page,
  limit,
  total,
  rowsPerPageOptions = [10, 25, 50],
  onPageChange,
  onLimitChange,
}: TableFooterProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="border-line-soft bg-surface-hover text-fg-muted flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t px-4 py-3 text-sm sm:justify-end sm:gap-6">
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Số dòng mỗi trang:</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="border-line bg-surface cursor-pointer rounded border px-2 py-1 text-base outline-none sm:text-sm"
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <span>
        {start}-{end} / {total}
      </span>

      <div className="flex items-center gap-1">
        <div>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            title="Trang đầu"
            className={NAV_BUTTON}
          >
            <AnglesUpIcon size="sm" className="rotate-270" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            title="Trang trước"
            className={NAV_BUTTON}
          >
            <ChevronUpIcon size="sm" className="rotate-270" />
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Trang sau"
            className={NAV_BUTTON}
          >
            <ChevronUpIcon size="sm" className="rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Trang cuối"
            className={NAV_BUTTON}
          >
            <AnglesUpIcon size="sm" className="rotate-90" />
          </button>
        </div>
      </div>
    </div>
  );
}
