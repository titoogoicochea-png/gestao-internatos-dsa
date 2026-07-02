import type { Paragraph as ParagraphT } from "docx";
import type { InformeConsolidado } from "@/lib/llm";

// Genera un documento Word (.docx) a partir de un informe (consolidado o ideas fuerza).
// `docx` se importa de forma diferida para no cargarlo en el bundle principal.
export async function informeADocx(opts: {
  tituloDoc: string;      // p.ej. "Consolidado por capítulo"
  subtitulo: string;      // p.ej. "Educación Básica · Workshop 1"
  resumenLabel: string;   // etiqueta del resumen general
  informe: InformeConsolidado;
}): Promise<Blob> {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import("docx");

  const kids: ParagraphT[] = [
    new Paragraph({ text: opts.tituloDoc, heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [new TextRun({ text: opts.subtitulo, italics: true, color: "567C8D" })],
      spacing: { after: 240 },
    }),
  ];

  if (opts.informe.resumenGeneral) {
    kids.push(
      new Paragraph({ children: [new TextRun({ text: opts.resumenLabel, bold: true })] }),
      new Paragraph({ text: opts.informe.resumenGeneral, spacing: { after: 200 } }),
    );
  }

  for (const s of opts.informe.secciones) {
    kids.push(new Paragraph({ text: s.titulo, heading: HeadingLevel.HEADING_2, spacing: { before: 260 } }));
    if (s.sintesis) {
      kids.push(new Paragraph({ children: [new TextRun({ text: s.sintesis, italics: true })] }));
    }
    for (const p of s.puntos) {
      kids.push(new Paragraph({ text: p, bullet: { level: 0 } }));
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children: kids }] });
  return Packer.toBlob(doc);
}

// Dispara la descarga de un Blob como archivo.
export function descargarBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
