import api from "@/lib/axios";
import type { BuyerPayload } from "@/schemas/buyerSchema";
import type { Buyer } from "@/types/sale";

export const buyerService = {
  async list() {
    const { data } = await api.get<{ data: Buyer[] }>("/buyers");
    return data.data;
  },

  async create(input: BuyerPayload) {
    const { data } = await api.post<{ data: Buyer }>("/buyers", input);
    return data.data;
  },

  async update(id: number, input: BuyerPayload) {
    const { data } = await api.patch<{ data: Buyer }>(`/buyers/${id}`, input);
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/buyers/${id}`);
  },
};
