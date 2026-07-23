"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getDocs, type Doc } from "@/lib/content";
import type { Nivel, Taller } from "@/lib/informe-data";
import type { ContenidoInforme, SeccionInforme } from "@/lib/llm";
import { generarConEscalamiento, esMotorValido, type Motor } from "@/lib/ai/motores";
import { displayTitulo, matchCapitulo, feedbackAnexoC, type FB } from "@/lib/reconstruir-shared";

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
type Lang = "es" | "pt";

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

async function cargarConsolidado(supabase: SupabaseClient, nivel: Nivel, taller: Taller): Promise<SeccionInforme[] | null> {
  const { data } = await supabase.from("informes").select("contenido").eq("nivel", nivel).eq("taller", taller).maybeSingle();
  const cont = (data?.contenido ?? {}) as ContenidoInforme;
  return cont.consolidado?.informe.secciones ?? null;
}

async function feedbackDeDoc(supabase: SupabaseClient, nivel: Nivel, doc: Doc): Promise<FB | null> {
  if (doc.kind === "capitulo") {
    const s = await cargarConsolidado(supabase, nivel, "tarde1");
    return s ? matchCapitulo(s, doc) : null;
  }
  if (doc.codigo === "ANEXO_C") {
    const s = await cargarConsolidado(supabase, nivel, "tarde2");
    return s && s.length ? feedbackAnexoC(s) : null;
  }
  return null;
}

const SYSTEM_RECONSTRUIR =
  "Eres un editor experto del 'Referencial de Gestión de Internados DSA'. Recibes el TEXTO ORIGINAL de una parte del documento (en Markdown) y las OBSERVACIONES y SUGERENCIAS de los participantes de un taller de validación. Reescribes esa parte incorporando las sugerencias y corrigiendo lo señalado, manteniendo EXACTAMENTE el mismo formato Markdown, la misma estructura y el mismo estilo, densidad y extensión del original. Devuelves solo el texto reescrito en Markdown, sin comentarios ni notas, y EN EL MISMO IDIOMA del texto original. No inventas datos ni referencias.";

function construirPromptReconstruir(nivel: Nivel, doc: Doc, fb: FB, lang: Lang, original: string): string {
  const idioma = lang === "pt" ? "portugués" : "español";
  const partes: string[] = [
    `Documento: Referencial de Gestión de Internados DSA — ${NIVEL_LABEL[nivel]}.`,
    `Idioma del texto original y de tu respuesta: ${idioma.toUpperCase()}.`,
    "",
    "OBSERVACIONES de los participantes (señalamientos a atender):",
    ...(fb.observaciones.length ? fb.observaciones.map((o) => `- ${o}`) : ["- (ninguna)"]),
    "",
    "SUGERENCIAS de los participantes (propuestas a incorporar):",
    ...(fb.sugerencias.length ? fb.sugerencias.map((s) => `- ${s}`) : ["- (ninguna)"]),
    "",
    "REGLAS CRÍTICAS:",
    `- Devuelve ÚNICAMENTE el texto reescrito en Markdown, EN ${idioma.toUpperCase()}. Sin explicaciones, sin encabezados extra, sin comentarios entre corchetes, sin \`\`\`fences\`\`\`.`,
    "- Mantén EXACTAMENTE la misma estructura y formato del original: los mismos niveles de encabezado (#, ##, ###, ####), las negritas (**), las listas, las tablas, las citas (>) y las separaciones (---).",
    "- Conserva el mismo estilo, tono, densidad y extensión del original. NO resumas ni acortes: es un documento oficial y debe mantener su profundidad.",
    "- Integra los cambios de forma natural dentro de la redacción; no los añadas como notas ni como lista de cambios.",
    "- Las observaciones y sugerencias están en español; entiéndelas, pero redacta el resultado en el idioma del texto original.",
    "- Si una sugerencia contradice el espíritu del documento o no aplica, conserva el texto original de esa parte.",
    "- No inventes datos, cifras, referencias ni citas nuevas.",
    "",
    `TEXTO ORIGINAL (Markdown, en ${idioma}):`,
    "-----",
    (original || "").trim(),
    "-----",
  ];
  return partes.join("\n");
}

