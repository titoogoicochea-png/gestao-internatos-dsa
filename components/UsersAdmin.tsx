"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/admin/usuarios/actions";
import { useLang } from "@/components/LanguageProvider";

type Profile = {
  id: string;
  nombre: string;
  email: string | null;
  rol: string;
  created_at: string;
};

const ROL_COLOR: Record<string, string> = {
  propietario: "bg-purple-100 text-purple-700",
  admin:        "bg-mist text-brand",
  usuario:      "bg-slate-100 text-slate-600",
};

type GrupoUser = { nombre: string; taller: string };

export function UsersAdmin({
  profiles,
  currentUserId,
  gruposByUser = {},
}: {
  profiles: Profile[];
  currentUserId: string;
  gruposByUser?: Record<string, GrupoUser[]>;
}) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const rolLabel = (rol: string): string =>
    t(`users.rol-${ROL_COLOR[rol] ? rol : "usuario"}`);
  const rolColor = (rol: string): string => ROL_COLOR[rol] ?? ROL_COLOR.usuario;

  const filtered = profiles.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function handleRoleChange(userId: string, newRol: "admin" | "usuario") {
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRol);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t("users.error-update-rol"));
      }
    });
  }

  const registeredLabel = t(
    profiles.length === 1 ? "users.registered-count-one" : "users.registered-count-other"
  ).replace("{n}", String(profiles.length));

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-white/80 hover:text-white">← {t("users.nav-home")}</a>
            <span className="text-white/40">/</span>
            <span className="text-sm font-semibold text-white">{t("users.title")}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-[#2F4156]">{t("users.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("users.description")}
          </p>
        </div>

        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder={t("users.search-placeholder")}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-sm rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("users.col-nombre")}</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("users.col-email")}</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("users.col-grupos")}</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("users.col-rol")}</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{t("users.col-accion")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      {t("users.empty")}
                    </td>
                  </tr>
                )}
                {filtered.map(profile => {
                  const isMe = profile.id === currentUserId;

                  return (
                    <tr key={profile.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {profile.nombre}
                        {isMe && <span className="ml-2 text-xs text-slate-400">{t("users.me")}</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{profile.email ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        {(gruposByUser[profile.id] ?? []).length === 0 ? (
                          <span className="text-xs text-slate-300">{t("users.sin-grupo")}</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(gruposByUser[profile.id] ?? []).map((g, i) => (
                              <span
                                key={i}
                                className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                                  g.taller === "tarde2" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"
                                }`}
                                title={g.taller === "tarde2" ? t("users.taller2-title") : t("users.taller1-title")}
                              >
                                {g.nombre}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${rolColor(profile.rol)}`}>
                          {rolLabel(profile.rol)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isMe || profile.rol === "propietario" ? (
                          <span className="text-xs text-slate-300">—</span>
                        ) : profile.rol === "admin" ? (
                          <button
                            disabled={isPending}
                            onClick={() => handleRoleChange(profile.id, "usuario")}
                            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                          >
                            {t("users.quitar-admin")}
                          </button>
                        ) : (
                          <button
                            disabled={isPending}
                            onClick={() => handleRoleChange(profile.id, "admin")}
                            className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-40"
                          >
                            {t("users.hacer-admin")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            {registeredLabel}
          </p>
        </div>
      </main>
    </div>
  );
}
