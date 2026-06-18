"use client";

import { useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { SectionHeader } from "@/components/SectionHeader";
import { generarInforme } from "@/app/modulo3/actions";
import type { InformeConsolidado, ModeloId } from "@/lib/llm";
import type { GrupoTema } from "@/lib/informe-data";

export type InformeGuardado = {
  contenido: InformeConsolidado;
  modelo: string;
  generadoEn: string;
};

type Props = {
  fases: { tarde1: boolean; tarde2: boolean };
  informesIniciales: Record<string, InformeGuardado>;
  conteos: Record<string, number>;
  rawData: Record<string, GrupoTema[]>;
};

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const TALLER_LABEL = { tarde1: "Workshop 1 — Tarde 1", tarde2: "Workshop 2 — Tarde 2" };

const MODELOS_UI: { id: ModeloId; label: string; nota: string }[] = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (gratis)", nota: "Rápido · sin costo" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", nota: "Rápido · económico" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", nota: "Máxima calidad" },
];

// Un color por capítulo / dimensión
const PALETA = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#db2777", "#65a30d"];
const color = (i: number) => PALETA[i % PALETA.length];

function fmtFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function modeloLabel(id: string, t: (key: string) => string): string {
  const found = MODELOS_UI.find((m) => m.id === id);
  return found ? t(`m3.modelo-label.${found.id}`) : id;
}

type Tfn = (k: string) => string;
const nivelLabel = (nivel: "basica" | "superior", t: Tfn) => t(nivel === "basica" ? "m3.nivel-basica" : "m3.nivel-superior");
const tallerLabel = (taller: "tarde1" | "tarde2", t: Tfn) => t(taller === "tarde1" ? "m3.taller-tarde1" : "m3.taller-tarde2");

function informeATexto(inf: InformeConsolidado, nivel: keyof typeof NIVEL_LABEL, taller: keyof typeof TALLER_LABEL, t: Tfn): string {
  const L: string[] = [`# ${t("m3.export-titulo")} — ${nivelLabel(nivel, t)} · ${tallerLabel(taller, t)}`, ""];
  if (inf.resumenGeneral) L.push(inf.resumenGeneral, "");
  for (const s of inf.secciones) {
    L.push(`## ${s.titulo}`);
    if (s.sintesis) L.push(s.sintesis);
    if (s.puntos.length) { L.push(""); s.puntos.forEach((o) => L.push(`• ${o}`)); }
    L.push("");
  }
  return L.join("\n");
}

function informeAHTML(inf: InformeConsolidado, nivel: keyof typeof NIVEL_LABEL, taller: keyof typeof TALLER_LABEL, t: Tfn, lang: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const nv = nivelLabel(nivel, t);
  const tl = tallerLabel(taller, t);
  const titulo = t("m3.export-titulo");
  const secciones = inf.secciones
    .map((s, i) => {
      const c = color(i);
      const lista = s.puntos.length
        ? `<ul style="margin:8px 0 0;padding-left:20px">${s.puntos.map((it) => `<li style="margin:4px 0">${esc(it)}</li>`).join("")}</ul>`
        : "";
      return `<section style="border-left:6px solid ${c};background:${c}0d;padding:14px 18px;margin:18px 0;border-radius:10px">
        <h3 style="margin:0;color:${c}">${esc(s.titulo)}</h3>
        ${s.sintesis ? `<p style="color:#475569;margin:6px 0 0">${esc(s.sintesis)}</p>` : ""}
        ${lista}
      </section>`;
    })
    .join("");
  return `<!doctype html><html lang="${lang === "pt" ? "pt-BR" : "es"}"><head><meta charset="utf-8">
<title>${esc(titulo)} — ${esc(nv)} · ${esc(tl)}</title>
<style>body{font-family:system-ui,-apple-system,Arial,sans-serif;max-width:820px;margin:24px auto;padding:0 16px;color:#1e293b;line-height:1.5}h1{color:#0f172a;margin-bottom:2px}</style>
</head><body>
<h1>${esc(titulo)}</h1>
<p style="color:#64748b;margin-top:0"><strong>${esc(nv)}</strong> · ${esc(tl)}</p>
${inf.resumenGeneral ? `<div style="background:#f1f5f9;padding:14px 18px;border-radius:10px;margin:12px 0"><strong>${esc(t("m3.resumen-general"))}</strong><p style="margin:6px 0 0">${esc(inf.resumenGeneral)}</p></div>` : ""}
${secciones}
</body></html>`;
}

