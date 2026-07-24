"use client";

import { useState } from "react";
import Link from "next/link";
import { generarWordReconstruido } from "@/app/reconstruir/actions";

type Lang = "es" | "pt";
export type NivelResumen = { nivel: "basica" | "superior"; total: number; reconstruidos: number };

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const NIVEL_ICON = { basica: "🏫", superior: "🎓" };
const NIVEL_ACCENT = { basica: "from-[#2F4156] to-[#567C8D]", superior: "from-[#567C8D] to-[#7fa0b2]" };

function descargarBase64(base64: string, nombre: string) {
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const blob = new Blob([arr], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function ReconstruirPicker({ niveles, isAdmin }: { niveles: NivelResumen[]; isAdmin: boolean }) {
  const [descargando, setDescargando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleWord(nivel: "basica" | "superior", lang: Lang) {
    setError(null);
    setDescargando(`${nivel}-${lang}`);
    try {
      const res = await generarWordReconstruido(nivel, lang);
      if (!res || !res.ok || !res.base64) setError(res?.error ?? "No se pudo generar el Word.");
      else descargarBase64(res.base64, res.nombre ?? `referencial-${nivel}-${lang}.docx`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado.");
    } finally {
      setDescargando(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">← Inicio</Link>
          <span className="text-sm font-semibold text-white">Módulo 4 · Documento reconstruido</span>
          <span className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-brand">Documento reconstruido</h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Versión del Referencial reescrita a partir de la validación participativa —incorporando las observaciones y sugerencias de los talleres—, en español y portugués. Elige el nivel para leerlo.
          </p>
        </div>

        {error && <p className="mx-auto mb-4 max-w-xl rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-700">{error}</p>}

        <div className="grid gap-5 sm:grid-cols-2">
          {niveles.map(({ nivel, total, reconstruidos }) => (
            <div key={nivel} className="flex flex-col overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-card ring-1 ring-slate-200/50">
              <Link href={`/reconstruir/${nivel}`} className="group flex flex-col">
                <div className="flex items-start gap-4">
                  <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${NIVEL_ACCENT[nivel]} text-2xl shadow-md`}>
                    {NIVEL_ICON[nivel]}
                  </div>
                  <h2 className="self-center font-display text-xl font-bold leading-snug text-[#2F4156]">{NIVEL_LABEL[nivel]}</h2>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {reconstruidos > 0
                    ? `${reconstruidos} de ${total} apartados reconstruidos. Los demás se muestran con su texto original.`
                    : "Se muestra el texto original; los apartados reconstruidos irán apareciendo aquí."}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 self-start rounded-full bg-[#2F4156] px-4 py-2 text-sm font-semibold text-white transition-all group-hover:gap-2.5 group-hover:bg-[#567C8D]">
                  Abrir lector <span aria-hidden>→</span>
                </span>
              </Link>

              {isAdmin && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Descargar Word</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleWord(nivel, "es")} disabled={descargando !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                      ⬇ {descargando === `${nivel}-es` ? "Generando…" : "Español"}
                    </button>
                    <button onClick={() => handleWord(nivel, "pt")} disabled={descargando !== null}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
                      ⬇ {descargando === `${nivel}-pt` ? "Gerando…" : "Português"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
