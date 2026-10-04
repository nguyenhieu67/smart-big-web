import api from "@/lib/axios";
import type { FeedLogPayload } from "@/schemas/feedLogSchema";
import type { FeedLog } from "@/types/feed";

export const feedLogService = {
  async list() {
    const { data } = await api.get<{ data: FeedLog[] }>("/feed-logs");
    return data.data;
  },

  async create(input: FeedLogPayload) {
    const { data } = await api.post<{ data: FeedLog }>("/feed-logs", input);
    return data.data;
  },

  async update(id: number, input: FeedLogPayload) {
    const { data } = await api.patch<{ data: FeedLog }>(
      `/feed-logs/${id}`,
      input,
    );
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/feed-logs/${id}`);
  },
};
