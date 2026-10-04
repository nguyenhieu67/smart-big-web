import api from "@/lib/axios";
import type { FarrowingPayload } from "@/schemas/farrowingSchema";
import type { Farrowing } from "@/types/farrowing";

export const farrowingService = {
  async list() {
    const { data } = await api.get<{ data: Farrowing[] }>("/farrowings");
    return data.data;
  },

  async create(input: FarrowingPayload) {
    const { data } = await api.post<{ data: Farrowing }>("/farrowings", input);
    return data.data;
  },

  async update(id: number, input: FarrowingPayload) {
    const { data } = await api.patch<{ data: Farrowing }>(
      `/farrowings/${id}`,
      input,
    );
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/farrowings/${id}`);
  },
};
