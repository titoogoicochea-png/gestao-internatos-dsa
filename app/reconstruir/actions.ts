"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getDocs, type Doc } from "@/lib/content";
import type { Nivel } from "@/lib/informe-data";
import type { ContenidoInforme, SeccionInforme } from "@/lib/llm";
import { generarConEscalamiento, esMotorValido, type Motor } from "@/lib/ai/motores";

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };

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

// Secciones del consolidado del Workshop 1 (capítulos) de un nivel.
async function cargarConsolidado(supabase: SupabaseClient, nivel: Nivel): Promise<SeccionInforme[] | null> {
  const { data } = await supabase.from("informes").select("contenido").eq("nivel", nivel).eq("taller", "tarde1").maybeSingle();
  const cont = (data?.contenido ?? {}) as ContenidoInforme;
  return cont.consolidado?.informe.secciones ?? null;
}

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// Empareja un capítulo (doc) con su sección del consolidado y devuelve su feedback.
function feedbackDeCapitulo(secciones: SeccionInforme[], doc: Doc): { observaciones: string[]; sugerencias: string[] } | null {
  let sec = secciones.find((s) => s.codigo && s.codigo === doc.codigo);
  if (!sec) {
    const t1 = norm(doc.subtitulo_es ? `${doc.titulo_es} — ${doc.subtitulo_es}` : doc.titulo_es);
    const t2 = norm(doc.titulo_es);
    sec = secciones.find((s) => {
      const st = norm(s.titulo);
      return st === t1 || st === t2 || st.includes(t2);
    });
  }
  if (!sec) return null;
  const observaciones = sec.observaciones ?? [];
  const sugerencias = sec.sugerencias ?? [];
  const puntos = sec.puntos ?? [];
  if (!observaciones.length && !sugerencias.length && !puntos.length) return null;
  // Formato anterior (solo "puntos"): trátalos como observaciones.
  if (!observaciones.length && !sugerencias.length) return { observaciones: puntos, sugerencias: [] };
  return { observaciones, sugerencias };
}

const SYSTEM_RECONSTRUIR =
  "Eres un editor experto del 'Referencial de Gestión de Internados DSA'. Recibes el TEXTO ORIGINAL de un capítulo (en Markdown) y las OBSERVACIONES y SUGERENCIAS de los participantes de un taller de validación. Reescribes el capítulo incorporando las sugerencias y corrigiendo lo señalado, manteniendo EXACTAMENTE el mismo formato Markdown, la misma estructura y el mismo estilo y densidad del original. Devuelves solo el capítulo reescrito en Markdown, sin comentarios ni notas. No inventas datos ni referencias. Escribes en español.";

function construirPromptReconstruir(nivel: Nivel, doc: Doc, fb: { observaciones: string[]; sugerencias: string[] }): string {
  const original = (doc.raw_es || "").trim();
  const partes: string[] = [
    `Documento: Referencial de Gestión de Internados DSA — ${NIVEL_LABEL[nivel]}.`,
    "",
    "OBSERVACIONES de los participantes (señalamientos a corregir o atender):",
    ...(fb.observaciones.length ? fb.observaciones.map((o) => `- ${o}`) : ["- (ninguna)"]),
    "",
    "SUGERENCIAS de los participantes (propuestas a incorporar):",
    ...(fb.sugerencias.length ? fb.sugerencias.map((s) => `- ${s}`) : ["- (ninguna)"]),
    "",
    "REGLAS CRÍTICAS:",
    "- Devuelve ÚNICAMENTE el capítulo reescrito en Markdown. Sin explicaciones, sin encabezados extra, sin comentarios entre corchetes, sin ```fences```.",
    "- Mantén EXACTAMENTE la misma estructura y formato del original: los mismos niveles de encabezado (#, ##, ###, ####), las negritas (**), las listas, las tablas, las citas (>) y las separaciones (---).",
    "- Conserva el mismo estilo, tono, densidad y extensión del original. NO resumas ni acortes: es un documento oficial y debe mantener su profundidad.",
    "- Integra los cambios de forma natural dentro de la redacción; no los añadas como notas ni como lista de cambios.",
    "- Si una sugerencia contradice el espíritu del documento o no aplica, conserva el texto original de esa parte.",
    "- No inventes datos, cifras, referencias ni citas nuevas. Responde en español.",
    "",
    "TEXTO ORIGINAL DEL CAPÍTULO (Markdown):",
    "-----",
    original,
    "-----",
  ];
  return partes.join("\n");
}

