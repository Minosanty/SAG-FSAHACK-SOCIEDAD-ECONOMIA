import { useEffect, useRef, useState, useCallback, type ChangeEvent } from "react";
import {
  Activity, AlertCircle, AlertTriangle, ArrowLeft, ArrowRight,
  BarChart3, BookOpen, Brain, Check, ChevronDown, ChevronRight,
  Clipboard, Clock, Database, Download, FileArchive, FileCode2,
  FileSpreadsheet, FileText, FileType, Globe, HelpCircle, History,
  Home, Layers, Lightbulb, Link2, LoaderCircle, Minus, PlusCircle,
  RefreshCw, Search, Sparkles, TrendingDown, TrendingUp, UploadCloud,
  X, Zap
} from "lucide-react";
import {
  Analysis, createAnalysis, createSource, DashboardData, getAnalysis,
  getDashboard, getSources, listAnalyses, Source, triggerWorkflow,
  analizarDocumento,
  type AIFinding, type DataQualityIssue, type ExecutiveReport, type KPI,
} from "./api";
import { DocumentSummary, parseDocument } from "./documentParser";

/* ─────────────────────────────────────────────────────────────────────── */
/*  Constants & Utilities                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

const acceptedFiles = ".pdf,.txt,.csv,.json,.md,.docx";

function formatDate(value?: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatDateShort(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function getSourceType(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "csv") return "csv";
  if (ext === "xlsx" || ext === "xls") return "excel";
  return "text";
}

function summaryText(summary: DocumentSummary) {
  return [summary.title, "", ...summary.highlights.map(h => `- ${h}`), "", ...summary.sections.map(s => `${s.heading}\n${s.body}`)].join("\n");
}

function truncateId(id: string, len = 8) {
  return id.length > len ? id.slice(0, len) + "…" : id;
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  SVG Logo Component (Analytical Prism)                                  */
/* ─────────────────────────────────────────────────────────────────────── */

function InfodexLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="prism-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
        <linearGradient id="accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* Base prism */}
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#prism-grad)" />
      {/* Geometric overlay — analytical nodes */}
      <path d="M20 8L32 26H8L20 8Z" fill="url(#accent-grad)" opacity="0.5" />
      <circle cx="20" cy="14" r="3" fill="white" opacity="0.9" />
      <circle cx="12" cy="26" r="2.5" fill="white" opacity="0.7" />
      <circle cx="28" cy="26" r="2.5" fill="white" opacity="0.7" />
      {/* Connection lines */}
      <line x1="20" y1="14" x2="12" y2="26" stroke="white" strokeWidth="1.2" opacity="0.4" />
      <line x1="20" y1="14" x2="28" y2="26" stroke="white" strokeWidth="1.2" opacity="0.4" />
      <line x1="12" y1="26" x2="28" y2="26" stroke="white" strokeWidth="1" opacity="0.3" />
      {/* Center dot */}
      <circle cx="20" cy="22" r="1.5" fill="white" opacity="0.5" />
      {/* Bottom text mark */}
      <rect x="14" y="31" width="12" height="2" rx="1" fill="white" opacity="0.3" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Status Badge                                                           */
/* ─────────────────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    created:    { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]", dot: "bg-[#0EA5E9]", label: "Creado" },
    processing: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", dot: "bg-[#F59E0B]", label: "Procesando" },
    completed:  { bg: "bg-[#DCFCE7]", text: "text-[#166534]", dot: "bg-[#22C55E]", label: "Completado" },
    pending:    { bg: "bg-[#F1F5F9]", text: "text-[#64748B]", dot: "bg-[#94A3B8]", label: "Pendiente" },
    processed:  { bg: "bg-[#DCFCE7]", text: "text-[#166534]", dot: "bg-[#22C55E]", label: "Procesado" },
    error:      { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", dot: "bg-[#EF4444]", label: "Error" },
  };
  const s = map[status?.toLowerCase()] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}>
      <span className={`size-1.5 rounded-full ${s.dot} ${status === "processing" ? "animate-pulse-soft" : ""}`} />
      {s.label}
    </span>
  );
}

function SourceIcon({ type }: { type: string }) {
  const m: Record<string, React.ReactNode> = {
    csv: <FileSpreadsheet size={16} />, excel: <FileSpreadsheet size={16} />,
    pdf: <FileText size={16} />, url: <Globe size={16} />, text: <FileType size={16} />,
  };
  return <span className="text-[#0284C7]">{m[type?.toLowerCase()] ?? <FileCode2 size={16} />}</span>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    high: { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]" },
    medium: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
    low: { bg: "bg-[#E0F2FE]", text: "text-[#0369A1]" },
  };
  const labels: Record<string, string> = { high: "Alta", medium: "Media", low: "Baja" };
  const s = map[severity] ?? map.low;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${s.bg} ${s.text}`}>
      {severity === "high" && <AlertCircle size={10} />}
      {severity === "medium" && <AlertTriangle size={10} />}
      {severity === "low" && <HelpCircle size={10} />}
      {labels[severity] ?? severity}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Skeleton & Empty State                                                 */
