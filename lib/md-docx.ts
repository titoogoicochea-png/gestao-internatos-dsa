// Conversor Markdown → Word (.docx) replicando la FORMA y ESTILO del documento
// original (Referencial v8): Arial 11pt, A4, márgenes 2.5cm; título de capítulo en
// blanco sobre barra azul marino (1F3864); subtítulo en blanco sobre barra azul
// (2E75B6); secciones en azul marino negrita (estilos "Título"); citas en cursiva
// sangrada. Solo cambia el texto (reconstruido); el estilo imita al original.

/* eslint-disable @typescript-eslint/no-explicit-any */

const NAVY = "1F3864";   // barra del título de capítulo / color de encabezados
const BLUE = "2E75B6";   // barra del subtítulo
const WHITE = "FFFFFF";

function inlineRuns(docx: any, text: string): any[] {
  const { TextRun } = docx;
  const runs: any[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) runs.push(new TextRun({ text: text.slice(last, m.index) }));
    if (m[2] !== undefined) runs.push(new TextRun({ text: m[2], bold: true }));
    else if (m[3] !== undefined) runs.push(new TextRun({ text: m[3], italics: true }));
    else if (m[4] !== undefined) runs.push(new TextRun({ text: m[4], font: "Courier New" }));
    last = m.index + m[0].length;
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last) }));
  if (runs.length === 0) runs.push(new TextRun({ text: "" }));
  return runs;
}

function splitCells(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

const isTableSep = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

function buildTable(docx: any, rows: string[][]): any {
  const { Table, TableRow, TableCell, Paragraph, WidthType, TextRun, ShadingType } = docx;
  const trs = rows.map((cells, ri) =>
    new TableRow({
      tableHeader: ri === 0,
      children: cells.map((c) =>
        new TableCell({
          shading: ri === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: NAVY } : undefined,
          children: [new Paragraph({ children: ri === 0 ? [new TextRun({ text: c, bold: true, color: WHITE })] : inlineRuns(docx, c) })],
        })
      ),
    })
  );
  return new Table({ rows: trs, width: { size: 100, type: WidthType.PERCENTAGE } });
}

// Banda de color con texto blanco centrado (título / subtítulo de capítulo).
function banner(docx: any, text: string, fill: string, halfPt: number): any {
  const { Paragraph, TextRun, AlignmentType, ShadingType } = docx;
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, color: "auto", fill },
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: WHITE, size: halfPt })],
  });
}

// Encabezado de sección (azul marino, negrita) — estilo "Título N".
function heading(docx: any, text: string, halfPt: number): any {
  const { Paragraph, TextRun } = docx;
  return new Paragraph({
    spacing: { before: 220, after: 60 },
    children: [new TextRun({ text, bold: true, color: NAVY, size: halfPt })],
  });
}

