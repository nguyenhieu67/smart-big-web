import api from "@/lib/axios";
import type { HealthLogPayload } from "@/schemas/healthLogSchema";
import type {
  HealthCategory,
  HealthLog,
  TreatmentStatus,
} from "@/types/healthLog";

export const healthLogService = {
  async list() {
    const { data } = await api.get<{ data: HealthLog[] }>("/health-logs");
    return data.data;
  },

  async create(input: HealthLogPayload) {
    const { data } = await api.post<{ data: HealthLog }>("/health-logs", input);
    return data.data;
  },

  // Ghi nhận cho đàn heo con (batch_id) thay vì nái; form sức khỏe trên web chỉ nhập cho nái
  async createForBatch(input: {
    batch_id: number;
    log_date: string;
    category: HealthCategory;
    name: string;
    dose?: string;
    cost?: number;
    status: TreatmentStatus;
    vaccine_type_id?: number;
    care_step?: string;
    head_count?: number; // số con chết khi category = DEATH
  }) {
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
