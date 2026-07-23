"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkdownView } from "@/components/MarkdownView";
import { reconstruirDoc, guardarReconstruccion, limpiarReconstruccion } from "@/app/reconstruir/actions";

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
  const [datos, setDatos] = useState(niveles);
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [lang, setLang] = useState<Lang>("es");
  const [generating, setGenerating] = useState(false);
  const [genCode, setGenCode] = useState<string | null>(null);
  const [limpiando, setLimpiando] = useState(false);
  const [progreso, setProgreso] = useState<{ done: number; total: number; titulo?: string } | null>(null);
  const [downloading, setDownloading] = useState<Lang | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const actual = datos.find((n) => n.nivel === nivel)!;
  const docs = actual.docs;
  const reconCount = docs.filter((d) => d.reconstruido_es || d.reconstruido_pt).length;
  const [activeCodigo, setActiveCodigo] = useState(docs[0]?.codigo ?? "");
  const active = docs.find((d) => d.codigo === activeCodigo) ?? docs[0];

  function selectNivel(n: "basica" | "superior") {
    setNivel(n); setError(null); setAviso(null);
    setActiveCodigo(datos.find((x) => x.nivel === n)!.docs[0]?.codigo ?? "");
  }

  const tituloDe = (codigo: string) => docs.find((d) => d.codigo === codigo)?.titulo ?? codigo;

  // Reconstruye UN apartado (ES + PT) y lo GUARDA de inmediato (no se pierde avance).
  async function reconstruirUno(codigo: string): Promise<{ hechos: number; error?: string }> {
    const langs: Lang[] = ["es", "pt"];
    const items: { codigo: string; lang: Lang; markdown: string; modelo: string }[] = [];
    let primerError: string | undefined;
    for (const l of langs) {
      const call = () => reconstruirDoc(nivel, codigo, l, "opus").catch((e) => ({ ok: false, error: e instanceof Error ? e.message : String(e) }));
      let res = await call();
      if (!res || !res.ok || !("markdown" in res) || !res.markdown) res = await call();
      if (res && res.ok && "markdown" in res && res.markdown) {
        items.push({ codigo, lang: l, markdown: res.markdown, modelo: ("modelo" in res && res.modelo) ? res.modelo : "opus" });
      } else if (!primerError) {
        primerError = (res && "error" in res && res.error) ? res.error : "sin respuesta (posible tiempo de espera o límite de la IA)";
      }
    }
    if (items.length > 0) {
      const g = await guardarReconstruccion(nivel, items).catch(() => undefined);
      if (!g || !g.ok) return { hechos: 0, error: g?.error ?? "No se pudo guardar." };
      const now = new Date().toISOString();
      setDatos((prev) => prev.map((n) => n.nivel !== nivel ? n : {
        ...n,
        docs: n.docs.map((d) => {
          if (d.codigo !== codigo) return d;
          const es = items.find((x) => x.lang === "es");
          const pt = items.find((x) => x.lang === "pt");
          return {
            ...d,
            reconstruido_es: es ? es.markdown : d.reconstruido_es,
            reconstruido_pt: pt ? pt.markdown : d.reconstruido_pt,
            modelo: items[0].modelo,
            generadoEn: now,
          };
        }),
      }));
    }
    return { hechos: items.length, error: primerError };
  }

  // Un apartado suelto
  async function handleGenerarApartado(codigo: string) {
    setError(null); setAviso(null); setGenCode(codigo);
    try {
      const r = await reconstruirUno(codigo);
      if (r.hechos === 2) setAviso(`Reconstruido: ${tituloDe(codigo)} (ES + PT).`);
      else if (r.hechos === 1) setError(`${tituloDe(codigo)}: solo se logró un idioma. Detalle: ${r.error ?? "desconocido"}`);
      else setError(`${tituloDe(codigo)}: no se pudo reconstruir. Detalle: ${r.error ?? "desconocido"}`);
    } finally {
      setGenCode(null);
    }
  }

  // Todos los apartados reconstruibles (guardando cada uno al terminar)
  async function handleGenerar() {
    setError(null); setAviso(null); setGenerating(true); setProgreso(null);
    try {
      const objetivos = docs.filter((d) => d.reconstruible);
      if (objetivos.length === 0) { setError("No hay apartados con aportes para reconstruir."); return; }
      setProgreso({ done: 0, total: objetivos.length });
      const fallidos: string[] = [];
      let primerError: string | undefined;
      for (let i = 0; i < objetivos.length; i++) {
        setProgreso({ done: i, total: objetivos.length, titulo: objetivos[i].titulo });
        const r = await reconstruirUno(objetivos[i].codigo);
        if (r.hechos < 2) { fallidos.push(objetivos[i].titulo); if (!primerError) primerError = r.error; }
        setProgreso({ done: i + 1, total: objetivos.length });
      }
      if (fallidos.length) setError(`No se completaron: ${fallidos.join(", ")}.${primerError ? ` Detalle del primer fallo: ${primerError}` : ""}`);
      else setAviso("Reconstrucción completa en español y portugués. Lo generado se guardó apartado por apartado.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setGenerating(false); setProgreso(null);
    }
  }

  async function handleLimpiar() {
    if (!confirm(`¿Borrar la reconstrucción guardada de ${nivelLabel(nivel)}? Podrás generarla de nuevo. No afecta a las respuestas ni al consolidado.`)) return;
    setError(null); setAviso(null); setLimpiando(true);
    try {
      const r = await limpiarReconstruccion(nivel);
      if (!r || !r.ok) { setError(r?.error ?? "No se pudo limpiar."); return; }
      setDatos((prev) => prev.map((n) => n.nivel !== nivel ? n : {
        ...n,
        docs: n.docs.map((d) => ({ ...d, reconstruido_es: null, reconstruido_pt: null, modelo: null, generadoEn: null })),
      }));
      setAviso("Reconstrucción borrada. Puedes generarla de nuevo.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setLimpiando(false);
    }
  }

  async function handleDescargar(l: Lang) {
    setError(null); setDownloading(l);
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
      document.body.appendChild(a); a.click(); a.remove();
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
          {isAdmin && (
            <Link href="/modulo3" className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10">
              ← Consolidado (Módulo 3)
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="mb-4">
          <h1 className="font-display text-3xl font-bold text-[#2F4156]">Documento reconstruido</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? (
              <>La IA reescribe cada capítulo (Workshop 1) y el Anexo C (Workshop 2) incorporando las observaciones y sugerencias, en <strong>español y portugués</strong>, manteniendo el formato. Motor: <strong>Claude Opus 4.8</strong>. Los demás apartados (Presentación, Anexo B, Referencias) se incluyen íntegros.</>
            ) : (
              <>Documento reescrito a partir de la validación participativa. Puedes leerlo aquí en <strong>español y portugués</strong>. La descarga en Word está disponible para la administración.</>
            )}
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
            <button onClick={handleLimpiar} disabled={limpiando || generating || genCode !== null || reconCount === 0}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
              {limpiando ? "Limpiando…" : "Limpiar"}
            </button>
          </div>
          )}
        </div>

        {/* Estado (solo admin) */}
        {isAdmin && !actual.tieneConsolidado && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            Primero genera el <strong>consolidado</strong> de {nivelLabel(nivel)} en el <Link href="/modulo3" className="font-semibold underline">Módulo 3</Link> (Workshop 1 para los capítulos, Workshop 2 para el Anexo C).
          </p>
        )}
        {generating && progreso && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs font-medium text-slate-500">
              <span className="truncate">{progreso.titulo ? `Generando: ${progreso.titulo}` : "Preparando…"}</span>
              <span>{Math.round((progreso.done / progreso.total) * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand transition-all duration-300" style={{ width: `${(progreso.done / progreso.total) * 100}%` }} />
            </div>
          </div>
        )}
        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {isAdmin && aviso && <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{aviso}</p>}
        <p className="mb-4 text-xs text-slate-400">
          {isAdmin
            ? reconCount > 0
              ? `${reconCount} apartado(s) reconstruido(s). El Word incluye SIEMPRE el documento completo (los apartados sin aportes salen con su texto original).`
              : "Aún no hay apartados reconstruidos para este nivel. Aun así puedes descargar el documento original completo."
            : reconCount > 0
              ? "Documento reconstruido disponible. Selecciona un apartado en el índice y elige el idioma (Español / Português)."
              : "Este nivel aún no tiene apartados reconstruidos; se muestra el texto original."}
        </p>

        {/* Generación por apartado (solo admin) */}
        {isAdmin && (
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/60">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-base font-bold text-[#2F4156]">Generación por apartado · Opus 4.8</h3>
              <button onClick={handleGenerar} disabled={generating || genCode !== null || limpiando || !actual.tieneConsolidado}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50">
                {generating ? (progreso ? `Reconstruyendo ${progreso.done}/${progreso.total}…` : "Reconstruyendo…") : "Reconstruir todo (ES + PT)"}
              </button>
            </div>
            {docs.filter((d) => d.reconstruible).length === 0 ? (
              <p className="text-sm text-slate-400">No hay apartados con aportes para reconstruir en este nivel.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {docs.filter((d) => d.reconstruible).map((d) => {
                  const both = !!d.reconstruido_es && !!d.reconstruido_pt;
                  const some = (!!d.reconstruido_es || !!d.reconstruido_pt) && !both;
                  return (
                    <li key={d.codigo} className="flex items-center justify-between gap-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        {d.badge && <span className="flex h-6 min-w-[1.6rem] items-center justify-center rounded-md bg-[#C8D9E6] px-1 text-xs font-bold text-[#2F4156]">{d.badge}</span>}
                        <span className="truncate text-sm text-slate-700">{d.titulo}</span>
                        {both ? (
                          <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">ES ✓ · PT ✓</span>
                        ) : some ? (
                          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">{d.reconstruido_es ? "ES ✓" : "ES —"} · {d.reconstruido_pt ? "PT ✓" : "PT —"}</span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">pendiente</span>
                        )}
                      </div>
                      <button onClick={() => handleGenerarApartado(d.codigo)} disabled={generating || genCode !== null || limpiando}
                        className="shrink-0 rounded-lg border border-brand/30 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/5 disabled:opacity-50">
                        {genCode === d.codigo ? "Generando…" : both ? "Regenerar" : "Generar"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-2 text-xs text-slate-400">Cada apartado se guarda apenas termina (no se pierde el avance). Presentación, Anexo B y Referencias se incluyen íntegros en el Word.</p>
          </div>
        )}

        {/* Lector estilo Módulo 1 */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card lg:grid-cols-[20rem_1fr] lg:h-[72vh]">
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
            {/* Toggle idioma de previsualización */}
            <div className="mx-auto mb-3 flex max-w-4xl items-center justify-end gap-1 rounded-full bg-white/70 p-1 text-xs font-semibold" style={{ width: "fit-content" }}>
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
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">✓ Reconstruido {active.modelo ? `· ${active.modelo}` : ""}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Texto original (sin aportes)</span>
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
