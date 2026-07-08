import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ParticipantesAdmin, type GrupoConMiembros, type Usuario } from "@/components/ParticipantesAdmin";

export const dynamic = "force-dynamic";

export default async function AdminParticipantesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = myProfile?.rol ?? "usuario";
  if (rol !== "admin" && rol !== "propietario") redirect("/");

  const { data: grupos } = await supabase
    .from("grupos")
    .select("id, nombre, nivel, taller, cupo_max")
    .order("taller")
    .order("nivel")
    .order("nombre");

  const { data: suscripciones } = await supabase
    .from("suscripciones")
    .select("grupo_id, profiles(id, nombre, email)");

  const { data: perfiles } = await supabase
    .from("profiles")
    .select("id, nombre, email")
    .order("nombre");
  const usuarios: Usuario[] = (perfiles ?? []).map((p) => ({
    id: p.id,
    nombre: p.nombre ?? "(sin nombre)",
    email: p.email ?? null,
  }));

  const membersByGrupo: Record<string, { id: string; nombre: string; email: string | null }[]> = {};
  for (const s of suscripciones ?? []) {
    const raw = s.profiles;
    const p = (Array.isArray(raw) ? raw[0] : raw) as { id: string; nombre: string; email: string | null } | null;
    if (!p) continue;
    (membersByGrupo[s.grupo_id] ??= []).push(p);
  }

  const gruposConMiembros: GrupoConMiembros[] = (grupos ?? []).map((g) => ({
    id: g.id,
    nombre: g.nombre,
    nivel: g.nivel as "basica" | "superior",
    taller: (g.taller ?? "tarde1") as "tarde1" | "tarde2",
    cupo_max: g.cupo_max,
    members: (membersByGrupo[g.id] ?? []).sort((a, b) => a.nombre.localeCompare(b.nombre)),
  }));

  return <ParticipantesAdmin grupos={gruposConMiembros} usuarios={usuarios} />;
}
