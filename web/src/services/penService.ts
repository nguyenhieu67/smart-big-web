import api from "@/lib/axios";
import type { PenPayload } from "@/schemas/penSchema";
import type { Pen } from "@/types/pen";

export const penService = {
  async list() {
    const { data } = await api.get<{ data: Pen[] }>("/pens");
    return data.data;
  },

  async create(input: PenPayload) {
    const { data } = await api.post<{ data: Pen }>("/pens", input);
    return data.data;
  },

  async update(id: number, input: PenPayload) {
    const { data } = await api.patch<{ data: Pen }>(`/pens/${id}`, input);
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/pens/${id}`);
  },
};
