import api from "@/lib/axios";
import type { VaccineTypePayload } from "@/schemas/vaccineTypeSchema";
import type { VaccineType } from "@/types/vaccine";

export const vaccineTypeService = {
  async list() {
    const { data } = await api.get<{ data: VaccineType[] }>("/vaccine-types");
    return data.data;
  },

  async create(input: VaccineTypePayload) {
    const { data } = await api.post<{ data: VaccineType }>(
      "/vaccine-types",
      input,
    );
    return data.data;
  },

  async update(id: number, input: VaccineTypePayload) {
    const { data } = await api.patch<{ data: VaccineType }>(
      `/vaccine-types/${id}`,
      input,
    );
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/vaccine-types/${id}`);
  },
};
