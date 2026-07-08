"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { SectionHeader } from "@/components/SectionHeader";
import { adminAddParticipante, adminRemoveParticipante } from "@/app/modulo2/actions";

export type Miembro = { id: string; nombre: string; email: string | null };
export type Usuario = { id: string; nombre: string; email: string | null };

export type GrupoConMiembros = {
  id: string;
  nombre: string;
  nivel: "basica" | "superior";
  taller: "tarde1" | "tarde2";
  cupo_max: number;
  members: Miembro[];
};

type Props = { grupos: GrupoConMiembros[]; usuarios: Usuario[] };

function useToggleSet() {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  return { open, setOpen, toggle };
}

const NIVEL_COLOR = { basica: "from-[#2F4156] to-[#3e566b]", superior: "from-[#567C8D] to-[#7fa0b2]" };
const TALLERES = ["tarde1", "tarde2"] as const;
const NIVELES = ["basica", "superior"] as const;

// --- Botón para quitar un participante del grupo ---
function RemoveButton({ grupoId, miembro }: { grupoId: string; miembro: Miembro }) {
  const { t } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();

  function remove() {
    if (!window.confirm(`${t("part.confirm-quitar")}\n\n${miembro.nombre}`)) return;
    start(async () => {
      const res = await adminRemoveParticipante(grupoId, miembro.id);
      if (!res.ok) {
        window.alert(res.error ?? "Error");
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      onClick={remove}
      disabled={pending}
      title={t("part.quitar")}
      aria-label={t("part.quitar")}
      className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold text-red-500 hover:bg-red-50 disabled:opacity-40"
    >
      {pending ? "…" : "✕"}
    </button>
  );
}

// --- Selector para añadir un participante al grupo ---
function AddParticipante({ grupo, usuarios }: { grupo: GrupoConMiembros; usuarios: Usuario[] }) {
  const { t } = useLang();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const memberIds = new Set(grupo.members.map((m) => m.id));
  const s = q.trim().toLowerCase();
  const candidatos = usuarios
    .filter((u) => !memberIds.has(u.id))
    .filter((u) => !s || u.nombre.toLowerCase().includes(s) || (u.email ?? "").toLowerCase().includes(s))
    .slice(0, 8);

  function add(u: Usuario) {
    setErr(null);
    start(async () => {
      const res = await adminAddParticipante(grupo.id, u.id);
      if (!res.ok) {
        setErr(res.error ?? "Error");
        return;
      }
      setQ("");
      router.refresh();
    });
  }

  return (
    <div className="mt-3 border-t border-dashed border-slate-200 pt-3">
      <label className="mb-1.5 block text-xs font-semibold text-slate-500">+ {t("part.anadir")}</label>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setErr(null);
        }}
        placeholder={t("part.anadir-placeholder")}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-[#567C8D] focus:ring-1 focus:ring-[#567C8D]"
      />
      {err && <p className="mt-1.5 text-xs font-medium text-red-600">{err}</p>}
      {q.trim() && (
        <ul className="mt-1.5 max-h-52 overflow-y-auto rounded-lg border border-slate-100">
          {candidatos.length === 0 ? (
            <li className="px-3 py-2 text-xs italic text-slate-400">{t("part.anadir-sin-resultados")}</li>
          ) : (
            candidatos.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => add(u)}
                  disabled={pending}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50 disabled:opacity-50"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                    {u.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-slate-700">{u.nombre}</p>
                    {u.email && <p className="truncate text-[11px] text-slate-400">{u.email}</p>}
                  </div>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export function ParticipantesAdmin({ grupos, usuarios }: Props) {
  const { t } = useLang();
  const { open, setOpen, toggle } = useToggleSet();

  const NIVEL_LABEL = { basica: t("part.nivel-basica"), superior: t("part.nivel-superior") };
  const TALLER_LABEL = { tarde1: t("part.taller-tarde1"), tarde2: t("part.taller-tarde2") };
  const conMiembros = grupos.filter((g) => g.members.length > 0);
  const todosAbiertos = conMiembros.length > 0 && conMiembros.every((g) => open.has(g.id));

  function toggleTodos() {
    setOpen(todosAbiertos ? new Set() : new Set(conMiembros.map((g) => g.id)));
  }

  function exportCSV() {
    const rows: string[][] = [[
      t("part.csv-workshop"),
      t("part.csv-nivel"),
      t("part.csv-grupo"),
      t("part.csv-nombre"),
      t("part.csv-correo"),
    ]];
    for (const taller of TALLERES) {
      for (const n of NIVELES) {
        for (const g of grupos.filter((x) => x.taller === taller && x.nivel === n)) {
          if (g.members.length === 0) {
            rows.push([TALLER_LABEL[taller], NIVEL_LABEL[n], g.nombre, t("part.csv-sin-participantes"), ""]);
          }
          for (const m of g.members) {
            rows.push([TALLER_LABEL[taller], NIVEL_LABEL[n], g.nombre, m.nombre, m.email ?? ""]);
          }
        }
      }
    }
    const csv = rows
      .map((r) => r.map((cell) => `"${(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    // BOM para que Excel respete los acentos (UTF-8)
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participantes-internados.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalGeneral = grupos.reduce((n, g) => n + g.members.length, 0);

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/modulo2" className="text-sm text-white/80 hover:text-white">← {t("part.breadcrumb-grupos")}</a>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">{t("part.titulo")}</span>
          </div>
          <button
            onClick={exportCSV}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#2F4156] hover:bg-white/90"
          >
            ⬇ {t("part.exportar")}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#2F4156]">{t("part.titulo")}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {totalGeneral} {t("part.inscripciones-total")}
            </p>
          </div>
          {conMiembros.length > 0 && (
            <button
              onClick={toggleTodos}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              {todosAbiertos ? t("part.colapsar-todos") : t("part.expandir-todos")}
            </button>
          )}
        </div>

        {TALLERES.map((taller) => {
          const gruposTaller = grupos.filter((g) => g.taller === taller);
          const totalTaller = gruposTaller.reduce((n, g) => n + g.members.length, 0);

          return (
            <section key={taller} className="mb-10">
              <SectionHeader
                icon={taller === "tarde1" ? "1" : "2"}
                accent={taller === "tarde1" ? "from-[#2F4156] to-[#567C8D]" : "from-[#567C8D] to-[#8FB0BF]"}
                title={TALLER_LABEL[taller]}
                action={
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200/70">
                    {totalTaller} {t("part.inscritos")}
                  </span>
                }
              />

              {NIVELES.map((nivel) => {
                const gruposNivel = gruposTaller.filter((g) => g.nivel === nivel);
                if (gruposNivel.length === 0) return null;

                return (
                  <div key={nivel} className="mb-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                      {NIVEL_LABEL[nivel]}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {gruposNivel.map((g) => {
                        const lleno = g.members.length >= g.cupo_max;
                        const vacio = g.members.length === 0;
                        const isOpen = open.has(g.id);
                        return (
                          <div key={g.id} className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card transition-shadow hover:shadow-card-hover">
                            <div className={`h-1.5 bg-gradient-to-r ${NIVEL_COLOR[g.nivel]}`} />
                            <button
                              onClick={() => toggle(g.id)}
                              className="flex w-full items-center justify-between gap-2 p-4 text-left hover:bg-slate-50"
                            >
                              <h3 className="font-bold text-slate-800">{g.nombre}</h3>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  lleno ? "bg-red-100 text-red-700" : vacio ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-700"
                                }`}>
                                  {g.members.length}/{g.cupo_max}
                                </span>
                                <span className="text-sm text-slate-400">{isOpen ? "▲" : "▼"}</span>
                              </div>
                            </button>
                            {isOpen ? (
                              <div className="border-t border-slate-100 p-4">
                                {vacio ? (
                                  <p className="text-sm italic text-slate-400">{t("part.sin-participantes-aun")}</p>
                                ) : (
                                  <ul className="space-y-1.5">
                                    {g.members.map((m) => (
                                      <li key={m.id} className="flex items-center gap-2">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                                          {m.nombre.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-medium text-slate-700">{m.nombre}</p>
                                          {m.email && <p className="truncate text-xs text-slate-400">{m.email}</p>}
                                        </div>
                                        <RemoveButton grupoId={g.id} miembro={m} />
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                <AddParticipante grupo={g} usuarios={usuarios} />
                              </div>
                            ) : vacio ? (
                              <p className="px-4 pb-4 text-sm italic text-slate-400">{t("part.sin-participantes-aun")}</p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}

        {grupos.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            {t("part.sin-grupos")}
          </p>
        )}
      </main>
    </div>
  );
}