function limpiarMarkdown(raw: string): string {
  let t = raw.trim();
  const fence = t.match(/^```(?:markdown|md)?\s*([\s\S]*?)```$/);
  if (fence) t = fence[1].trim();
  return t;
}

export async function listarDocsReconstruir(
  nivel: Nivel
): Promise<{ ok: boolean; docs?: { codigo: string; titulo: string }[]; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase } = auth;

  const w1 = await cargarConsolidado(supabase, nivel, "tarde1");
  const w2 = await cargarConsolidado(supabase, nivel, "tarde2");
  if ((!w1 || !w1.length) && (!w2 || !w2.length)) {
    return { ok: false, error: "Primero genera el consolidado (Workshop 1 y/o 2) en el Módulo 3." };
  }

  const out: { codigo: string; titulo: string }[] = [];
  for (const d of getDocs(nivel)) {
    if (d.kind === "capitulo" && w1 && matchCapitulo(w1, d)) {
      out.push({ codigo: d.codigo, titulo: displayTitulo(d) });
    } else if (d.codigo === "ANEXO_C" && w2 && feedbackAnexoC(w2)) {
      out.push({ codigo: d.codigo, titulo: displayTitulo(d) });
    }
  }
  if (out.length === 0) return { ok: false, error: "No hay capítulos ni Anexo C con aportes consolidados." };
  return { ok: true, docs: out };
}

export async function reconstruirDoc(
  nivel: Nivel,
  docCodigo: string,
  lang: Lang,
  motor: string = "opus"
): Promise<{ ok: boolean; markdown?: string; modelo?: string; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!esMotorValido(motor)) return { ok: false, error: "Motor de IA no válido." };

  const doc = getDocs(nivel).find((d) => d.codigo === docCodigo);
  if (!doc) return { ok: false, error: "Documento no encontrado." };

  const fb = await feedbackDeDoc(auth.supabase, nivel, doc);
  if (!fb) return { ok: false, error: "Este documento no tiene aportes consolidados." };

  const original = lang === "pt" ? doc.raw : doc.raw_es;

  let raw: string;
  let motorUsado: string;
  try {
    const r = await generarConEscalamiento({
      motor: motor as Motor,
      systemPrompt: SYSTEM_RECONSTRUIR,
      userPrompt: construirPromptReconstruir(nivel, doc, fb, lang, original),
      json: false,
    });
    raw = r.text;
    motorUsado = r.motorUsado;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al llamar al motor de IA." };
  }

  const markdown = limpiarMarkdown(raw);
  if (!markdown.trim()) return { ok: false, error: "La IA devolvió una respuesta vacía." };
  return { ok: true, markdown, modelo: motorUsado };
}

export async function guardarReconstruccion(
  nivel: Nivel,
  items: { codigo: string; lang: Lang; markdown: string; modelo: string }[]
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
  const recon: NonNullable<ContenidoInforme["reconstruccion"]> = { ...(prev.reconstruccion ?? {}) };
  const now = new Date().toISOString();
  let modelo = "IA";
  for (const it of items) {
    const cur = { ...(recon[it.codigo] ?? { modelo: it.modelo, generadoEn: now }) };
    cur[it.lang] = it.markdown;
    cur.modelo = it.modelo;
    cur.generadoEn = now;
    recon[it.codigo] = cur;
    if (it.modelo) modelo = it.modelo;
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

// Borra toda la reconstrucción guardada de un nivel (para empezar de cero).
export async function limpiarReconstruccion(nivel: Nivel): Promise<{ ok: boolean; error?: string }> {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false, error: auth.error };
  const { supabase, userId } = auth;

  const { data: existing } = await supabase
    .from("informes")
    .select("contenido")
    .eq("nivel", nivel)
    .eq("taller", "tarde1")
    .maybeSingle();
  if (!existing) { revalidatePath("/reconstruir"); return { ok: true }; }

  const cont = { ...((existing.contenido ?? {}) as ContenidoInforme) };
  delete cont.reconstruccion;

  const { error } = await supabase.from("informes").upsert(
    { nivel, taller: "tarde1", contenido: cont, generado_por: userId, generado_en: new Date().toISOString() },
    { onConflict: "nivel,taller" }
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/reconstruir");
  return { ok: true };
}
