import api from "@/lib/axios";
import type { SowPayload } from "@/schemas/sowSchema";
import type { Sow } from "@/types/sow";

export const sowService = {
  async list() {
    const { data } = await api.get<{ data: Sow[] }>("/sows");
    return data.data;
  },

  async create(input: SowPayload) {
    const { data } = await api.post<{ data: Sow }>("/sows", input);
    return data.data;
  },

  async update(id: number, input: SowPayload) {
    const { data } = await api.patch<{ data: Sow }>(`/sows/${id}`, input);
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/sows/${id}`);
  },
};
