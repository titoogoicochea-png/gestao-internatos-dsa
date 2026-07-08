"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getMyRol() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  return { supabase, user, rol: data?.rol ?? "usuario" };
}

export async function createGrupo(data: {
  nombre: string;
  nivel: string;
  taller: string;
  descripcion: string;
  cupo_max: number;
}) {
  const { supabase, rol } = await getMyRol();
  if (!["admin", "propietario"].includes(rol)) throw new Error("Sin permiso");

  const { error } = await supabase.from("grupos").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/modulo2");
}

export async function updateGrupo(grupoId: string, data: { nombre: string; descripcion: string; cupo_max: number }) {
  const { supabase, rol } = await getMyRol();
  if (!["admin", "propietario"].includes(rol)) throw new Error("Sin permiso");

  const { error } = await supabase.from("grupos").update(data).eq("id", grupoId);
  if (error) throw new Error(error.message);
  revalidatePath("/modulo2");
}

export async function deleteGrupo(grupoId: string) {
  const { supabase, rol } = await getMyRol();
  if (!["admin", "propietario"].includes(rol)) throw new Error("Sin permiso");

  const { error } = await supabase.from("grupos").delete().eq("id", grupoId);
  if (error) throw new Error(error.message);
  revalidatePath("/modulo2");
}

export async function setAsignaciones(grupoId: string, codigos: string[]) {
  const { supabase, rol } = await getMyRol();
  if (!["admin", "propietario"].includes(rol)) throw new Error("Sin permiso");

  await supabase.from("asignaciones").delete().eq("grupo_id", grupoId);

  if (codigos.length > 0) {
    const rows = codigos.map(doc_codigo => ({ grupo_id: grupoId, doc_codigo }));
    const { error } = await supabase.from("asignaciones").insert(rows);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/modulo2");
}

export type ActionResult = { ok: boolean; error?: string };

export async function joinGrupo(grupoId: string): Promise<ActionResult> {
  const { supabase, user } = await getMyRol();

  // El grupo destino y su workshop
  const { data: grupo } = await supabase
    .from("grupos")
    .select("taller")
    .eq("id", grupoId)
    .single();
  if (!grupo) return { ok: false, error: "El grupo no existe." };
  const taller = grupo.taller ?? "tarde1";

  // ¿Ya tiene un grupo en ese mismo workshop? (dos pasos, sin embed)
  const { data: subs } = await supabase
    .from("suscripciones")
    .select("grupo_id")
    .eq("usuario_id", user.id);
  const otrosIds = (subs ?? []).map((s) => s.grupo_id).filter((id) => id !== grupoId);

  if (otrosIds.length > 0) {
    const { data: gruposActuales } = await supabase
      .from("grupos")
      .select("id, taller")
      .in("id", otrosIds);
    const yaEnEseTaller = (gruposActuales ?? []).some((g) => (g.taller ?? "tarde1") === taller);
    if (yaEnEseTaller) {
      return { ok: false, error: "Ya perteneces a un grupo de este workshop. Sal de ese grupo antes de unirte a otro." };
    }
  }

  const { error } = await supabase
    .from("suscripciones")
    .insert({ usuario_id: user.id, grupo_id: grupoId });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ya perteneces a este grupo." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/modulo2");
  return { ok: true };
}

export async function leaveGrupo(grupoId: string): Promise<ActionResult> {
  const { supabase, user } = await getMyRol();

  const { error } = await supabase
    .from("suscripciones")
    .delete()
    .eq("usuario_id", user.id)
    .eq("grupo_id", grupoId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/modulo2");
  return { ok: true };
}

// --- Gestión de participantes por admin/propietario (panel "Participantes por grupo") ---

export async function adminAddParticipante(grupoId: string, usuarioId: string): Promise<ActionResult> {
  const { supabase, rol } = await getMyRol();
  if (!["admin", "propietario"].includes(rol)) return { ok: false, error: "Sin permiso" };

  // Workshop del grupo destino
  const { data: grupo } = await supabase.from("grupos").select("taller").eq("id", grupoId).single();
  if (!grupo) return { ok: false, error: "El grupo no existe." };
  const taller = grupo.taller ?? "tarde1";

  // Regla de negocio: un participante solo puede estar en un grupo por workshop.
  const { data: subs } = await supabase
    .from("suscripciones")
    .select("grupo_id")
    .eq("usuario_id", usuarioId);
  const otrosIds = (subs ?? []).map((s) => s.grupo_id).filter((id) => id !== grupoId);
  if (otrosIds.length > 0) {
    const { data: gruposActuales } = await supabase
      .from("grupos")
      .select("id, taller")
      .in("id", otrosIds);
    if ((gruposActuales ?? []).some((g) => (g.taller ?? "tarde1") === taller)) {
      return { ok: false, error: "Ese participante ya pertenece a un grupo de este workshop." };
    }
  }

  const { error } = await supabase
    .from("suscripciones")
    .insert({ usuario_id: usuarioId, grupo_id: grupoId });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "Ese participante ya está en este grupo." };
    return { ok: false, error: error.message };
  }
  revalidatePath("/admin/participantes");
  revalidatePath("/modulo2");
  return { ok: true };
}

export async function adminRemoveParticipante(grupoId: string, usuarioId: string): Promise<ActionResult> {
  const { supabase, rol } = await getMyRol();
  if (!["admin", "propietario"].includes(rol)) return { ok: false, error: "Sin permiso" };

  const { error } = await supabase
    .from("suscripciones")
    .delete()
    .eq("grupo_id", grupoId)
    .eq("usuario_id", usuarioId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/participantes");
  revalidatePath("/modulo2");
  return { ok: true };
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function assertWorkshopAbierto(supabase: SupabaseClient, grupoId: string) {
  const { data: grupo } = await supabase.from("grupos").select("taller").eq("id", grupoId).single();
  const taller = grupo?.taller ?? "tarde1";
  const { data: fase } = await supabase.from("fase_taller").select("abierto").eq("taller", taller).maybeSingle();
  if (!fase?.abierto) {
    throw new Error("El workshop está cerrado. No puedes guardar ni modificar anotaciones en este momento.");
  }
}

export async function setFaseTaller(taller: "tarde1" | "tarde2", abierto: boolean) {
  const { supabase, rol } = await getMyRol();
  if (!["admin", "propietario"].includes(rol)) throw new Error("Sin permiso");

  const { error } = await supabase
    .from("fase_taller")
    .update({ abierto })
    .eq("taller", taller);
  if (error) throw new Error(error.message);
  revalidatePath("/modulo2");
}

export async function addObservacion(
  grupoId: string,
  docCodigo: string,
  tipo: string,
  texto: string
): Promise<string> {
  const { supabase, user } = await getMyRol();
  await assertWorkshopAbierto(supabase, grupoId);

  const { data, error } = await supabase
    .from("observaciones")
    .insert({ usuario_id: user.id, grupo_id: grupoId, doc_codigo: docCodigo, tipo, texto, seccion_id: null })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function deleteObservacion(id: string) {
  const { supabase, user } = await getMyRol();

  const { data: obs } = await supabase
    .from("observaciones")
    .select("grupo_id")
    .eq("id", id)
    .eq("usuario_id", user.id)
    .maybeSingle();
  if (!obs) return;

  await assertWorkshopAbierto(supabase, obs.grupo_id);

  const { error } = await supabase
    .from("observaciones")
    .delete()
    .eq("id", id)
    .eq("usuario_id", user.id);

  if (error) throw new Error(error.message);
}