// Quita ```fences``` que algún modelo pueda añadir alrededor del markdown.
function limpiarMarkdown(raw: string): string {
  let t = raw.trim();
  const fence = t.match(/^```(?:markdown|md)?\s*([\s\S]*?)```$/);
  if (fence) t = fence[1].trim();
  return t;
}

export async function listarCapitulosReconstruir(
  nivel: Nivel
): Promise<{ ok: boolean; capitulos?: { codigo: string; titulo: string }[]; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const secciones = await cargarConsolidado(auth.supabase, nivel);
  if (!secciones || secciones.length === 0) {
    return { ok: false, error: "Primero genera el consolidado del Workshop 1 (capítulos) en el Módulo 3." };
  }
  const docs = getDocs(nivel).filter((d) => d.kind === "capitulo");
  const capitulos = docs
    .filter((d) => feedbackDeCapitulo(secciones, d))
    .map((d) => ({ codigo: d.codigo, titulo: d.subtitulo_es ? `${d.titulo_es} — ${d.subtitulo_es}` : d.titulo_es }));
  if (capitulos.length === 0) return { ok: false, error: "No hay capítulos con aportes consolidados para reconstruir." };
  return { ok: true, capitulos };
}

export async function reconstruirCapitulo(
  nivel: Nivel,
  docCodigo: string,
  motor: string = "opus"
): Promise<{ ok: boolean; markdown?: string; modelo?: string; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!esMotorValido(motor)) return { ok: false, error: "Motor de IA no válido." };

  const doc = getDocs(nivel).find((d) => d.codigo === docCodigo);
  if (!doc) return { ok: false, error: "Capítulo no encontrado." };

  const secciones = await cargarConsolidado(auth.supabase, nivel);
  if (!secciones) return { ok: false, error: "No hay consolidado para este nivel." };
  const fb = feedbackDeCapitulo(secciones, doc);
  if (!fb) return { ok: false, error: "Este capítulo no tiene aportes consolidados." };

  let raw: string;
  let motorUsado: string;
  try {
    const r = await generarConEscalamiento({
      motor: motor as Motor,
      systemPrompt: SYSTEM_RECONSTRUIR,
      userPrompt: construirPromptReconstruir(nivel, doc, fb),
      json: false,
    });
    raw = r.text;
    motorUsado = r.motorUsado;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al llamar al motor de IA." };
  }

  const markdown = limpiarMarkdown(raw);
  if (!markdown.trim()) return { ok: false, error: "La IA devolvió una respuesta vacía para este capítulo." };
  return { ok: true, markdown, modelo: motorUsado };
}

export async function guardarReconstruccion(
  nivel: Nivel,
  docs: { codigo: string; markdown: string; modelo: string }[]
): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase, userId } = auth;

  const { data: existing } = await supabase
    .from("informes")
    .select("contenido")
    .eq("nivel", nivel)
    .eq("taller", "tarde1")
    .maybeSingle();
  const prev = (existing?.contenido ?? {}) as ContenidoInforme;
  const recon = { ...(prev.reconstruccion ?? {}) };
  const now = new Date().toISOString();
  let modelo = "IA";
  for (const d of docs) {
    recon[d.codigo] = { markdown: d.markdown, modelo: d.modelo, generadoEn: now };
    if (d.modelo) modelo = d.modelo;
  }
  const contenido = { ...prev, reconstruccion: recon };
  const { error } = await supabase.from("informes").upsert(
    { nivel, taller: "tarde1", contenido, modelo, generado_por: userId, generado_en: now },
    { onConflict: "nivel,taller" }
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/reconstruir");
  return { ok: true };
}
