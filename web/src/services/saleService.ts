import api from "@/lib/axios";
import type { SalePayload } from "@/schemas/saleSchema";
import type { Sale } from "@/types/sale";

export const saleService = {
  async list() {
    const { data } = await api.get<{ data: Sale[] }>("/sales");
    return data.data;
  },

  async create(input: SalePayload) {
    const { data } = await api.post<{ data: Sale }>("/sales", input);
    return data.data;
  },

  async update(id: number, input: SalePayload) {
    const { data } = await api.patch<{ data: Sale }>(`/sales/${id}`, input);
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/sales/${id}`);
  },
};
