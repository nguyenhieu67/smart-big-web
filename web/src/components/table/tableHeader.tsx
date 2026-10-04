import type { ColumnI, RowI } from "@/types/table";

interface TableHeaderProps<T extends RowI = RowI> {
  columns: ColumnI<T>[];
}

export function TableHeader<T extends RowI = RowI>({
  columns,
}: TableHeaderProps<T>) {
  return (
    <thead className="bg-surface-hover text-fg-body sticky top-0 z-10 text-xs font-semibold uppercase">
      <tr>
        {columns.map((column) => (
          <th key={column.value} className="p-4">
            {column.text}
          </th>
        ))}
      </tr>
    </thead>
  );
}
