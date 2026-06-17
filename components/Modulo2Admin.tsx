"use client";

import { useState, useTransition } from "react";
import type { Doc } from "@/lib/content";
import { ANEXO_C_DIMS, ANEXO_C_SUBDIMS } from "@/lib/anexo-c-sections";
import { createGrupo, deleteGrupo, setAsignaciones } from "@/app/modulo2/actions";

type Asignacion = { doc_codigo: string };
type Member = { id: string; nombre: string; email: string | null };

export type GrupoAdmin = {
  id: string;
  nombre: string;
  nivel: "basica" | "superior";
  taller: "tarde1" | "tarde2";
  descripcion: string | null;
  cupo_max: number;
  asignaciones: Asignacion[];
  members: Member[];
};

type Props = {
  grupos: GrupoAdmin[];
  docsByNivel: { basica: Doc[]; superior: Doc[] };
};

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const NIVEL_DESC  = { basica: "Internados de educación básica", superior: "Internados de educación superior" };
const TALLER_LABEL = { tarde1: "Workshop 1 — Tarde 1", tarde2: "Workshop 2 — Tarde 2" };

export function Modulo2Admin({ grupos, docsByNivel }: Props) {
  const [taller, setTaller] = useState<"tarde1" | "tarde2">("tarde1");
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", cupo_max: "20" });
  const [pendingCodigos, setPendingCodigos] = useState<Record<string, string[]>>({});

  const gruposDeNivel = grupos.filter(g => g.taller === taller && g.nivel === nivel);

  function codigosFor(grupo: GrupoAdmin): string[] {
    return pendingCodigos[grupo.id] ?? grupo.asignaciones.map(a => a.doc_codigo);
  }

  function toggleCodigo(grupoId: string, codigo: string, current: string[]) {
    const next = current.includes(codigo)
      ? current.filter(c => c !== codigo)
      : [...current, codigo];
    setPendingCodigos(prev => ({ ...prev, [grupoId]: next }));
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await createGrupo({ ...form, nivel, taller, cupo_max: parseInt(form.cupo_max) });
        setForm({ nombre: "", descripcion: "", cupo_max: "20" });
        setShowForm(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al crear el grupo");
      }
    });
  }

  function handleDelete(grupoId: string, nombre: string) {
    if (!confirm(`¿Eliminar el grupo "${nombre}"? Se quitará a todos sus miembros.`)) return;
    startTransition(async () => {
      try {
        await deleteGrupo(grupoId);
        if (expandedId === grupoId) setExpandedId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar");
      }
    });
  }

  function handleGuardar(grupoId: string) {
    const codigos = codigosFor(grupos.find(g => g.id === grupoId)!);
    startTransition(async () => {
      try {
        await setAsignaciones(grupoId, codigos);
        setPendingCodigos(prev => { const n = { ...prev }; delete n[grupoId]; return n; });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar");
      }
    });
  }

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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">Grupos de trabajo</h1>
            <p className="mt-1 text-sm text-slate-500">Selecciona el nivel, el workshop y gestiona los grupos.</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
          >
            {showForm ? "Cancelar" : "+ Crear grupo"}
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}

        {/* NIVEL — selector primario */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          {(["basica", "superior"] as const).map(n => (
            <button
              key={n}
              onClick={() => { setNivel(n); setExpandedId(null); }}
              className={`rounded-2xl border-2 p-4 text-left transition ${
                nivel === n
                  ? "border-brand bg-brand text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 hover:bg-slate-50"
              }`}
            >
              <p className="text-base font-extrabold">{NIVEL_LABEL[n]}</p>
              <p className={`mt-0.5 text-xs ${nivel === n ? "text-white/70" : "text-slate-400"}`}>
                {NIVEL_DESC[n]}
              </p>
            </button>
          ))}
        </div>

        {/* WORKSHOP — selector secundario */}
        <div className="mb-5 flex gap-2">
          {(["tarde1", "tarde2"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTaller(t); setExpandedId(null); }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                taller === t
                  ? "bg-slate-800 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {TALLER_LABEL[t]}
            </button>
          ))}
        </div>

        {/* Formulario de creación */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">{NIVEL_LABEL[nivel]}</span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{TALLER_LABEL[taller]}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Nombre del grupo</label>
                <input
                  required
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="Ej. Grupo A — Identidad Espiritual"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="¿Qué temática abordará este grupo?"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">Cupo máximo</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={form.cupo_max}
                  onChange={e => setForm(f => ({ ...f, cupo_max: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
              >
                {isPending ? "Creando..." : "Crear grupo"}
              </button>
            </div>
          </form>
        )}

        {/* Lista de grupos */}
        {gruposDeNivel.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            No hay grupos de {NIVEL_LABEL[nivel].toLowerCase()} para {TALLER_LABEL[taller].toLowerCase()} todavía.
          </div>
        ) : (
          <div className="space-y-3">
            {gruposDeNivel.map(grupo => {
              const isExpanded = expandedId === grupo.id;
              const memberCount = grupo.members.length;
              const codigos = codigosFor(grupo);
              const hasPendingChanges = pendingCodigos[grupo.id] !== undefined;
              const nivelDocs = docsByNivel[grupo.nivel].filter(d => d.kind === "capitulo");

              return (
                <div key={grupo.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-800">{grupo.nombre}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          memberCount >= grupo.cupo_max
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                          {memberCount}/{grupo.cupo_max} cupos
                        </span>
                      </div>
                      {grupo.descripcion && (
                        <p className="mt-0.5 text-sm text-slate-500 truncate">{grupo.descripcion}</p>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : grupo.id)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        {isExpanded ? "Cerrar" : "Gestionar"}
                      </button>
                      <button
                        onClick={() => handleDelete(grupo.id, grupo.nombre)}
                        disabled={isPending}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Asignación de contenido */}
                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-700">
                              {grupo.taller === "tarde1"
                                ? `Índice — ${NIVEL_LABEL[grupo.nivel]}`
                                : "Subdimensiones del Anexo C"}
                            </h4>
                            {hasPendingChanges && (
                              <button
                                onClick={() => handleGuardar(grupo.id)}
                                disabled={isPending}
                                className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
                              >
                                Guardar
                              </button>
                            )}
                          </div>

                          {grupo.taller === "tarde1" ? (
                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                              {nivelDocs.map(doc => {
                                const dimSections = doc.sections_es.filter(
                                  s => s.depth === 3 && /^\d+\.\d+/.test(s.text)
                                );
                                if (dimSections.length > 0) {
                                  return (
                                    <div key={doc.codigo} className="rounded-lg border border-slate-100 bg-slate-50/50 p-2">
                                      <p className="mb-1.5 px-1 text-xs font-bold text-slate-500">
                                        {doc.titulo_es}
                                        {doc.subtitulo_es && <span className="font-normal"> — {doc.subtitulo_es}</span>}
                                      </p>
                                      <div className="space-y-1 pl-1">
                                        {dimSections.map(section => {
                                          const code = `${doc.codigo}#${section.id}`;
                                          return (
                                            <label key={section.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white">
                                              <input
                                                type="checkbox"
                                                checked={codigos.includes(code)}
                                                onChange={() => toggleCodigo(grupo.id, code, codigos)}
                                                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                                              />
                                              <p className="text-sm text-slate-700">{section.text}</p>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                                return (
                                  <label key={doc.codigo} className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-slate-50">
                                    <input
                                      type="checkbox"
                                      checked={codigos.includes(doc.codigo)}
                                      onChange={() => toggleCodigo(grupo.id, doc.codigo, codigos)}
                                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                                    />
                                    <div>
                                      <p className="text-sm font-semibold text-slate-700">{doc.titulo_es}</p>
                                      {doc.subtitulo_es && (
                                        <p className="text-xs text-slate-400">{doc.subtitulo_es}</p>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                              {ANEXO_C_DIMS.map(dim => (
                                <div key={dim.num}>
                                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                                    Dimensión {dim.num} — {dim.titulo_es}
                                  </p>
                                  <div className="space-y-1">
                                    {ANEXO_C_SUBDIMS.filter(s => s.dimNum === dim.num).map(sub => (
                                      <label key={sub.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                                        <input
                                          type="checkbox"
                                          checked={codigos.includes(sub.id)}
                                          onChange={() => toggleCodigo(grupo.id, sub.id, codigos)}
                                          className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                                        />
                                        <span className="text-sm text-slate-700">
                                          <span className="font-medium text-slate-500">{sub.codigo}</span> {sub.titulo_es}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Lista de miembros */}
                        <div>
                          <h4 className="mb-3 text-sm font-semibold text-slate-700">
                            Participantes ({memberCount})
                          </h4>
                          {memberCount === 0 ? (
                            <p className="text-sm text-slate-400">Ningún participante aún.</p>
                          ) : (
                            <ul className="space-y-1.5">
                              {grupo.members.map(m => (
                                <li key={m.id} className="flex items-center gap-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                    {m.nombre.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-700">{m.nombre}</p>
                                    {m.email && <p className="text-xs text-slate-400 truncate">{m.email}</p>}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
