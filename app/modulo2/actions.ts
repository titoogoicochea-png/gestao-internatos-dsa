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

export async function joinGrupo(grupoId: string) {
  const { supabase, user } = await getMyRol();

  const { error } = await supabase
    .from("suscripciones")
    .insert({ usuario_id: user.id, grupo_id: grupoId });

  if (error) {
    if (error.code === "23505") throw new Error("Ya perteneces a un grupo.");
    throw new Error(error.message);
  }
  revalidatePath("/modulo2");
}

export async function leaveGrupo() {
  const { supabase, user } = await getMyRol();

  const { error } = await supabase
    .from("suscripciones")
    .delete()
    .eq("usuario_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/modulo2");
}
