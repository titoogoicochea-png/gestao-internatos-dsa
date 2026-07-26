// Conversor Markdown → Word (.docx) replicando la FORMA y ESTILO del documento
// original (Referencial v8): Arial 11pt, A4, márgenes 2.5cm; título de capítulo en
// blanco sobre barra azul marino (1F3864); subtítulo en blanco sobre barra azul
// (2E75B6); secciones en azul marino negrita; citas en cursiva sangrada.
//
// Tablas (Anexos B y C) replicando el instrumento original: cuerpo en Arial 8pt,
// encabezado blanco sobre azul (2E75B6) repetido en cada página, filas cebra
// (blanco / EBF3FB), bordes gris claro (CCCCCC), fila de subtotal en azul marino,
// anchos de columna proporcionales al contenido y tabla centrada en la página.

/* eslint-disable @typescript-eslint/no-explicit-any */

const NAVY = "1F3864";   // barra de capítulo / dimensión / fila de subtotal
const BLUE = "2E75B6";   // barra de subtítulo / encabezado de tabla
const WHITE = "FFFFFF";
const ZEBRA = "EBF3FB";  // fila alterna (igual que el original)
const GRID = "CCCCCC";   // borde de celda
const NOTE = "F2F7FC";   // recuadro de nota

// A4 menos márgenes de 2,5 cm → ancho útil para las tablas (twips).
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = 1417;
const ANCHO_VERTICAL = PAGE_W - MARGIN * 2;
const ANCHO_HORIZONTAL = PAGE_H - MARGIN * 2;

// Ancho útil de la sección que se está convirtiendo. El Anexo C, por tener once
// columnas, se compone en horizontal; el resto del documento, en vertical.
let CONTENT_W = ANCHO_VERTICAL;

type Base = { size?: number; bold?: boolean; color?: string; italics?: boolean };

function inlineRuns(docx: any, text: string, base: Base = {}): any[] {
  const { TextRun } = docx;
  const runs: any[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) runs.push(new TextRun({ ...base, text: text.slice(last, m.index) }));
    if (m[2] !== undefined) runs.push(new TextRun({ ...base, text: m[2], bold: true }));
    else if (m[3] !== undefined) runs.push(new TextRun({ ...base, text: m[3], italics: true }));
    else if (m[4] !== undefined) runs.push(new TextRun({ ...base, text: m[4], font: "Courier New" }));
    last = m.index + m[0].length;
  }
  if (last < text.length) runs.push(new TextRun({ ...base, text: text.slice(last) }));
  if (runs.length === 0) runs.push(new TextRun({ ...base, text: "" }));
  return runs;
}

function splitCells(line: string): string[] {
  let s = line.trim();
  if (s.startsWith("|")) s = s.slice(1);
  if (s.endsWith("|")) s = s.slice(0, -1);
  return s.split("|").map((c) => c.trim());
}

const isTableSep = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

const plain = (s: string) => s.replace(/\*/g, "").trim();

// ── Tablas ───────────────────────────────────────────────────────────────────

// Peso relativo de cada columna, para repartir el ancho como en el original
// (Nº, puntos y casillas estrechos; Criterios y Detalle anchos).
function colWeight(header: string): number {
  const h = plain(header).toLowerCase();
  if (/^n[ºo°]?$/.test(h)) return 1.2;
  if (/^(nivel de logro|nível de atendimento)$/.test(h)) return 5.0;  // las cuatro opciones
  if (/^(puntaje|pontuação)\s+(máximo|máxima|obtenido|obtida)$/.test(h)) return 2.0;
  if (/^observaci[óo]n(es)?$|^observaç[ãa]o(es|ões)?$/.test(h)) return 3.0;
  if (/^(pts|puntos|pontos)$/.test(h)) return 1.25;
  if (/^(ap|aa|pa|na|a)$/.test(h)) return 1.6;
  if (/crit[eé]rio/.test(h)) return 4.2;
  if (/evid[eê]ncia/.test(h)) return 3.7;
  if (/detal/.test(h)) return 4.4;
  if (/documento/.test(h)) return 3.4;
  return 3;
}

