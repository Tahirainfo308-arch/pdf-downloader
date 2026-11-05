import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pdfly_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error, fallback = "Something went wrong.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return error?.message || fallback;
}

export async function signup(payload) {
  const { data } = await api.post("/api/auth/signup", payload);
  return data;
}

export async function login(payload) {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get("/api/auth/me");
  return data;
}

export async function fetchHistory() {
  const { data } = await api.get("/api/history");
  return data;
}

export async function convertToPdf(url, { clean = true } = {}) {
  const response = await api.post(
    "/api/convert",
    { url, clean },
    { responseType: "blob" }
  );

  const count = Number(response.headers["x-pdf-count"]);
  const blob = new Blob([response.data], { type: "application/pdf" });

  return { blob, count: Number.isFinite(count) ? count : null };
}

export function downloadBlob(blob, filename = "page.pdf") {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

export default api;
