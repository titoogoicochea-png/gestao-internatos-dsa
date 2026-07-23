"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { agruparAportes, type GrupoTema, type Nivel, type Taller } from "@/lib/informe-data";
import { parseInforme, parseSeccion, type InformeConsolidado, type SeccionInforme, type ParteGuardada, type EspacioId } from "@/lib/llm";
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
  "secciones": [
    {
      "titulo": "título del ${unidad}",
      "observaciones": ["observación consolidada 1", "observación consolidada 2"],
      "sugerencias": ["sugerencia consolidada 1", "sugerencia consolidada 2"]
    }
  ]
}`,
    "",
    "Reglas (síguelas al pie de la letra):",
    `- Devuelve EXACTAMENTE una entrada por cada ${unidad} recibido, en el mismo orden y copiando el mismo título.`,
    "- Clasifica CADA aporte según su contenido en una de dos categorías:",
    "   • OBSERVACIÓN: un señalamiento sobre el texto actual (algo que se nota, se cuestiona, un error, una falta, una ambigüedad, una conformidad o un comentario sobre lo que dice el documento).",
    "   • SUGERENCIA: una propuesta concreta de cambio, adición, corrección o mejora del documento.",
    "- Si un mismo aporte contiene ambas cosas, sepáralo: la parte de señalamiento va a \"observaciones\" y la parte propositiva a \"sugerencias\".",
    "- EXHAUSTIVIDAD ABSOLUTA: ninguna respuesta puede quedar fuera. Cada aporte debe estar representado en al menos una viñeta. Este consolidado se usará para reconstruir el documento, así que NO se puede perder información.",
    "- Junta en una sola viñeta ÚNICAMENTE los aportes idénticos o casi idénticos (que dicen lo mismo). Si dos aportes difieren en algún matiz, mantenlos como viñetas separadas. Ante la duda, sepáralos.",
    "- No resumas ni generalices al punto de perder contenido: es preferible tener más viñetas a perder una idea.",
    '- Si un mismo punto lo plantearon varios grupos, inclúyelo una sola vez y añade al final "(planteado por varios grupos)".',
    "- Cada viñeta debe ser clara, concisa y fiel al aporte original.",
    `- Si un ${unidad} no tiene observaciones, deja "observaciones" como lista vacía []; igual para "sugerencias".`,
    "- No inventes información que no esté en los aportes. Responde en español."
  );

  return partes.join("\n");
}

// Prompt para consolidar UN solo capítulo/dimensión (generación por partes).
function construirPromptTema(nivel: Nivel, taller: Taller, tema: GrupoTema): string {
  const unidad = taller === "tarde2" ? "dimensión" : "capítulo";
  const partes: string[] = [
    `Nivel: ${NIVEL_LABEL[nivel]}. Workshop: ${TALLER_LABEL[taller]}.`,
    "",
    `${unidad === "dimensión" ? "Dimensión" : "Capítulo"}: ${tema.titulo}`,
    "",
    "Aportes de los grupos (observaciones, sugerencias y comentarios):",
    ...(tema.aportes.length ? tema.aportes.map((a) => `- ${a.replace(/\s+/g, " ").trim()}`) : ["- (ninguno)"]),
    "",
    "Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta (sin markdown ni texto adicional):",
    `{ "titulo": ${JSON.stringify(tema.titulo)}, "observaciones": ["observación 1"], "sugerencias": ["sugerencia 1"] }`,
    "",
    "Reglas (síguelas al pie de la letra):",
    "- Clasifica CADA aporte en OBSERVACIÓN (señalamiento sobre el texto actual: algo que se nota, se cuestiona, un error, una falta, una ambigüedad, una conformidad) o SUGERENCIA (propuesta concreta de cambio, adición o mejora).",
    "- Si un aporte contiene ambas cosas, sepáralo: la parte de señalamiento va a \"observaciones\" y la propositiva a \"sugerencias\".",
    "- EXHAUSTIVIDAD ABSOLUTA: ninguna respuesta puede quedar fuera; cada aporte debe estar representado en al menos una viñeta. Este consolidado sirve para reconstruir el documento.",
    "- Junta en una sola viñeta ÚNICAMENTE los aportes idénticos o casi idénticos; si difieren en algún matiz, sepáralos. Ante la duda, sepáralos.",
    "- No resumas al punto de perder contenido: es preferible más viñetas a perder una idea.",
    '- Si un punto lo plantearon varios grupos, inclúyelo una vez y añade "(planteado por varios grupos)".',
    `- Copia "titulo" EXACTAMENTE como se te dio. Si no hay observaciones o sugerencias, usa lista vacía [].`,
    "- No inventes. Responde en español.",
  ];
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

  consolidado.secciones.forEach((s) => {
    partes.push(`### ${s.titulo}`);
    if (s.sintesis) partes.push(s.sintesis);
    const pts = [...(s.observaciones ?? []), ...(s.sugerencias ?? []), ...(s.puntos ?? [])];
    pts.forEach((p) => partes.push(`- ${p}`));
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
    `- Devuelve EXACTAMENTE una entrada por cada ${unidad} recibido, en el mismo orden. En "titulo" copia TEXTUALMENTE el título que recibiste tras "### ", sin agregar prefijos como "Capítulo N:" ni numeración.`,
    `- Por cada ${unidad}, entre 2 y 4 IDEAS FUERZA de mejora: frases potentes, accionables y sintéticas que capturen lo esencial de lo que proponen los participantes.`,
    "- Cada idea fuerza es una viñeta breve, redactada como una dirección o acción de mejora clara y contundente.",
    "- No repitas ideas; prioriza lo más relevante. Deja \"sintesis\" vacío.",
    "- No inventes: básate solo en el consolidado recibido. Responde en español."
  );

  return partes.join("\n");
}

