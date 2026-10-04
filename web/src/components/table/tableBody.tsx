import type { ColumnI, RowI } from "@/types/table";

import { TableRow } from "./tableRow";

interface TableBodyProps<T extends RowI = RowI> {
  columns: ColumnI<T>[];
  rows: T[];
  emptyMessage?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  limit?: number;
  total?: number;
}

export function TableBody<T extends RowI = RowI>({
  columns,
  rows,
  emptyMessage = "Không có dữ liệu.",
  onEdit,
  onDelete,
  limit,
  total,
}: TableBodyProps<T>) {
  if (rows.length === 0) {
    return (
      <tbody className="divide-line-soft divide-y">
        <tr>
          <td
            colSpan={columns.length}
            className="text-fg-muted p-6 text-center text-sm"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  const fillerCount =
    limit && total && total > limit && rows.length < limit
      ? limit - rows.length
      : 0;

  return (
    <tbody className="divide-line-soft divide-y">
      {rows.map((row) => (
        <TableRow
          key={row.id}
          columns={columns}
          row={row}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {Array.from({ length: fillerCount }).map((_, index) => (
        <tr key={`filler-${index}`} aria-hidden="true">
          <td colSpan={columns.length} className="p-5">
            &nbsp;
          </td>
        </tr>
      ))}
    </tbody>
  );
}
