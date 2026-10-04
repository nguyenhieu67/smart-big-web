export interface ExpenseCategory {
  id: number;
  name: string;
}

export interface Expense {
  id: number;
  expense_date: string; // ISO
  description: string | null;
  amount: string; // Decimal -> chuỗi
  category_id: number;
  category: { id: number; name: string };
  // có giá trị khi khoản chi tự sinh từ nhật ký cho ăn / sức khỏe
  feed_log_id: number | null;
  health_log_id: number | null;
}
