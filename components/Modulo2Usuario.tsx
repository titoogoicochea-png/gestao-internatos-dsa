"use client";

import { useState, useTransition } from "react";
import type { Doc } from "@/lib/content";
import { ANEXO_C_SUBDIMS } from "@/lib/anexo-c-sections";
import { CAP3_DIMS } from "@/lib/cap3-dims";
import { joinGrupo, leaveGrupo } from "@/app/modulo2/actions";

type Asignacion = { doc_codigo: string };

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
};

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const NIVEL_COLOR = { basica: "from-sky-600 to-brand", superior: "from-emerald-600 to-emerald-800" };
const TALLER_LABEL = { tarde1: "Workshop 1 — Tarde 1", tarde2: "Workshop 2 — Tarde 2" };

export function Modulo2Usuario({ suscripcion, grupos, docsByNivel }: Props) {
  const [taller, setTaller] = useState<"tarde1" | "tarde2">("tarde1");
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleJoin(grupoId: string) {
    setError(null);
    startTransition(async () => {
      try {
        await joinGrupo(grupoId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al unirse al grupo");
      }
    });
  }

  function handleLeave() {
    if (!confirm("¿Salir de este grupo? Perderás acceso a su contenido asignado.")) return;
    setError(null);
    startTransition(async () => {
      try {
        await leaveGrupo();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al salir del grupo");
      }
    });
  }

  // Vista: ya pertenece a un grupo
  if (suscripcion) {
    const { grupo } = suscripcion;
    const isWorkshop2 = grupo.taller === "tarde2";
    const assignedDims = !isWorkshop2
      ? CAP3_DIMS.filter(d => grupo.asignaciones.some(a => a.doc_codigo === d.id))
      : [];
    const assignedSubdims = isWorkshop2
      ? ANEXO_C_SUBDIMS.filter(s => grupo.asignaciones.some(a => a.doc_codigo === s.id))
      : [];

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <a href="/" className="text-sm text-slate-400 hover:text-slate-600">← Inicio</a>
              <span className="text-slate-300">/</span>
              <span className="text-sm font-semibold text-brand">Módulo 2 · Mi grupo</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8">
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${NIVEL_COLOR[grupo.nivel]}`} />
          <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              {NIVEL_LABEL[grupo.nivel]}
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">{grupo.nombre}</h1>
            {grupo.descripcion && (
              <p className="mt-2 text-sm text-slate-600">{grupo.descripcion}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              {grupo.memberCount}/{grupo.cupo_max} participantes
            </p>
          </div>

          <div className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              {isWorkshop2
                ? "Subdimensiones del Anexo C asignadas a tu grupo"
                : "Dimensiones del Capítulo III asignadas a tu grupo"}
            </h2>

            {isWorkshop2 ? (
              assignedSubdims.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                  El administrador aún no ha asignado subdimensiones a este grupo.
                </p>
              ) : (
                <div className="space-y-2">
                  {assignedSubdims.map(sub => (
                    <a
                      key={sub.id}
                      href={`/${grupo.nivel}?doc=99_anexoC#${sub.id}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
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
            ) : (
              assignedDims.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
                  El administrador aún no ha asignado dimensiones a este grupo.
                </p>
              ) : (
                <>
                  <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2.5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Capítulo III — Dimensiones Operativas</p>
                    <p className="mt-0.5 text-xs text-slate-400">¿Cómo formamos y cuidamos?</p>
                  </div>
                  <div className="space-y-2">
                    {assignedDims.map(dim => (
                      <a
                        key={dim.id}
                        href={`/${grupo.nivel}?doc=CAP_III#${dim.anchor_es}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className={`h-8 w-1.5 rounded-full bg-gradient-to-b ${NIVEL_COLOR[grupo.nivel]}`} />
                        <div>
                          <p className="text-xs font-bold text-slate-400">{dim.num}</p>
                          <p className="text-sm font-semibold text-slate-800">{dim.titulo_es}</p>
                        </div>
                        <span className="ml-auto text-slate-300">→</span>
                      </a>
                    ))}
                  </div>
                </>
              )
            )}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <button
              onClick={handleLeave}
              disabled={isPending}
              className="text-sm text-slate-400 hover:text-red-600 disabled:opacity-40"
            >
              Salir de este grupo
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Vista: sin grupo — explorar y unirse
  const gruposDeNivel = grupos.filter(g => g.taller === taller && g.nivel === nivel);

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

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-center text-sm text-red-700">{error}</p>
        )}

        {/* Taller tabs */}
        <div className="mb-3 flex justify-center gap-2">
          {(["tarde1", "tarde2"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTaller(t)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                taller === t
                  ? "bg-slate-800 text-white shadow"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {TALLER_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Nivel tabs */}
        <div className="mb-5 flex justify-center gap-2">
          {(["basica", "superior"] as const).map(n => (
            <button
              key={n}
              onClick={() => setNivel(n)}
              className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                nivel === n
                  ? "bg-brand text-white shadow"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {NIVEL_LABEL[n]}
            </button>
          ))}
        </div>

        {gruposDeNivel.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            No hay grupos disponibles para {NIVEL_LABEL[nivel].toLowerCase()} todavía.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {gruposDeNivel.map(grupo => {
              const isFull = grupo.memberCount >= grupo.cupo_max;
              const pct = Math.min(100, Math.round((grupo.memberCount / grupo.cupo_max) * 100));
              const docs = docsByNivel[nivel];
              const assignedDocs = docs.filter(d => grupo.asignaciones.some(a => a.doc_codigo === d.codigo));

              return (
                <div key={grupo.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className={`h-1.5 bg-gradient-to-r ${NIVEL_COLOR[nivel]}`} />
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800">{grupo.nombre}</h3>
                    {grupo.descripcion && (
                      <p className="mt-1 text-sm text-slate-500">{grupo.descripcion}</p>
                    )}

                    {/* Capacity bar */}
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-400">
                        <span>{grupo.memberCount} participantes</span>
                        <span>{isFull ? "Completo" : `${grupo.cupo_max - grupo.memberCount} cupos disponibles`}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-1.5 rounded-full transition-all ${isFull ? "bg-red-400" : "bg-emerald-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Assigned content preview */}
                    {(() => {
                      const isW2 = grupo.taller === "tarde2";
                      if (isW2) {
                        const items = ANEXO_C_SUBDIMS.filter(s => grupo.asignaciones.some(a => a.doc_codigo === s.id));
                        return items.length > 0 ? (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-medium text-slate-500">Subdimensiones:</p>
                            <ul className="space-y-0.5">
                              {items.map(s => (
                                <li key={s.id} className="text-xs text-slate-600">· {s.codigo} {s.titulo_es}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null;
                      } else {
                        const items = CAP3_DIMS.filter(d => grupo.asignaciones.some(a => a.doc_codigo === d.id));
                        return items.length > 0 ? (
                          <div className="mt-3">
                            <p className="mb-1 text-xs font-medium text-slate-500">Cap. III · Dimensiones:</p>
                            <ul className="space-y-0.5">
                              {items.map(d => (
                                <li key={d.id} className="text-xs text-slate-600">· {d.num} {d.titulo_es}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null;
                      }
                    })()}

                    <button
                      onClick={() => handleJoin(grupo.id)}
                      disabled={isFull || isPending}
                      className={`mt-4 w-full rounded-lg py-2 text-sm font-semibold transition ${
                        isFull
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
                      }`}
                    >
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
