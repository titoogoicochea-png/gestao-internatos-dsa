import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocs, NIVEIS } from "@/lib/content";
import type { ContenidoInforme } from "@/lib/llm";
import { ReconstruirAdmin, type NivelData } from "@/components/ReconstruirAdmin";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export default async function ReconstruirPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  const rol = profile?.rol ?? "usuario";
  if (rol !== "admin" && rol !== "propietario") redirect("/");

  // Contenido guardado por nivel (fila taller = tarde1): consolidado + reconstrucción
  const { data: rows } = await supabase.from("informes").select("nivel, contenido").eq("taller", "tarde1");
  const contByNivel = new Map<string, ContenidoInforme>();
  for (const r of rows ?? []) contByNivel.set(r.nivel, (r.contenido ?? {}) as ContenidoInforme);

  const niveles: NivelData[] = NIVEIS.map((nivel) => {
    const cont = contByNivel.get(nivel) ?? {};
    const recon = cont.reconstruccion ?? {};
    const docs = getDocs(nivel).map((d) => {
      const r = recon[d.codigo];
      return {
        codigo: d.codigo,
        kind: d.kind,
        badge: d.badge,
        titulo: d.titulo_es,
        subtitulo: d.subtitulo_es,
        original: d.raw_es,
        reconstruido: r?.markdown ?? null,
        modelo: r?.modelo ?? null,
        generadoEn: r?.generadoEn ?? null,
      };
    });
    return { nivel, tieneConsolidado: !!cont.consolidado, docs };
  });

  return <ReconstruirAdmin niveles={niveles} />;
}