export function Modulo3Admin({ fases, informesIniciales, conteos, rawData }: Props) {
  const { t, lang } = useLang();
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [taller, setTaller] = useState<"tarde1" | "tarde2">("tarde1");
  const [modelo, setModelo] = useState<ModeloId>("gemini-2.5-flash");
  const [informes, setInformes] = useState(informesIniciales);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [verAportes, setVerAportes] = useState(true);

  const key = `${nivel}__${taller}`;
  const informe = informes[key];
  const conteo = conteos[key] ?? 0;
  const abierto = fases[taller];
  const aportes = rawData[key] ?? [];
  const unidad = taller === "tarde2" ? t("m3.unidad-dimension") : t("m3.unidad-capitulo");

  async function handleGenerar() {
    setError(null);
    setGenerating(true);
    try {
      const res = await generarInforme(nivel, taller, modelo);
      if (!res.ok || !res.informe) {
        setError(res.error ?? t("m3.error-generar"));
      } else {
        setInformes((prev) => ({
          ...prev,
          [key]: { contenido: res.informe!, modelo: res.modelo ?? modelo, generadoEn: res.generadoEn ?? new Date().toISOString() },
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("m3.error-inesperado"));
    } finally {
      setGenerating(false);
    }
  }

  function handleCopiar() {
    if (!informe) return;
    navigator.clipboard.writeText(informeATexto(informe.contenido, nivel, taller, t));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  function handleDescargar() {
    if (!informe) return;
    const blob = new Blob([informeAHTML(informe.contenido, nivel, taller, t, lang)], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `informe-${nivel}-${taller}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-white/80 hover:text-white">← {t("m3.inicio")}</a>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">{t("m3.breadcrumb")}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-[#2F4156]">{t("m3.titulo")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("m3.intro-prefijo")} ({taller === "tarde2" ? t("m3.intro-orden-dimension") : t("m3.intro-orden-capitulo")}) {t("m3.intro-sufijo")}
          </p>
        </div>

        {/* Selectores */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="grid grid-cols-2 gap-2">
            {(["basica", "superior"] as const).map((n) => (
              <button key={n} onClick={() => setNivel(n)}
                className={`rounded-xl border-2 p-3 text-center text-sm font-bold transition ${
                  nivel === n ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}>
                {n === "basica" ? t("m3.nivel-basica") : t("m3.nivel-superior")}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(["tarde1", "tarde2"] as const).map((tl) => (
              <button key={tl} onClick={() => setTaller(tl)}
                className={`rounded-xl border-2 p-3 text-center text-sm font-bold transition ${
                  taller === tl ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}>
                {tl === "tarde1" ? t("m3.workshop-1") : t("m3.workshop-2")}
              </button>
            ))}
          </div>
        </div>

        {/* Estado + conteo */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${abierto ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            <span className={`h-2 w-2 rounded-full ${abierto ? "bg-emerald-500" : "bg-slate-400"}`} />
            {abierto ? t("m3.workshop-abierto") : t("m3.workshop-cerrado")}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
            {conteo} {conteo !== 1 ? t("m3.aportes-plural") : t("m3.aportes-singular")} · {aportes.length} {taller === "tarde2" ? t("m3.dimensiones-conteo") : t("m3.capitulos-conteo")}
          </span>
        </div>

        {abierto && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {t("m3.aviso-abierto-1")} <strong>{t("m3.aviso-abierto-abierto")}</strong>{t("m3.aviso-abierto-2")} <strong>{t("m3.aviso-abierto-cerrarlo")}</strong> {t("m3.aviso-abierto-3")}
          </p>
        )}

        {/* Aportes recolectados (sin procesar) */}
        {aportes.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setVerAportes((v) => !v)}
              className="mb-3 flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              <span>{t("m3.aportes-recolectados-por")} {unidad} {t("m3.sin-procesar")}</span>
              <span className="text-slate-400">{verAportes ? "▲" : "▼"}</span>
            </button>
            {verAportes && (
              <div className="space-y-3">
                {aportes.map((g, i) => (
                  <TemaCard key={g.clave} c={color(i)} titulo={g.titulo} puntos={g.aportes} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Motor de IA + generar */}
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
          <SectionHeader icon="🤖" title={t("m3.motor-ia")} />
          <div className="grid gap-2 sm:grid-cols-3">
            {MODELOS_UI.map((m) => (
              <button key={m.id} onClick={() => setModelo(m.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  modelo === m.id ? "border-brand bg-brand/5 ring-1 ring-brand" : "border-slate-200 hover:bg-slate-50"
                }`}>
                <p className="text-sm font-semibold text-slate-800">{t(`m3.modelo-label.${m.id}`)}</p>
                <p className="text-xs text-slate-400">{t(`m3.modelo-nota.${m.id}`)}</p>
              </button>
            ))}
          </div>
          <button
            onClick={handleGenerar}
            disabled={generating || conteo === 0}
            className="mt-4 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating
              ? t("m3.btn-analizando")
              : conteo === 0
              ? t("m3.btn-sin-aportes")
              : informe
              ? t("m3.btn-regenerar")
              : t("m3.btn-generar")}
          </button>
          {generating && <p className="mt-2 text-center text-xs text-slate-400">{t("m3.tiempo-estimado")}</p>}
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        {/* Informe consolidado */}
        {informe && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-400">
                {t("m3.informe-generado-con")} <strong>{modeloLabel(informe.modelo, t)}</strong> · {fmtFecha(informe.generadoEn)}
              </p>
              <div className="flex gap-2">
                <button onClick={handleCopiar} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  {copiado ? t("m3.copiado") : t("m3.copiar-texto")}
                </button>
                <button onClick={handleDescargar} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                  ⬇ {t("m3.descargar-informe")}
                </button>
              </div>
            </div>

            {informe.contenido.resumenGeneral && (
              <div className="mb-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">{t("m3.resumen-general")}</p>
                <p className="text-sm leading-relaxed text-slate-700">{informe.contenido.resumenGeneral}</p>
              </div>
            )}

            <div className="space-y-4">
              {informe.contenido.secciones.map((s, i) => (
                <TemaCard key={i} c={color(i)} titulo={s.titulo} sintesis={s.sintesis} puntos={s.puntos} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TemaCard({
  c, titulo, sintesis, puntos,
}: {
  c: string;
  titulo: string;
  sintesis?: string;
  puntos: string[];
}) {
  const { t } = useLang();
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-card" style={{ borderLeft: `6px solid ${c}` }}>
      <div className="px-4 py-2.5" style={{ background: `${c}0d` }}>
        <h3 className="font-bold" style={{ color: c }}>{titulo}</h3>
        {sintesis && <p className="mt-1 text-sm text-slate-600">{sintesis}</p>}
      </div>
      <div className="p-4">
        {puntos.length === 0 ? (
          <p className="text-xs italic text-slate-300">{t("m3.sin-aportes")}</p>
        ) : (
          <ul className="space-y-1.5">
            {puntos.map((it, i) => (
              <li key={i} className="flex gap-2 text-sm leading-snug text-slate-700">
                <span style={{ color: c }}>•</span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
