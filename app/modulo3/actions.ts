"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { agruparAportes, type GrupoTema, type Nivel, type Taller } from "@/lib/informe-data";
import {
  generarTextoIA,
  parseInforme,
  esModeloValido,
  type InformeConsolidado,
} from "@/lib/llm";

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const TALLER_LABEL = { tarde1: "Workshop 1 — Tarde 1", tarde2: "Workshop 2 — Tarde 2" };

function construirPrompt(nivel: Nivel, taller: Taller, grupos: GrupoTema[]): string {
  const unidad = taller === "tarde2" ? "dimensión" : "capítulo";
  const unidadPlural = taller === "tarde2" ? "dimensiones del Anexo C" : "capítulos del referencial";

  const partes: string[] = [
    `Nivel: ${NIVEL_LABEL[nivel]}. Workshop: ${TALLER_LABEL[taller]}.`,
    "",
    `A continuación están TODOS los aportes recolectados por los grupos de trabajo, organizados por ${unidadPlural}. ` +
      `Consolida la información de cada ${unidad}.`,
    "",
  ];

  grupos.forEach((g, i) => {
    partes.push(`### ${unidad === "dimensión" ? "Dimensión" : "Capítulo"} ${i + 1}: ${g.titulo}`);
    partes.push("Aportes (observaciones, sugerencias y comentarios de los grupos):");
    if (g.aportes.length === 0) partes.push("- (ninguno)");
    else g.aportes.forEach((t) => partes.push(`- ${t.replace(/\s+/g, " ").trim()}`));
    partes.push("");
  });

  partes.push(
    "Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta (sin texto adicional ni markdown):",
    `{
  "resumenGeneral": "Síntesis global de 2 a 4 oraciones de los principales hallazgos de este nivel y workshop.",
  "secciones": [
    {
      "titulo": "título del ${unidad}",
      "sintesis": "1 a 3 oraciones que resumen la retroalimentación de este ${unidad}",
      "puntos": ["punto consolidado 1", "punto consolidado 2"]
    }
  ]
}`,
    "",
    "Reglas:",
    `- Devuelve EXACTAMENTE una entrada por cada ${unidad} recibido, en el mismo orden y usando el mismo título.`,
    "- Lee y analiza TODOS los aportes; agrupa los que digan lo mismo o algo semejante en un solo punto (viñeta), sin perder matices importantes.",
    "- Elimina la repetición: no repitas el mismo punto dos veces.",
    '- Si un punto fue planteado por varios grupos, indícalo al final entre paréntesis, p. ej. "(planteado por varios grupos)".',
    "- Cada punto consolidado debe ser una viñeta clara y concisa.",
    `- "puntos" es una sola lista por ${unidad}; NO separes por observación/sugerencia/comentario.`,
    "- No inventes información que no esté en los aportes. Responde en español."
  );

  return partes.join("\n");
}

const SYSTEM_PROMPT =
  "Eres un analista experto en gestión educativa adventista. Tu tarea es consolidar la retroalimentación de un taller de validación del 'Referencial de Gestión de Internados DSA'. Recibes los aportes (observaciones, sugerencias y comentarios) redactados por varios grupos de trabajo, organizados por capítulo (o por dimensión del Anexo C). Debes leer y analizar toda la información, agrupar los aportes semejantes en una sola lista de viñetas por capítulo/dimensión, eliminar repeticiones y redactar de forma clara y profesional en español. No inventes información que no esté en los aportes.";

export type GenerarResult = {
  ok: boolean;
  error?: string;
  informe?: InformeConsolidado;
  generadoEn?: string;
  modelo?: string;
};

export async function generarInforme(nivel: Nivel, taller: Taller, modelo: string): Promise<GenerarResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  const rol = profile?.rol ?? "usuario";
  if (rol !== "admin" && rol !== "propietario") return { ok: false, error: "Sin permiso." };

  if (!esModeloValido(modelo)) return { ok: false, error: "Modelo de IA no válido." };

  // 1) Grupos de ese nivel + workshop
  const { data: grupos } = await supabase
    .from("grupos")
    .select("id")
    .eq("nivel", nivel)
    .eq("taller", taller);
  const ids = (grupos ?? []).map((g) => g.id);
  if (ids.length === 0) return { ok: false, error: "No hay grupos en este nivel y workshop." };

  // 2) Todas las observaciones de esos grupos
  const { data: obs } = await supabase
    .from("observaciones")
    .select("doc_codigo, tipo, texto")
    .in("grupo_id", ids);
  if (!obs || obs.length === 0) {
    return { ok: false, error: "Todavía no hay observaciones, sugerencias ni comentarios para consolidar." };
  }

  // 3) Agrupar por capítulo (W1) o por dimensión del Anexo C (W2)
  const temas = agruparAportes(nivel, taller, obs);
  if (temas.length === 0) {
    return { ok: false, error: "No hay aportes con contenido para consolidar." };
  }

  // 4) Llamar a la IA
  let raw: string;
  try {
    raw = await generarTextoIA(modelo, SYSTEM_PROMPT, construirPrompt(nivel, taller, temas));
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al llamar al motor de IA." };
  }

  let informe: InformeConsolidado;
  try {
    informe = parseInforme(raw);
  } catch {
    return { ok: false, error: "La IA devolvió un formato inesperado. Intenta de nuevo o con otro modelo." };
  }

  // 5) Guardar
  const generadoEn = new Date().toISOString();
  const { error } = await supabase.from("informes").upsert(
    { nivel, taller, contenido: informe, modelo, generado_por: user.id, generado_en: generadoEn },
    { onConflict: "nivel,taller" }
  );
  if (error) return { ok: false, error: `Se generó el informe pero no se pudo guardar: ${error.message}` };

  revalidatePath("/modulo3");
  return { ok: true, informe, generadoEn, modelo };
}
