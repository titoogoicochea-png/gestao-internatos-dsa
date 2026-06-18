import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocs } from "@/lib/content";
import { Modulo2Admin, type GrupoAdmin } from "@/components/Modulo2Admin";
import { Modulo2Usuario, type GrupoPublico, type ObservacionItem } from "@/components/Modulo2Usuario";

// Datos mutables (suscripciones, fases) — nunca cachear, siempre leer en vivo
export const dynamic = "force-dynamic";

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

  // Estado de apertura de los workshops (por taller)
  const fases: { tarde1: boolean; tarde2: boolean } = { tarde1: false, tarde2: false };
  const { data: faseRows } = await supabase.from("fase_taller").select("taller, abierto");
  for (const f of faseRows ?? []) {
    const t = f.taller as "tarde1" | "tarde2";
    if (t === "tarde1" || t === "tarde2") fases[t] = !!f.abierto;
  }

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

    return <Modulo2Admin grupos={gruposAdmin} docsByNivel={docsByNivel} fases={fases} />;
  }

  // Usuario view — un participante se inscribe en un grupo por cada workshop
  const { data: misSuscRows } = await supabase
    .from("suscripciones")
    .select("grupo_id")
    .eq("usuario_id", user.id);

  const misGrupoIds = new Set((misSuscRows ?? []).map(s => s.grupo_id));

  // Fetch all groups for exploration + member counts
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

  const inscritos: GrupoPublico[] = gruposPublicos.filter(g => misGrupoIds.has(g.id));

  // Fetch existing observations for this user across their groups
  const initialObservaciones: Record<string, ObservacionItem[]> = {};
  if (misGrupoIds.size > 0) {
    const { data: observaciones } = await supabase
      .from("observaciones")
      .select("id, doc_codigo, tipo, texto")
      .eq("usuario_id", user.id)
      .in("grupo_id", Array.from(misGrupoIds))
      .order("created_at");
    for (const obs of observaciones ?? []) {
      if (!initialObservaciones[obs.doc_codigo]) initialObservaciones[obs.doc_codigo] = [];
      initialObservaciones[obs.doc_codigo].push({ id: obs.id, tipo: obs.tipo ?? "comentario", texto: obs.texto });
    }
  }

  return (
    <Modulo2Usuario
      inscritos={inscritos}
      grupos={gruposPublicos}
      docsByNivel={docsByNivel}
      initialObservaciones={initialObservaciones}
      fases={fases}
    />
  );
}
