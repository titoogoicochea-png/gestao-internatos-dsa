"use server";

import { createClient } from "@/lib/supabase/server";

export async function upsertObservacion(
  grupoId: string,
  docCodigo: string,
  seccionId: string,
  texto: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  if (!texto.trim()) {
    // Delete if empty
    await supabase
      .from("observaciones")
      .delete()
      .eq("usuario_id", user.id)
      .eq("grupo_id", grupoId)
      .eq("doc_codigo", docCodigo)
      .eq("seccion_id", seccionId);
    return;
  }

  const { data: existing } = await supabase
    .from("observaciones")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("grupo_id", grupoId)
    .eq("doc_codigo", docCodigo)
    .eq("seccion_id", seccionId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("observaciones")
      .update({ texto })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("observaciones")
      .insert({ usuario_id: user.id, grupo_id: grupoId, doc_codigo: docCodigo, seccion_id: seccionId, texto });
  }
}
