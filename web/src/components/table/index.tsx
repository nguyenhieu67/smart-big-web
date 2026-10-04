import type { ColumnI, RowI } from "@/types/table";

import { TableBody } from "./tableBody";
import { TableFooter } from "./tableFooter";
import { TableHeader } from "./tableHeader";

interface TableProps<T extends RowI = RowI> {
  columns: ColumnI<T>[];
  rows: T[];
  height?: string;
  emptyMessage?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  page?: number;
  limit?: number;
  total?: number;
  rowsPerPageOptions?: number[];
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function Table<T extends RowI = RowI>({
  columns = [],
  rows = [],
  height = "h-125",
  emptyMessage,
  onEdit,
  onDelete,
  page,
  limit,
  total,
  rowsPerPageOptions,
  onPageChange,
  onLimitChange,
}: TableProps<T>) {
  const showPagination =
    page !== undefined &&
    limit !== undefined &&
    total !== undefined &&
    onPageChange &&
    onLimitChange;

  return (
    <div>
      <div className={`overflow-auto ${height}`}>
        <table className="w-full min-w-max border-collapse text-left text-sm">
          <TableHeader columns={columns} />
          <TableBody
            columns={columns}
            rows={rows}
            emptyMessage={emptyMessage}
            onEdit={onEdit}
            onDelete={onDelete}
            limit={limit}
            total={total}
          />
        </table>
      </div>

      {showPagination && (
        <TableFooter
          page={page}
          limit={limit}
          total={total}
          rowsPerPageOptions={rowsPerPageOptions}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}
