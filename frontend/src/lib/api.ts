import axios from "axios";
import { getToken, clearAuth } from "./auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; role: string; company_name?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// Jobs
export const jobsApi = {
  list: (skip = 0, limit = 20) => api.get(`/jobs/?skip=${skip}&limit=${limit}`),
  get: (id: string) => api.get(`/jobs/${id}`),
  create: (data: unknown) => api.post("/jobs/", data),
  update: (id: string, data: unknown) => api.put(`/jobs/${id}`, data),
  delete: (id: string) => api.delete(`/jobs/${id}`),
  getApplications: (id: string) => api.get(`/jobs/${id}/applications`),
  updateWeights: (id: string, weights: Record<string, number>) =>
    api.put(`/jobs/${id}/weights`, { modality_weights: weights }),
};

// Applications
export const applicationsApi = {
  submit: (formData: FormData) =>
    api.post("/applications/", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  myApplications: () => api.get("/applications/my"),
  get: (id: string) => api.get(`/applications/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/applications/${id}/status?status=${status}`),
};

// Assessments
export const assessmentsApi = {
  get: (applicationId: string) => api.get(`/assessments/${applicationId}`),
  getRanked: (jobId: string) => api.get(`/assessments/job/${jobId}/ranked`),
};

// RAG
export const ragApi = {
  chat: (data: { application_id: string; message: string; conversation_history: Array<{ role: string; content: string }> }) =>
    api.post("/rag/chat", data),
};
