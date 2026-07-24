"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkdownView } from "@/components/MarkdownView";

type Lang = "es" | "pt";

export type DocData = {
  codigo: string;
  kind: string;
  badge: string | null;
  titulo: string;
  subtitulo: string | null;
  original_es: string;
  original_pt: string;
  reconstruido_es: string | null;
  reconstruido_pt: string | null;
  reconstruible: boolean;
  modelo: string | null;
  generadoEn: string | null;
};
export type NivelData = { nivel: "basica" | "superior"; tieneConsolidado: boolean; docs: DocData[] };

const NIVELES = [
  ["basica", "Educación Básica"],
  ["superior", "Educación Superior"],
] as const;
const nivelLabel = (n: string) => NIVELES.find((x) => x[0] === n)?.[1] ?? n;

const orig = (d: DocData, l: Lang) => (l === "pt" ? d.original_pt : d.original_es);
const recon = (d: DocData, l: Lang) => (l === "pt" ? d.reconstruido_pt : d.reconstruido_es);

export function ReconstruirAdmin({ niveles, isAdmin }: { niveles: NivelData[]; isAdmin: boolean }) {
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [lang, setLang] = useState<Lang>("es");
  const [downloading, setDownloading] = useState<Lang | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actual = niveles.find((n) => n.nivel === nivel)!;
  const docs = actual.docs;
  const reconCount = docs.filter((d) => d.reconstruido_es || d.reconstruido_pt).length;
  const [activeCodigo, setActiveCodigo] = useState(docs[0]?.codigo ?? "");
  const active = docs.find((d) => d.codigo === activeCodigo) ?? docs[0];

  function selectNivel(n: "basica" | "superior") {
    setNivel(n);
    setError(null);
    setActiveCodigo(niveles.find((x) => x.nivel === n)!.docs[0]?.codigo ?? "");
  }

  async function handleDescargar(l: Lang) {
    setError(null);
    setDownloading(l);
    try {
      const { documentoADocx } = await import("@/lib/md-docx");
      const sufijo = l === "pt" ? "Português" : "Español";
      const blob = await documentoADocx({
        titulo: `Referencial de Gestión de Internados DSA — ${nivelLabel(nivel)}`,
        subtitulo: `Documento reconstruido (${sufijo}) a partir de la validación participativa`,
        docs: docs.map((d) => ({ markdown: recon(d, l) ?? orig(d, l) })),
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `referencial-reconstruido-${nivel}-${l}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el Word.");
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/80 hover:text-white">← Inicio</Link>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">Módulo 4 · Documento reconstruido</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#2F4156]">Documento reconstruido</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">
              Versión del Referencial reescrita a partir de la validación participativa —incorporando las observaciones y sugerencias de los talleres—, disponible en <strong>español y portugués</strong>.
              {isAdmin ? " La descarga en Word es para la administración." : " La descarga en Word está reservada a la administración."}
            </p>
          </div>
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => handleDescargar("es")} disabled={downloading !== null}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                ⬇ {downloading === "es" ? "Generando…" : "Word (Español)"}
              </button>
              <button onClick={() => handleDescargar("pt")} disabled={downloading !== null}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                ⬇ {downloading === "pt" ? "Gerando…" : "Word (Português)"}
              </button>
            </div>
          )}
        </div>

        {/* Selector de nivel */}
        <div className="mb-3 grid grid-cols-2 gap-2 sm:max-w-md">
          {NIVELES.map(([n, label]) => (
            <button key={n} onClick={() => selectNivel(n)}
              className={`rounded-xl border-2 p-3 text-center text-sm font-bold transition ${
                nivel === n ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}>
              {label}
            </button>
          ))}
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        <p className="mb-4 text-xs text-slate-400">
          {reconCount > 0
            ? "Los apartados con punto verde ya están reconstruidos; el resto se muestra con su texto original. El Word incluye siempre el documento completo."
            : "Aún se muestra el texto original; los apartados reconstruidos irán apareciendo aquí."}
        </p>

        {/* Lector estilo Módulo 1 */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card lg:grid-cols-[20rem_1fr] lg:h-[74vh]">
          <nav className="overflow-y-auto border-b border-slate-100 p-3 lg:border-b-0 lg:border-r">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Índice</p>
            <ul className="space-y-0.5">
              {docs.map((d) => {
                const isActive = d.codigo === active?.codigo;
                const done = d.reconstruido_es || d.reconstruido_pt;
                return (
                  <li key={d.codigo}>
                    <button onClick={() => setActiveCodigo(d.codigo)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${isActive ? "bg-brand/10 font-semibold text-brand ring-1 ring-inset ring-brand/15" : "text-slate-700 hover:bg-slate-100"}`}>
                      {d.badge && (
                        <span className={`flex h-6 min-w-[1.6rem] items-center justify-center rounded-md px-1 text-xs font-bold ${isActive ? "bg-brand text-white" : "bg-[#C8D9E6] text-[#2F4156]"}`}>{d.badge}</span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{d.titulo}</span>
                      {done && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Reconstruido" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="overflow-y-auto bg-[#EEF1F6] p-4 sm:p-8">
            {/* Toggle idioma */}
            <div className="mx-auto mb-3 flex items-center justify-end gap-1 rounded-full bg-white/70 p-1 text-xs font-semibold" style={{ width: "fit-content" }}>
              {(["es", "pt"] as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-1 ${lang === l ? "bg-brand text-white" : "text-slate-500 hover:text-brand"}`}>
                  {l === "es" ? "Español" : "Português"}
                </button>
              ))}
            </div>
            {active && (
              <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200/70 bg-white p-7 shadow-card sm:p-12">
                <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                  {recon(active, lang) ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">✓ Reconstruido{active.modelo ? ` · ${active.modelo}` : ""}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Texto original</span>
                  )}
                </div>
                <MarkdownView markdown={recon(active, lang) ?? orig(active, lang)} />
              </article>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
