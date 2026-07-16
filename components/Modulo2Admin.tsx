"use client";

import { useState, useTransition } from "react";
import type { Doc } from "@/lib/content";
import { ANEXO_C_DIMS, ANEXO_C_SUBDIMS } from "@/lib/anexo-c-sections";
import { createGrupo, deleteGrupo, setAsignaciones, updateGrupo, setFaseTaller } from "@/app/modulo2/actions";
import { useLang } from "@/components/LanguageProvider";
import { SectionHeader } from "@/components/SectionHeader";

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
  fases: { tarde1: boolean; tarde2: boolean };
};

export function Modulo2Admin({ grupos, docsByNivel, fases }: Props) {
  const { t } = useLang();
  const NIVEL_LABEL = { basica: t("m2a.nivel-basica"), superior: t("m2a.nivel-superior") };
  const NIVEL_DESC  = { basica: t("m2a.nivel-basica-desc"), superior: t("m2a.nivel-superior-desc") };
  const TALLER_LABEL = { tarde1: t("m2a.taller-tarde1"), tarde2: t("m2a.taller-tarde2") };
  const [taller, setTaller] = useState<"tarde1" | "tarde2">("tarde1");
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", cupo_max: "20" });
  const [pendingCodigos, setPendingCodigos] = useState<Record<string, string[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ nombre: "", descripcion: "", cupo_max: "20" });
  const [fasesState, setFasesState] = useState(fases);
  const [faseSaving, setFaseSaving] = useState<"tarde1" | "tarde2" | null>(null);

  function handleToggleFase(tt: "tarde1" | "tarde2") {
    const nuevo = !fasesState[tt];
    if (nuevo === false && !confirm(t("m2a.confirm-cerrar-taller").replace("{taller}", TALLER_LABEL[tt]))) return;
    setError(null);
    setFaseSaving(tt);
    setFasesState(prev => ({ ...prev, [tt]: nuevo }));
    startTransition(async () => {
      try {
        await setFaseTaller(tt, nuevo);
      } catch (err) {
        setFasesState(prev => ({ ...prev, [tt]: !nuevo }));
        setError(err instanceof Error ? err.message : t("m2a.error-cambiar-estado"));
      } finally {
        setFaseSaving(null);
      }
    });
  }

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
        setError(err instanceof Error ? err.message : t("m2a.error-crear-grupo"));
      }
    });
  }

  function handleDelete(grupoId: string, nombre: string) {
    if (!confirm(t("m2a.confirm-eliminar-grupo").replace("{nombre}", nombre))) return;
    startTransition(async () => {
      try {
        await deleteGrupo(grupoId);
        if (expandedId === grupoId) setExpandedId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("m2a.error-eliminar"));
      }
    });
  }

  function handleStartEdit(grupo: GrupoAdmin) {
    setEditingId(grupo.id);
    setEditForm({ nombre: grupo.nombre, descripcion: grupo.descripcion ?? "", cupo_max: String(grupo.cupo_max) });
  }

  function handleSaveEdit(grupoId: string) {
    startTransition(async () => {
      try {
        await updateGrupo(grupoId, {
          nombre: editForm.nombre,
          descripcion: editForm.descripcion,
          cupo_max: parseInt(editForm.cupo_max),
        });
        setEditingId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("m2a.error-actualizar"));
      }
    });
  }

  function getAssignedLabels(grupo: GrupoAdmin): string[] {
    if (grupo.taller === "tarde2") {
      return ANEXO_C_SUBDIMS
        .filter(s => grupo.asignaciones.some(a => a.doc_codigo === s.id))
        .map(s => `${s.codigo} ${s.titulo_es}`);
    }
    const docs = docsByNivel[grupo.nivel];
    return grupo.asignaciones.map(a => {
      if (a.doc_codigo.includes("#")) {
        const [docCode, sectionId] = a.doc_codigo.split("#");
        const doc = docs.find(d => d.codigo === docCode);
        const section = doc?.sections_es.find(s => s.id === sectionId);
        return section?.text ?? a.doc_codigo;
      }
      const doc = docs.find(d => d.codigo === a.doc_codigo);
      return doc ? doc.titulo_es : a.doc_codigo;
    });
  }

  function handleGuardar(grupoId: string) {
    const codigos = codigosFor(grupos.find(g => g.id === grupoId)!);
    startTransition(async () => {
      try {
        await setAsignaciones(grupoId, codigos);
        setPendingCodigos(prev => { const n = { ...prev }; delete n[grupoId]; return n; });
      } catch (err) {
        setError(err instanceof Error ? err.message : t("m2a.error-guardar"));
      }
    });
  }

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-white/80 hover:text-white">← {t("m2a.inicio")}</a>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">{t("m2a.breadcrumb-modulo2")}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#2F4156]">{t("m2a.titulo-grupos")}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("m2a.subtitulo-grupos")}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/participantes"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              👥 {t("m2a.ver-participantes")}
            </a>
            <button
              onClick={() => setShowForm(v => !v)}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
            >
              {showForm ? t("m2a.cancelar") : t("m2a.crear-grupo")}
            </button>
          </div>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}

        {/* CONTROL DE APERTURA DE WORKSHOPS */}
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card">
          <SectionHeader icon="🚦" title={t("m2a.estado-workshops")} subtitle={t("m2a.estado-workshops-desc")} />
          <div className="grid gap-3 sm:grid-cols-2">
            {(["tarde1", "tarde2"] as const).map(tt => {
              const abierto = fasesState[tt];
              return (
                <div
                  key={tt}
                  className={`flex items-center justify-between rounded-xl border p-3.5 ${
                    abierto ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{TALLER_LABEL[tt]}</p>
                    <p className={`mt-0.5 flex items-center gap-1.5 text-xs font-medium ${abierto ? "text-emerald-600" : "text-slate-400"}`}>
                      <span className={`h-2 w-2 rounded-full ${abierto ? "bg-emerald-500" : "bg-slate-300"}`} />
                      {abierto ? t("m2a.estado-abierto") : t("m2a.estado-cerrado")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleFase(tt)}
                    disabled={isPending && faseSaving === tt}
                    className={`shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                      abierto
                        ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {faseSaving === tt ? "..." : abierto ? t("m2a.cerrar") : t("m2a.abrir-workshop")}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

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
          {(["tarde1", "tarde2"] as const).map(tt => (
            <button
              key={tt}
              onClick={() => { setTaller(tt); setExpandedId(null); }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                taller === tt
                  ? "bg-slate-800 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {TALLER_LABEL[tt]}
            </button>
          ))}
        </div>

        {/* Formulario de creación */}
        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand">{NIVEL_LABEL[nivel]}</span>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{TALLER_LABEL[taller]}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">{t("m2a.label-nombre-grupo")}</label>
                <input
                  required
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder={t("m2a.placeholder-nombre-grupo")}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-slate-600">{t("m2a.label-descripcion")}</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder={t("m2a.placeholder-descripcion")}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">{t("m2a.label-cupo-max")}</label>
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
                {isPending ? t("m2a.creando") : t("m2a.crear-grupo-submit")}
              </button>
            </div>
          </form>
        )}

        {/* Lista de grupos */}
        {gruposDeNivel.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            {t("m2a.sin-grupos").replace("{nivel}", NIVEL_LABEL[nivel].toLowerCase()).replace("{taller}", TALLER_LABEL[taller].toLowerCase())}
          </div>
        ) : (
          <div className="space-y-3">
            {gruposDeNivel.map(grupo => {
              const isExpanded = expandedId === grupo.id;
              const isEditing = editingId === grupo.id;
              const memberCount = grupo.members.length;
              const codigos = codigosFor(grupo);
              const hasPendingChanges = pendingCodigos[grupo.id] !== undefined;
              const nivelDocs = docsByNivel[grupo.nivel].filter(d => d.kind === "capitulo");
              const assignedLabels = getAssignedLabels(grupo);
              // Tarde 1: capítulos asignados (deduplicados) con sus datos, para mostrar
              // el detalle de temas (capítulo + subtítulo + secciones) como lo ve el usuario.
              const capsTarde1: Doc[] = grupo.taller === "tarde1"
                ? Array.from(new Set(grupo.asignaciones.map(a => a.doc_codigo.split("#")[0])))
                    .map(code => nivelDocs.find(d => d.codigo === code))
                    .filter((d): d is Doc => !!d)
                : [];

              return (
                <div key={grupo.id} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card transition-shadow hover:shadow-card-hover">
                  <div className="px-5 py-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-slate-500">{t("m2a.label-nombre-grupo")}</label>
                            <input
                              autoFocus
                              value={editForm.nombre}
                              onChange={e => setEditForm(f => ({ ...f, nombre: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-slate-500">{t("m2a.label-descripcion")}</label>
                            <input
                              value={editForm.descripcion}
                              onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">{t("m2a.label-cupo-max")}</label>
                            <input
                              type="number"
                              min={1}
                              max={200}
                              value={editForm.cupo_max}
                              onChange={e => setEditForm(f => ({ ...f, cupo_max: e.target.value }))}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            {t("m2a.cancelar")}
                          </button>
                          <button
                            onClick={() => handleSaveEdit(grupo.id)}
                            disabled={isPending || !editForm.nombre}
                            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
                          >
                            {isPending ? t("m2a.guardando") : t("m2a.guardar-cambios")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-800">{grupo.nombre}</h3>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              memberCount >= grupo.cupo_max
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {memberCount}/{grupo.cupo_max} {t("m2a.cupos")}
                            </span>
                          </div>
                          {grupo.descripcion && (
                            <p className="mt-0.5 text-sm text-slate-500 truncate">{grupo.descripcion}</p>
                          )}
                          {/* Tarde 1: detalle de temas (capítulo + subtítulo + secciones) */}
                          {!isExpanded && grupo.taller === "tarde1" && capsTarde1.length > 0 && (
                            <div className="mt-2 space-y-1.5">
                              <p className="text-xs font-medium text-slate-500">{t("m2u.contenido-label")}</p>
                              {capsTarde1.map(doc => {
                                const secs = doc.sections_es.filter(s => s.depth === 3 && /^\d+\.\d+/.test(s.text));
                                return (
                                  <div key={doc.codigo}>
                                    <p className="text-xs font-semibold text-slate-700">
                                      {doc.titulo_es}{doc.subtitulo_es ? ` — ${doc.subtitulo_es}` : ""}
                                    </p>
                                    {secs.length > 0 && (
                                      <ul className="mt-0.5 space-y-0.5 pl-3">
                                        {secs.map((s, i) => (
                                          <li key={i} className="text-xs text-slate-500">· {s.text}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Tarde 2: subdimensiones asignadas como etiquetas */}
                          {!isExpanded && grupo.taller === "tarde2" && assignedLabels.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {assignedLabels.map((label, i) => (
                                <span key={i} className="rounded-md bg-brand/8 px-2 py-0.5 text-xs text-brand font-medium">
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(grupo)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            {t("m2a.editar")}
                          </button>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : grupo.id)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            {isExpanded ? t("m2a.cerrar") : t("m2a.gestionar")}
                          </button>
                          <button
                            onClick={() => handleDelete(grupo.id, grupo.nombre)}
                            disabled={isPending}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            {t("m2a.eliminar")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Asignación de contenido */}
                        <div>
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-slate-700">
                              {grupo.taller === "tarde1"
                                ? `${t("m2a.capitulos")} — ${NIVEL_LABEL[grupo.nivel]}`
                                : t("m2a.subdimensiones-anexo-c")}
                            </h4>
                            {hasPendingChanges && (
                              <button
                                onClick={() => handleGuardar(grupo.id)}
                                disabled={isPending}
                                className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
                              >
                                {t("m2a.guardar")}
                              </button>
                            )}
                          </div>

                          {grupo.taller === "tarde1" ? (
                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                              {nivelDocs.map(doc => {
                                const code = doc.codigo;
                                // marcado si está el capítulo completo o cualquier sección suya (datos antiguos)
                                const checked = codigos.some(c => c === code || c.startsWith(code + "#"));
                                const toggleCap = () => {
                                  const next = checked
                                    ? codigos.filter(c => c !== code && !c.startsWith(code + "#"))
                                    : [...codigos.filter(c => !c.startsWith(code + "#")), code];
                                  setPendingCodigos(prev => ({ ...prev, [grupo.id]: next }));
                                };
                                return (
                                  <label key={doc.codigo} className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-slate-50">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={toggleCap}
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
                                    {t("m2a.dimension")} {dim.num} — {dim.titulo_es}
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
                            {t("m2a.participantes")} ({memberCount})
                          </h4>
                          {memberCount === 0 ? (
                            <p className="text-sm text-slate-400">{t("m2a.sin-participantes")}</p>
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
