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
  const isAdmin = rol === "admin" || rol === "propietario";

  // Contenido guardado por nivel y taller. La reconstrucción vive en la fila tarde1;
  // el consolidado de capítulos en tarde1 y el del Anexo C en tarde2.
  const { data: rows } = await supabase.from("informes").select("nivel, taller, contenido");
  const contByKey = new Map<string, ContenidoInforme>();
  for (const r of rows ?? []) contByKey.set(`${r.nivel}__${r.taller}`, (r.contenido ?? {}) as ContenidoInforme);

  const niveles: NivelData[] = NIVEIS.map((nivel) => {
    const cont = contByKey.get(`${nivel}__tarde1`) ?? {};
    const cont2 = contByKey.get(`${nivel}__tarde2`) ?? {};
    const recon = cont.reconstruccion ?? {};
    const docs = getDocs(nivel).map((d) => {
      const r = recon[d.codigo];
      return {
        codigo: d.codigo,
        kind: d.kind,
        badge: d.badge,
        titulo: d.titulo_es,
        subtitulo: d.subtitulo_es,
        original_es: d.raw_es,
        original_pt: d.raw,
        reconstruido_es: r?.es ?? r?.markdown ?? null,
        reconstruido_pt: r?.pt ?? null,
        modelo: r?.modelo ?? null,
        generadoEn: r?.generadoEn ?? null,
      };
    });
    return { nivel, tieneConsolidado: !!cont.consolidado || !!cont2.consolidado, docs };
  });

  return <ReconstruirAdmin niveles={niveles} isAdmin={isAdmin} />;
}