// El instrumento original abrevia "Puntos" como "Pts" en la columna estrecha.
// Los encabezados de puntaje máximo/obtenido se muestran completos (su columna
// es más ancha y admite dos líneas).
function abrevHeader(text: string): string {
  return /^(puntos|pontos)$/i.test(plain(text)) ? "**Pts**" : text;
}

function cellBorders(docx: any) {
  const { BorderStyle } = docx;
  const b = { style: BorderStyle.SINGLE, size: 4, color: GRID };
  return { top: b, bottom: b, left: b, right: b };
}

function tCell(
  docx: any,
  text: string,
  opts: { fill?: string; align?: any; base?: Base; span?: number; width?: number; tight?: boolean }
): any {
  const { TableCell, Paragraph, ShadingType, WidthType, VerticalAlign } = docx;
  const pad = opts.tight ? 30 : 80;   // columnas estrechas con menos margen interno
  return new TableCell({
    columnSpan: opts.span,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { type: ShadingType.CLEAR, color: "auto", fill: opts.fill } : undefined,
    borders: cellBorders(docx),
    margins: { top: 30, bottom: 30, left: pad, right: pad },
    verticalAlign: VerticalAlign.TOP,
    children: [
      new Paragraph({
        alignment: opts.align,
        spacing: { before: 20, after: 20, line: 240, lineRule: "auto" },
        children: inlineRuns(docx, text, opts.base ?? {}),
      }),
    ],
  });
}

function buildTable(docx: any, rows: string[][]): any {
  const { Table, TableRow, WidthType, AlignmentType, TableLayoutType } = docx;

  const headers = rows[0] ?? [];
  const nCols = Math.max(...rows.map((r) => r.length));
  // Tablas anchas (instrumento de acreditación) en 8pt; el resto en 9pt.
  const size = nCols >= 6 ? 16 : 18;

  const weights = Array.from({ length: nCols }, (_, i) => colWeight(headers[i] ?? ""));
  const wSum = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => Math.round((CONTENT_W * w) / wSum));
  const isNarrow = (i: number) => weights[i] <= 1.2;

  const C = AlignmentType.CENTER;
  const L = AlignmentType.LEFT;

  let dataIdx = 0;
  const trs = rows.map((cells, ri) => {
    const padded = Array.from({ length: nCols }, (_, i) => cells[i] ?? "");
    const flat = padded.join(" ");

    // Encabezado: blanco sobre azul; se repite al pasar de página.
    if (ri === 0) {
      return new TableRow({
        tableHeader: true,
        children: padded.map((c, i) =>
          tCell(docx, abrevHeader(c), {
            fill: BLUE,
            align: C,
            width: widths[i],
            tight: isNarrow(i),
            base: { size, bold: true, color: WHITE },
          })
        ),
      });
    }

    // Fila de subtotal / total: blanco sobre azul marino.
    if (/\bSUBTOTAL\b|\bTOTAL\b/i.test(flat)) {
      return new TableRow({
        children: padded.map((c, i) =>
          tCell(docx, c, {
            fill: NAVY,
            align: isNarrow(i) ? C : L,
            width: widths[i],
            tight: isNarrow(i),
            base: { size, bold: true, color: WHITE },
          })
        ),
      });
    }

    // Filas de datos: cebra blanco / EBF3FB, como el original.
    const fill = dataIdx++ % 2 === 1 ? ZEBRA : WHITE;
    return new TableRow({
      children: padded.map((c, i) => {
        // Casilla de conformidad sola ("☐") o con un único valor ("☐ 12-14").
        // La celda de "Nivel de logro" lleva las cuatro opciones y va alineada
        // a la izquierda, porque ocupa varias líneas.
        const soloCasilla = /^[☐☑]$/.test(plain(c));
        const variasOpciones = (plain(c).match(/[☐☑]/g) ?? []).length > 1;
        const box = !variasOpciones && (soloCasilla || /^[☐☑]\s+\S/.test(plain(c)));
        const strong = i === 0 || isNarrow(i);           // Nº y puntos en negrita
        return tCell(docx, c, {
          fill,
          align: isNarrow(i) || box ? C : L,
          width: widths[i],
          tight: isNarrow(i),
          base: { size: soloCasilla ? 20 : size, bold: strong && !box },
        });
      }),
    });
  });

  return new Table({
    rows: trs,
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
  });
}

