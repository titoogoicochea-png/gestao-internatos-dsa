import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocs } from "@/lib/content";
import { Modulo2Admin, type GrupoAdmin } from "@/components/Modulo2Admin";
import { Modulo2Usuario, type GrupoPublico, type MiSuscripcion } from "@/components/Modulo2Usuario";

export default async function Modulo2Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = profile?.rol ?? "usuario";
  const isAdmin = rol === "admin" || rol === "propietario";

  const docsByNivel = {
    basica: getDocs("basica"),
    superior: getDocs("superior"),
  };

  if (isAdmin) {
    const { data: grupos } = await supabase
      .from("grupos")
      .select("id, nombre, nivel, taller, descripcion, cupo_max, asignaciones(doc_codigo)")
      .order("taller")
      .order("nivel")
      .order("nombre");

    const { data: suscripciones } = await supabase
      .from("suscripciones")
      .select("grupo_id, profiles(id, nombre, email)");

    const membersByGrupo: Record<string, { id: string; nombre: string; email: string | null }[]> = {};
    for (const s of suscripciones ?? []) {
      const raw = s.profiles;
      const p = (Array.isArray(raw) ? raw[0] : raw) as { id: string; nombre: string; email: string | null } | null;
      if (!p) continue;
      if (!membersByGrupo[s.grupo_id]) membersByGrupo[s.grupo_id] = [];
      membersByGrupo[s.grupo_id].push(p);
    }

    const gruposAdmin: GrupoAdmin[] = (grupos ?? []).map(g => ({
      ...g,
      nivel: g.nivel as "basica" | "superior",
      taller: (g.taller ?? "tarde1") as "tarde1" | "tarde2",
      members: membersByGrupo[g.id] ?? [],
    }));

    return <Modulo2Admin grupos={gruposAdmin} docsByNivel={docsByNivel} />;
  }

  // Usuario view
  const { data: suscRow } = await supabase
    .from("suscripciones")
    .select("grupo_id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  let suscripcion: MiSuscripcion = null;

  if (suscRow) {
    const { data: grupo } = await supabase
      .from("grupos")
      .select("id, nombre, nivel, descripcion, cupo_max, asignaciones(doc_codigo)")
      .eq("id", suscRow.grupo_id)
      .single();

    const { count } = await supabase
      .from("suscripciones")
      .select("*", { count: "exact", head: true })
      .eq("grupo_id", suscRow.grupo_id);

    if (grupo) {
      suscripcion = {
        grupo: {
          ...grupo,
          nivel: grupo.nivel as "basica" | "superior",
          memberCount: count ?? 0,
        },
      };
    }
  }

  // Fetch all groups for exploration
  const { data: grupos } = await supabase
    .from("grupos")
    .select("id, nombre, nivel, taller, descripcion, cupo_max, asignaciones(doc_codigo)")
    .order("taller")
    .order("nivel")
    .order("nombre");

  const { data: allSusc } = await supabase
    .from("suscripciones")
    .select("grupo_id");

  const countByGrupo: Record<string, number> = {};
  for (const s of allSusc ?? []) {
    countByGrupo[s.grupo_id] = (countByGrupo[s.grupo_id] ?? 0) + 1;
  }

  const gruposPublicos: GrupoPublico[] = (grupos ?? []).map(g => ({
    ...g,
    nivel: g.nivel as "basica" | "superior",
    taller: (g.taller ?? "tarde1") as "tarde1" | "tarde2",
    memberCount: countByGrupo[g.id] ?? 0,
  }));

  return (
    <Modulo2Usuario
      suscripcion={suscripcion}
      grupos={gruposPublicos}
      docsByNivel={docsByNivel}
    />
  );
}