/* ─────────────────────────────────────────────────────────────────────── */

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="skeleton mb-3 h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skeleton mb-2 h-3" style={{ width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={2} />)}
      </div>
      <SkeletonCard lines={4} />
      <SkeletonCard lines={5} />
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-[#EFF6FF] text-[#1E40AF]">{icon}</div>
      <h3 className="mb-2 text-[15px] font-semibold text-[#0F172A]">{title}</h3>
      <p className="max-w-xs text-[13px] leading-5 text-[#64748B]">{description}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  Tabs                                                                   */
/* ─────────────────────────────────────────────────────────────────────── */

type TabId = "sources" | "dashboard" | "upload";

function TabButton({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; count?: number }) {
  return (
    <button
      type="button" onClick={onClick}
      className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-[13px] font-semibold transition-colors ${active ? "border-[#1E40AF] text-[#1E40AF]" : "border-transparent text-[#64748B] hover:border-[#CBD5E1] hover:text-[#0F172A]"}`}
    >
      {icon}{label}
      {count !== undefined && count > 0 && (
        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-[#1E40AF] text-white" : "bg-[#E2E8F0] text-[#64748B]"}`}>{count}</span>
      )}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  App-level screen type                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

type Screen = "home" | "history" | "workspace";

/* ═══════════════════════════════════════════════════════════════════════ */
/*  MAIN APP                                                               */
/* ═══════════════════════════════════════════════════════════════════════ */

