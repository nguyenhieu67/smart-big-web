import api from "@/lib/axios";
import type { ExpensePayload } from "@/schemas/expenseSchema";
import type { Expense } from "@/types/expense";

export const expenseService = {
  async list() {
    const { data } = await api.get<{ data: Expense[] }>("/expenses");
    return data.data;
  },

  async create(input: ExpensePayload) {
    const { data } = await api.post<{ data: Expense }>("/expenses", input);
    return data.data;
  },

  async update(id: number, input: ExpensePayload) {
    const { data } = await api.patch<{ data: Expense }>(
      `/expenses/${id}`,
      input,
    );
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/expenses/${id}`);
  },
};
