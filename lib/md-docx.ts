// Conversor Markdown → Word (.docx) preservando el formato del documento:
// encabezados (#..####), negritas/itálicas, listas, listas numeradas, citas,
// separadores y tablas. `docx` se importa de forma diferida.

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  const { Table, TableRow, TableCell, Paragraph, WidthType, TextRun } = docx;
  const trs = rows.map((cells, ri) =>
    new TableRow({
      children: cells.map((c) =>
        new TableCell({
          children: [new Paragraph({ children: ri === 0 ? [new TextRun({ text: c, bold: true })] : inlineRuns(docx, c) })],
        })
      ),
    })
  );
  return new Table({ rows: trs, width: { size: 100, type: WidthType.PERCENTAGE } });
}

// Convierte un bloque de markdown en elementos docx (Paragraph / Table).
export function markdownToDocx(docx: any, md: string): any[] {
  const { Paragraph, HeadingLevel } = docx;
  const HEAD = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6];
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

    // Tabla (línea con | y la siguiente es separador)
    if (trimmed.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const rows: string[][] = [splitCells(trimmed)];
      i += 2; // saltar cabecera + separador
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
      out.push(new Paragraph({ children: inlineRuns(docx, h[2]), heading: HEAD[level - 1], spacing: { before: 220, after: 80 } }));
      i++;
      continue;
    }

    // Cita
    if (/^>\s?/.test(trimmed)) {
      const { TextRun } = docx;
      out.push(new Paragraph({ children: [new TextRun({ text: trimmed.replace(/^>\s?/, ""), italics: true, color: "334155" })], indent: { left: 480 }, spacing: { after: 120 } }));
      i++;
      continue;
    }

    // Lista con viñeta
    if (/^[-*+]\s+/.test(trimmed)) {
      out.push(new Paragraph({ children: inlineRuns(docx, trimmed.replace(/^[-*+]\s+/, "")), bullet: { level: 0 } }));
      i++;
      continue;
    }

    // Lista numerada → conserva el número como texto (evita numeración docx compleja)
    const ol = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (ol) {
      out.push(new Paragraph({ children: inlineRuns(docx, `${ol[1]}. ${ol[2]}`), indent: { left: 360 }, spacing: { after: 40 } }));
      i++;
      continue;
    }

    // Párrafo normal
    out.push(new Paragraph({ children: inlineRuns(docx, trimmed), spacing: { after: 120 } }));
    i++;
  }

  return out;
}

type DocOpts = { titulo: string; subtitulo: string; docs: { markdown: string }[] };

async function construirDocumento(opts: DocOpts) {
  const docx = await import("docx");
  const { Document, Paragraph, HeadingLevel, TextRun, PageBreak } = docx as any;

  const children: any[] = [
    new Paragraph({ text: opts.titulo, heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: opts.subtitulo, italics: true, color: "567C8D" })], spacing: { after: 240 } }),
  ];
  opts.docs.forEach((d, idx) => {
    if (idx > 0) children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(...markdownToDocx(docx, d.markdown));
  });

  return { docx, doc: new Document({ sections: [{ properties: {}, children }] }) };
}

// Documento completo (varios capítulos) → Blob .docx (cliente).
export async function documentoADocx(opts: DocOpts): Promise<Blob> {
  const { docx, doc } = await construirDocumento(opts);
  return (docx as any).Packer.toBlob(doc);
}

// Documento completo → base64 (servidor: server action).
export async function documentoADocxBase64(opts: DocOpts): Promise<string> {
  const { docx, doc } = await construirDocumento(opts);
  return (docx as any).Packer.toBase64String(doc);
}
