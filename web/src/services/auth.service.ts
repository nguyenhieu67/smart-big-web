import api from "@/lib/axios";
import type { AuthResult, Farm, User } from "@/types/auth";
import type { LoginInput, RegisterInput } from "@/schemas/auth.schema";

export const authService = {
  async login(input: LoginInput) {
    const { data } = await api.post<{ data: AuthResult }>("/auth/login", input);
    return data.data;
  },

  async register({ email, password, farmName }: RegisterInput) {
    const { data } = await api.post<{ data: AuthResult }>("/auth/register", {
      email,
      password,
      farmName: farmName || undefined,
    });
    return data.data;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async me() {
    const { data } = await api.get<{ data: User }>("/auth/me");
    return data.data;
  },

  async farms() {
    const { data } = await api.get<{ data: Farm[] }>("/farms");
    return data.data;
  },
};
