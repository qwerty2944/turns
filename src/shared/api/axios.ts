import axios, { AxiosError } from "axios";
import { env } from "../config/env";
import { storage } from "../lib/storage";

export const apiClient = axios.create({
  baseURL: env.backendUrl,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handler — when the backend says our token is no longer valid
// (e.g. the user logged in from another browser and bumped token_version),
// drop the local session and bounce to /login.
const isAuthEndpoint = (url?: string) =>
  !!url && (url.includes("/auth/login") || url.includes("/auth/signup"));

apiClient.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint(error.config?.url) &&
      typeof window !== "undefined"
    ) {
      storage.clear();
      const here = window.location.pathname;
      if (here !== "/login" && here !== "/signup" && here !== "/") {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  },
);

export const extractApiError = (e: unknown): string => {
  if (e instanceof AxiosError) {
    const data = e.response?.data as { error?: string } | undefined;
    return data?.error || e.message;
  }
  if (e instanceof Error) return e.message;
  return "알 수 없는 오류";
};
