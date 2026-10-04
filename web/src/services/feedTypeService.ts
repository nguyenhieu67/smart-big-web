import api from "@/lib/axios";
import type { FeedTypePayload } from "@/schemas/feedTypeSchema";
import type { FeedType } from "@/types/feed";

export const feedTypeService = {
  async list() {
    const { data } = await api.get<{ data: FeedType[] }>("/feed-types");
    return data.data;
  },

  async create(input: FeedTypePayload) {
    const { data } = await api.post<{ data: FeedType }>("/feed-types", input);
    return data.data;
  },

  async update(id: number, input: FeedTypePayload) {
    const { data } = await api.patch<{ data: FeedType }>(
      `/feed-types/${id}`,
      input,
    );
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/feed-types/${id}`);
  },
};
