"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { agruparAportes, type GrupoTema, type Nivel, type Taller } from "@/lib/informe-data";
import { parseInforme, type InformeConsolidado, type ParteGuardada, type EspacioId } from "@/lib/llm";
import { generarConEscalamiento, esMotorValido, type Motor } from "@/lib/ai/motores";

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const TALLER_LABEL = { tarde1: "Workshop 1 — Tarde 1", tarde2: "Workshop 2 — Tarde 2" };

// ───────────────── Prompts ─────────────────

function construirPromptConsolidado(nivel: Nivel, taller: Taller, grupos: GrupoTema[]): string {
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

function construirPromptIdeasFuerza(nivel: Nivel, taller: Taller, consolidado: InformeConsolidado): string {
  const unidad = taller === "tarde2" ? "dimensión" : "capítulo";

  const partes: string[] = [
    `Nivel: ${NIVEL_LABEL[nivel]}. Workshop: ${TALLER_LABEL[taller]}.`,
    "",
    `A continuación está el CONSOLIDADO de aportes por ${unidad}. Para cada ${unidad}, destila las IDEAS FUERZA DE MEJORA.`,
    "",
  ];

  consolidado.secciones.forEach((s, i) => {
    partes.push(`### ${unidad === "dimensión" ? "Dimensión" : "Capítulo"} ${i + 1}: ${s.titulo}`);
    if (s.sintesis) partes.push(s.sintesis);
    s.puntos.forEach((p) => partes.push(`- ${p}`));
    partes.push("");
  });

  partes.push(
    "Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta (sin texto adicional ni markdown):",
    `{
  "resumenGeneral": "1 a 3 oraciones con las ideas fuerza generales de mejora de este nivel y workshop.",
  "secciones": [
    {
      "titulo": "título del ${unidad}",
      "sintesis": "",
      "puntos": ["idea fuerza de mejora 1", "idea fuerza de mejora 2"]
    }
  ]
}`,
    "",
    "Reglas:",
    `- Devuelve EXACTAMENTE una entrada por cada ${unidad} recibido, en el mismo orden y con el mismo título.`,
    `- Por cada ${unidad}, entre 2 y 4 IDEAS FUERZA de mejora: frases potentes, accionables y sintéticas que capturen lo esencial de lo que proponen los participantes.`,
    "- Cada idea fuerza es una viñeta breve, redactada como una dirección o acción de mejora clara y contundente.",
    "- No repitas ideas; prioriza lo más relevante. Deja \"sintesis\" vacío.",
    "- No inventes: básate solo en el consolidado recibido. Responde en español."
  );

  return partes.join("\n");
}

const SYSTEM_CONSOLIDADO =
  "Eres un analista experto en gestión educativa adventista. Tu tarea es consolidar la retroalimentación de un taller de validación del 'Referencial de Gestión de Internados DSA'. Recibes los aportes (observaciones, sugerencias y comentarios) redactados por varios grupos de trabajo, organizados por capítulo (o por dimensión del Anexo C). Debes leer y analizar toda la información, agrupar los aportes semejantes en una sola lista de viñetas por capítulo/dimensión, eliminar repeticiones y redactar de forma clara y profesional en español. No inventes información que no esté en los aportes.";

const SYSTEM_IDEAS =
  "Eres un consultor experto en gestión educativa adventista. A partir de un consolidado de aportes por capítulo/dimensión, destilas 'ideas fuerza de mejora': pocas frases potentes, accionables y memorables que sinteticen las mejoras propuestas por los participantes. Redactas en español, de forma clara, profesional y contundente. No inventas información fuera del consolidado.";

// ───────────────── Utilidades ─────────────────

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function requireAdmin(): Promise<
  | { ok: true; supabase: SupabaseClient; userId: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };
  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  const rol = profile?.rol ?? "usuario";
  if (rol !== "admin" && rol !== "propietario") return { ok: false, error: "Sin permiso." };
  return { ok: true, supabase, userId: user.id };
}

