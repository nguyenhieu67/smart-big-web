import api from "@/lib/axios";
import type { MatingPayload } from "@/schemas/matingSchema";
import type { Mating } from "@/types/mating";

export const matingService = {
  async list() {
    const { data } = await api.get<{ data: Mating[] }>("/matings");
    return data.data;
  },

  async create(input: MatingPayload) {
    const { data } = await api.post<{ data: Mating }>("/matings", input);
    return data.data;
  },

  async update(id: number, input: MatingPayload) {
    const { data } = await api.patch<{ data: Mating }>(`/matings/${id}`, input);
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/matings/${id}`);
  },
};
