import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const ACTIVE_FARM_KEY = "smartpig.activeFarmId";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

// Mọi route nghiệp vụ cần x-farm-id (BE đọc từ header, không nhận từ body)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const farmId = window.localStorage.getItem(ACTIVE_FARM_KEY);
    if (farmId) config.headers.set("x-farm-id", farmId);
  }
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Chỉ 1 request refresh chạy tại một thời điểm, các request 401 khác chờ chung kết quả
let refreshing: Promise<void> | null = null;

function refreshSession() {
  refreshing ??= api
    .post("/auth/refresh-token")
    .then(() => undefined)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh-token",
  "/auth/logout",
];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const isAuthCall = AUTH_PATHS.some((p) => original?.url?.startsWith(p));

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retried ||
      isAuthCall
    ) {
      return Promise.reject(error);
    }

    original._retried = true;
    try {
      await refreshSession();
      return api(original);
    } catch {
      if (typeof window !== "undefined")
        window.location.href = "/login?expired=1";
      return Promise.reject(error);
    }
  },
);

export default api;