export function markdownToDocx(docx: any, md: string): any[] {
  const { Paragraph, TextRun } = docx;
  const out: any[] = [];
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "") { i++; continue; }

    // Separador horizontal
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      out.push(new Paragraph({ thematicBreak: true }));
      i++;
      continue;
    }

    // Tabla
    if (trimmed.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const rows: string[][] = [splitCells(trimmed)];
      i += 2;
      while (i < lines.length && lines[i].trim().includes("|") && lines[i].trim() !== "") {
        rows.push(splitCells(lines[i].trim()));
        i++;
      }
      out.push(buildTable(docx, rows));
      continue;
    }

    // Encabezados
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].replace(/\*\*/g, "");
      if (level === 1) out.push(banner(docx, text, NAVY, 28));        // Capítulo — barra azul marino, blanco 14pt
      else if (level === 2) out.push(banner(docx, text, BLUE, 24));   // Subtítulo — barra azul, blanco 12pt
      else if (level === 3) out.push(heading(docx, text, 24));         // Sección 1.1 — azul marino 12pt
      else if (level === 4) out.push(heading(docx, text, 23));         // 1.2.1 — azul marino 11.5pt
      else out.push(heading(docx, text, 22));
      i++;
      continue;
    }

    // Cita
    if (/^>\s?/.test(trimmed)) {
      out.push(new Paragraph({
        children: [new TextRun({ text: trimmed.replace(/^>\s?/, ""), italics: true, color: "3B3B3B" })],
        indent: { left: 567 },
        spacing: { after: 120, line: 276, lineRule: "auto" },
      }));
      i++;
      continue;
    }

    // Lista con viñeta
    if (/^[-*+]\s+/.test(trimmed)) {
      out.push(new Paragraph({ children: inlineRuns(docx, trimmed.replace(/^[-*+]\s+/, "")), bullet: { level: 0 }, spacing: { after: 60, line: 276, lineRule: "auto" } }));
      i++;
      continue;
    }

    // Lista numerada (conserva el número como texto)
    const ol = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (ol) {
      out.push(new Paragraph({ children: inlineRuns(docx, `${ol[1]}. ${ol[2]}`), indent: { left: 360 }, spacing: { after: 60, line: 276, lineRule: "auto" } }));
      i++;
      continue;
    }

    // Párrafo normal
    out.push(new Paragraph({ children: inlineRuns(docx, trimmed), spacing: { after: 160, line: 276, lineRule: "auto" } }));
    i++;
  }

  return out;
}

export type Portada = {
  organizacion: string;   // DIVISÃO SUL-AMERICANA
  departamento: string;   // Departamento de Educação
  titulo: string;         // REFERENCIAL PARA A GESTÃO DE INTERNATOS ADVENTISTAS DA DIVISÃO SUL-AMERICANA
  nivel: string;          // Educação Básica
  cita: string;           // "O internato é uma comunidade formativa..."
  anio: string;           // 2026
};
type DocOpts = { portada: Portada; docs: { markdown: string }[] };

async function construirDocumento(opts: DocOpts) {
  const docx = await import("docx");
  const { Document, Paragraph, TextRun, PageBreak, AlignmentType } = docx as any;
  const p = opts.portada;
  const C = AlignmentType.CENTER;

  // Portada replicando el documento original.
  const portada: any[] = [
    new Paragraph({ spacing: { before: 1600 } }),
    new Paragraph({ alignment: C, spacing: { after: 80 }, children: [new TextRun({ text: p.organizacion, bold: true, color: NAVY, size: 32 })] }),
    new Paragraph({ alignment: C, spacing: { after: 700 }, children: [new TextRun({ text: p.departamento, color: BLUE, size: 26 })] }),
    new Paragraph({ alignment: C, spacing: { after: 160, line: 360, lineRule: "auto" }, children: [new TextRun({ text: p.titulo, bold: true, color: NAVY, size: 48 })] }),
    new Paragraph({ alignment: C, spacing: { after: 900 }, children: [new TextRun({ text: p.nivel, color: BLUE, size: 28 })] }),
    new Paragraph({ alignment: C, spacing: { after: 900 }, children: [new TextRun({ text: `"${p.cita}"`, italics: true, size: 22 })] }),
    new Paragraph({ alignment: C, children: [new TextRun({ text: p.anio, color: "404040", size: 24 })] }),
    new Paragraph({ children: [new PageBreak()] }),
  ];

  const children: any[] = [...portada];
  opts.docs.forEach((d, idx) => {
    if (idx > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(...markdownToDocx(docx, d.markdown));
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 22 },                        // Arial 11pt
          paragraph: { spacing: { line: 276, lineRule: "auto", after: 160 } },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },                   // A4
          margin: { top: 1417, right: 1417, bottom: 1417, left: 1417 }, // 2.5 cm
        },
      },
      children,
    }],
  });
  return { docx, doc };
}

export async function documentoADocx(opts: DocOpts): Promise<Blob> {
  const { docx, doc } = await construirDocumento(opts);
  return (docx as any).Packer.toBlob(doc);
}

export async function documentoADocxBase64(opts: DocOpts): Promise<string> {
  const { docx, doc } = await construirDocumento(opts);
  return (docx as any).Packer.toBase64String(doc);
}
