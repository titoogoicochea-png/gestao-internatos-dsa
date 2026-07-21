"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Doc, Lang } from "@/lib/content";
import { ANEXO_C_SUBDIMS } from "@/lib/anexo-c-sections";
import { joinGrupo, leaveGrupo, addObservacion, deleteObservacion } from "@/app/modulo2/actions";
import { AnexoCSubdimView } from "@/components/AnexoCView";
import { MarkdownView } from "@/components/MarkdownView";
import { useLang } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SectionHeader } from "@/components/SectionHeader";

type Asignacion = { doc_codigo: string };

export type ObservacionItem = { id: string; tipo: string; texto: string };

export type GrupoPublico = {
  id: string;
  nombre: string;
  nivel: "basica" | "superior";
  taller: "tarde1" | "tarde2";
  descripcion: string | null;
  cupo_max: number;
  memberCount: number;
  asignaciones: Asignacion[];
};

type Props = {
  inscritos: GrupoPublico[];
  grupos: GrupoPublico[];
  docsByNivel: { basica: Doc[]; superior: Doc[] };
  initialObservaciones?: Record<string, ObservacionItem[]>;
  fases: { tarde1: boolean; tarde2: boolean };
};

const NIVEL_LABEL_KEY = { basica: "m2u.nivel-basica", superior: "m2u.nivel-superior" };
const NIVEL_COLOR = { basica: "from-[#2F4156] to-[#3e566b]", superior: "from-[#567C8D] to-[#7fa0b2]" };
const TALLER_LABEL_KEY = { tarde1: "m2u.taller-tarde1", tarde2: "m2u.taller-tarde2" };
const TALLERES = ["tarde1", "tarde2"] as const;

// Todos los aportes se guardan como un solo tipo neutro; la app no separa por categoría.
const TIPO_APORTE = "comentario";

// Las asignaciones guardan el id de sección en ES (sections_es). Las secciones PT/ES
// son paralelas (mismo orden) porque la estructura del documento es idéntica.
function langSection(doc: Doc, sectionId: string, lang: Lang) {
  const idx = doc.sections_es.findIndex((s) => s.id === sectionId);
  if (idx < 0) return null;
  const parallel = doc.sections.length === doc.sections_es.length;
  const usePt = lang === "pt" && parallel;
  const sec = (usePt ? doc.sections : doc.sections_es)[idx] ?? doc.sections_es[idx];
  const raw = usePt ? doc.raw : doc.raw_es;
  return { sec, raw };
}

function getSectionTitle(doc: Doc, sectionId: string, lang: Lang): string {
  return langSection(doc, sectionId, lang)?.sec.text ?? "";
}

