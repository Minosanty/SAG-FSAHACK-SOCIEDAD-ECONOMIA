import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Activity, AlertCircle, Check, Clipboard, Download, FileArchive, FileCode2, FileText, LoaderCircle, Plus, Sparkles, UploadCloud, X } from "lucide-react";
import { Analysis, createAnalysis, createSource, getAnalysis, getApiBaseUrl } from "./api";
import { DocumentSummary, parseDocument } from "./documentParser";

const acceptedFiles = ".pdf,.txt,.csv,.json,.md,.docx";

function formatDate(value?: string) {
    if (!value) return "Sin fecha";
    return new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function getSourceType(fileName: string) {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return "pdf";
    if (extension === "csv") return "csv";
    if (extension === "xlsx" || extension === "xls") return "excel";
    return "text";
}

function summaryText(summary: DocumentSummary) {
    return [
        summary.title,
        "",
        ...summary.highlights.map((highlight) => `- ${highlight}`),
        "",
        ...summary.sections.map((section) => `${section.heading}\n${section.body}`),
    ].join("\n");
}

function App() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [analysisId, setAnalysisId] = useState(() => localStorage.getItem("infodex-analysis-id") ?? "");
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [summary, setSummary] = useState<DocumentSummary | null>(null);
    const [parsing, setParsing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", description: "" });

    async function loadWorkspace(id = analysisId) {
        if (!id.trim()) return;
        try {
            const analysisData = await getAnalysis(id.trim());
            setAnalysis(analysisData);
            setAnalysisId(id.trim());
            localStorage.setItem("infodex-analysis-id", id.trim());
        } catch (error) {
            setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo conectar con el backend." });
        }
    }

    useEffect(() => { if (analysisId) void loadWorkspace(analysisId); }, []);

    async function readFile(nextFile: File) {
        setFile(nextFile);
        setParsing(true);
        setNotice(null);
        try {
            setSummary(await parseDocument(nextFile));
        } catch (error) {
            setSummary(null);
            setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo leer el documento." });
        } finally { setParsing(false); }
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const nextFile = event.target.files?.[0];
        if (nextFile) void readFile(nextFile);
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setDragging(false);
        const nextFile = event.dataTransfer.files[0];
        if (nextFile) void readFile(nextFile);
    }

    async function saveDocument() {
        if (!file || !summary) return;
        if (!analysis) {
            setNotice({ type: "error", text: "Crea o abre un análisis antes de guardar el documento." });
            return;
        }
        setSaving(true);
        try {
            await createSource(analysis.analysis_id, {
                name: file.name,
                type: getSourceType(file.name),
                location: file.name,
                content: { fileName: file.name, mimeType: file.type, size: file.size, summary },
            });
            await loadWorkspace(analysis.analysis_id);
            setNotice({ type: "success", text: "Documento guardado como fuente en el análisis." });
        } catch (error) {
            setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo guardar el documento." });
        } finally { setSaving(false); }
    }

    async function handleCreate(event: FormEvent) {
        event.preventDefault();
        try {
            const created = await createAnalysis(createForm);
            setCreateForm({ name: "", description: "" });
            setShowCreate(false);
            await loadWorkspace(created.analysis_id);
            setNotice({ type: "success", text: "Análisis creado. Ya puedes guardar documentos en él." });
        } catch (error) {
            setNotice({ type: "error", text: error instanceof Error ? error.message : "No se pudo crear el análisis." });
        }
    }

    async function copySummary() {
        if (!summary) return;
        await navigator.clipboard.writeText(summaryText(summary));
        setNotice({ type: "success", text: "Resumen copiado al portapapeles." });
    }

    function downloadSummary() {
        if (!summary) return;
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([summaryText(summary)], { type: "text/plain;charset=utf-8" }));
        link.download = `${summary.title.replace(/[^a-z0-9áéíóúñ]+/gi, "-").toLowerCase() || "resumen-documento"}.txt`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    return (
        <div className="min-h-screen bg-[#e8f1f5] text-[#d8e7ed]">
            <header className="flex h-20 items-center justify-between border-b border-[#1c344d] bg-[#0c1c2b] px-[clamp(24px,5vw,80px)] shadow-[0_2px_0_rgba(4,16,28,.18)]"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-[11px] bg-[#9ecbd7] text-[#102b40] shadow-[0_5px_12px_rgba(15,30,56,.17)]"><FileText size={21} /></div><div><div className="flex items-center gap-2 text-[17px] font-extrabold tracking-[-.6px] text-[#e7f3f6]">SAG Context <span className="rounded border border-[#46617b] bg-[#18334a] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#a9c7d8]">SAG</span></div><p className="text-[12px] text-[#91adbd]">Contexto documental inteligente</p></div></div></header>

            <main className="mx-auto max-w-347.5 px-[clamp(18px,5vw,80px)] pb-14 pt-9"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="mb-2 font-mono text-[10px] uppercase tracking-[1.4px] text-[#7890ab]">Espacio de trabajo / lectura asistida</p><h1 className="text-[25px] font-bold tracking-[-.8px] text-[#18334b]">Organiza la información de tus documentos</h1></div><div className="flex items-center gap-2"><span className="hidden text-[11px] text-[#71839a] sm:inline">{analysis ? `Análisis: ${analysis.name}` : "Sin análisis conectado"}</span><button className="inline-flex items-center gap-2 rounded-lg border border-[#3c5d73] bg-[#17334a] px-3 py-2 text-[11px] font-bold text-[#c8e2ea] shadow-sm hover:border-[#77aec3]" onClick={() => setShowCreate(true)} type="button"><Plus size={15} /> Nuevo análisis</button></div></div>
                {notice && <div className={`mb-5 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[11px] ${notice.type === "success" ? "border-[#b9e7d8] bg-[#effbf6] text-[#287e63]" : "border-[#f1c5c0] bg-[#fff6f5] text-[#a34e49]"}`}><span>{notice.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}</span>{notice.text}<button className="ml-auto" onClick={() => setNotice(null)} title="Cerrar" type="button"><X size={15} /></button></div>}
                <div className="grid items-start gap-7 lg:grid-cols-[minmax(340px,.88fr)_minmax(0,1.22fr)]"><section className="space-y-6"><div className="rounded-[14px] border border-[#c4d7e3] bg-[#fafdff] p-7 shadow-[0_7px_20px_rgba(50,79,107,.06)]"><div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2.5"><span className="text-[#4f9bb5]"><UploadCloud size={19} /></span><h2 className="text-[15px] font-bold text-[#18334b]">Carga de documento</h2></div><span className="text-[10px] text-[#91a2b7]">PDF, DOCX, TXT, CSV, JSON</span></div><input ref={inputRef} className="hidden" type="file" accept={acceptedFiles} onChange={handleFileChange} /><div className={`flex min-h-49.5 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 text-center transition ${dragging ? "border-[#6da1bc] bg-[#eff7fa]" : "border-[#cbdbe8] bg-[#fbfcfe] hover:border-[#9ab9cc] hover:bg-[#f7fafc]"}`} onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={handleDrop}><div className="mb-4 grid size-14 place-items-center rounded-full bg-[#f0f5f9] text-[#426987] ring-8 ring-[#f8fafc]">{parsing ? <LoaderCircle size={25} className="animate-spin" /> : <FileArchive size={25} />}</div>{file ? <><strong className="max-w-full truncate text-[13px] text-[#173b56]">{file.name}</strong><span className="mt-2 text-[11px] text-[#6f8ca0]">{parsing ? "Extrayendo información..." : `${(file.size / 1024).toFixed(1)} KB · listo para analizar`}</span></> : <><strong className="text-[13px] text-[#1b3d59]">Haz clic para seleccionar o arrastra tu archivo</strong><span className="mt-2 text-[11px] text-[#6d879a]">El contenido se procesa localmente y se guarda en tu análisis</span></>}</div><div className="mt-5 flex items-center justify-between gap-3 border-t border-[#dfeaf0] pt-5"><span className="text-[10px] leading-4 text-[#8a9aae]">Los PDF se convierten en texto estructurado automáticamente.</span><button className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#b9dbe4] px-3.5 py-2.5 text-[11px] font-bold text-[#17364c] transition hover:bg-[#cddce8] disabled:cursor-not-allowed disabled:opacity-50" disabled={!summary || parsing || saving} onClick={() => void saveDocument()} type="button">{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />} Guardar documento</button></div></div></section>

                    <section className="overflow-hidden rounded-[14px] border border-[#c4d7e3] bg-[#fafdff] shadow-[0_7px_20px_rgba(50,79,107,.06)]"><div className="flex items-center justify-between border-b border-[#dfeaf0] px-7 py-6"><div><div className="flex items-center gap-2.5"><FileCode2 size={20} className="text-[#315c7e]" /><h2 className="text-[16px] font-bold text-[#18334b]">Resumen informativo</h2></div><p className="mt-1 text-[12px] text-[#7793a5]">Información del documento simplificada y ordenada para lectura rápida</p></div><div className="flex gap-2"><button className="inline-flex items-center gap-2 rounded-lg border border-[#d4e3eb] bg-[#f5fafc] px-3 py-2 text-[11px] font-bold text-[#315a72] hover:bg-[#f2f6f9] disabled:opacity-40" disabled={!summary} onClick={() => void copySummary()} type="button"><Clipboard size={14} /> Copiar resumen</button><button className="inline-flex items-center gap-2 rounded-lg border border-[#d4e3eb] bg-[#f5fafc] px-3 py-2 text-[11px] font-bold text-[#315a72] hover:bg-[#f2f6f9] disabled:opacity-40" disabled={!summary} onClick={downloadSummary} type="button"><Download size={14} /> Descargar</button></div></div><div className="min-h-140 bg-[#0d1d30] px-8 py-8 text-[#d9eaf0] [@media(max-width:590px)]:px-5">{summary ? <SummaryView summary={summary} /> : <div className="flex min-h-120 flex-col items-center justify-center text-center"><div className="mb-5 grid size-14 place-items-center rounded-full bg-[#173450] text-[#9cc7d6]"><FileCode2 size={25} /></div><h3 className="text-[15px] font-semibold text-[#c7dce5]">Aquí aparecerá la información del documento</h3><p className="mt-2 max-w-97.5 text-[12px] leading-5 text-[#8eabbc]">Sube un PDF, CSV o archivo de texto para construir una lectura clara con título, puntos clave y secciones.</p></div>}</div></section></div>
            </main>
            {showCreate && <Modal title="Crear análisis" onClose={() => setShowCreate(false)}><form onSubmit={handleCreate}><label className="mt-5 block text-[11px] text-[#344d68]">Nombre del análisis<input className={inputClass} required value={createForm.name} onChange={(event) => setCreateForm({ ...createForm, name: event.target.value })} placeholder="Ej. Documentos de proyecto" /></label><label className="mt-5 block text-[11px] text-[#344d68]">Descripción<textarea className={`${inputClass} resize-y`} rows={3} value={createForm.description} onChange={(event) => setCreateForm({ ...createForm, description: event.target.value })} placeholder="Qué documentos vas a organizar..." /></label><div className="mt-6 flex justify-end gap-2"><button className="rounded-lg border border-[#d8e3ed] px-3 py-2 text-[11px] font-bold text-[#526980]" onClick={() => setShowCreate(false)} type="button">Cancelar</button><button className="inline-flex items-center gap-2 rounded-lg bg-[#102b45] px-4 py-2.5 text-[11px] font-bold text-white" type="submit"><Plus size={15} /> Crear análisis</button></div></form></Modal>}
        </div>
    );
}

function SummaryView({ summary }: { summary: DocumentSummary }) {
    return <div className="mx-auto max-w-190"><div className="mb-7 border-b border-[#2c3d56] pb-6"><div className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded bg-[#29425f] px-2 py-1 font-mono text-[10px] uppercase text-[#a8c5da]">{summary.type}</span><span className="text-[10px] text-[#7892aa]">{summary.pages ? `${summary.pages} página${summary.pages === 1 ? "" : "s"}` : "archivo"}</span><span className="text-[10px] text-[#7892aa]">{summary.wordCount.toLocaleString("es-ES")} palabras</span></div><h3 className="text-[24px] font-semibold leading-tight tracking-[-.7px] text-[#f0f5f8]">{summary.title}</h3></div>{!summary.supported && <div className="mb-6 rounded-lg border border-[#8c7047] bg-[#332b20] px-4 py-3 text-[11px] text-[#e2c99e]">{summary.highlights[0]}</div>}{summary.highlights.length > 0 && <div className="mb-7"><h4 className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.2px] text-[#91c3d2]"><Sparkles size={14} /> Puntos clave</h4><ul className="grid gap-2.5">{summary.highlights.map((item) => <li className="flex gap-3 text-[12px] leading-5 text-[#c1d5df]" key={item}><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#83b5c9]" />{item}</li>)}</ul></div>}{summary.sections.length > 0 && <div className="grid gap-5">{summary.sections.map((section) => <article className="border-l border-[#40627d] pl-4" key={section.heading}><h4 className="mb-1.5 text-[13px] font-semibold text-[#e0eef2]">{section.heading}</h4><p className="text-[12px] leading-5 text-[#9bb6c6]">{section.body}</p></article>)}</div>}</div>;
}

const inputClass = "mt-2 w-full rounded-lg border border-[#c5d9e4] bg-[#fafdff] px-3 py-2.5 text-[11px] text-[#20445e] outline-none placeholder:text-[#9aabbc] focus:border-[#5b9eb6] focus:ring-4 focus:ring-[#cfeaf1]";

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    return <div className="fixed inset-0 z-20 grid place-items-center bg-[#071a2b]/60 p-5" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="w-full max-w-107.5 rounded-xl border border-[#dce5ee] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="mb-1 font-mono text-[10px] uppercase tracking-[1.3px] text-[#8ca0b3]">SAG Context</p><h2 className="text-xl font-bold text-[#142942]">{title}</h2></div><button className="text-[#71859a]" onClick={onClose} title="Cerrar" type="button"><X size={18} /></button></div>{children}</div></div>;
}

export default App;






