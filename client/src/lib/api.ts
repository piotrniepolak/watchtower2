import { apiRequest } from "./queryClient";

export const stocksApi = {
  getAll: () => fetch("/api/stocks").then(res => res.json()),
  getOne: (symbol: string) => fetch(`/api/stocks/${symbol}`).then(res => res.json()),
  refresh: () => apiRequest("POST", "/api/stocks/refresh"),
};

export const conflictsApi = {
  getAll: () => fetch("/api/conflicts").then(res => res.json()),
  getOne: (id: number) => fetch(`/api/conflicts/${id}`).then(res => res.json()),
};

export const metricsApi = {
  get: () => fetch("/api/metrics").then(res => res.json()),
};

export const correlationApi = {
  getEvents: () => fetch("/api/correlation-events").then(res => res.json()),
};
