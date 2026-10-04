import api from "@/lib/axios";
import type { HealthLogPayload } from "@/schemas/healthLogSchema";
import type { HealthLog } from "@/types/healthLog";

export const healthLogService = {
  async list() {
    const { data } = await api.get<{ data: HealthLog[] }>("/health-logs");
    return data.data;
  },

  async create(input: HealthLogPayload) {
    const { data } = await api.post<{ data: HealthLog }>("/health-logs", input);
    return data.data;
  },

  async update(id: number, input: HealthLogPayload) {
    const { data } = await api.patch<{ data: HealthLog }>(
      `/health-logs/${id}`,
      input,
    );
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/health-logs/${id}`);
  },
};
