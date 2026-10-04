export interface RowI {
  id?: number | string;
}

export interface ColumnI<T = RowI> {
  value: string;
  text: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface PaginatedResultI<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
