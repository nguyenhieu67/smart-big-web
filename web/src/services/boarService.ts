import api from "@/lib/axios";
import type { BoarPayload } from "@/schemas/boarSchema";
import type { Boar } from "@/types/mating";

export const boarService = {
  async list() {
    const { data } = await api.get<{ data: Boar[] }>("/boars");
    return data.data;
  },

  async create(input: BoarPayload) {
    const { data } = await api.post<{ data: Boar }>("/boars", input);
    return data.data;
  },

  async update(id: number, input: BoarPayload) {
    const { data } = await api.patch<{ data: Boar }>(`/boars/${id}`, input);
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/boars/${id}`);
  },
};
