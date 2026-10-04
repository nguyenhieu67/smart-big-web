import api from "@/lib/axios";
import type { ReminderPayload } from "@/schemas/reminderSchema";
import type { Reminder } from "@/types/reminder";

export const reminderService = {
  async list() {
    const { data } = await api.get<{ data: Reminder[] }>("/reminders");
    return data.data;
  },

  async create(input: ReminderPayload) {
    const { data } = await api.post<{ data: Reminder }>("/reminders", input);
    return data.data;
  },

  async update(id: number, input: ReminderPayload) {
    const { data } = await api.patch<{ data: Reminder }>(
      `/reminders/${id}`,
      input,
    );
    return data.data;
  },

  async setDone(id: number, isDone: boolean) {
    const { data } = await api.patch<{ data: Reminder }>(`/reminders/${id}`, {
      is_done: isDone,
    });
    return data.data;
  },

  async remove(id: number) {
    await api.delete(`/reminders/${id}`);
  },
};
