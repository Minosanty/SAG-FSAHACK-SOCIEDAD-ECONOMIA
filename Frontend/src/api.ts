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

export type KPI = {
  label: string;
  value: string | number;
  calculation: string;
  source_name?: string;
  trend?: "up" | "down" | "stable";
};

export type DataQualityIssue = {
  severity: "high" | "medium" | "low";
  description: string;
  evidence?: string;
  field?: string;
};

export type AIFinding = {
  type: "trend" | "pattern" | "anomaly" | "insight";
  description: string;
  confidence?: number;
  evidence_sources?: string[];
};

export type ExecutiveReport = {
  summary: string;
  potential_needs: string[];
  additional_info_needed: string[];
  questions_to_investigate: string[];
};

export type DashboardData = {
  kpis: KPI[];
  data_quality: DataQualityIssue[];
  ai_findings: AIFinding[];
  executive_report: ExecutiveReport | null;
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

export async function listAnalyses(): Promise<Analysis[]> {
  // Backend returns { analyses: [...] } — unwrap it
  const result = await request<{ analyses?: Analysis[] } | Analysis[]>("/analyses");
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "analyses" in result && Array.isArray(result.analyses)) {
    return result.analyses;
  }
  return [];
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

export async function getDashboard(analysisId: string): Promise<DashboardData> {
  // Try /results first (backend endpoint), fall back to /dashboard
  try {
    return await request<DashboardData>(`/analyses/${analysisId}/results`);
  } catch {
    return await request<DashboardData>(`/analyses/${analysisId}/dashboard`);
  }
}

export async function analizarDocumento(file: File) {
  const formData = new FormData();
  formData.append("data", file);
  
  const response = await fetch(`${API_BASE_URL}/analizar`, {
    method: "POST",
    body: formData,
    // Do not set Content-Type header, let the browser set it with the correct boundary
  });
  
  const body = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const message = body?.error || "Error al analizar el documento.";
    throw new Error(message);
  }
  
  return body;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