const SYSTEM_CONSOLIDADO =
  "Eres un analista experto en gestión educativa adventista. Consolidas la retroalimentación de un taller de validación del 'Referencial de Gestión de Internados DSA'. Recibes TODOS los aportes redactados por los grupos, organizados por capítulo (o por dimensión del Anexo C). Debes leer y analizar cada aporte y clasificarlo en dos listas de viñetas por capítulo/dimensión: OBSERVACIONES (señalamientos sobre el texto actual) y SUGERENCIAS (propuestas de cambio o mejora). Juntas en una sola viñeta solo los aportes idénticos o casi idénticos, sin perder ningún matiz ni dejar ninguna respuesta fuera, porque el consolidado se usará para reconstruir el documento. Redactas claro y profesional en español y no inventas nada que no esté en los aportes.";

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

// ───────────── Consolidado POR PARTES (una llamada por capítulo/dimensión) ─────────────
// Evita el tiempo de espera con modelos lentos (p. ej. Sonnet) y da atención
// completa a cada capítulo, garantizando exhaustividad.

async function cargarTemas(supabase: SupabaseClient, nivel: Nivel, taller: Taller): Promise<GrupoTema[] | { error: string }> {
  const { data: grupos } = await supabase.from("grupos").select("id").eq("nivel", nivel).eq("taller", taller);
  const ids = (grupos ?? []).map((g) => g.id);
  if (ids.length === 0) return { error: "No hay grupos en este nivel y workshop." };
  const { data: obs } = await supabase.from("observaciones").select("doc_codigo, tipo, texto").in("grupo_id", ids);
  if (!obs || obs.length === 0) return { error: "Todavía no hay observaciones, sugerencias ni comentarios para consolidar." };
  const temas = agruparAportes(nivel, taller, obs);
  if (temas.length === 0) return { error: "No hay aportes con contenido para consolidar." };
  return temas;
}

export async function listarTemasConsolidado(
  nivel: Nivel,
  taller: Taller
): Promise<{ ok: boolean; temas?: { titulo: string }[]; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const temas = await cargarTemas(auth.supabase, nivel, taller);
  if ("error" in temas) return { ok: false, error: temas.error };
  return { ok: true, temas: temas.map((t) => ({ titulo: t.titulo })) };
}

export async function generarConsolidadoTema(
  nivel: Nivel,
  taller: Taller,
  temaIndex: number,
  motor: string
): Promise<{ ok: boolean; seccion?: SeccionInforme; modelo?: string; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!esMotorValido(motor)) return { ok: false, error: "Motor de IA no válido." };

  const temas = await cargarTemas(auth.supabase, nivel, taller);
  if ("error" in temas) return { ok: false, error: temas.error };
  const tema = temas[temaIndex];
  if (!tema) return { ok: false, error: "Capítulo fuera de rango." };

  let raw: string;
  let motorUsado: string;
  try {
    const r = await generarConEscalamiento({ motor: motor as Motor, systemPrompt: SYSTEM_CONSOLIDADO, userPrompt: construirPromptTema(nivel, taller, tema) });
    raw = r.text;
    motorUsado = r.motorUsado;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al llamar al motor de IA." };
  }

  let seccion: SeccionInforme;
  try {
    seccion = parseSeccion(raw);
  } catch {
    return { ok: false, error: "La IA devolvió un formato inesperado en este capítulo." };
  }
  if (!seccion.titulo) seccion.titulo = tema.titulo;
  return { ok: true, seccion, modelo: motorUsado };
}

export async function guardarConsolidado(
  nivel: Nivel,
  taller: Taller,
  secciones: SeccionInforme[],
  modelo: string
): Promise<GenerarResult> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase, userId } = auth;

  const informe: InformeConsolidado = { resumenGeneral: "", secciones };
  const parte: ParteGuardada = { informe, modelo: modelo || "IA", generadoEn: new Date().toISOString() };
  const err = await mergeSaveParte(supabase, nivel, taller, userId, "consolidado", parte);
  if (err) return { ok: false, error: `Se generó el consolidado pero no se pudo guardar: ${err}` };

  revalidatePath("/modulo3");
  return { ok: true, parte };
}

// ───────────────── Limpiar informe (consolidado + ideas fuerza) ─────────────────

export async function limpiarInforme(nivel: Nivel, taller: Taller): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const { error } = await supabase.from("informes").delete().eq("nivel", nivel).eq("taller", taller);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/modulo3");
  return { ok: true };
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
