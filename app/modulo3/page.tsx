import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Modulo3Admin } from "@/components/Modulo3Admin";
import type { ContenidoInforme, InformeConsolidado } from "@/lib/llm";
import { agruparAportes, type GrupoTema, type Nivel, type Taller } from "@/lib/informe-data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function Modulo3Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  const rol = profile?.rol ?? "usuario";
  if (rol !== "admin" && rol !== "propietario") redirect("/");

  // Estado de apertura de los workshops
  const fases: { tarde1: boolean; tarde2: boolean } = { tarde1: false, tarde2: false };
  const { data: faseRows } = await supabase.from("fase_taller").select("taller, abierto");
  for (const f of faseRows ?? []) {
    const t = f.taller as "tarde1" | "tarde2";
    if (t === "tarde1" || t === "tarde2") fases[t] = !!f.abierto;
  }

  // Informes ya generados
  const { data: informesRows } = await supabase
    .from("informes")
    .select("nivel, taller, contenido, modelo, generado_en");
  const informes: Record<string, ContenidoInforme> = {};
  for (const r of informesRows ?? []) {
    const c = r.contenido as
      | (ContenidoInforme & { secciones?: unknown })
      | null;
    let cont: ContenidoInforme = {};
    if (c && (c.consolidado || c.ideasFuerza)) {
      cont = c;
    } else if (c && Array.isArray(c.secciones)) {
      // Formato anterior: `contenido` era directamente un InformeConsolidado.
      cont = {
        consolidado: {
          informe: c as unknown as InformeConsolidado,
          modelo: r.modelo as string,
          generadoEn: r.generado_en as string,
        },
      };
    }
    informes[`${r.nivel}__${r.taller}`] = cont;
  }

  // Aportes crudos agrupados por capítulo/dimensión, para la lista previa
  const { data: grupos } = await supabase.from("grupos").select("id, nivel, taller");
  const grupoMeta = new Map((grupos ?? []).map((g) => [g.id, { nivel: g.nivel, taller: g.taller ?? "tarde1" }]));
  const { data: allObs } = await supabase.from("observaciones").select("grupo_id, doc_codigo, tipo, texto");

  const obsPorClave: Record<string, { doc_codigo: string; tipo: string | null; texto: string }[]> = {};
  for (const o of allObs ?? []) {
    const m = grupoMeta.get(o.grupo_id);
    if (!m) continue;
    const k = `${m.nivel}__${m.taller}`;
    (obsPorClave[k] ??= []).push({ doc_codigo: o.doc_codigo, tipo: o.tipo, texto: o.texto });
  }

  const rawData: Record<string, GrupoTema[]> = {};
  const conteos: Record<string, number> = {};
  for (const [k, list] of Object.entries(obsPorClave)) {
    const [nivelK, tallerK] = k.split("__") as [Nivel, Taller];
    rawData[k] = agruparAportes(nivelK, tallerK, list);
    conteos[k] = list.length;
  }

  return <Modulo3Admin fases={fases} informesIniciales={informes} conteos={conteos} rawData={rawData} />;
}
