"use client";

import { useState, useTransition } from "react";
import {
  updateUserRole,
  updateUserData,
  resetUserPassword,
} from "@/app/admin/usuarios/actions";
import { useLang } from "@/components/LanguageProvider";
import { PhoneInput } from "@/components/PhoneInput";

type Profile = {
  id: string;
  nombre: string;
  email: string | null;
  celular: string | null;
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
  currentUserRole,
  gruposByUser = {},
}: {
  profiles: Profile[];
  currentUserId: string;
  currentUserRole: string;
  gruposByUser?: Record<string, GrupoUser[]>;
}) {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal editar datos
  const [editing, setEditing] = useState<Profile | null>(null);

  // Modal restablecer contraseña
  const [resetting, setResetting] = useState<Profile | null>(null);
  const [resetResult, setResetResult] = useState<{ password: string; nombre: string; celular: string } | null>(null);

  const rolLabel = (rol: string): string =>
    t(`users.rol-${ROL_COLOR[rol] ? rol : "usuario"}`);
  const rolColor = (rol: string): string => ROL_COLOR[rol] ?? ROL_COLOR.usuario;

  // Un admin puede gestionar a cualquiera menos al propietario; el propietario a todos.
  const canManage = (p: Profile): boolean =>
    currentUserRole === "propietario" ? true : p.rol !== "propietario";

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

          <div className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-card">
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
                  const manage = canManage(profile);
                  const canToggleRole = canManage(profile) && !isMe && profile.rol !== "propietario";
                  const hasActions = manage || canToggleRole;

                  return (
                    <tr key={profile.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5 font-medium text-slate-800">
                        {profile.nombre}
                        {isMe && <span className="ml-2 text-xs text-slate-400">{t("users.me")}</span>}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        <div>{profile.email ?? "—"}</div>
                        {profile.celular ? (
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
                            <span aria-hidden>📱</span>{profile.celular}
                          </div>
                        ) : (
                          <div className="mt-0.5 text-xs text-slate-300">{t("users.sin-whatsapp")}</div>
                        )}
                      </td>
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
                        {!hasActions ? (
                          <span className="text-xs text-slate-300">—</span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            {manage && (
                              <button
                                onClick={() => { setError(null); setEditing(profile); }}
                                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                              >
                                {t("users.btn-editar")}
                              </button>
                            )}
                            {manage && !isMe && (
                              <button
                                onClick={() => { setError(null); setResetResult(null); setResetting(profile); }}
                                className="rounded-lg border border-brand/30 bg-mist px-3 py-1 text-xs font-medium text-brand hover:bg-brand/10"
                              >
                                {t("users.btn-reset")}
                              </button>
                            )}
                            {canToggleRole && (profile.rol === "admin" ? (
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
                            ))}
                          </div>
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

      {editing && (
        <EditModal
          key={editing.id}
          profile={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {resetting && (
        <ResetModal
          key={resetting.id}
          profile={resetting}
          result={resetResult}
          onResult={setResetResult}
          onClose={() => { setResetting(null); setResetResult(null); }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────── Modal: editar datos ─────────────────────────── */

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function EditModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const { t } = useLang();
  const [nombre, setNombre] = useState(profile.nombre);
  const [celular, setCelular] = useState(profile.celular ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setError(null);
    if (!nombre.trim()) { setError(t("users.error-generic")); return; }
    setSaving(true);
    try {
      await updateUserData(profile.id, { nombre, celular });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("users.error-generic"));
      setSaving(false);
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <h3 className="text-lg font-bold text-[#2F4156]">{t("users.edit-title")}</h3>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t("users.col-nombre")}</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t("users.edit-whatsapp")}</label>
          <PhoneInput value={celular} onChange={setCelular} placeholder={t("auth.phone_placeholder")} />
          <p className="mt-1 text-xs text-slate-400">{t("users.edit-whatsapp-help")}</p>
        </div>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          {t("users.edit-cancel")}
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
        >
          {saving ? t("users.edit-saving") : t("users.edit-save")}
        </button>
      </div>
    </ModalShell>
  );
}

/* ──────────────────────── Modal: restablecer contraseña ──────────────────── */

function ResetModal({
  profile,
  result,
  onResult,
  onClose,
}: {
  profile: Profile;
  result: { password: string; nombre: string; celular: string } | null;
  onResult: (r: { password: string; nombre: string; celular: string }) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generar() {
    setError(null);
    setLoading(true);
    try {
      const r = await resetUserPassword(profile.id);
      onResult(r);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("users.error-generic"));
    } finally {
      setLoading(false);
    }
  }

  async function copiar() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  function waLink(): string {
    if (!result) return "#";
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const msg = t("users.reset-msg")
      .replace("{nombre}", result.nombre.split(" ")[0])
      .replace("{password}", result.password)
      .replace("{url}", `${origin}/login`);
    const numero = result.celular.replace(/\D/g, "");
    return `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <ModalShell onClose={onClose}>
      {!result ? (
        <>
          <h3 className="text-lg font-bold text-[#2F4156]">{t("users.reset-title")}</h3>
          <p className="mt-3 text-sm text-slate-600">
            {t("users.reset-confirm").replace("{nombre}", profile.nombre)}
          </p>

          {error && <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

          <div className="mt-6 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {t("users.edit-cancel")}
            </button>
            <button
              onClick={generar}
              disabled={loading}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {loading ? t("users.reset-generating") : t("users.reset-generate")}
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold text-[#2F4156]">{t("users.reset-done-title")}</h3>

          <label className="mb-1 mt-4 block text-sm font-medium text-slate-700">{t("users.reset-password-label")}</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-center font-mono text-lg font-bold tracking-wider text-[#2F4156]">
              {result.password}
            </code>
            <button
              onClick={copiar}
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              {copied ? t("users.reset-copied") : t("users.reset-copy")}
            </button>
          </div>

          {result.celular ? (
            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1eb85a]"
            >
              <span aria-hidden>💬</span> {t("users.reset-send-whatsapp")}
            </a>
          ) : (
            <p className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {t("users.reset-no-phone")}
            </p>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {t("users.close")}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
