"use client";

import { useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { SectionHeader } from "@/components/SectionHeader";
import { generarConsolidado, generarIdeasFuerza } from "@/app/modulo3/actions";
import type { ContenidoInforme } from "@/lib/llm";
import type { Motor, Badge } from "@/lib/ai/motores";
import type { GrupoTema } from "@/lib/informe-data";

type Props = {
  fases: { tarde1: boolean; tarde2: boolean };
  informesIniciales: Record<string, ContenidoInforme>;
  conteos: Record<string, number>;
  rawData: Record<string, GrupoTema[]>;
  motoresActivos?: string[];
};

// Etiquetas de los motores (nombres de producto, neutros al idioma).
const MOTOR_LABEL: Record<string, string> = {
  auto: "Automático",
  groq: "Groq · Llama 3.3 70B",
  "gemini-flash": "Gemini 2.5 Flash",
  deepseek: "DeepSeek Chat",
  grok: "Grok (xAI)",
  chatgpt: "ChatGPT · GPT-4o mini",
  "gemini-pro": "Gemini 2.5 Pro",
  haiku: "Claude Haiku 4.5",
  sonnet: "Claude Sonnet 4.6",
};
const MOTOR_OPCIONES: { id: Exclude<Motor, "auto">; badge: Badge }[] = [
  { id: "groq", badge: "GRATIS" },
  { id: "gemini-flash", badge: "GRATIS" },
  { id: "deepseek", badge: "BARATO" },
  { id: "haiku", badge: "BARATO" },
  { id: "sonnet", badge: "PREMIUM" },
];
const BADGE_STYLE: Record<Badge, string> = {
  GRATIS: "bg-emerald-100 text-emerald-700",
  BARATO: "bg-sky-100 text-sky-700",
  PREMIUM: "bg-amber-100 text-amber-700",
};

// Un color por capítulo / dimensión
const PALETA = ["#2563eb", "#059669", "#d97706", "#7c3aed", "#dc2626", "#0891b2", "#db2777", "#65a30d"];
const color = (i: number) => PALETA[i % PALETA.length];

type Tfn = (k: string) => string;
const nivelLabel = (nivel: "basica" | "superior", t: Tfn) => t(nivel === "basica" ? "m3.nivel-basica" : "m3.nivel-superior");
const tallerLabel = (taller: "tarde1" | "tarde2", t: Tfn) => t(taller === "tarde1" ? "m3.taller-tarde1" : "m3.taller-tarde2");

function fmtFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

const motorLabel = (id: string): string => MOTOR_LABEL[id] ?? id;

export function Modulo3Admin({ fases, informesIniciales, conteos, rawData, motoresActivos = [] }: Props) {
  const { t } = useLang();
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [taller, setTaller] = useState<"tarde1" | "tarde2">("tarde1");
  const [motor, setMotor] = useState<Motor>("auto");
  const [informes, setInformes] = useState(informesIniciales);
  const [espacio, setEspacio] = useState<1 | 2>(1);
  const [generating, setGenerating] = useState<null | "consolidado" | "ideasFuerza">(null);
  const [downloading, setDownloading] = useState<null | "consolidado" | "ideasFuerza">(null);
  const [error, setError] = useState<string | null>(null);
  const [verAportes, setVerAportes] = useState(false);

  const key = `${nivel}__${taller}`;
  const contenido = informes[key] ?? {};
  const consolidado = contenido.consolidado;
  const ideasFuerza = contenido.ideasFuerza;
  const conteo = conteos[key] ?? 0;
  const abierto = fases[taller];
  const aportes = rawData[key] ?? [];
  const unidad = taller === "tarde2" ? t("m3.unidad-dimension") : t("m3.unidad-capitulo");
  const esp1Titulo = taller === "tarde2" ? t("m3.esp1-titulo-dim") : t("m3.esp1-titulo-cap");
  const subtituloDoc = `${nivelLabel(nivel, t)} · ${tallerLabel(taller, t)}`;
  const ideasDesactualizadas =
    !!ideasFuerza && !!consolidado && ideasFuerza.generadoEn < consolidado.generadoEn;

  function setParte(k: "consolidado" | "ideasFuerza", parte: ContenidoInforme["consolidado"]) {
    setInformes((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), [k]: parte } }));
  }

  async function handleGenerarConsolidado() {
    setError(null);
    setGenerating("consolidado");
    try {
      const res = await generarConsolidado(nivel, taller, motor);
      if (!res.ok || !res.parte) setError(res.error ?? t("m3.error-generar"));
      else setParte("consolidado", res.parte);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("m3.error-inesperado"));
    } finally {
      setGenerating(null);
    }
  }

  async function handleGenerarIdeas() {
    setError(null);
    setGenerating("ideasFuerza");
    try {
      const res = await generarIdeasFuerza(nivel, taller, motor);
      if (!res.ok || !res.parte) setError(res.error ?? t("m3.error-generar"));
      else setParte("ideasFuerza", res.parte);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("m3.error-inesperado"));
    } finally {
      setGenerating(null);
    }
  }

  async function handleDescargarWord(esp: "consolidado" | "ideasFuerza") {
    const parte = esp === "consolidado" ? consolidado : ideasFuerza;
    if (!parte) return;
    setError(null);
    setDownloading(esp);
    try {
      const { informeADocx, descargarBlob } = await import("@/lib/informe-docx");
      const tituloDoc = esp === "consolidado" ? esp1Titulo : t("m3.esp2-titulo");
      const blob = await informeADocx({
        tituloDoc,
        subtitulo: subtituloDoc,
        resumenLabel: t("m3.resumen-general"),
        informe: parte.informe,
      });
      const base = esp === "consolidado" ? "consolidado" : "ideas-fuerza";
      descargarBlob(blob, `${base}-${nivel}-${taller}.docx`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("m3.error-inesperado"));
    } finally {
      setDownloading(null);
    }
  }

  const btnBrand =
    "rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50";
  const btnWord =
    "inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50";

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-white/80 hover:text-white">← {t("m3.inicio")}</a>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">{t("m3.breadcrumb")}</span>
          </div>
          <a href="/respuestas" className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10">
            Ver respuestas por grupo →
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-display text-4xl font-bold text-[#2F4156]">{t("m3.titulo")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("m3.intro-prefijo")} ({taller === "tarde2" ? t("m3.intro-orden-dimension") : t("m3.intro-orden-capitulo")}) {t("m3.intro-sufijo")}
          </p>
        </div>

        {/* Selectores nivel + workshop */}
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

        {/* Motor de IA en escala (compartido por ambos espacios) */}
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
          <SectionHeader icon="🤖" title={t("m3.motor-ia")} />
          <MotorSelector value={motor} onChange={setMotor} motoresActivos={motoresActivos} t={t} />
          <p className="mt-2 text-xs text-slate-400">{t("m3.motor-ayuda")}</p>
        </div>

        {/* Aportes crudos (referencia) */}
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
                  <TemaColapsable key={g.clave} c={color(i)} titulo={g.titulo} puntos={g.aportes} />
                ))}
              </div>
            )}
          </div>
        )}

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        {/* ── Pestañas de los dos espacios ── */}
        <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
          <button onClick={() => setEspacio(1)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${espacio === 1 ? "bg-white text-[#2F4156] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t("m3.espacio-1")} · {esp1Titulo}
          </button>
          <button onClick={() => setEspacio(2)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${espacio === 2 ? "bg-white text-[#2F4156] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {t("m3.espacio-2")} · {t("m3.esp2-titulo")}
          </button>
        </div>

        {/* ── Espacio 1: Consolidado ── */}
        {espacio === 1 && (
          <section>
            <p className="mb-3 text-sm text-slate-500">{t("m3.esp1-desc").replace("{u}", unidad)}</p>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button onClick={handleGenerarConsolidado} disabled={generating !== null || conteo === 0} className={btnBrand}>
                {generating === "consolidado"
                  ? t("m3.generando")
                  : conteo === 0
                  ? t("m3.btn-sin-aportes")
                  : consolidado
                  ? t("m3.regenerar-consolidado")
                  : t("m3.generar-consolidado")}
              </button>
              {consolidado && (
                <button onClick={() => handleDescargarWord("consolidado")} disabled={downloading !== null} className={btnWord}>
                  ⬇ {downloading === "consolidado" ? t("m3.generando") : t("m3.descargar-word")}
                </button>
              )}
            </div>
            {generating === "consolidado" && <p className="mb-3 text-xs text-slate-400">{t("m3.tiempo-estimado")}</p>}

            {consolidado && (
              <>
                <p className="mb-3 text-xs text-slate-400">
                  {t("m3.informe-generado-con")} <strong>{motorLabel(consolidado.modelo)}</strong> · {fmtFecha(consolidado.generadoEn)}
                </p>
                {consolidado.informe.resumenGeneral && (
                  <div className="mb-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">{t("m3.resumen-general")}</p>
                    <p className="text-base leading-relaxed text-slate-700">{consolidado.informe.resumenGeneral}</p>
                  </div>
                )}
                <div className="space-y-3">
                  {consolidado.informe.secciones.map((s, i) => (
                    <TemaColapsable key={i} c={color(i)} titulo={s.titulo} sintesis={s.sintesis} puntos={s.puntos} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ── Espacio 2: Ideas fuerza ── */}
        {espacio === 2 && (
          <section>
            <p className="mb-3 text-sm text-slate-500">{t("m3.esp2-desc").replace("{u}", unidad)}</p>
            {!consolidado && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">{t("m3.esp2-bloqueado")}</p>
            )}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <button onClick={handleGenerarIdeas} disabled={generating !== null || !consolidado} className={btnBrand}>
                {generating === "ideasFuerza"
                  ? t("m3.generando")
                  : ideasFuerza
                  ? t("m3.regenerar-ideas")
                  : t("m3.generar-ideas")}
              </button>
              {ideasFuerza && (
                <button onClick={() => handleDescargarWord("ideasFuerza")} disabled={downloading !== null} className={btnWord}>
                  ⬇ {downloading === "ideasFuerza" ? t("m3.generando") : t("m3.descargar-word")}
                </button>
              )}
            </div>
            {generating === "ideasFuerza" && <p className="mb-3 text-xs text-slate-400">{t("m3.tiempo-estimado")}</p>}

            {ideasFuerza && (
              <>
                <p className="mb-1 text-xs text-slate-400">
                  {t("m3.informe-generado-con")} <strong>{motorLabel(ideasFuerza.modelo)}</strong> · {fmtFecha(ideasFuerza.generadoEn)}
                </p>
                {ideasDesactualizadas && (
                  <p className="mb-3 text-xs font-medium text-amber-600">⚠ {t("m3.esp2-desactualizado")}</p>
                )}
                {ideasFuerza.informe.resumenGeneral && (
                  <div className="mb-4 mt-2 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">{t("m3.ideas-fuerza-generales")}</p>
                    <p className="text-base leading-relaxed text-slate-700">{ideasFuerza.informe.resumenGeneral}</p>
                  </div>
                )}
                <div className="space-y-3">
                  {ideasFuerza.informe.secciones.map((s, i) => (
                    <TemaCard key={i} c={color(i)} titulo={s.titulo} puntos={s.puntos} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// Selector de motor de IA como desplegable compacto (muestra el elegido; la lista aparece al clic).
function MotorSelector({
  value, onChange, motoresActivos, t,
}: {
  value: Motor;
  onChange: (m: Motor) => void;
  motoresActivos: string[];
  t: Tfn;
}) {
  const [open, setOpen] = useState(false);
  const selBadge = value === "auto" ? null : MOTOR_OPCIONES.find((o) => o.id === value)?.badge;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-left transition hover:border-brand/40"
      >
        <span className="flex min-w-0 items-center gap-2">
          {value === "auto" && <span aria-hidden>⚡</span>}
          <span className="truncate text-sm font-semibold text-[#2F4156]">
            {value === "auto" ? t("m3.motor-auto-label") : motorLabel(value)}
          </span>
          {selBadge && (
            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${BADGE_STYLE[selBadge]}`}>
              {t(`m3.badge-${selBadge.toLowerCase()}`)}
            </span>
          )}
        </span>
        <span className="shrink-0 text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => { onChange("auto"); setOpen(false); }}
              className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-slate-50 ${value === "auto" ? "bg-brand/5" : ""}`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold text-[#2F4156]">⚡ {t("m3.motor-auto-label")}</span>
                <span className="block text-xs text-slate-400">{t("m3.motor-auto-desc")}</span>
              </span>
              {value === "auto" && <span className="shrink-0 font-bold text-brand">✓</span>}
            </button>
            <div className="border-t border-slate-100" />
            {MOTOR_OPCIONES.map((m) => {
              const activo = motoresActivos.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onChange(m.id); setOpen(false); }}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-slate-50 ${value === m.id ? "bg-brand/5" : ""}`}
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-slate-800">{motorLabel(m.id)}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {!activo && <span className="text-[10px] text-slate-400">{t("m3.motor-no-config")}</span>}
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${BADGE_STYLE[m.badge]}`}>
                      {t(`m3.badge-${m.badge.toLowerCase()}`)}
                    </span>
                    {value === m.id && <span className="font-bold text-brand">✓</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Sección desplegable (colapsada por defecto) — usada en el consolidado y en los aportes crudos.
function TemaColapsable({ c, titulo, sintesis, puntos }: {
  c: string; titulo: string; sintesis?: string; puntos: string[];
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-card" style={{ borderLeft: `6px solid ${c}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        style={{ background: `${c}0d` }}
      >
        <h3 className="text-lg font-bold" style={{ color: c }}>{titulo}</h3>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold" style={{ color: c }}>{puntos.length}</span>
          <span className="text-sm" style={{ color: c }}>{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="p-4">
          {sintesis && <p className="mb-2 text-sm text-slate-600">{sintesis}</p>}
          {puntos.length === 0 ? (
            <p className="text-xs italic text-slate-300">{t("m3.sin-aportes")}</p>
          ) : (
            <ul className="space-y-1.5">
              {puntos.map((it, i) => (
                <li key={i} className="flex gap-2 text-base leading-snug text-slate-700">
                  <span style={{ color: c }}>•</span><span>{it}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Tarjeta expandida (ideas fuerza — contenido breve).
function TemaCard({ c, titulo, puntos }: { c: string; titulo: string; puntos: string[] }) {
  const { t } = useLang();
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-card" style={{ borderLeft: `6px solid ${c}` }}>
      <div className="px-4 py-2.5" style={{ background: `${c}0d` }}>
        <h3 className="text-lg font-bold" style={{ color: c }}>{titulo}</h3>
      </div>
      <div className="p-4">
        {puntos.length === 0 ? (
          <p className="text-xs italic text-slate-300">{t("m3.sin-aportes")}</p>
        ) : (
          <ul className="space-y-1.5">
            {puntos.map((it, i) => (
              <li key={i} className="flex gap-2 text-base leading-snug text-slate-700">
                <span style={{ color: c }}>•</span><span>{it}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
