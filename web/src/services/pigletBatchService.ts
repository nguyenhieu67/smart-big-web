import api from "@/lib/axios";
import type { PigletBatchPayload } from "@/schemas/pigletBatchSchema";
import type { PigletBatch } from "@/types/piglet";

export const pigletBatchService = {
  async list() {
    const { data } = await api.get<{ data: PigletBatch[] }>("/piglet-batches");
    return data.data;
  },

  async create(input: PigletBatchPayload) {
    const { data } = await api.post<{ data: PigletBatch }>(
      "/piglet-batches",
      input,
    );
    return data.data;
  },

  async update(id: number, input: PigletBatchPayload) {
    const { data } = await api.patch<{ data: PigletBatch }>(
      `/piglet-batches/${id}`,
      input,
    );
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/piglet-batches/${id}`);
  },
};