// Bloque "Meta de vivencia percibida (ILE/IVC)": título a todo el ancho + filas.
function buildMetaTable(docx: any, rows: string[][]): any {
  const { Table, TableRow, WidthType, AlignmentType, TableLayoutType } = docx;
  const widths = [Math.round(CONTENT_W * 0.14), Math.round(CONTENT_W * 0.86)];
  const C = AlignmentType.CENTER;
  const L = AlignmentType.LEFT;

  const trs: any[] = [
    new TableRow({
      children: [
        tCell(docx, rows[0][0], { fill: BLUE, align: L, span: 2, base: { size: 16, bold: true, color: WHITE } }),
      ],
    }),
  ];
  rows.slice(1).forEach((r, i) => {
    const fill = i % 2 === 1 ? ZEBRA : WHITE;
    trs.push(
      new TableRow({
        children: [
          tCell(docx, r[0] ?? "", { fill, align: C, width: widths[0], base: { size: 16, bold: true } }),
          tCell(docx, r[1] ?? "", { fill, align: L, width: widths[1], base: { size: 16, italics: true, color: "3B3B3B" } }),
        ],
      })
    );
  });

  return new Table({
    rows: trs,
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
  });
}

// ── Índice navegable ─────────────────────────────────────────────────────────

export type TocEntry = { level: number; text: string; anchor: string };
type Ctx = { toc: TocEntry[]; seq: number } | undefined;

// Registra una entrada del índice y devuelve el nombre del marcador al que
// apuntará el hipervínculo.
function anclar(ctx: Ctx, level: number, text: string): string | undefined {
  if (!ctx) return undefined;
  ctx.seq += 1;
  const anchor = `sec${ctx.seq}`;
  ctx.toc.push({ level, text, anchor });
  return anchor;
}

// Generador de identificadores de marcador. Se usa BookmarkStart/BookmarkEnd en
// lugar de Bookmark porque este último emite siempre w:id="1" (ids duplicados).
let bmGen: (() => number) | undefined;
function bookmarkId(docx: any): number {
  if (!bmGen) bmGen = docx.bookmarkUniqueNumericIdGen();
  return bmGen!();
}

// Envuelve el texto en un marcador cuando la línea va al índice.
function marcado(docx: any, run: any, anchor?: string): any[] {
  if (!anchor) return [run];
  const { BookmarkStart, BookmarkEnd } = docx;
  const id = bookmarkId(docx);
  return [new BookmarkStart(anchor, id), run, new BookmarkEnd(id)];
}

type BlockOpts = { anchor?: string; heading?: any };

// Banda de color con texto blanco centrado (capítulo / dimensión / subdimensión).
function banner(docx: any, text: string, fill: string, halfPt: number, o: BlockOpts = {}): any {
  const { Paragraph, TextRun, AlignmentType, ShadingType } = docx;
  const run = new TextRun({ text, bold: true, color: WHITE, size: halfPt, font: "Arial" });
  return new Paragraph({
    heading: o.heading,
    shading: { type: ShadingType.CLEAR, color: "auto", fill },
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 120 },
    children: marcado(docx, run, o.anchor),
  });
}

// Recuadro de nota (texto informativo largo en una sola celda).
function noteBox(docx: any, text: string): any {
  const { Table, TableRow, WidthType, AlignmentType, TableLayoutType } = docx;
  return new Table({
    rows: [
      new TableRow({
        children: [tCell(docx, text, { fill: NOTE, align: AlignmentType.BOTH, width: CONTENT_W, base: { size: 17 } })],
      }),
    ],
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    layout: TableLayoutType.FIXED,
    alignment: AlignmentType.CENTER,
  });
}

// Encabezado de sección (azul marino, negrita) — estilo "Título N".
function heading(docx: any, text: string, halfPt: number, o: BlockOpts = {}): any {
  const { Paragraph, TextRun, AlignmentType } = docx;
  const run = new TextRun({ text, bold: true, color: NAVY, size: halfPt, font: "Arial" });
  return new Paragraph({
    heading: o.heading,
    alignment: AlignmentType.LEFT,
    spacing: { before: 220, after: 60 },
    children: marcado(docx, run, o.anchor),
  });
}

