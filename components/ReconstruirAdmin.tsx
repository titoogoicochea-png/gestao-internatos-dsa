"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkdownView } from "@/components/MarkdownView";
import { listarCapitulosReconstruir, reconstruirCapitulo, guardarReconstruccion } from "@/app/reconstruir/actions";

export type DocData = {
  codigo: string;
  kind: string;
  badge: string | null;
  titulo: string;
  subtitulo: string | null;
  original: string;
  reconstruido: string | null;
  modelo: string | null;
  generadoEn: string | null;
};
export type NivelData = { nivel: "basica" | "superior"; tieneConsolidado: boolean; docs: DocData[] };

const NIVELES = [
  ["basica", "Educación Básica"],
  ["superior", "Educación Superior"],
] as const;
const nivelLabel = (n: string) => NIVELES.find((x) => x[0] === n)?.[1] ?? n;

export function ReconstruirAdmin({ niveles }: { niveles: NivelData[] }) {
  const [datos, setDatos] = useState(niveles);
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [generating, setGenerating] = useState(false);
  const [progreso, setProgreso] = useState<{ done: number; total: number; titulo?: string } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const actual = datos.find((n) => n.nivel === nivel)!;
  const docs = actual.docs;
  const capitulosConRecon = docs.filter((d) => d.reconstruido).length;
  const [activeCodigo, setActiveCodigo] = useState(docs[0]?.codigo ?? "");
  const active = docs.find((d) => d.codigo === activeCodigo) ?? docs[0];

  function selectNivel(n: "basica" | "superior") {
    setNivel(n);
    setError(null);
    setAviso(null);
    const first = datos.find((x) => x.nivel === n)!.docs[0];
    setActiveCodigo(first?.codigo ?? "");
  }

  async function handleGenerar() {
    setError(null);
    setAviso(null);
    setGenerating(true);
    setProgreso(null);
    try {
      const lista = await listarCapitulosReconstruir(nivel);
      if (!lista) { setError("La operación no respondió (tiempo de espera). Intenta de nuevo."); return; }
      if (!lista.ok || !lista.capitulos || lista.capitulos.length === 0) { setError(lista.error ?? "No se pudo iniciar la reconstrucción."); return; }

      const caps = lista.capitulos;
      setProgreso({ done: 0, total: caps.length });
      const generados: { codigo: string; markdown: string; modelo: string }[] = [];
      const fallidos: string[] = [];

      for (let i = 0; i < caps.length; i++) {
        setProgreso({ done: i, total: caps.length, titulo: caps[i].titulo });
        let res = await reconstruirCapitulo(nivel, caps[i].codigo, "opus").catch(() => undefined);
        if (!res || !res.ok || !res.markdown) {
          res = await reconstruirCapitulo(nivel, caps[i].codigo, "opus").catch(() => undefined);
        }
        if (res && res.ok && res.markdown) {
          generados.push({ codigo: caps[i].codigo, markdown: res.markdown, modelo: res.modelo ?? "opus" });
        } else {
          fallidos.push(caps[i].titulo);
        }
        setProgreso({ done: i + 1, total: caps.length });
      }

      if (generados.length > 0) {
        const g = await guardarReconstruccion(nivel, generados);
        if (!g || !g.ok) { setError(g?.error ?? "Se reconstruyó pero no se pudo guardar."); return; }
        const now = new Date().toISOString();
        setDatos((prev) => prev.map((n) =>
          n.nivel !== nivel ? n : {
            ...n,
            docs: n.docs.map((d) => {
              const f = generados.find((x) => x.codigo === d.codigo);
              return f ? { ...d, reconstruido: f.markdown, modelo: f.modelo, generadoEn: now } : d;
            }),
          }
        ));
        setActiveCodigo(generados[0].codigo);
      }
      if (fallidos.length) {
        setError(`No se pudieron reconstruir estos capítulos: ${fallidos.join(", ")}. Vuelve a intentar.`);
      } else if (generados.length) {
        setAviso(`Reconstrucción completa: ${generados.length} capítulo(s).`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setGenerating(false);
      setProgreso(null);
    }
  }

  async function handleDescargar() {
    setError(null);
    setDownloading(true);
    try {
      const { documentoADocx } = await import("@/lib/md-docx");
      const blob = await documentoADocx({
        titulo: `Referencial de Gestión de Internados DSA — ${nivelLabel(nivel)}`,
        subtitulo: "Documento reconstruido a partir de la validación participativa",
        docs: docs.map((d) => ({ markdown: d.reconstruido ?? d.original })),
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `referencial-reconstruido-${nivel}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo generar el Word.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/80 hover:text-white">← Inicio</Link>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">Reconstruir documento</span>
          </div>
          <Link href="/modulo3" className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10">
            ← Consolidado (Módulo 3)
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="mb-4">
          <h1 className="font-display text-3xl font-bold text-[#2F4156]">Reconstruir el documento</h1>
          <p className="mt-1 text-sm text-slate-500">
            La IA reescribe cada capítulo incorporando las observaciones y sugerencias del consolidado, manteniendo el formato original. Motor: <strong>Claude Opus 4.8</strong>.
          </p>
        </div>

        {/* Controles */}
        <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid grid-cols-2 gap-2 sm:max-w-md">
            {NIVELES.map(([n, label]) => (
              <button key={n} onClick={() => selectNivel(n)}
                className={`rounded-xl border-2 p-3 text-center text-sm font-bold transition ${
                  nivel === n ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleGenerar} disabled={generating || !actual.tieneConsolidado}
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50">
              {generating
                ? progreso ? `Reconstruyendo ${progreso.done}/${progreso.total}…` : "Reconstruyendo…"
                : capitulosConRecon > 0 ? "Regenerar con Opus 4.8" : "Reconstruir con Opus 4.8"}
            </button>
            <button onClick={handleDescargar} disabled={downloading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
              ⬇ {downloading ? "Generando…" : "Descargar Word"}
            </button>
          </div>
        </div>

        {/* Estado */}
        {!actual.tieneConsolidado && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            Primero genera el <strong>consolidado del Workshop 1</strong> de {nivelLabel(nivel)} en el <Link href="/modulo3" className="font-semibold underline">Módulo 3</Link>. La reconstrucción usa las observaciones y sugerencias consolidadas.
          </p>
        )}
        {generating && progreso && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
              <span className="truncate">{progreso.titulo ? `Capítulo: ${progreso.titulo}` : "Preparando…"}</span>
              <span>{Math.round((progreso.done / progreso.total) * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${(progreso.done / progreso.total) * 100}%` }} />
            </div>
          </div>
        )}
        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {aviso && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{aviso}</p>}
        <p className="mb-4 text-xs text-slate-400">
          {capitulosConRecon > 0
            ? `${capitulosConRecon} capítulo(s) reconstruido(s). Los capítulos sin aportes se descargan con su texto original.`
            : "Aún no hay capítulos reconstruidos para este nivel."}
        </p>

        {/* Lector estilo Módulo 1 */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card lg:grid-cols-[20rem_1fr] lg:h-[72vh]">
          {/* Índice */}
          <nav className="overflow-y-auto border-b border-slate-100 p-3 lg:border-b-0 lg:border-r">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Índice</p>
            <ul className="space-y-0.5">
              {docs.map((d) => {
                const isActive = d.codigo === active?.codigo;
                return (
                  <li key={d.codigo}>
                    <button onClick={() => setActiveCodigo(d.codigo)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm ${isActive ? "bg-brand/10 font-semibold text-brand ring-1 ring-inset ring-brand/15" : "text-slate-700 hover:bg-slate-100"}`}>
                      {d.badge && (
                        <span className={`flex h-6 min-w-[1.6rem] items-center justify-center rounded-md px-1 text-xs font-bold ${isActive ? "bg-brand text-white" : "bg-[#C8D9E6] text-[#2F4156]"}`}>{d.badge}</span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{d.titulo}</span>
                      {d.reconstruido && <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" title="Reconstruido" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Contenido */}
          <div className="overflow-y-auto bg-[#EEF1F6] p-4 sm:p-8">
            {active && (
              <article className="mx-auto max-w-4xl rounded-2xl border border-slate-200/70 bg-white p-7 shadow-card sm:p-12">
                <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
                  {active.reconstruido ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">✓ Reconstruido {active.modelo ? `· ${active.modelo}` : ""}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Texto original (sin aportes)</span>
                  )}
                </div>
                <MarkdownView markdown={active.reconstruido ?? active.original} />
              </article>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
