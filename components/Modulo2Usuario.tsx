"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Doc } from "@/lib/content";
import { ANEXO_C_SUBDIMS } from "@/lib/anexo-c-sections";
import { joinGrupo, leaveGrupo } from "@/app/modulo2/actions";
import { upsertObservacion } from "@/app/trabajo/actions";

type Asignacion = { doc_codigo: string };
type SaveStatus = "idle" | "saving" | "saved" | "error";

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

export type MiSuscripcion = {
  grupo: {
    id: string;
    nombre: string;
    nivel: "basica" | "superior";
    taller: "tarde1" | "tarde2";
    descripcion: string | null;
    cupo_max: number;
    asignaciones: Asignacion[];
    memberCount: number;
  };
} | null;

type Props = {
  suscripcion: MiSuscripcion;
  grupos: GrupoPublico[];
  docsByNivel: { basica: Doc[]; superior: Doc[] };
  initialComments?: Record<string, string>;
};

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const NIVEL_COLOR = { basica: "from-sky-600 to-brand", superior: "from-emerald-600 to-emerald-800" };
const TALLER_LABEL = { tarde1: "Workshop 1 — Tarde 1", tarde2: "Workshop 2 — Tarde 2" };

function getSectionContent(doc: Doc, sectionId: string): string {
  const sec = doc.sections_es.find((s) => s.id === sectionId);
  if (!sec) return "";
  const lines = doc.raw_es.split("\n");
  const prefix = "#".repeat(sec.depth);
  const target = sec.text.trim().toLowerCase().replace(/\s+/g, " ");
  let started = false;
  const out: string[] = [];
  for (const line of lines) {
    if (!started) {
      const stripped = line.startsWith(prefix + " ") ? line.slice(sec.depth + 1).trim().toLowerCase().replace(/\s+/g, " ") : null;
      if (stripped === target) started = true;
    } else {
      const m = line.match(/^(#{1,6})\s/);
      if (m && m[1].length <= sec.depth) break;
      out.push(line);
    }
  }
  return out.join("\n").trim();
}

export function Modulo2Usuario({ suscripcion, grupos, docsByNivel, initialComments = {} }: Props) {
  const [taller, setTaller] = useState<"tarde1" | "tarde2">("tarde1");
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Comment state (only used in subscribed view)
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>(initialComments);
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function handleJoin(grupoId: string) {
    setError(null);
    startTransition(async () => {
      try { await joinGrupo(grupoId); }
      catch (err) { setError(err instanceof Error ? err.message : "Error al unirse al grupo"); }
    });
  }

  function handleLeave() {
    if (!confirm("¿Salir de este grupo? Perderás acceso a su contenido asignado.")) return;
    setError(null);
    startTransition(async () => {
      try { await leaveGrupo(); }
      catch (err) { setError(err instanceof Error ? err.message : "Error al salir del grupo"); }
    });
  }

  const handleCommentChange = useCallback((grupoId: string, assignmentCode: string, texto: string) => {
    setComments((prev) => ({ ...prev, [assignmentCode]: texto }));
    setSaveStatus((prev) => ({ ...prev, [assignmentCode]: "saving" }));
    clearTimeout(timers.current[assignmentCode]);
    timers.current[assignmentCode] = setTimeout(async () => {
      try {
        await upsertObservacion(grupoId, assignmentCode, "main", texto);
        setSaveStatus((prev) => ({ ...prev, [assignmentCode]: "saved" }));
        setTimeout(() => {
          setSaveStatus((prev) => prev[assignmentCode] === "saved" ? { ...prev, [assignmentCode]: "idle" } : prev);
        }, 2000);
      } catch {
        setSaveStatus((prev) => ({ ...prev, [assignmentCode]: "error" }));
      }
    }, 800);
  }, []);

  // ── Vista: ya pertenece a un grupo ──────────────────────────────
  if (suscripcion) {
    const { grupo } = suscripcion;
    const isWorkshop2 = grupo.taller === "tarde2";
    const nivelDocs = docsByNivel[grupo.nivel].filter((d) => d.kind === "capitulo");

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

    const totalItems = isWorkshop2 ? assignedSubdims.length : assignedItems.length;
    const commented = Object.values(comments).filter((t) => t.trim()).length;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <a href="/" className="text-sm text-slate-400 hover:text-slate-600">← Inicio</a>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-semibold text-brand">Módulo 2 · Mi grupo</span>
            </div>
            {!isWorkshop2 && totalItems > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${NIVEL_COLOR[grupo.nivel]} transition-all`}
                    style={{ width: `${totalItems ? Math.round((commented / totalItems) * 100) : 0}%` }}
                  />
                </div>
                <span>{commented}/{totalItems} comentadas</span>
              </div>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

          {/* Grupo info */}
          <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${NIVEL_COLOR[grupo.nivel]}`} />
          <div className="mb-6 rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{NIVEL_LABEL[grupo.nivel]}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs font-semibold text-slate-400">{TALLER_LABEL[grupo.taller]}</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">{grupo.nombre}</h1>
            {grupo.descripcion && <p className="mt-2 text-sm text-slate-600">{grupo.descripcion}</p>}
            <p className="mt-1 text-xs text-slate-400">{grupo.memberCount}/{grupo.cupo_max} participantes</p>
          </div>

          {/* Content list */}
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            {isWorkshop2 ? "Subdimensiones del Anexo C asignadas a tu grupo" : `Contenido asignado — ${NIVEL_LABEL[grupo.nivel]}`}
          </h2>

          {isWorkshop2 ? (
            assignedSubdims.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                El administrador aún no ha asignado subdimensiones a este grupo.
              </p>
            ) : (
              <div className="space-y-2">
                {assignedSubdims.map((sub) => (
                  <a key={sub.id} href={`/${grupo.nivel}?doc=99_anexoC#${sub.id}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${NIVEL_COLOR[grupo.nivel]}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-400">{sub.codigo} · Dim. {sub.dimNum}</p>
                      <p className="text-sm font-semibold text-slate-800">{sub.titulo_es}</p>
                    </div>
                    <span className="ml-auto text-slate-300">→</span>
                  </a>
                ))}
              </div>
            )
          ) : assignedItems.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
              El administrador aún no ha asignado contenido a este grupo.
            </p>
          ) : (
            <div className="space-y-3">
              {assignedItems.map((item) => {
                const key = item.assignmentCode;
                const isOpen = expandedKey === key;
                const commentText = comments[key] ?? "";
                const status = saveStatus[key] ?? "idle";
                const hasComment = commentText.trim().length > 0;

                const content = item.type === "section"
                  ? getSectionContent(item.doc, item.sectionId)
                  : "";

                return (
                  <div key={key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Card header — clickable */}
                    <button
                      onClick={() => setExpandedKey(isOpen ? null : key)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50"
                    >
                      <div className={`h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${NIVEL_COLOR[grupo.nivel]}`} />
                      <div className="min-w-0 flex-1">
                        {item.type === "section" ? (
                          <>
                            <p className="text-xs font-semibold text-slate-400">{item.doc.titulo_es}</p>
                            <p className="text-sm font-semibold text-slate-800">{item.sectionText}</p>
                          </>
                        ) : (
                          <p className="text-sm font-semibold text-slate-800">{item.doc.titulo_es}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {hasComment && <span className="h-2 w-2 rounded-full bg-emerald-400" title="Tiene comentario" />}
                        <span className="text-slate-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {/* Expanded: content + comment */}
                    {isOpen && (
                      <div className="border-t border-slate-100">
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
                          {/* Content */}
                          <div className="overflow-y-auto border-b border-slate-100 p-5 lg:border-b-0 lg:border-r lg:max-h-[70vh]">
                            {content ? (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                              </div>
                            ) : (
                              <p className="italic text-slate-400 text-sm">
                                Abre el{" "}
                                <a href={`/${grupo.nivel}?doc=${item.doc.codigo}`} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                                  documento completo
                                </a>{" "}
                                para leer esta sección.
                              </p>
                            )}
                          </div>

                          {/* Comment box */}
                          <div className="flex flex-col gap-2 bg-slate-50/70 p-4">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Tus comentarios, observaciones y/o sugerencias
                            </label>
                            <textarea
                              value={commentText}
                              onChange={(e) => handleCommentChange(grupo.id, key, e.target.value)}
                              rows={10}
                              placeholder="Escribe aquí tus comentarios..."
                              className="w-full flex-1 resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                            <div className="text-right text-xs">
                              {status === "saving" && <span className="text-slate-400">Guardando…</span>}
                              {status === "saved" && <span className="text-emerald-600">✓ Guardado</span>}
                              {status === "error" && <span className="text-red-500">Error al guardar</span>}
                              {status === "idle" && hasComment && <span className="text-slate-300">✓ Guardado</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 border-t border-slate-100 pt-4">
            <button onClick={handleLeave} disabled={isPending}
              className="text-sm text-slate-400 hover:text-red-600 disabled:opacity-40">
              Salir de este grupo
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Vista: sin grupo — explorar y unirse ────────────────────────
  const gruposDeNivel = grupos.filter((g) => g.taller === taller && g.nivel === nivel);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-slate-400 hover:text-slate-600">← Inicio</a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-brand">Módulo 2 · Grupos de trabajo</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-slate-800">Únete a un grupo</h1>
          <p className="mt-2 text-sm text-slate-500">
            Elige el nivel y el grupo que mejor se alinee con tu área de trabajo.<br />
            Solo puedes pertenecer a un grupo.
          </p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-700">{error}</p>}

        <div className="mb-4 grid grid-cols-2 gap-3">
          {(["basica", "superior"] as const).map((n) => (
            <button key={n} onClick={() => setNivel(n)}
              className={`rounded-2xl border-2 p-4 text-center transition ${
                nivel === n ? "border-brand bg-brand text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 hover:bg-slate-50"
              }`}>
              <p className="font-extrabold">{NIVEL_LABEL[n]}</p>
            </button>
          ))}
        </div>

        <div className="mb-5 flex justify-center gap-2">
          {(["tarde1", "tarde2"] as const).map((t) => (
            <button key={t} onClick={() => setTaller(t)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                taller === t ? "bg-slate-800 text-white shadow" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}>
              {TALLER_LABEL[t]}
            </button>
          ))}
        </div>

        {gruposDeNivel.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            No hay grupos disponibles para {NIVEL_LABEL[nivel].toLowerCase()} todavía.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {gruposDeNivel.map((grupo) => {
              const isFull = grupo.memberCount >= grupo.cupo_max;
              const pct = Math.min(100, Math.round((grupo.memberCount / grupo.cupo_max) * 100));
              const isW2 = grupo.taller === "tarde2";

              return (
                <div key={grupo.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className={`h-1.5 bg-gradient-to-r ${NIVEL_COLOR[grupo.nivel]}`} />
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800">{grupo.nombre}</h3>
                    {grupo.descripcion && <p className="mt-1 text-sm text-slate-500">{grupo.descripcion}</p>}
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-400">
                        <span>{grupo.memberCount} participantes</span>
                        <span>{isFull ? "Completo" : `${grupo.cupo_max - grupo.memberCount} cupos disponibles`}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full transition-all ${isFull ? "bg-red-400" : "bg-emerald-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {(() => {
                      if (isW2) {
                        const items = ANEXO_C_SUBDIMS.filter((s) => grupo.asignaciones.some((a) => a.doc_codigo === s.id));
                        return items.length > 0 ? (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-medium text-slate-500">Subdimensiones:</p>
                            <ul className="space-y-0.5">{items.map((s) => <li key={s.id} className="text-xs text-slate-600">· {s.codigo} {s.titulo_es}</li>)}</ul>
                          </div>
                        ) : null;
                      }
                      const allDocs = docsByNivel[grupo.nivel].filter((d) => d.kind === "capitulo");
                      const previewItems = grupo.asignaciones.flatMap((a) => {
                        if (a.doc_codigo.includes("#")) {
                          const [docCode, sectionId] = a.doc_codigo.split("#");
                          const doc = allDocs.find((d) => d.codigo === docCode);
                          const section = doc?.sections_es.find((s) => s.id === sectionId);
                          return section ? [{ label: section.text }] : [];
                        }
                        const doc = allDocs.find((d) => d.codigo === a.doc_codigo);
                        return doc ? [{ label: doc.titulo_es + (doc.subtitulo_es ? ` — ${doc.subtitulo_es}` : "") }] : [];
                      });
                      return previewItems.length > 0 ? (
                        <div className="mt-3">
                          <p className="mb-1 text-xs font-medium text-slate-500">Contenido:</p>
                          <ul className="space-y-0.5">{previewItems.map((item, i) => <li key={i} className="text-xs text-slate-600">· {item.label}</li>)}</ul>
                        </div>
                      ) : null;
                    })()}

                    <button onClick={() => handleJoin(grupo.id)} disabled={isFull || isPending}
                      className={`mt-4 w-full rounded-lg py-2 text-sm font-semibold transition ${
                        isFull ? "cursor-not-allowed bg-slate-100 text-slate-400" : "bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
                      }`}>
                      {isFull ? "Grupo completo" : isPending ? "Uniéndose..." : "Unirme a este grupo"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