function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  /* ── Navigation ── */
  const [screen, setScreen] = useState<Screen>("home");

  /* ── State ── */
  const [analysisId, setAnalysisId] = useState(() => localStorage.getItem("infodex-analysis-id") ?? "");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<DocumentSummary | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingSources, setLoadingSources] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creatingAnalysis, setCreatingAnalysis] = useState(false);
  const [showAnalysisDropdown, setShowAnalysisDropdown] = useState(false);
  const [directResult, setDirectResult] = useState<unknown>(null);

  /* ── Loaders ── */
  const loadAnalysesList = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const list = await listAnalyses();
      setAnalyses(Array.isArray(list) ? list : []);
    } catch { setAnalyses([]); }
    finally { setLoadingHistory(false); }
  }, []);

  const loadWorkspace = useCallback(async (id: string) => {
    if (!id.trim()) return;
    setLoadingAnalysis(true);
    try {
      const data = await getAnalysis(id.trim());
      setAnalysis(data);
      setAnalysisId(id.trim());
      localStorage.setItem("infodex-analysis-id", id.trim());
      setScreen("workspace");
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo conectar con el backend." });
    } finally { setLoadingAnalysis(false); }
  }, []);

  const loadSources = useCallback(async (id: string) => {
    setLoadingSources(true);
    try {
      const result = await getSources(id);
      const data = result?.data ?? (Array.isArray(result) ? result : []);
      setSources(Array.isArray(data) ? data : []);
    } catch { setSources([]); }
    finally { setLoadingSources(false); }
  }, []);

  const loadDashboard = useCallback(async (id: string) => {
    setLoadingDashboard(true);
    try { setDashboard(await getDashboard(id)); }
    catch { setDashboard(null); }
    finally { setLoadingDashboard(false); }
  }, []);

  /* ── Effects ── */
  useEffect(() => { void loadAnalysesList(); }, []);

  useEffect(() => {
    if (analysis?.analysis_id) {
      void loadSources(analysis.analysis_id);
      void loadDashboard(analysis.analysis_id);
    }
  }, [analysis?.analysis_id]);

  /* ── File ── */
  async function readFile(nextFile: File) {
    setFile(nextFile); setParsing(true); setNotice(null);
    try { setSummary(await parseDocument(nextFile)); }
    catch (error) { setSummary(null); setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo leer el documento." }); }
    finally { setParsing(false); }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) { const f = e.target.files?.[0]; if (f) void readFile(f); }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) void readFile(f); }

  async function saveDocument() {
    if (!file) return;
    setSaving(true);
    setDirectResult(null);
    try {
      const result = await analizarDocumento(file);
      setDirectResult(result);
      setNotice({ type: "success", text: "Análisis completado exitosamente por n8n." });
    } catch (error) { 
      setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo analizar el documento." }); 
    }
    finally { setSaving(false); }
  }

  async function copySummary() { if (!summary) return; await navigator.clipboard.writeText(summaryText(summary)); setNotice({ type: "success", text: "Resumen copiado al portapapeles." }); }

  function downloadSummary() {
    if (!summary) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([summaryText(summary)], { type: "text/plain;charset=utf-8" }));
    link.download = `${summary.title.replace(/[^a-z0-9áéíóúñ]+/gi, "-").toLowerCase() || "resumen"}.txt`;
    link.click(); URL.revokeObjectURL(link.href);
  }

  async function handleCreateAnalysis() {
    if (!newName.trim()) return;
    setCreatingAnalysis(true);
    try {
      const created = await createAnalysis({ name: newName.trim(), description: newDesc.trim() });
      setAnalysis(created); setAnalysisId(created.analysis_id);
      localStorage.setItem("infodex-analysis-id", created.analysis_id);
      setShowNewAnalysis(false); setNewName(""); setNewDesc("");
      void loadAnalysesList();
      setNotice({ type: "success", text: "Análisis creado exitosamente." });
      setScreen("workspace");
    } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo crear el análisis." }); }
    finally { setCreatingAnalysis(false); }
  }

  async function handleRefreshDashboard() {
    if (!analysis) return;
    try {
      await triggerWorkflow(analysis.analysis_id, "analizar-data");
      setNotice({ type: "success", text: "Flujo de análisis iniciado. Los resultados aparecerán en breve." });
      setTimeout(() => { void loadDashboard(analysis.analysis_id); void loadSources(analysis.analysis_id); void loadWorkspace(analysis.analysis_id); }, 3000);
    } catch (error) { setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo iniciar el flujo de análisis." }); }
  }

  function selectAnalysis(a: Analysis) {
    setAnalysis(a); setAnalysisId(a.analysis_id);
    localStorage.setItem("infodex-analysis-id", a.analysis_id);
    setShowAnalysisDropdown(false); setSources([]); setDashboard(null);
    setScreen("workspace");
  }

  function goHome() { setScreen("home"); setAnalysis(null); }

  /* ═══════════════════════════════════════════════════════════════════ */
  /*  RENDER                                                             */
  /* ═══════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ════════ HEADER ════════ */}
      <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={goHome} className="flex items-center gap-3 transition hover:opacity-80">
            <InfodexLogo size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-extrabold tracking-tight text-[#0F172A]">Infodex AI</span>
                <span className="rounded-md bg-[#EFF6FF] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#1E40AF]">Beta</span>
              </div>
              <p className="text-[11px] text-[#64748B]">Plataforma de Análisis Inteligente</p>
            </div>
          </button>

          <nav className="flex items-center gap-2">
            <button type="button" onClick={goHome} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition ${screen === "home" ? "bg-[#EFF6FF] text-[#1E40AF]" : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"}`}>
              <Home size={14} /> Inicio
            </button>
            <button type="button" onClick={() => { setScreen("history"); void loadAnalysesList(); }} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition ${screen === "history" ? "bg-[#EFF6FF] text-[#1E40AF]" : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"}`}>
              <History size={14} /> Historial
              {analyses.length > 0 && <span className="rounded-full bg-[#E2E8F0] px-1.5 py-0.5 text-[9px] font-bold text-[#64748B]">{analyses.length}</span>}
            </button>
            {analysis && screen === "workspace" && (
              <div className="relative ml-2 border-l border-[#E2E8F0] pl-3">
                <button type="button" onClick={() => setShowAnalysisDropdown(!showAnalysisDropdown)} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[12px] font-medium text-[#0F172A] transition hover:border-[#CBD5E1]">
                  <Layers size={14} className="text-[#0284C7]" />
                  <span className="max-w-[160px] truncate">{analysis.name || truncateId(analysis.analysis_id)}</span>
                  <StatusBadge status={analysis.status} />
                  <ChevronDown size={14} className="text-[#94A3B8]" />
                </button>
                {showAnalysisDropdown && analyses.length > 0 && (
                  <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-xl">
                    <p className="mb-2 px-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Análisis disponibles</p>
                    <div className="custom-scrollbar max-h-60 overflow-y-auto">
                      {analyses.map(a => (
                        <button key={a.analysis_id} type="button" onClick={() => selectAnalysis(a)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[12px] transition hover:bg-[#F0F4F8] ${a.analysis_id === analysis.analysis_id ? "bg-[#EFF6FF]" : ""}`}>
                          <div>
                            <div className="font-medium text-[#0F172A]">{a.name || truncateId(a.analysis_id)}</div>
                            <div className="mt-0.5 text-[10px] text-[#64748B]">{formatDate(a.created_at)}</div>
                          </div>
                          <StatusBadge status={a.status} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button type="button" onClick={() => setShowNewAnalysis(true)} className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#1E40AF] to-[#1D4ED8] px-3.5 py-2 text-[12px] font-semibold text-white shadow-[0_2px_8px_rgba(30,64,175,0.3)] transition hover:shadow-[0_4px_16px_rgba(30,64,175,0.35)] active:scale-[0.98]">
              <PlusCircle size={15} /> Nuevo Análisis
            </button>
          </nav>
        </div>
      </header>

      {showAnalysisDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowAnalysisDropdown(false)} />}

      {/* ════════ NEW ANALYSIS MODAL ════════ */}
      {showNewAnalysis && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setShowNewAnalysis(false)}>
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#1E40AF] to-[#0EA5E9] text-white"><PlusCircle size={20} /></div>
                <h2 className="text-[18px] font-bold text-[#0F172A]">Crear nuevo análisis</h2>
              </div>
              <button type="button" onClick={() => setShowNewAnalysis(false)} className="rounded-lg p-1.5 text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#64748B]"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#0F172A]">Nombre del análisis</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Análisis de ventas Q3 2026" className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-[#0F172A]">Descripción</label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Describe brevemente el objetivo del análisis..." rows={3} className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20 resize-none" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowNewAnalysis(false)} className="rounded-lg border border-[#E2E8F0] px-4 py-2.5 text-[12px] font-semibold text-[#64748B] transition hover:bg-[#F1F5F9]">Cancelar</button>
              <button type="button" onClick={() => void handleCreateAnalysis()} disabled={!newName.trim() || creatingAnalysis} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#1E40AF] to-[#1D4ED8] px-4 py-2.5 text-[12px] font-semibold text-white shadow-sm transition hover:shadow-md disabled:opacity-50">
                {creatingAnalysis ? <LoaderCircle size={14} className="animate-spin" /> : <PlusCircle size={14} />} Crear análisis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ NOTICE ════════ */}
      {notice && (
        <div className="mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 lg:px-8 animate-fade-in">
          <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[12px] font-medium ${notice.type === "success" ? "border-[#BBF7D0] bg-[#DCFCE7] text-[#166534]" : "border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]"}`}>
            {notice.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
            {notice.text}
            <button className="ml-auto rounded-md p-0.5 transition hover:bg-black/5" onClick={() => setNotice(null)} type="button"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  SCREEN: HOME                                                    */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {screen === "home" && (
        <main className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="animate-fade-in pt-12 pb-10">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-1.5 text-[11px] font-semibold text-[#1E40AF]">
                <Sparkles size={13} /> Potenciado por Inteligencia Artificial
              </div>
              <h1 className="mb-5 text-[36px] font-extrabold leading-tight tracking-tight text-[#0F172A] sm:text-[44px]">
                Transforma información local fragmentada en{" "}
                <span className="bg-gradient-to-r from-[#1E40AF] to-[#0EA5E9] bg-clip-text text-transparent">decisiones estructuradas</span>
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-[16px] leading-relaxed text-[#64748B]">
                Carga tus documentos, conecta tus fuentes de datos y deja que nuestra IA analice, identifique patrones y genere reportes ejecutivos automáticamente.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={() => setShowNewAnalysis(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1E40AF] to-[#1D4ED8] px-7 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_16px_rgba(30,64,175,0.3)] transition hover:shadow-[0_6px_24px_rgba(30,64,175,0.4)] active:scale-[0.98]">
                  <PlusCircle size={18} /> Iniciar Nuevo Análisis
                </button>
                <button type="button" onClick={() => { setScreen("history"); void loadAnalysesList(); }} className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-6 py-3.5 text-[14px] font-semibold text-[#0F172A] shadow-sm transition hover:bg-[#F8FAFC] hover:shadow-md">
                  <History size={18} className="text-[#0284C7]" /> Ver Historial
                </button>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mx-auto mt-4 grid max-w-5xl gap-6 sm:grid-cols-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            {[
              { icon: <UploadCloud size={24} />, title: "Carga Inteligente", desc: "Sube PDFs, CSVs, DOCX y más. Procesamos y estructuramos tu información automáticamente." },
              { icon: <Brain size={24} />, title: "Análisis IA con Qwen", desc: "Detección de patrones, anomalías y tendencias mediante inteligencia artificial avanzada." },
              { icon: <BarChart3 size={24} />, title: "Dashboard Ejecutivo", desc: "KPIs, indicadores de calidad, hallazgos y reporte de síntesis en un solo lugar." },
            ].map((f, i) => (
              <div key={i} className="group rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all hover:border-[#BFDBFE] hover:shadow-[0_8px_24px_rgba(30,64,175,0.08)]">
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#E0F2FE] p-3 text-[#1E40AF] transition group-hover:from-[#1E40AF] group-hover:to-[#0EA5E9] group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-[16px] font-bold text-[#0F172A]">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#64748B]">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick access — recent analyses */}
          {analyses.length > 0 && (
            <div className="mx-auto mt-12 max-w-5xl animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#0F172A]">
                  <Clock size={16} className="text-[#0284C7]" /> Análisis Recientes
                </h2>
                <button type="button" onClick={() => setScreen("history")} className="flex items-center gap-1 text-[12px] font-semibold text-[#1E40AF] transition hover:text-[#1D4ED8]">
                  Ver todos <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {analyses.slice(0, 3).map(a => (
                  <button key={a.analysis_id} type="button" onClick={() => selectAnalysis(a)} className="flex items-center gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 text-left shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:border-[#BFDBFE] hover:shadow-[0_4px_16px_rgba(30,64,175,0.08)]">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#EFF6FF] to-[#E0F2FE] text-[#1E40AF]">
                      <Layers size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-semibold text-[#0F172A]">{a.name || truncateId(a.analysis_id)}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-[#94A3B8]">{formatDateShort(a.created_at)}</span>
                        <StatusBadge status={a.status} />
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-[#CBD5E1]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  SCREEN: HISTORY                                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {screen === "history" && (
        <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-8 sm:px-6 lg:px-8 animate-fade-in">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={goHome} className="rounded-lg p-1.5 text-[#64748B] transition hover:bg-[#F1F5F9]"><ArrowLeft size={18} /></button>
              <div>
                <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A]">Historial de Análisis</h1>
                <p className="text-[13px] text-[#64748B]">Todos los análisis registrados en la plataforma</p>
              </div>
            </div>
            <button type="button" onClick={() => void loadAnalysesList()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-[11px] font-semibold text-[#64748B] transition hover:bg-[#F8FAFC]">
              <RefreshCw size={12} className={loadingHistory ? "animate-spin" : ""} /> Actualizar
            </button>
          </div>

          {loadingHistory ? (
            <div className="space-y-3">{[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={2} />)}</div>
          ) : analyses.length > 0 ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <div className="divide-y divide-[#F1F5F9]">
                {analyses.map(a => (
                  <button key={a.analysis_id} type="button" onClick={() => selectAnalysis(a)} className="flex w-full items-center gap-5 px-6 py-5 text-left transition hover:bg-[#F8FAFC]">
                    <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#E0F2FE] text-[#1E40AF]">
                      <Layers size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-semibold text-[#0F172A]">{a.name || "Análisis sin título"}</div>
                      {a.description && <p className="mt-0.5 truncate text-[12px] text-[#64748B]">{a.description}</p>}
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-[#94A3B8]">
                        <span className="font-mono">{truncateId(a.analysis_id, 12)}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {formatDate(a.created_at)}</span>
                      </div>
                    </div>
                    <StatusBadge status={a.status} />
                    <ChevronRight size={18} className="shrink-0 text-[#CBD5E1]" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
              <EmptyState icon={<History size={28} />} title="Aún no hay análisis creados" description="Crea tu primer análisis para comenzar a transformar datos en decisiones." />
            </div>
          )}
        </main>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/*  SCREEN: WORKSPACE                                               */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {screen === "workspace" && (
        <main className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {loadingAnalysis ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <LoaderCircle size={32} className="animate-spin text-[#1E40AF]" />
                <span className="text-[13px] font-medium text-[#64748B]">Cargando análisis...</span>
              </div>
            </div>
          ) : analysis ? (
            <div className="animate-fade-in">
              {/* Workspace Header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-center gap-4">
                  <button type="button" onClick={goHome} className="rounded-lg p-1.5 text-[#64748B] transition hover:bg-[#F1F5F9]"><ArrowLeft size={18} /></button>
                  <div>
                    <p className="mb-0.5 font-mono text-[10px] uppercase tracking-[1.4px] text-[#64748B]">Espacio de trabajo · {truncateId(analysis.analysis_id, 12)}</p>
                    <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A]">{analysis.name || "Análisis sin título"}</h1>
                    {analysis.description && <p className="mt-1 text-[13px] text-[#64748B]">{analysis.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={analysis.status} />
                  <span className="text-[11px] text-[#94A3B8]">{formatDate(analysis.created_at)}</span>
                  <button type="button" onClick={() => void handleRefreshDashboard()} className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#1E40AF] to-[#0EA5E9] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:shadow-md" title="Ejecutar análisis">
                    <Zap size={13} /> Analizar con IA
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6 flex border-b border-[#E2E8F0]">
                <TabButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<BarChart3 size={15} />} label="Dashboard" />
                <TabButton active={activeTab === "sources"} onClick={() => setActiveTab("sources")} icon={<Database size={15} />} label="Fuentes" count={sources.length} />
                <TabButton active={activeTab === "upload"} onClick={() => setActiveTab("upload")} icon={<UploadCloud size={15} />} label="Cargar Documento" />
              </div>

              {/* TAB: DASHBOARD */}
              {activeTab === "dashboard" && (
                <div className="space-y-8 animate-fade-in">
                  {loadingDashboard ? <DashboardSkeleton /> : (
                    <>
                      <section>
                        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#0F172A]"><BarChart3 size={17} className="text-[#0284C7]" /> Indicadores Clave</h2>
                        {dashboard?.kpis && dashboard.kpis.length > 0 ? (
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{dashboard.kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}</div>
                        ) : (
                          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><EmptyState icon={<BarChart3 size={24} />} title="Sin indicadores disponibles" description="Carga fuentes de datos y ejecuta el análisis para ver los KPIs." /></div>
                        )}
                      </section>

                      <section>
                        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#0F172A]"><AlertTriangle size={17} className="text-[#F59E0B]" /> Calidad de Datos</h2>
                        {dashboard?.data_quality && dashboard.data_quality.length > 0 ? (
                          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><div className="divide-y divide-[#F1F5F9]">{dashboard.data_quality.map((issue, i) => <DataQualityRow key={i} issue={issue} />)}</div></div>
                        ) : (
                          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><EmptyState icon={<Check size={24} />} title="No se detectaron inconsistencias" description="Los datos cargados no presentan problemas de calidad visibles." /></div>
                        )}
                      </section>

                      <section>
                        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#0F172A]"><Brain size={17} className="text-[#7C3AED]" /> Hallazgos IA <span className="ml-1 rounded-md bg-[#EDE9FE] px-1.5 py-0.5 text-[9px] font-bold text-[#7C3AED]">Qwen</span></h2>
                        {dashboard?.ai_findings && dashboard.ai_findings.length > 0 ? (
                          <div className="grid gap-4 sm:grid-cols-2">{dashboard.ai_findings.map((f, i) => <AIFindingCard key={i} finding={f} />)}</div>
                        ) : (
                          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><EmptyState icon={<Brain size={24} />} title="Sin hallazgos disponibles" description="Ejecuta el análisis para que la IA identifique patrones, tendencias y anomalías." /></div>
                        )}
                      </section>

                      <section>
                        <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[#0F172A]"><BookOpen size={17} className="text-[#1E40AF]" /> Reporte Ejecutivo</h2>
                        {dashboard?.executive_report ? <ExecutiveReportSection report={dashboard.executive_report} /> : (
                          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><EmptyState icon={<BookOpen size={24} />} title="Reporte no generado" description="El reporte ejecutivo se generará al completar el análisis de todas las fuentes." /></div>
                        )}
                      </section>
                    </>
                  )}
                </div>
              )}

              {/* TAB: SOURCES */}
              {activeTab === "sources" && (
                <div className="animate-fade-in">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-[15px] font-bold text-[#0F172A]">Fuentes del análisis</h2>
                    <button type="button" onClick={() => void loadSources(analysis.analysis_id)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-1.5 text-[11px] font-medium text-[#64748B] transition hover:bg-[#F8FAFC]">
                      <RefreshCw size={12} className={loadingSources ? "animate-spin" : ""} /> Actualizar
                    </button>
                  </div>
                  {loadingSources ? (
                    <div className="space-y-3">{[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}</div>
                  ) : sources.length > 0 ? (
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                      <div className="divide-y divide-[#F1F5F9]">
                        {sources.map(s => (
                          <div key={s.id} className="flex items-center gap-4 px-6 py-5 transition hover:bg-[#F8FAFC]">
                            <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#E0F2FE]"><SourceIcon type={s.type} /></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-[13px] font-semibold text-[#0F172A]">{s.name}</span>
                                <span className="shrink-0 rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[9px] uppercase text-[#64748B]">{s.type}</span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-3 text-[11px] text-[#94A3B8]">
                                <span className="font-mono">{truncateId(s.id, 12)}</span>
                                <span>{formatDate(s.created_at)}</span>
                              </div>
                            </div>
                            <StatusBadge status={s.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_2px_8px_rgba(15,23,42,0.04)]"><EmptyState icon={<Database size={24} />} title="Sin fuentes cargadas" description="Ve a la pestaña 'Cargar Documento' para agregar fuentes de datos al análisis." /></div>
                  )}
                </div>
              )}

              {/* TAB: UPLOAD */}
              {activeTab === "upload" && (
                <div className="animate-fade-in grid items-start gap-6 lg:grid-cols-[minmax(340px,.88fr)_minmax(0,1.22fr)]">
                  <section>
                    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                      <div className="mb-5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[#0284C7]"><UploadCloud size={18} /></span>
                          <h2 className="text-[15px] font-bold text-[#0F172A]">Carga de documento</h2>
                        </div>
                        <span className="text-[10px] font-medium text-[#94A3B8]">PDF, DOCX, TXT, CSV, JSON</span>
                      </div>
                      <input ref={inputRef} className="hidden" type="file" accept={acceptedFiles} onChange={handleFileChange} />
                      <div className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 text-center transition-all ${dragging ? "border-[#1E40AF] bg-[#EFF6FF]" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#0284C7] hover:bg-[#EFF6FF]/50"}`}
                        onClick={() => inputRef.current?.click()} onDragEnter={e => { e.preventDefault(); setDragging(true); }} onDragOver={e => e.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
                        <div className={`mb-4 grid size-14 place-items-center rounded-full ${dragging ? "bg-[#1E40AF]/10 text-[#1E40AF]" : "bg-[#EFF6FF] text-[#0284C7]"} ring-8 ring-white`}>
                          {parsing ? <LoaderCircle size={24} className="animate-spin" /> : <FileArchive size={24} />}
                        </div>
                        {file ? (<><strong className="max-w-full truncate text-[13px] text-[#0F172A]">{file.name}</strong><span className="mt-2 text-[11px] text-[#64748B]">{parsing ? "Extrayendo información..." : `${(file.size / 1024).toFixed(1)} KB · listo para analizar`}</span></>) : (<><strong className="text-[13px] text-[#0F172A]">Haz clic para seleccionar o arrastra tu archivo</strong><span className="mt-2 text-[11px] text-[#64748B]">El contenido se procesa localmente y se guarda en tu análisis</span></>)}
                      </div>
                      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#F1F5F9] pt-5">
                        <span className="text-[10px] leading-4 text-[#94A3B8]">Envía el documento directamente a n8n para análisis.</span>
                        <button className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-[#1E40AF] to-[#1D4ED8] px-4 py-2.5 text-[11px] font-bold text-white shadow-sm transition hover:shadow-md disabled:opacity-50" disabled={!file || parsing || saving} onClick={() => void saveDocument()} type="button">
                          {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Sparkles size={14} />} Analizar con n8n
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                    <div className="flex items-center justify-between border-b border-[#F1F5F9] px-7 py-5">
                      <div>
                        <div className="flex items-center gap-2.5"><FileCode2 size={18} className="text-[#1E40AF]" /><h2 className="text-[15px] font-bold text-[#0F172A]">{directResult ? "Resultado de n8n" : "Resumen informativo"}</h2></div>
                        <p className="mt-1 text-[12px] text-[#64748B]">{directResult ? "Respuesta directa del Webhook de n8n" : "Información del documento simplificada para lectura rápida"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-[11px] font-semibold text-[#0F172A] transition hover:bg-[#F8FAFC] disabled:opacity-40" disabled={!summary && !directResult} onClick={() => { directResult ? navigator.clipboard.writeText(JSON.stringify(directResult, null, 2)) : copySummary(); setNotice({ type: "success", text: "Copiado al portapapeles." }); }} type="button"><Clipboard size={13} /> Copiar</button>
                      </div>
                    </div>
                    <div className="min-h-[450px] bg-[#0F172A] px-7 py-7 text-[#E2E8F0] overflow-auto">
                      {directResult ? (
                        <pre className="text-[12px] font-mono whitespace-pre-wrap">{JSON.stringify(directResult, null, 2)}</pre>
                      ) : summary ? <SummaryView summary={summary} /> : (
                        <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                          <div className="mb-5 grid size-14 place-items-center rounded-full bg-[#1E293B] text-[#0EA5E9]"><FileCode2 size={24} /></div>
                          <h3 className="text-[15px] font-semibold text-[#E2E8F0]">Aquí aparecerá la información del documento</h3>
                          <p className="mt-2 max-w-xs text-[12px] leading-5 text-[#64748B]">Sube un PDF, CSV o archivo de texto para construir una lectura clara con título, puntos clave y secciones.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              )}
            </div>
          ) : null}
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-5">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <InfodexLogo size={20} />
              <span className="text-[11px] font-semibold text-[#64748B]">Infodex AI</span>
            </div>
            <p className="text-[11px] text-[#94A3B8]">Plataforma de Análisis Inteligente · {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────── */
/*  KPI Card                                                               */
/* ─────────────────────────────────────────────────────────────────────── */

function KPICard({ kpi }: { kpi: KPI }) {
  const trendIcons: Record<string, React.ReactNode> = {
    up: <TrendingUp size={14} className="text-[#16A34A]" />,
    down: <TrendingDown size={14} className="text-[#DC2626]" />,
    stable: <Minus size={14} className="text-[#64748B]" />,
  };
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-[#BFDBFE]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#64748B]">{kpi.label}</span>
        {kpi.trend && trendIcons[kpi.trend]}
      </div>
      <div className="text-[28px] font-extrabold tracking-tight text-[#0F172A]">{typeof kpi.value === "number" ? kpi.value.toLocaleString("es-ES") : kpi.value}</div>
      <div className="mt-2 flex items-center gap-2">
        <span className="rounded bg-[#EFF6FF] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#1E40AF]">{kpi.calculation}</span>
        {kpi.source_name && <span className="truncate text-[10px] text-[#94A3B8]">{kpi.source_name}</span>}
      </div>
    </div>
  );
}

function DataQualityRow({ issue }: { issue: DataQualityIssue }) {
  return (
    <div className="flex items-start gap-4 px-6 py-5">
      <div className="mt-0.5 shrink-0"><SeverityBadge severity={issue.severity} /></div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-[#0F172A]">{issue.description}</p>
        {issue.evidence && <p className="mt-1 text-[11px] text-[#64748B]"><span className="font-semibold">Evidencia:</span> {issue.evidence}</p>}
        {issue.field && <span className="mt-1.5 inline-block rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[10px] text-[#64748B]">{issue.field}</span>}
      </div>
    </div>
  );
}

function AIFindingCard({ finding }: { finding: AIFinding }) {
  const cfg: Record<string, { icon: React.ReactNode; bg: string; border: string }> = {
    trend: { icon: <TrendingUp size={16} />, bg: "bg-[#EFF6FF]", border: "border-[#BFDBFE]" },
    pattern: { icon: <Activity size={16} />, bg: "bg-[#F0FDF4]", border: "border-[#BBF7D0]" },
    anomaly: { icon: <Zap size={16} />, bg: "bg-[#FEF3C7]", border: "border-[#FDE68A]" },
    insight: { icon: <Lightbulb size={16} />, bg: "bg-[#EDE9FE]", border: "border-[#C4B5FD]" },
  };
  const c = cfg[finding.type] ?? cfg.insight;
  const labels: Record<string, string> = { trend: "Tendencia", pattern: "Patrón", anomaly: "Anomalía", insight: "Hallazgo" };
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]`}>
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-lg bg-white/60 p-1.5">{c.icon}</div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A]/60">{labels[finding.type] ?? finding.type}</span>
        {finding.confidence !== undefined && <span className="ml-auto rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">{Math.round(finding.confidence * 100)}% conf.</span>}
      </div>
      <p className="text-[13px] leading-relaxed text-[#0F172A]">{finding.description}</p>
      {finding.evidence_sources && finding.evidence_sources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {finding.evidence_sources.map((src, i) => <span key={i} className="inline-flex items-center gap-1 rounded-md bg-white/60 px-2 py-0.5 text-[10px] font-medium text-[#64748B]"><Link2 size={9} /> {src}</span>)}
        </div>
      )}
    </div>
  );
}

function ExecutiveReportSection({ report }: { report: ExecutiveReport }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-[#E0F2FE] p-7 shadow-[0_2px_8px_rgba(30,64,175,0.06)]">
        <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-[#1E40AF]"><Sparkles size={16} /> Síntesis Principal</h3>
        <p className="text-[14px] leading-relaxed text-[#0F172A]">{report.summary}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {([
          { title: "Posibles Necesidades", items: report.potential_needs, icon: <Lightbulb size={14} className="text-[#0284C7]" />, dot: "bg-[#0284C7]" },
          { title: "Información Adicional Necesaria", items: report.additional_info_needed, icon: <Search size={14} className="text-[#F59E0B]" />, dot: "bg-[#F59E0B]" },
          { title: "Preguntas para Investigar", items: report.questions_to_investigate, icon: <HelpCircle size={14} className="text-[#7C3AED]" />, dot: "bg-[#7C3AED]" },
        ] as const).map((section, idx) => (
          <div key={idx} className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
            <h4 className="mb-3 flex items-center gap-2 text-[12px] font-bold text-[#0F172A]">{section.icon} {section.title}</h4>
            {section.items.length > 0 ? (
              <ul className="space-y-2">{section.items.map((item, i) => <li key={i} className="flex gap-2.5 text-[12px] leading-5 text-[#334155]"><span className={`mt-2 size-1.5 shrink-0 rounded-full ${section.dot}`} />{item}</li>)}</ul>
            ) : <p className="text-[12px] text-[#94A3B8]">Sin datos disponibles</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryView({ summary }: { summary: DocumentSummary }) {
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-7 border-b border-[#1E293B] pb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-[#1E293B] px-2 py-1 font-mono text-[10px] uppercase text-[#0EA5E9]">{summary.type}</span>
          <span className="text-[10px] text-[#64748B]">{summary.pages ? `${summary.pages} página${summary.pages === 1 ? "" : "s"}` : "archivo"}</span>
          <span className="text-[10px] text-[#64748B]">{summary.wordCount.toLocaleString("es-ES")} palabras</span>
        </div>
        <h3 className="text-[24px] font-semibold leading-tight tracking-tight text-[#F1F5F9]">{summary.title}</h3>
      </div>
      {!summary.supported && <div className="mb-6 rounded-lg border border-[#92400E] bg-[#451A03]/30 px-4 py-3 text-[11px] text-[#FDE68A]">{summary.highlights[0]}</div>}
      {summary.highlights.length > 0 && (
        <div className="mb-7">
          <h4 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#0EA5E9]"><Sparkles size={14} /> Puntos clave</h4>
          <ul className="grid gap-2.5">{summary.highlights.map(item => <li className="flex gap-3 text-[12px] leading-5 text-[#CBD5E1]" key={item}><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#0EA5E9]" />{item}</li>)}</ul>
        </div>
      )}
      {summary.sections.length > 0 && (
        <div className="grid gap-5">{summary.sections.map(s => <article className="border-l-2 border-[#1E40AF] pl-4" key={s.heading}><h4 className="mb-1.5 text-[13px] font-semibold text-[#E2E8F0]">{s.heading}</h4><p className="text-[12px] leading-5 text-[#94A3B8]">{s.body}</p></article>)}</div>
      )}
    </div>
  );
}

export default App;
