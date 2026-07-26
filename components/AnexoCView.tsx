"use client";

import { useMemo, useState } from "react";
import { MarkdownView } from "./MarkdownView";
import { useLang } from "./LanguageProvider";

// ── Paleta por dimensión ──────────────────────────────────────────────────────
const DIM_BG: Record<string, string> = {
  "1": "#1F3A5F", "2": "#14532D", "3": "#7C1D1D", "4": "#78350F", "5": "#3B0764",
};
const DIM_ACCENT: Record<string, string> = {
  "1": "#2E5A9C", "2": "#166534", "3": "#B91C1C", "4": "#B45309", "5": "#6D28D9",
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Row { cells: string[]; isSubtotal: boolean; }
interface Meta { crit: string; text: string; }
interface Subdim { id: string; title: string; dimNum: string; headers: string[]; rows: Row[]; metaTitle: string; metas: Meta[]; }
interface Dim { id: string; num: string; title: string; subdims: Subdim[]; intro: string; }

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

function parseAnexoC(raw: string): { intro: string; dims: Dim[]; cierre: string } {
  const lines = raw.split(/\r?\n/);
  const introLines: string[] = [];
  const cierreLines: string[] = [];
  let enCierre = false;                    // sección final (consolidado de puntaje)
  const dims: Dim[] = [];
  let curDim: Dim | null = null;
  let curSub: Subdim | null = null;
  let seenDim = false;
  let headerSet = false;
  let inMetas = false;

  for (const line of lines) {
    const t = line.trim();

    // Una vez abierta la sección final, todo el resto se muestra tal cual.
    if (enCierre) {
      cierreLines.push(line);
      continue;
    }

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
      if (t.startsWith("#")) continue;
      if (!seenDim) introLines.push(line);
      // Texto entre el título de la dimensión y su primera subdimensión:
      // orientación al evaluador.
      else if (curDim && !curSub) curDim.intro += (curDim.intro ? "\n" : "") + line;
      continue;
    }

    const cs = splitCells(t);
    if (!cs.length) continue;

    // ── Fila de una sola columna ──────────────────────────────────────────────
    if (cs.length === 1) {
      const text = stripMd(cs[0]);

      // Encabezado de Dimensión (ES "DIMENSIÓN" o PT "DIMENSÃO"; excluye filas de TOTAL)
      const dm = text.match(/DIMENS(?:I[ÓO]N|[ÃA]O)\s*(\d+)\s*[—–\-]/i);
      if (dm && !/\bTOTAL\b/i.test(text)) {
        seenDim = true;
        curSub = null;
        headerSet = false;
        inMetas = false;
        curDim = { id: `d${dm[1]}`, num: dm[1], title: text, subdims: [], intro: "" };
        dims.push(curDim);
        continue;
      }

      // Fila "TOTAL DIMENSIÓN/DIMENSÃO N" → saltar
      if (/TOTAL\s+DIMENS(?:I[ÓO]N|[ÃA]O)/i.test(text)) continue;

      // Encabezado de Subdimensión: comienza con N.M
      const sm = text.match(/^(\d+)\.(\d+)/);
      if (sm && curDim) {
        curSub = {
          id: `s${sm[1]}-${sm[2]}`,
          title: text,
          dimNum: sm[1],
          headers: [],
          rows: [],
          metaTitle: "",
          metas: [],
        };
        curDim.subdims.push(curSub);
        headerSet = false;
        inMetas = false;
        continue;
      }

      // Antes de la primera Dimensión → intro. Después de las dimensiones, una
      // fila suelta de una columna abre la sección final (consolidado).
      if (!seenDim) introLines.push(line);
      else { enCierre = true; cierreLines.push(line); }
      continue;
    }

    // ── Filas multicolumna ────────────────────────────────────────────────────
    if (!curSub) {
      if (!seenDim) introLines.push(line); // tabla intro (5 Dimensões...)
      continue;
    }

    const flat = cs.join(" ");

    // Bloque "META DE VIVENCIA / VIVÊNCIA PERCIBIDA (ILE/IVC)" — tabla aparte por subdimensión
    if (/META DE VIV[EÊ]NCIA/i.test(flat)) {
      inMetas = true;
      curSub.metaTitle = stripMd(cs[0]);
      continue;
    }
    if (inMetas) {
      if (cs.length >= 2 && cs[1]) curSub.metas.push({ crit: stripMd(cs[0]), text: cs[1] });
      continue;
    }

    // Fila de encabezados (contiene "Critérios")
    if (!headerSet && /crit[eé]rios?/i.test(flat)) {
      curSub.headers = cs.map(stripMd);
      headerSet = true;
      continue;
    }

    // Fila de datos o subtotal
    curSub.rows.push({ cells: cs, isSubtotal: /SUBTOTAL/i.test(flat) });
  }

  return { intro: introLines.join("\n"), dims, cierre: cierreLines.join("\n") };
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

// ── Bloque "Meta de vivencia percibida (ILE/IVC)" de una subdimensión ─────────
function MetasBlock({ metaTitle, metas, accent }: { metaTitle: string; metas: Meta[]; accent: string }) {
  if (!metas.length) return null;
  return (
    <div className="mt-2 overflow-x-auto bg-white">
      <div className="px-3 py-1.5 text-xs font-semibold text-white" style={{ background: accent }}>
        {metaTitle || "Meta de vivencia percibida (ILE/IVC)"}
      </div>
      <table className="w-full border-collapse text-xs">
        <tbody>
          {metas.map((m, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              <td className="border border-slate-300 px-2 py-1.5 align-top font-semibold text-slate-700" style={{ minWidth: "4.5rem", whiteSpace: "nowrap" }}>
                {m.crit}
              </td>
              <td className="border border-slate-300 px-2 py-1.5 align-top italic text-slate-600">
                <Inline text={m.text} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Render de UNA subdimensión (reutiliza el mismo parser y estilo) ───────────
export function AnexoCSubdimView({ raw, subdimId }: { raw: string; subdimId: string }) {
  const { t } = useLang();
  const { dims } = useMemo(() => parseAnexoC(raw), [raw]);
  let sub: Subdim | undefined;
  let dimNum = "1";
  for (const d of dims) {
    const found = d.subdims.find((s) => s.id === subdimId);
    if (found) { sub = found; dimNum = d.num; break; }
  }
  if (!sub) {
    return <p className="text-sm italic text-slate-400">{t("reader.subdim_not_found")}</p>;
  }
  const accent = DIM_ACCENT[dimNum] ?? "#2E5A9C";
  return (
    <div>
      <div className="mb-3 rounded-lg px-4 py-2.5 text-sm font-semibold text-white" style={{ background: accent }}>
        {sub.title}
      </div>
      <div className="overflow-x-auto bg-white">
        <table className="w-full border-collapse text-xs">
          {sub.headers.length > 0 && (
            <thead>
              <tr>
                {sub.headers.map((h, i) => (
                  <th key={i}
                    className="border border-slate-300 px-2 py-2 text-left font-semibold text-white"
                    style={{ background: accent, minWidth: i === 0 ? "2.5rem" : i >= 5 ? "3rem" : "8rem" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {sub.rows.map((row, ri) => (
              <tr key={ri}
                className={row.isSubtotal ? "font-semibold" : ri % 2 === 0 ? "bg-white" : "bg-slate-50"}
                style={row.isSubtotal ? { background: accent + "22" } : undefined}>
                {row.cells.map((cell, ci) => (
                  <td key={ci}
                    className="border border-slate-300 px-2 py-1.5 align-top text-slate-700"
                    style={{ minWidth: ci === 0 ? "2.5rem" : ci >= 5 ? "3rem" : "7rem", maxWidth: ci >= 1 && ci <= 4 ? "18rem" : undefined }}>
                    <Inline text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <MetasBlock metaTitle={sub.metaTitle} metas={sub.metas} accent={accent} />
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function AnexoCView({ raw }: { raw: string }) {
  const { intro, dims, cierre } = parseAnexoC(raw);
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
        <div className="mb-6">
          <MarkdownView markdown={intro} />
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
                  {dim.intro.trim() && (
                    <div className="bg-white px-4 py-3">
                      <MarkdownView markdown={dim.intro} />
                    </div>
                  )}
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
                          <>
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
                          <MetasBlock metaTitle={sub.metaTitle} metas={sub.metas} accent={accent} />
                          </>
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

      {/* Sección final: consolidado de puntaje y nivel de logro */}
      {cierre.trim() && (
        <div className="mt-6">
          <MarkdownView markdown={cierre} />
        </div>
      )}
    </div>
  );
}