export function markdownToDocx(docx: any, md: string, ctx?: Ctx): any[] {
  const { Paragraph, HeadingLevel } = docx;
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

      // El Anexo C encadena en un mismo bloque el título de la subdimensión
      // (fila de una sola celda) y la tabla de criterios. Se separa en segmentos:
      // cada fila de una sola celda es una banda; el resto forma una tabla.
      let seg: string[][] = [];
      const flush = () => {
        if (!seg.length) return;
        const head = plain(seg[0][0] ?? "");
        if (seg[0].length === 2 && /META DE VIV[EÊ]NCIA/i.test(head)) out.push(buildMetaTable(docx, seg));
        else out.push(buildTable(docx, seg));
        seg = [];
      };

      for (const r of rows) {
        if (r.length === 1) {
          flush();
          const txt = plain(r[0] ?? "");
          // Secciones, dimensiones y subdimensiones del Anexo C entran al índice.
          if (/^SE(CCI[ÓO]N|[ÇC][ÃA]O)\s+[IVX]+\s*:/i.test(txt)) {
            out.push(banner(docx, txt, NAVY, 26, { anchor: anclar(ctx, 2, txt), heading: HeadingLevel.HEADING_2 }));
          } else if (/^DIMENS(I[ÓO]N|[ÃA]O)\s*\d/i.test(txt)) {
            out.push(banner(docx, txt, NAVY, 28, { anchor: anclar(ctx, 3, txt), heading: HeadingLevel.HEADING_3 }));
          } else if (/^TOTAL\s+DIMENS/i.test(txt)) {
            out.push(banner(docx, txt, NAVY, 20));
          } else if (/^\d+\.\d+\s/.test(txt)) {
            out.push(banner(docx, txt, BLUE, 22, { heading: HeadingLevel.HEADING_4 }));
          } else if (txt.length > 180) {
            out.push(noteBox(docx, r[0]));
          } else {
            out.push(banner(docx, txt, BLUE, 22));
          }
        } else {
          seg.push(r);
        }
      }
      flush();
      continue;
    }

    // Encabezados
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].replace(/\*\*/g, "");
      // Los niveles 1–3 alimentan el índice navegable; todos llevan estilo de
      // título para que funcione el panel de navegación de Word.
      if (level === 1) {
        out.push(banner(docx, text, NAVY, 28, { anchor: anclar(ctx, 1, text), heading: HeadingLevel.HEADING_1 }));
      } else if (level === 2) {
        out.push(banner(docx, text, BLUE, 24, { anchor: anclar(ctx, 2, text), heading: HeadingLevel.HEADING_2 }));
      } else if (level === 3) {
        out.push(heading(docx, text, 24, { anchor: anclar(ctx, 3, text), heading: HeadingLevel.HEADING_3 }));
      } else if (level === 4) {
        out.push(heading(docx, text, 23, { heading: HeadingLevel.HEADING_4 }));
      } else {
        out.push(heading(docx, text, 22, { heading: HeadingLevel.HEADING_5 }));
      }
      i++;
      continue;
    }

    // Cita
    if (/^>\s?/.test(trimmed)) {
      out.push(new Paragraph({
        children: inlineRuns(docx, trimmed.replace(/^>\s?/, ""), { italics: true, color: "3B3B3B" }),
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

    // Leyenda de la escala de conformidad (AP/AA/PA/NA): compacta y en gris.
    if (/^(AP|AA)\s*=\s*At[ei]/i.test(trimmed)) {
      out.push(new Paragraph({
        children: inlineRuns(docx, trimmed, { size: 17, color: "3B3B3B" }),
        spacing: { after: 120, line: 240, lineRule: "auto" },
      }));
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
type DocOpts = { portada: Portada; docs: { markdown: string }[]; lang?: "es" | "pt" };

// Cada apartado encabeza el índice con una sola línea. Si el apartado tiene
// título y subtítulo (p. ej. "CAPÍTULO I" + "NUESTRA ESENCIA") se unen en esa
// línea y sus secciones suben un nivel, para que el índice quede legible.
function normalizarApartado(toc: TocEntry[], start: number): void {
  const ent = toc.slice(start);
  if (!ent.length) return;
  if (ent[0].level > 1) ent[0].level = 1;              // apartados que empiezan en "##"
  const soloUnSubtitulo = ent.filter((e) => e.level === 2).length === 1;
  if (soloUnSubtitulo && ent[1]?.level === 2) {
    ent[0].text = `${ent[0].text} — ${ent[1].text}`;
    toc.splice(start + 1, 1);
    for (const e of toc.slice(start + 1)) if (e.level === 3) e.level = 2;
  }
}

// Índice navegable: cada línea es un hipervínculo interno al marcador del
// apartado correspondiente (funciona al abrir el documento, sin actualizar campos).
function construirIndice(docx: any, toc: TocEntry[], lang: "es" | "pt"): any[] {
  const { Paragraph, TextRun, InternalHyperlink, AlignmentType } = docx;
  const out: any[] = [banner(docx, lang === "pt" ? "SUMÁRIO" : "ÍNDICE", NAVY, 28)];

  out.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: lang === "pt"
            ? "Clique em qualquer item para ir diretamente à seção."
            : "Haz clic en cualquier ítem para ir directamente a la sección.",
          italics: true,
          size: 18,
          color: "3B3B3B",
          font: "Arial",
        }),
      ],
    })
  );

  for (const e of toc) {
    const lvl1 = e.level === 1;
    out.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        indent: { left: e.level === 1 ? 0 : e.level === 2 ? 340 : 680 },
        spacing: { before: lvl1 ? 160 : 20, after: 20, line: 240, lineRule: "auto" },
        children: [
          new InternalHyperlink({
            anchor: e.anchor,
            children: [
              new TextRun({
                text: e.text,
                bold: lvl1,
                color: lvl1 ? NAVY : BLUE,
                size: lvl1 ? 22 : e.level === 2 ? 21 : 20,
                font: "Arial",
              }),
            ],
          }),
        ],
      })
    );
  }
  return out;
}

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

  // Se recorre primero el contenido para reunir las entradas del índice y sus
  // marcadores; después se antepone el índice, ya con los enlaces resueltos.
  const lang: "es" | "pt" = opts.lang ?? (/Educaç/i.test(p.departamento) ? "pt" : "es");
  const ctx = { toc: [] as TocEntry[], seq: 0 };

  // El Anexo C (instrumento de acreditación) tiene once columnas y se compone en
  // horizontal; el resto del documento, en vertical. Los apartados contiguos con
  // la misma orientación comparten sección.
  const esInstrumento = (md: string) => /^#\s+ANEXO\s+C\b/im.test(md.slice(0, 400));
  const grupos: { horizontal: boolean; children: any[] }[] = [];
  opts.docs.forEach((d) => {
    const horizontal = esInstrumento(d.markdown);
    CONTENT_W = horizontal ? ANCHO_HORIZONTAL : ANCHO_VERTICAL;
    const start = ctx.toc.length;
    const bloque = markdownToDocx(docx, d.markdown, ctx);
    normalizarApartado(ctx.toc, start);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.horizontal === horizontal) {
      ultimo.children.push(new Paragraph({ children: [new PageBreak()] }), ...bloque);
    } else {
      grupos.push({ horizontal, children: bloque });
    }
  });
  CONTENT_W = ANCHO_VERTICAL;

  // La portada y el índice encabezan la primera sección (vertical).
  const preliminares = [
    ...portada,
    ...construirIndice(docx, ctx.toc, lang),
    new Paragraph({ children: [new PageBreak()] }),
  ];
  if (grupos.length === 0 || grupos[0].horizontal) {
    grupos.unshift({ horizontal: false, children: preliminares });
  } else {
    grupos[0].children.unshift(...preliminares);
  }

  const pagina = (horizontal: boolean) => ({
    // Con orientación horizontal la librería intercambia ancho y alto, de modo
    // que aquí siempre se indican las medidas del A4 vertical.
    size: horizontal
      ? { width: PAGE_W, height: PAGE_H, orientation: (docx as any).PageOrientation.LANDSCAPE }
      : { width: PAGE_W, height: PAGE_H },
    margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 22 },                        // Arial 11pt
          // Cuerpo justificado, como el estilo "Normal" del documento original.
          paragraph: { alignment: AlignmentType.BOTH, spacing: { line: 276, lineRule: "auto", after: 160 } },
        },
      },
    },
    sections: grupos.map((g) => ({ properties: { page: pagina(g.horizontal) }, children: g.children })),
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
