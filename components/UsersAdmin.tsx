"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "@/app/admin/usuarios/actions";

type Profile = {
  id: string;
  nombre: string;
  email: string | null;
  rol: string;
  created_at: string;
};

const ROL_LABEL: Record<string, { label: string; color: string }> = {
  propietario: { label: "Propietario", color: "bg-purple-100 text-purple-700" },
  admin:        { label: "Admin",       color: "bg-amber-100 text-amber-700"  },
  usuario:      { label: "Usuario",     color: "bg-slate-100 text-slate-600"  },
};

export function UsersAdmin({ profiles, currentUserId }: { profiles: Profile[]; currentUserId: string }) {
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
        setError(e instanceof Error ? e.message : "Error al actualizar el rol");
      }
    });
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Rol</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
            {filtered.map(profile => {
              const isMe = profile.id === currentUserId;
              const rolInfo = ROL_LABEL[profile.rol] ?? ROL_LABEL.usuario;

              return (
                <tr key={profile.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    {profile.nombre}
                    {isMe && <span className="ml-2 text-xs text-slate-400">(tú)</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{profile.email ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${rolInfo.color}`}>
                      {rolInfo.label}
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
                        Quitar admin
                      </button>
                    ) : (
                      <button
                        disabled={isPending}
                        onClick={() => handleRoleChange(profile.id, "admin")}
                        className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-40"
                      >
                        Hacer admin
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
        {profiles.length} usuario{profiles.length !== 1 ? "s" : ""} registrado{profiles.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