function getSectionContent(doc: Doc, sectionId: string, lang: Lang): string {
  const ls = langSection(doc, sectionId, lang);
  if (!ls) return "";
  const { sec, raw } = ls;
  const lines = raw.split("\n");
  const prefix = "#".repeat(sec.depth);
  const target = sec.text.trim().toLowerCase().replace(/\s+/g, " ");
  let started = false;
  const out: string[] = [];
  for (const line of lines) {
    if (!started) {
      const stripped = line.startsWith(prefix + " ")
        ? line.slice(sec.depth + 1).trim().toLowerCase().replace(/\s+/g, " ")
        : null;
      if (stripped === target) started = true;
    } else {
      const m = line.match(/^(#{1,6})\s/);
      if (m && m[1].length <= sec.depth) break;
      out.push(line);
    }
  }
  return out.join("\n").trim();
}

function getFullDocContent(doc: Doc, lang: Lang): string {
  return lang === "pt" ? doc.raw : doc.raw_es;
}

export function Modulo2Usuario({ inscritos, grupos, docsByNivel, initialObservaciones = {}, fases }: Props) {
  const router = useRouter();
  const { lang, t } = useLang();
  const [nivel, setNivel] = useState<"basica" | "superior">(inscritos[0]?.nivel ?? "basica");
  const [isPending, startTransition] = useTransition();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Workspace state (anotaciones)
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [items, setItems] = useState<Record<string, ObservacionItem[]>>(initialObservaciones);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const inscritoPorTaller: Record<"tarde1" | "tarde2", GrupoPublico | null> = {
    tarde1: inscritos.find((g) => g.taller === "tarde1") ?? null,
    tarde2: inscritos.find((g) => g.taller === "tarde2") ?? null,
  };
  const faltaAlguno = !inscritoPorTaller.tarde1 || !inscritoPorTaller.tarde2;

  function handleJoin(grupoId: string) {
    setError(null);
    setJoiningId(grupoId);
    startTransition(async () => {
      try {
        const res = await joinGrupo(grupoId);
        if (!res.ok) setError(res.error ?? t("m2u.error-no-se-pudo-unir"));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("m2u.error-al-unirse"));
      } finally {
        setJoiningId(null);
        router.refresh();
      }
    });
  }

  function handleLeave(grupoId: string) {
    if (!confirm(t("m2u.confirmar-salir-grupo"))) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await leaveGrupo(grupoId);
        if (!res.ok) setError(res.error ?? t("m2u.error-no-se-pudo-salir"));
      } catch (err) {
        setError(err instanceof Error ? err.message : t("m2u.error-al-salir"));
      } finally {
        router.refresh();
      }
    });
  }

  async function handleAdd(grupoId: string, docCodigo: string) {
    const texto = (drafts[docCodigo] ?? "").trim();
    if (!texto) return;

    setSaving((prev) => ({ ...prev, [docCodigo]: true }));
    try {
      const id = await addObservacion(grupoId, docCodigo, TIPO_APORTE, texto);
      setItems((prev) => ({ ...prev, [docCodigo]: [...(prev[docCodigo] ?? []), { id, tipo: TIPO_APORTE, texto }] }));
      setDrafts((prev) => ({ ...prev, [docCodigo]: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("m2u.error-no-se-pudo-guardar"));
    } finally {
      setSaving((prev) => ({ ...prev, [docCodigo]: false }));
    }
  }

  async function handleDelete(docCodigo: string, itemId: string) {
    try {
      await deleteObservacion(itemId);
      setItems((prev) => ({ ...prev, [docCodigo]: (prev[docCodigo] ?? []).filter((i) => i.id !== itemId) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("m2u.error-no-se-pudo-eliminar"));
    }
  }

  // Barra lateral de aportes (reutilizada por Workshop 1 y Workshop 2)
  function renderAportesSidebar(grupoId: string, key: string) {
    const currentDraft = drafts[key] ?? "";
    const isSaving = saving[key] ?? false;
    const cardItems = items[key] ?? [];
    return (
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto bg-slate-50/60 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            {t("m2u.observaciones-sugerencias-comentarios")}
          </p>
          <textarea rows={5} value={currentDraft}
            onChange={(e) => setDrafts((prev) => ({ ...prev, [key]: e.target.value }))}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleAdd(grupoId, key); } }}
            placeholder={t("m2u.escribe-observacion-placeholder")}
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20" />
          <button onClick={() => handleAdd(grupoId, key)} disabled={!currentDraft.trim() || isSaving}
            className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-40">
            {isSaving ? t("m2u.guardando") : t("m2u.agregar")}
          </button>
          <p className="text-right text-xs text-slate-400">{t("m2u.atajo-guardar")}</p>
        </div>

        {cardItems.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t("m2u.mis-aportes")} ({cardItems.length})</p>
            {cardItems.map((obsItem) => (
              <div key={obsItem.id} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{obsItem.texto}</p>
                  <button onClick={() => handleDelete(key, obsItem.id)} className="shrink-0 text-slate-400 hover:text-red-500 text-lg leading-none" title={t("m2u.eliminar")}>×</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Render: área de trabajo de un grupo inscrito ────────────────
  function renderWorkspace(grupo: GrupoPublico) {
    const isWorkshop2 = grupo.taller === "tarde2";
    const abierto = fases[grupo.taller];
    const nivelDocs = docsByNivel[grupo.nivel].filter((d) => d.kind === "capitulo");
    const anexoDoc = isWorkshop2 ? docsByNivel[grupo.nivel].find((d) => d.codigo === "ANEXO_C") : undefined;

    type AssignedItem =
      | { type: "doc"; doc: (typeof nivelDocs)[number]; assignmentCode: string }
      | { type: "section"; doc: (typeof nivelDocs)[number]; sectionId: string; sectionText: string; assignmentCode: string };

    const assignedItems: AssignedItem[] = !isWorkshop2
      ? grupo.asignaciones.flatMap((a): AssignedItem[] => {
          if (a.doc_codigo.includes("#")) {
            const [docCode, sectionId] = a.doc_codigo.split("#");
            const doc = nivelDocs.find((d) => d.codigo === docCode);
            const section = doc?.sections_es.find((s) => s.id === sectionId);
            if (doc && section) return [{ type: "section", doc, sectionId, sectionText: section.text, assignmentCode: a.doc_codigo }];
            return [];
          }
          const doc = nivelDocs.find((d) => d.codigo === a.doc_codigo);
          return doc ? [{ type: "doc", doc, assignmentCode: a.doc_codigo }] : [];
        })
      : [];

    const assignedSubdims = isWorkshop2
      ? ANEXO_C_SUBDIMS.filter((s) => grupo.asignaciones.some((a) => a.doc_codigo === s.id))
      : [];

    return (
      <div>
        {/* Grupo info */}
        <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${NIVEL_COLOR[grupo.nivel]}`} />
        <div className="mb-4 rounded-b-2xl border border-t-0 border-slate-200/70 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-400">{t(NIVEL_LABEL_KEY[grupo.nivel])}</span>
              <h3 className="text-xl font-extrabold text-slate-800">{grupo.nombre}</h3>
              {grupo.descripcion && <p className="mt-1 text-base text-slate-600">{grupo.descripcion}</p>}
              <p className="mt-1 text-sm text-slate-400">{grupo.memberCount}/{grupo.cupo_max} {t("m2u.participantes")}</p>
            </div>
            <button onClick={() => handleLeave(grupo.id)} disabled={isPending}
              className="shrink-0 text-sm text-slate-400 hover:text-red-600 disabled:opacity-40">
              {t("m2u.salir")}
            </button>
          </div>
        </div>

        {/* Banner cerrado */}
        {!abierto && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <span className="text-lg leading-none">🔒</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">{t("m2u.workshop-no-habilitado-titulo")}</p>
              <p className="mt-0.5 text-sm text-amber-700">
                {t("m2u.workshop-no-habilitado-texto")}
              </p>
            </div>
          </div>
        )}

        {/* Contenido asignado */}
        {isWorkshop2 ? (
          assignedSubdims.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              {t("m2u.sin-subdimensiones-asignadas")}
            </p>
          ) : (
            <div className="space-y-3">
              {assignedSubdims.map((sub) => {
                const key = sub.id;
                const isOpen = abierto && expandedKey === key;
                const cardItems = items[key] ?? [];
                const totalCount = cardItems.length;

                return (
                  <div key={key} className={`overflow-hidden rounded-2xl border border-slate-200/70 shadow-card ${abierto ? "bg-white" : "bg-slate-50"}`}>
                    <button
                      onClick={() => { if (abierto) setExpandedKey(isOpen ? null : key); }}
                      disabled={!abierto}
                      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${abierto ? "hover:bg-slate-50" : "cursor-default"}`}
                    >
                      <div className={`h-8 w-1.5 shrink-0 rounded-full ${abierto ? `bg-gradient-to-b ${NIVEL_COLOR[grupo.nivel]}` : "bg-slate-200"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-400">{sub.codigo} · {t("m2u.dim-abrev")} {sub.dimNum}</p>
                        <p className={`text-base font-semibold ${abierto ? "text-slate-800" : "text-slate-500"}`}>{lang === "pt" ? sub.titulo_pt : sub.titulo_es}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!abierto ? (
                          <span className="text-slate-300">🔒</span>
                        ) : (
                          <>
                            {totalCount > 0 && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                {totalCount} {totalCount === 1 ? t("m2u.aporte") : t("m2u.aportes")}
                              </span>
                            )}
                            <span className="text-sm text-slate-400">{isOpen ? "▲" : "▼"}</span>
                          </>
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100">
                        <div className="grid grid-cols-1 lg:h-[72vh] lg:grid-cols-[1fr_480px] lg:divide-x lg:divide-slate-100">
                          {/* Contenido de la subdimensión (igual que en el Módulo 1) */}
                          <div className="m2doc min-h-0 overflow-y-auto p-6">
                            <div className="mb-3">
                              <a href={`/${grupo.nivel}?doc=ANEXO_C`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand hover:underline">
                                {t("m2u.abrir-anexo-c-completo")} →
                              </a>
                            </div>
                            {anexoDoc ? (
                              <AnexoCSubdimView raw={lang === "pt" ? anexoDoc.raw : anexoDoc.raw_es} subdimId={sub.id} />
                            ) : (
                              <p className="italic text-sm text-slate-400">
                                {t("m2u.consulta-criterios-anexo-c")}
                              </p>
                            )}
                          </div>

                          {/* Sidebar aportes */}
                          {renderAportesSidebar(grupo.id, key)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : assignedItems.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
            {t("m2u.sin-contenido-asignado")}
          </p>
        ) : (
          <div className="space-y-3">
            {assignedItems.map((item) => {
              const key = item.assignmentCode;
              const isOpen = abierto && expandedKey === key;
              const cardItems = items[key] ?? [];
              const totalCount = cardItems.length;
              const content = item.type === "section" ? getSectionContent(item.doc, item.sectionId, lang) : getFullDocContent(item.doc, lang);

              return (
                <div key={key} className={`overflow-hidden rounded-2xl border border-slate-200 shadow-sm ${abierto ? "bg-white" : "bg-slate-50"}`}>
                  <button
                    onClick={() => { if (abierto) setExpandedKey(isOpen ? null : key); }}
                    disabled={!abierto}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${abierto ? "hover:bg-slate-50" : "cursor-default"}`}
                  >
                    <div className={`h-8 w-1.5 shrink-0 rounded-full ${abierto ? `bg-gradient-to-b ${NIVEL_COLOR[grupo.nivel]}` : "bg-slate-200"}`} />
                    <div className="min-w-0 flex-1">
                      {item.type === "section" ? (
                        <>
                          <p className="text-xs font-semibold text-slate-400">{lang === "pt" ? item.doc.titulo_pt : item.doc.titulo_es}</p>
                          <p className={`text-base font-semibold ${abierto ? "text-slate-800" : "text-slate-500"}`}>{getSectionTitle(item.doc, item.sectionId, lang)}</p>
                        </>
                      ) : (
                        <p className={`text-base font-semibold ${abierto ? "text-slate-800" : "text-slate-500"}`}>{lang === "pt" ? item.doc.titulo_pt : item.doc.titulo_es}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!abierto ? (
                        <span className="text-slate-300">🔒</span>
                      ) : (
                        <>
                          {totalCount > 0 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                              {totalCount} {totalCount === 1 ? t("m2u.aporte") : t("m2u.aportes")}
                            </span>
                          )}
                          <span className="text-sm text-slate-400">{isOpen ? "▲" : "▼"}</span>
                        </>
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100">
                      <div className="grid grid-cols-1 lg:h-[72vh] lg:grid-cols-[1fr_480px] lg:divide-x lg:divide-slate-100">
                        {/* Contenido */}
                        <div className="m2doc min-h-0 overflow-y-auto p-6">
                          {content ? (
                            <div className="max-w-[70ch]">
                              <MarkdownView markdown={content} />
                            </div>
                          ) : (
                            <p className="italic text-sm text-slate-400">
                              {t("m2u.lee-el-texto-en-el")}{" "}
                              <a href={`/${grupo.nivel}?doc=${item.doc.codigo}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">{t("m2u.documento-completo")}</a>.
                            </p>
                          )}
                        </div>

                        {/* Sidebar aportes */}
                        {renderAportesSidebar(grupo.id, key)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Render: selector de grupo para un workshop sin inscripción ──
  function renderPicker(taller: "tarde1" | "tarde2") {
    const disponibles = grupos.filter((g) => g.taller === taller && g.nivel === nivel);

    if (disponibles.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
          {t("m2u.sin-grupos-nivel-prefijo")} {t(NIVEL_LABEL_KEY[nivel]).toLowerCase()} {t("m2u.sin-grupos-nivel-sufijo")}
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {disponibles.map((grupo) => {
          const isFull = grupo.memberCount >= grupo.cupo_max;
          const pct = Math.min(100, Math.round((grupo.memberCount / grupo.cupo_max) * 100));
          const isW2 = grupo.taller === "tarde2";

          return (
            <div key={grupo.id} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
              <div className={`h-1.5 bg-gradient-to-r ${NIVEL_COLOR[grupo.nivel]}`} />
              <div className="p-5">
                <h3 className="text-xl font-bold text-slate-800">{grupo.nombre}</h3>
                {grupo.descripcion && <p className="mt-1 text-base text-slate-500">{grupo.descripcion}</p>}
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-sm text-slate-400">
                    <span>{grupo.memberCount} {t("m2u.participantes")}</span>
                    <span>{isFull ? t("m2u.completo") : `${grupo.cupo_max - grupo.memberCount} ${t("m2u.cupos-disponibles")}`}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full transition-all ${isFull ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {(() => {
                  if (isW2) {
                    const subdims = ANEXO_C_SUBDIMS.filter((s) => grupo.asignaciones.some((a) => a.doc_codigo === s.id));
                    return subdims.length > 0 ? (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-medium text-slate-500">{t("m2u.subdimensiones-label")}</p>
                        <ul className="space-y-0.5">{subdims.map((s) => <li key={s.id} className="text-xs text-slate-600">· {s.codigo} {lang === "pt" ? s.titulo_pt : s.titulo_es}</li>)}</ul>
                      </div>
                    ) : null;
                  }
                  const allDocs = docsByNivel[grupo.nivel].filter((d) => d.kind === "capitulo");
                  // Capítulos asignados (sin "#"; si quedaran códigos de sección antiguos, tomamos su capítulo)
                  const capCodes = Array.from(new Set(grupo.asignaciones.map((a) => a.doc_codigo.split("#")[0])));
                  const caps = capCodes
                    .map((code) => allDocs.find((d) => d.codigo === code))
                    .filter((d): d is Doc => !!d);
                  return caps.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-slate-500">{t("m2u.contenido-label")}</p>
                      {caps.map((doc) => {
                        const titulo = lang === "pt" ? doc.titulo_pt : doc.titulo_es;
                        const subt = lang === "pt" ? doc.subtitulo : doc.subtitulo_es;
                        const secs = (lang === "pt" && doc.sections.length === doc.sections_es.length ? doc.sections : doc.sections_es)
                          .filter((s) => s.depth === 3 && /^\d+\.\d+/.test(s.text));
                        return (
                          <div key={doc.codigo}>
                            <p className="text-xs font-semibold text-slate-700">{titulo}{subt ? ` — ${subt}` : ""}</p>
                            {secs.length > 0 && (
                              <ul className="mt-0.5 space-y-0.5 pl-3">
                                {secs.map((s, i) => <li key={i} className="text-xs text-slate-500">· {s.text}</li>)}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null;
                })()}

                <button onClick={() => handleJoin(grupo.id)} disabled={isFull || isPending}
                  className={`mt-4 w-full rounded-lg py-3 text-base font-semibold transition ${isFull ? "cursor-not-allowed bg-slate-100 text-slate-400" : "bg-brand text-white hover:bg-brand/90 disabled:opacity-60"}`}>
                  {isFull ? t("m2u.grupo-completo") : joiningId === grupo.id ? t("m2u.uniendose") : t("m2u.unirme-a-este-grupo")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Render: bloque por workshop ─────────────────────────────────
  function renderWorkshopBlock(taller: "tarde1" | "tarde2") {
    const inscrito = inscritoPorTaller[taller];
    return (
      <section className="mb-10">
        <SectionHeader
          icon={taller === "tarde1" ? "1" : "2"}
          accent={taller === "tarde1" ? "from-[#2F4156] to-[#567C8D]" : "from-[#567C8D] to-[#8FB0BF]"}
          title={t(TALLER_LABEL_KEY[taller])}
          action={
            inscrito ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">✓ {t("m2u.inscrito")}</span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">{t("m2u.falta-inscribirte")}</span>
            )
          }
        />
        {inscrito ? renderWorkspace(inscrito) : renderPicker(taller)}
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-[1720px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-base text-white/80 hover:text-white">← {t("m2u.inicio")}</a>
            <span className="text-white/40">/</span>
            <span className="text-base font-semibold text-white">{t("m2u.modulo-2-mi-participacion")}</span>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="mx-auto max-w-[1720px] px-4 py-8">
        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

        {/* Recordatorio + selector de nivel cuando falta inscribirse */}
        {faltaAlguno && (
          <div className="mb-8">
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4">
              <span className="text-lg leading-none">📌</span>
              <div>
                <p className="text-base font-semibold text-slate-800">{t("m2u.debes-inscribirte-titulo")}</p>
                <p className="mt-0.5 text-base text-slate-600">
                  {t("m2u.tu-participacion-requiere-1")} <strong>{t("m2u.workshop-1")}</strong> {t("m2u.tu-participacion-requiere-2")} <strong>{t("m2u.workshop-2")}</strong>.
                  {" "}{t("m2u.elige-tu-nivel")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(["basica", "superior"] as const).map((n) => (
                <button key={n} onClick={() => setNivel(n)}
                  className={`rounded-2xl border-2 p-3 text-center transition ${nivel === n ? "border-brand bg-brand text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 hover:bg-slate-50"}`}>
                  <p className="text-lg font-extrabold">{t(NIVEL_LABEL_KEY[n])}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {TALLERES.map((t) => <div key={t}>{renderWorkshopBlock(t)}</div>)}
      </main>
    </div>
  );
}
