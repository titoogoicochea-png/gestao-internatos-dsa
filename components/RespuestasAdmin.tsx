"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type ObsResp = { id: string; autorId: string; autor: string; tema: string; texto: string; fecha: string };
export type MemberResp = { id: string; nombre: string; email: string | null };
export type GrupoRespuestas = {
  id: string;
  nombre: string;
  nivel: "basica" | "superior";
  taller: "tarde1" | "tarde2";
  descripcion: string | null;
  members: MemberResp[];
  observaciones: ObsResp[];
};

const NIVELES = [
  ["basica", "Educación Básica"],
  ["superior", "Educación Superior"],
] as const;
const TALLERES = [
  ["tarde1", "Workshop 1 · Tarde 1"],
  ["tarde2", "Workshop 2 · Tarde 2"],
] as const;

function fmtFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

const nivelLabel = (n: string) => NIVELES.find((x) => x[0] === n)?.[1] ?? n;
const tallerLabel = (t: string) => TALLERES.find((x) => x[0] === t)?.[1] ?? t;

export function RespuestasAdmin({ grupos }: { grupos: GrupoRespuestas[] }) {
  const [nivel, setNivel] = useState<"basica" | "superior">("basica");
  const [taller, setTaller] = useState<"tarde1" | "tarde2">("tarde1");
  const [q, setQ] = useState("");

  const visibles = useMemo(
    () => grupos.filter((g) => g.nivel === nivel && g.taller === taller).sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [grupos, nivel, taller]
  );

  const totalObs = visibles.reduce((n, g) => n + g.observaciones.length, 0);
  const totalPart = visibles.reduce((n, g) => n + g.members.length, 0);
  const participaron = new Set(visibles.flatMap((g) => g.observaciones.map((o) => o.autorId))).size;

  const needle = q.trim().toLowerCase();
  const match = (o: ObsResp) =>
    !needle || o.texto.toLowerCase().includes(needle) || o.autor.toLowerCase().includes(needle) || o.tema.toLowerCase().includes(needle);

  function exportCSV() {
    const rows: string[][] = [["Nivel", "Workshop", "Grupo", "Participante", "Tema", "Observación", "Fecha"]];
    for (const g of visibles) {
      for (const o of g.observaciones) {
        rows.push([nivelLabel(nivel), tallerLabel(taller), g.nombre, o.autor, o.tema, o.texto, fmtFecha(o.fecha)]);
      }
    }
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `respuestas-${nivel}-${taller}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/80 hover:text-white">← Inicio</Link>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">Respuestas por grupo</span>
          </div>
          <Link href="/modulo3" className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10">
            Informe consolidado →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-[#2F4156]">Respuestas de los participantes</h1>
            <p className="mt-1 text-sm text-slate-500">Observaciones, sugerencias y comentarios registrados en el Módulo 2, por grupo y persona.</p>
          </div>
          <button
            onClick={exportCSV}
            disabled={totalObs === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            ⬇ Exportar a Excel (CSV)
          </button>
        </div>

        {/* Selectores nivel + workshop */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="grid grid-cols-2 gap-2">
            {NIVELES.map(([n, label]) => (
              <button key={n} onClick={() => setNivel(n)}
                className={`rounded-xl border-2 p-3 text-center text-sm font-bold transition ${
                  nivel === n ? "border-brand bg-brand text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}>
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TALLERES.map(([tl, label]) => (
              <button key={tl} onClick={() => setTaller(tl)}
                className={`rounded-xl border-2 p-3 text-center text-sm font-bold transition ${
                  taller === tl ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Resumen + búsqueda */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 shadow-sm">
            {visibles.length} grupos · {participaron}/{totalPart} participaron · {totalObs} respuestas
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por texto, persona o tema…"
            className="min-w-[16rem] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        {visibles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            No hay grupos en este nivel y workshop.
          </p>
        ) : (
          <div className="space-y-5">
            {visibles.map((g) => (
              <GrupoCard key={g.id} grupo={g} match={match} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function GrupoCard({ grupo, match }: { grupo: GrupoRespuestas; match: (o: ObsResp) => boolean }) {
  // Observaciones por autor (dentro del grupo)
  const porAutor = new Map<string, { nombre: string; items: ObsResp[] }>();
  for (const o of grupo.observaciones) {
    if (!porAutor.has(o.autorId)) porAutor.set(o.autorId, { nombre: o.autor, items: [] });
    porAutor.get(o.autorId)!.items.push(o);
  }
  // Miembros sin aportes (para saber quién no participó)
  const conAportes = new Set(porAutor.keys());
  const sinAportes = grupo.members.filter((m) => !conAportes.has(m.id));

  const filtered = grupo.observaciones.filter(match).length;
  const totalItems = grupo.observaciones.length;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">{grupo.nombre}</h2>
          {grupo.descripcion && <p className="text-sm text-slate-500">{grupo.descripcion}</p>}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600">{grupo.members.length} participantes</span>
          <span className="rounded-full bg-brand/10 px-2.5 py-1 font-semibold text-brand">{totalItems} respuestas</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {totalItems === 0 ? (
          <p className="px-5 py-6 text-center text-sm italic text-slate-400">Este grupo aún no registró observaciones.</p>
        ) : (
          Array.from(porAutor.values())
            .filter((a) => a.items.some(match))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
            .map((a) => (
              <div key={a.nombre} className="px-5 py-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2F4156] to-[#567C8D] text-xs font-bold text-white">
                    {a.nombre.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <span className="font-semibold text-slate-800">{a.nombre}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{a.items.length}</span>
                </div>
                <ul className="space-y-2 pl-9">
                  {a.items.filter(match).map((o) => (
                    <li key={o.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                        <span className="font-semibold text-brand-light">{o.tema}</span>
                        <span>·</span>
                        <span>{fmtFecha(o.fecha)}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{o.texto}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </div>

      {sinAportes.length > 0 && (
        <div className="border-t border-slate-100 bg-amber-50/50 px-5 py-2.5">
          <p className="text-xs text-amber-700">
            <span className="font-semibold">Sin aportes ({sinAportes.length}):</span>{" "}
            {sinAportes.map((m) => m.nombre).join(", ")}
          </p>
        </div>
      )}
    </section>
  );
}