async function mergeSaveParte(
  supabase: SupabaseClient,
  nivel: Nivel,
  taller: Taller,
  userId: string,
  parte: EspacioId,
  guardada: ParteGuardada
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("informes")
    .select("contenido")
    .eq("nivel", nivel)
    .eq("taller", taller)
    .maybeSingle();
  const prev = (existing?.contenido ?? {}) as Record<string, unknown>;
  const contenido = { ...prev, [parte]: guardada };
  const { error } = await supabase.from("informes").upsert(
    { nivel, taller, contenido, modelo: guardada.modelo, generado_por: userId, generado_en: guardada.generadoEn },
    { onConflict: "nivel,taller" }
  );
  return error ? error.message : null;
}

export type GenerarResult = {
  ok: boolean;
  error?: string;
  parte?: ParteGuardada;
};

// ───────────────── Espacio 1: Consolidado ─────────────────

export async function generarConsolidado(nivel: Nivel, taller: Taller, motor: string): Promise<GenerarResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase, userId } = auth;
  if (!esMotorValido(motor)) return { ok: false, error: "Motor de IA no válido." };

  const { data: grupos } = await supabase.from("grupos").select("id").eq("nivel", nivel).eq("taller", taller);
  const ids = (grupos ?? []).map((g) => g.id);
  if (ids.length === 0) return { ok: false, error: "No hay grupos en este nivel y workshop." };

  const { data: obs } = await supabase
    .from("observaciones")
    .select("doc_codigo, tipo, texto")
    .in("grupo_id", ids);
  if (!obs || obs.length === 0) {
    return { ok: false, error: "Todavía no hay observaciones, sugerencias ni comentarios para consolidar." };
  }

  const temas = agruparAportes(nivel, taller, obs);
  if (temas.length === 0) return { ok: false, error: "No hay aportes con contenido para consolidar." };

  let raw: string;
  let motorUsado: string;
  try {
    const r = await generarConEscalamiento({ motor: motor as Motor, systemPrompt: SYSTEM_CONSOLIDADO, userPrompt: construirPromptConsolidado(nivel, taller, temas) });
    raw = r.text;
    motorUsado = r.motorUsado;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al llamar al motor de IA." };
  }

  let informe: InformeConsolidado;
  try {
    informe = parseInforme(raw);
  } catch {
    return { ok: false, error: "La IA devolvió un formato inesperado. Intenta de nuevo o con otro motor." };
  }

  const parte: ParteGuardada = { informe, modelo: motorUsado, generadoEn: new Date().toISOString() };
  const err = await mergeSaveParte(supabase, nivel, taller, userId, "consolidado", parte);
  if (err) return { ok: false, error: `Se generó el consolidado pero no se pudo guardar: ${err}` };

  revalidatePath("/modulo3");
  return { ok: true, parte };
}

// ───────────────── Espacio 2: Ideas fuerza ─────────────────

export async function generarIdeasFuerza(nivel: Nivel, taller: Taller, motor: string): Promise<GenerarResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase, userId } = auth;
  if (!esMotorValido(motor)) return { ok: false, error: "Motor de IA no válido." };

  const { data: existing } = await supabase
    .from("informes")
    .select("contenido")
    .eq("nivel", nivel)
    .eq("taller", taller)
    .maybeSingle();
  const contenido = (existing?.contenido ?? {}) as { consolidado?: ParteGuardada };
  const consolidado = contenido.consolidado?.informe;
  if (!consolidado || consolidado.secciones.length === 0) {
    return { ok: false, error: "Primero genera el consolidado (Espacio 1)." };
  }

  let raw: string;
  let motorUsado: string;
  try {
    const r = await generarConEscalamiento({ motor: motor as Motor, systemPrompt: SYSTEM_IDEAS, userPrompt: construirPromptIdeasFuerza(nivel, taller, consolidado) });
    raw = r.text;
    motorUsado = r.motorUsado;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al llamar al motor de IA." };
  }

  let informe: InformeConsolidado;
  try {
    informe = parseInforme(raw);
  } catch {
    return { ok: false, error: "La IA devolvió un formato inesperado. Intenta de nuevo o con otro motor." };
  }

  const parte: ParteGuardada = { informe, modelo: motorUsado, generadoEn: new Date().toISOString() };
  const err = await mergeSaveParte(supabase, nivel, taller, userId, "ideasFuerza", parte);
  if (err) return { ok: false, error: `Se generaron las ideas fuerza pero no se pudieron guardar: ${err}` };

  revalidatePath("/modulo3");
  return { ok: true, parte };
}
