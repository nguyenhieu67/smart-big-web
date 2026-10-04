import api from "@/lib/axios";
import type { ExpenseCategoryPayload } from "@/schemas/expenseCategorySchema";
import type { ExpenseCategory } from "@/types/expense";

export const expenseCategoryService = {
  async list() {
    const { data } = await api.get<{ data: ExpenseCategory[] }>(
      "/expense-categories",
    );
    return data.data;
  },

  async create(input: ExpenseCategoryPayload) {
    const { data } = await api.post<{ data: ExpenseCategory }>(
      "/expense-categories",
      input,
    );
    return data.data;
  },

  async update(id: number, input: ExpenseCategoryPayload) {
    const { data } = await api.patch<{ data: ExpenseCategory }>(
      `/expense-categories/${id}`,
      input,
    );
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/expense-categories/${id}`);
  },
};
