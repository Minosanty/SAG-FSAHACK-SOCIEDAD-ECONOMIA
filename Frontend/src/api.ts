const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export type Analysis = {
  analysis_id: string;
  name: string;
  description?: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
};

export type Source = {
  id: string;
  analysis_id: string;
  name: string;
  type: string;
  location?: string | null;
  content?: unknown;
  status: string;
  created_at: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string };
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as T &
    ApiEnvelope<unknown>;
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? body.error?.message
        : undefined;
    throw new Error(message ?? "No se pudo completar la solicitud.");
  }
  return body;
}

export function getAnalysis(id: string) {
  return request<Analysis>(`/analyses/${id}`);
}

export function createAnalysis(payload: { name: string; description: string }) {
  return request<Analysis>("/analyses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSources(analysisId: string) {
  return request<ApiEnvelope<Source[]>>(`/analyses/${analysisId}/sources`);
}

export function createSource(
  analysisId: string,
  payload: { name: string; type: string; location: string; content?: unknown },
) {
  return request<ApiEnvelope<Source>>(`/analyses/${analysisId}/sources`, {
    method: "POST",
    body: JSON.stringify({ ...payload, status: "pending" }),
  });
}

export function triggerWorkflow(analysisId: string, workflowName: string) {
  return request<ApiEnvelope<{ ok: boolean }>>(`/workflows/${workflowName}`, {
    method: "POST",
    body: JSON.stringify({ analysis_id: analysisId }),
  });
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
