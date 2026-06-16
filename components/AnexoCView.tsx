"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Paleta por dimensión ──────────────────────────────────────────────────────
const DIM_BG: Record<string, string> = {
  "1": "#1F3A5F", "2": "#14532D", "3": "#7C1D1D", "4": "#78350F", "5": "#3B0764",
};
const DIM_ACCENT: Record<string, string> = {
  "1": "#2E5A9C", "2": "#166534", "3": "#B91C1C", "4": "#B45309", "5": "#6D28D9",
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Row { cells: string[]; isSubtotal: boolean; }
interface Subdim { id: string; title: string; dimNum: string; headers: string[]; rows: Row[]; }
interface Dim { id: string; num: string; title: string; subdims: Subdim[]; }

// ── Parser ────────────────────────────────────────────────────────────────────
function splitCells(line: string): string[] {
  return line.trim().split("|").slice(1, -1).map(c => c.trim());
}

function isSep(line: string): boolean {
  return /^\|[\s\-:|]+\|?\s*$/.test(line.trim());
}

function stripMd(t: string): string {
  return t.replace(/\*{2,}/g, "").trim();
}

function parseAnexoC(raw: string): { intro: string; dims: Dim[] } {
  const lines = raw.split(/\r?\n/);
  const introLines: string[] = [];
  const dims: Dim[] = [];
  let curDim: Dim | null = null;
  let curSub: Subdim | null = null;
  let seenDim = false;
  let headerSet = false;

  for (const line of lines) {
    const t = line.trim();

    if (!t) {
      if (!seenDim) introLines.push("");
      continue;
    }

    // Separadores: los conservamos en intro para que ReactMarkdown arme tablas
    if (isSep(t)) {
      if (!seenDim) introLines.push(line);
      continue;
    }

    // Líneas sin tabla (texto, encabezados #)
    if (!t.startsWith("|")) {
      if (!seenDim && !t.startsWith("#")) introLines.push(line);
      continue;
    }

    const cs = splitCells(t);
    if (!cs.length) continue;

    // ── Fila de una sola columna ──────────────────────────────────────────────
    if (cs.length === 1) {
      const text = stripMd(cs[0]);

      // Encabezado de Dimensión (excluye filas de TOTAL)
      const dm = text.match(/DIMENS[ÃA]O\s*(\d+)\s*[—–\-]/i);
      if (dm && !/\bTOTAL\b/i.test(text)) {
        seenDim = true;
        curSub = null;
        headerSet = false;
        curDim = { id: `d${dm[1]}`, num: dm[1], title: text, subdims: [] };
        dims.push(curDim);
        continue;
      }

      // Fila "TOTAL DIMENSÃO N" → saltar
      if (/TOTAL\s+DIMENS[ÃA]O/i.test(text)) continue;

      // Encabezado de Subdimensión: comienza con N.M
      const sm = text.match(/^(\d+)\.(\d+)/);
      if (sm && curDim) {
        curSub = {
          id: `s${sm[1]}-${sm[2]}`,
          title: text,
          dimNum: sm[1],
          headers: [],
          rows: [],
        };
        curDim.subdims.push(curSub);
        headerSet = false;
        continue;
      }

      // Otras filas de 1 columna antes de la primera Dimensión → intro
      if (!seenDim) introLines.push(line);
      continue;
    }

    // ── Filas multicolumna ────────────────────────────────────────────────────
    if (!curSub) {
      if (!seenDim) introLines.push(line); // tabla intro (5 Dimensões...)
      continue;
    }

    const flat = cs.join(" ");

    // Fila de encabezados (contiene "Critérios")
    if (!headerSet && /crit[eé]rios?/i.test(flat)) {
      curSub.headers = cs.map(stripMd);
      headerSet = true;
      continue;
    }

    // Fila de datos o subtotal
    curSub.rows.push({ cells: cs, isSubtotal: /SUBTOTAL/i.test(flat) });
  }

  return { intro: introLines.join("\n"), dims };
}

// ── Renderer de Markdown inline (**negrita**) ─────────────────────────────────
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      className={`shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function AnexoCView({ raw }: { raw: string }) {
  const { intro, dims } = parseAnexoC(raw);
  const [openDims, setOpenDims] = useState<Set<string>>(new Set());
  const [openSubs, setOpenSubs] = useState<Set<string>>(new Set());

  const toggleDim = (id: string) =>
    setOpenDims(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSub = (id: string) =>
    setOpenSubs(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div>
      {/* Sección introductoria */}
      {intro.trim() && (
        <div className="doc mb-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{intro}</ReactMarkdown>
        </div>
      )}

      {/* Dimensiones como acordeón */}
      <div className="space-y-3">
        {dims.map(dim => {
          const isOpen = openDims.has(dim.id);
          const bg = DIM_BG[dim.num] ?? "#1F3A5F";
          const accent = DIM_ACCENT[dim.num] ?? "#2E5A9C";

          return (
            <div key={dim.id} className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
              {/* Botón de Dimensión */}
              <button
                onClick={() => toggleDim(dim.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-white text-sm font-bold uppercase tracking-wide"
                style={{ background: bg }}
              >
                <span className="flex-1">{dim.title}</span>
                <Chevron open={isOpen} />
              </button>

              {/* Contenido de la Dimensión: subdimensiones */}
              {isOpen && (
                <div className="divide-y divide-slate-100 bg-slate-50">
                  {dim.subdims.map(sub => {
                    const isSubOpen = openSubs.has(sub.id);
                    return (
                      <div key={sub.id}>
                        {/* Botón de Subdimensión */}
                        <button
                          onClick={() => toggleSub(sub.id)}
                          className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-white text-sm font-semibold"
                          style={{ background: accent }}
                        >
                          <span className="flex-1">{sub.title}</span>
                          <Chevron open={isSubOpen} />
                        </button>

                        {/* Tabla de criterios */}
                        {isSubOpen && (
                          <div className="overflow-x-auto bg-white">
                            <table className="w-full border-collapse text-xs">
                              {sub.headers.length > 0 && (
                                <thead>
                                  <tr>
                                    {sub.headers.map((h, i) => (
                                      <th
                                        key={i}
                                        className="border border-slate-300 px-2 py-2 text-left font-semibold text-white"
                                        style={{
                                          background: accent,
                                          minWidth: i === 0 ? "2.5rem"
                                            : i >= 5 ? "3rem"
                                            : "8rem",
                                        }}
                                      >
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                              )}
                              <tbody>
                                {sub.rows.map((row, ri) => (
                                  <tr
                                    key={ri}
                                    className={
                                      row.isSubtotal
                                        ? "font-semibold"
                                        : ri % 2 === 0 ? "bg-white" : "bg-slate-50"
                                    }
                                    style={
                                      row.isSubtotal
                                        ? { background: accent + "22" }
                                        : undefined
                                    }
                                  >
                                    {row.cells.map((cell, ci) => (
                                      <td
                                        key={ci}
                                        className="border border-slate-300 px-2 py-1.5 align-top text-slate-700"
                                        style={{
                                          minWidth: ci === 0 ? "2.5rem"
                                            : ci >= 5 ? "3rem"
                                            : "7rem",
                                          maxWidth: ci >= 1 && ci <= 4
                                            ? "18rem"
                                            : undefined,
                                        }}
                                      >
                                        <Inline text={cell} />
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
