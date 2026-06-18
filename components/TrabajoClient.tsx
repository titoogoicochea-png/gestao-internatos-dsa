"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { upsertObservacion } from "@/app/trabajo/actions";
import type { WorkSection } from "@/lib/sections-parser";

export type Assignment = {
  docCodigo: string;
  title: string;
  parentTitle: string;
  sections: WorkSection[];
  nivelLink: string;
};

type Props = {
  grupoId: string;
  grupoNombre: string;
  nivel: "basica" | "superior";
  taller: "tarde1" | "tarde2";
  assignments: Assignment[];
  initialComments: Record<string, string>;
};

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const NIVEL_COLOR = { basica: "from-[#2F4156] to-[#3e566b]", superior: "from-[#567C8D] to-[#7fa0b2]" };
const TALLER_LABEL = { tarde1: "Workshop 1 — Tarde 1", tarde2: "Workshop 2 — Tarde 2" };

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function TrabajoClient({ grupoId, grupoNombre, nivel, taller, assignments, initialComments }: Props) {
  const [comments, setComments] = useState<Record<string, string>>(initialComments);
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(
    assignments[0]?.sections[0]
      ? `${assignments[0].docCodigo}::${assignments[0].sections[0].slug}`
      : null
  );
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleChange = useCallback(
    (docCodigo: string, seccionId: string, texto: string) => {
      const key = `${docCodigo}::${seccionId}`;
      setComments((prev) => ({ ...prev, [key]: texto }));
      setSaveStatus((prev) => ({ ...prev, [key]: "saving" }));

      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(async () => {
        try {
          await upsertObservacion(grupoId, docCodigo, seccionId, texto);
          setSaveStatus((prev) => ({ ...prev, [key]: "saved" }));
          // Reset to idle after 2s
          setTimeout(() => {
            setSaveStatus((prev) => {
              if (prev[key] === "saved") return { ...prev, [key]: "idle" };
              return prev;
            });
          }, 2000);
        } catch {
          setSaveStatus((prev) => ({ ...prev, [key]: "error" }));
        }
      }, 800);
    },
    [grupoId]
  );

  const totalSections = assignments.reduce((n, a) => n + a.sections.length, 0);
  const commented = Object.values(comments).filter((t) => t.trim()).length;

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-slate-400 hover:text-slate-600">← Inicio</a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-brand">Espacio de trabajo</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className={`rounded-full px-2.5 py-0.5 font-semibold text-white bg-gradient-to-r ${NIVEL_COLOR[nivel]}`}>
              {NIVEL_LABEL[nivel]}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-medium text-slate-600">
              {TALLER_LABEL[taller]}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Group info + progress */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">{grupoNombre}</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {commented} de {totalSections} secciones comentadas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${NIVEL_COLOR[nivel]} transition-all`}
                style={{ width: totalSections ? `${Math.round((commented / totalSections) * 100)}%` : "0%" }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {totalSections ? Math.round((commented / totalSections) * 100) : 0}%
            </span>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            El administrador aún no ha asignado contenido a tu grupo.{" "}
            <a href="/modulo2" className="text-brand hover:underline">Volver</a>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => (
              <AssignmentBlock
                key={assignment.docCodigo}
                assignment={assignment}
                comments={comments}
                saveStatus={saveStatus}
                expandedSection={expandedSection}
                onToggleSection={setExpandedSection}
                onChangeComment={handleChange}
                nivel={nivel}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AssignmentBlock({
  assignment,
  comments,
  saveStatus,
  expandedSection,
  onToggleSection,
  onChangeComment,
  nivel,
}: {
  assignment: Assignment;
  comments: Record<string, string>;
  saveStatus: Record<string, SaveStatus>;
  expandedSection: string | null;
  onToggleSection: (key: string | null) => void;
  onChangeComment: (docCodigo: string, seccionId: string, texto: string) => void;
  nivel: "basica" | "superior";
}) {
  const NIVEL_COLOR = { basica: "from-[#2F4156] to-[#3e566b]", superior: "from-[#567C8D] to-[#7fa0b2]" };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Assignment header */}
      <div className={`h-1.5 bg-gradient-to-r ${NIVEL_COLOR[nivel]}`} />
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {assignment.parentTitle !== assignment.title ? assignment.parentTitle : "Contenido asignado"}
          </p>
          <h2 className="text-base font-extrabold text-slate-800">{assignment.title}</h2>
        </div>
        <a
          href={assignment.nivelLink}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
        >
          Ver documento →
        </a>
      </div>

      {/* Sections accordion */}
      <div className="border-t border-slate-100">
        {assignment.sections.map((section, i) => {
          const key = `${assignment.docCodigo}::${section.slug}`;
          const isOpen = expandedSection === key;
          const text = comments[key] ?? "";
          const status = saveStatus[key] ?? "idle";
          const hasComment = text.trim().length > 0;

          return (
            <div key={section.slug} className={i > 0 ? "border-t border-slate-100" : ""}>
              {/* Section toggle */}
              <button
                onClick={() => onToggleSection(isOpen ? null : key)}
                className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${hasComment ? "bg-emerald-400" : "bg-slate-200"}`} />
                  <span className="text-sm font-medium text-slate-700">{section.title}</span>
                </div>
                <span className="ml-4 text-slate-400">{isOpen ? "▲" : "▼"}</span>
              </button>

              {/* Section content */}
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-5">
                  <div className="flex flex-col gap-5">
                    {/* Top: original text */}
                    <div className="prose prose-sm max-w-none rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                      {section.content ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {section.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="italic text-slate-400">
                          Lee el texto completo en el{" "}
                          <a href={assignment.nivelLink} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                            documento
                          </a>.
                        </p>
                      )}
                    </div>

                    {/* Bottom: comment box */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Tus comentarios, observaciones y/o sugerencias
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => onChangeComment(assignment.docCodigo, section.slug, e.target.value)}
                        rows={6}
                        placeholder="Escribe aquí tus comentarios sobre esta sección..."
                        className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                      <div className="flex items-center justify-end gap-2 text-xs">
                        {status === "saving" && <span className="text-slate-400">Guardando…</span>}
                        {status === "saved" && <span className="text-emerald-600">✓ Guardado</span>}
                        {status === "error" && <span className="text-red-500">Error al guardar</span>}
                        {status === "idle" && text.trim() && <span className="text-slate-300">✓ Guardado</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
