import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { temaLabel, type Nivel, type Taller } from "@/lib/informe-data";
import { RespuestasAdmin, type GrupoRespuestas } from "@/components/RespuestasAdmin";

// Datos en vivo (observaciones cambian durante los workshops)
export const dynamic = "force-dynamic";

type PerfilRel = { id: string; nombre: string; email: string | null };

export default async function RespuestasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  const rol = profile?.rol ?? "usuario";
  if (rol !== "admin" && rol !== "propietario") redirect("/");

  const [{ data: grupos }, { data: susc }, { data: obs }, { data: perfiles }] = await Promise.all([
    supabase.from("grupos").select("id, nombre, nivel, taller, descripcion").order("nombre"),
    supabase.from("suscripciones").select("grupo_id, profiles(id, nombre, email)"),
    supabase.from("observaciones").select("id, usuario_id, grupo_id, doc_codigo, texto, created_at").order("created_at"),
    supabase.from("profiles").select("id, nombre"),
  ]);

  const nombreById = new Map((perfiles ?? []).map((p) => [p.id, p.nombre as string]));

  // Miembros por grupo
  const membersByGrupo: Record<string, PerfilRel[]> = {};
  for (const s of susc ?? []) {
    const raw = (s as { profiles: PerfilRel | PerfilRel[] | null }).profiles;
    const p = (Array.isArray(raw) ? raw[0] : raw) as PerfilRel | null;
    if (!p) continue;
    (membersByGrupo[s.grupo_id] ??= []).push(p);
  }

  // Observaciones por grupo
  type ObsRow = { id: string; usuario_id: string; grupo_id: string; doc_codigo: string; texto: string; created_at: string };
  const obsByGrupo: Record<string, ObsRow[]> = {};
  for (const o of (obs ?? []) as ObsRow[]) {
    (obsByGrupo[o.grupo_id] ??= []).push(o);
  }

  const data: GrupoRespuestas[] = (grupos ?? []).map((g) => {
    const nivel = g.nivel as Nivel;
    const taller = (g.taller ?? "tarde1") as Taller;
    const members = (membersByGrupo[g.id] ?? [])
      .map((p) => ({ id: p.id, nombre: p.nombre, email: p.email }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    const observaciones = (obsByGrupo[g.id] ?? []).map((o) => ({
      id: o.id,
      autorId: o.usuario_id,
      autor: nombreById.get(o.usuario_id) ?? "—",
      tema: temaLabel(nivel, taller, o.doc_codigo),
      texto: o.texto,
      fecha: o.created_at,
    }));
    return {
      id: g.id,
      nombre: g.nombre,
      nivel,
      taller,
      descripcion: g.descripcion,
      members,
      observaciones,
    };
  });

  return <RespuestasAdmin grupos={data} />;
}
