import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import * as mammoth from "mammoth";

GlobalWorkerOptions.workerSrc = workerUrl;

export type DocumentSection = {
  heading: string;
  body: string;
};

export type DocumentSummary = {
  title: string;
  type: string;
  pages: number;
  wordCount: number;
  highlights: string[];
  sections: DocumentSection[];
  text: string;
  supported: boolean;
};

function cleanLine(line: string) {
  return line
    .replace(/\s+/g, " ")
    .replace(/^[•*-]\s*/, "")
    .trim();
}

function buildSummary(
  text: string,
  fileName: string,
  type: string,
  pages = 1,
): DocumentSummary {
  const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const title = lines[0]?.slice(0, 110) || fileName.replace(/\.[^.]+$/, "");
  const highlights = lines.filter((line) => line.length > 32).slice(0, 5);
  const sections: DocumentSection[] = [];
  let currentHeading = "Vista general";
  let currentBody: string[] = [];

  const flush = () => {
    if (currentBody.length > 0) {
      sections.push({
        heading: currentHeading,
        body: currentBody.join(" ").slice(0, 560),
      });
    }
  };

  for (const line of lines.slice(1)) {
    const looksLikeHeading =
      line.length < 80 &&
      (/^[A-ZÁÉÍÓÚÑ0-9\s-]+$/.test(line) || /:$/.test(line));
    if (looksLikeHeading) {
      flush();
      currentHeading = line.replace(/:$/, "");
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  flush();

  return {
    title,
    type,
    pages,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    highlights,
    sections: sections.slice(0, 6),
    text: text.slice(0, 30000),
    supported: true,
  };
}

async function extractPdf(file: File) {
  const data = new Uint8Array(await file.arrayBuffer());
  const document = await getDocument({ data }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(
      content.items.map((item) => ("str" in item ? item.str : "")).join(" "),
    );
  }
  return { text: pages.join("\n\n"), pages: document.numPages };
}

export async function parseDocument(file: File): Promise<DocumentSummary> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (file.type === "application/pdf" || extension === "pdf") {
    const result = await extractPdf(file);
    return buildSummary(result.text, file.name, "PDF", result.pages);
  }

  if (
    ["txt", "csv", "json", "md"].includes(extension) ||
    file.type.startsWith("text/")
  ) {
    const text = await file.text();
    const normalized =
      extension === "json" ? JSON.stringify(JSON.parse(text), null, 2) : text;
    return buildSummary(normalized, file.name, extension.toUpperCase(), 1);
  }

  if (extension === "docx") {
    const result = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer(),
    });
    return buildSummary(result.value, file.name, "DOCX", 1);
  }

  return {
    title: file.name,
    type: extension.toUpperCase() || "ARCHIVO",
    pages: 0,
    wordCount: 0,
    highlights: [
      "Este formato quedó registrado como fuente, pero necesita un procesador externo para extraer su texto.",
    ],
    sections: [],
    text: "",
    supported: false,
  };
}
