import { EditIcon, TrashIcon } from "@/components/icons";
import type { ColumnI, RowI } from "@/types/table";

interface TableRowProps<T extends RowI = RowI> {
  columns: ColumnI<T>[];
  row: T;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function TableRow<T extends RowI = RowI>({
  columns,
  row,
  onEdit,
  onDelete,
}: TableRowProps<T>) {
  return (
    <tr className="text-fg-body hover:bg-surface-muted transition">
      {columns.map((column) => {
        if (column.value === "actions") {
          return (
            <td key={column.value} className="p-3.5 whitespace-nowrap">
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    className="text-fg-muted hover:bg-surface-hover hover:text-info cursor-pointer rounded p-2 transition sm:p-1"
                    title="Chỉnh sửa"
                  >
                    <EditIcon />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="text-fg-muted hover:bg-surface-hover hover:text-danger cursor-pointer rounded p-2 transition sm:p-1"
                    title="Xóa"
                  >
                    <TrashIcon />
                  </button>
                )}
              </div>
            </td>
          );
        }
        return (
          <td key={column.value} className={`p-3.5 ${column.className ?? ""}`}>
            {column.render
              ? column.render(row)
              : ((row as Record<string, unknown>)[
                  column.value
                ] as React.ReactNode)}
          </td>
        );
      })}
    </tr>
  );
}
