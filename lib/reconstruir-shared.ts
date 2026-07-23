// Helpers puros para la reconstrucción del documento (Módulo 4).
// Se usan tanto en el servidor (actions) como en la página (para marcar
// qué apartados son reconstruibles). Sin "use server" para poder exportar
// funciones síncronas.

import type { Doc } from "@/lib/content";
import type { SeccionInforme } from "@/lib/llm";

export type FB = { observaciones: string[]; sugerencias: string[] };

export const displayTitulo = (d: Doc) => (d.subtitulo_es ? `${d.titulo_es} — ${d.subtitulo_es}` : d.titulo_es);

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// Empareja un capítulo (doc) con su sección del consolidado de Workshop 1.
export function matchCapitulo(secciones: SeccionInforme[], doc: Doc): FB | null {
  let sec = secciones.find((s) => s.codigo && s.codigo === doc.codigo);
  if (!sec) {
    const t1 = norm(displayTitulo(doc));
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
  if (!observaciones.length && !sugerencias.length) return { observaciones: puntos, sugerencias: [] };
  return { observaciones, sugerencias };
}

// Agrega TODO el feedback del Workshop 2 (dimensiones) para reconstruir el Anexo C.
export function feedbackAnexoC(secciones: SeccionInforme[]): FB | null {
  const observaciones: string[] = [];
  const sugerencias: string[] = [];
  for (const s of secciones) {
    const pre = s.titulo ? `[${s.titulo}] ` : "";
    const obs = s.observaciones ?? [];
    const sug = s.sugerencias ?? [];
    if (!obs.length && !sug.length) {
      for (const p of s.puntos ?? []) observaciones.push(pre + p);
    } else {
      for (const o of obs) observaciones.push(pre + o);
      for (const g of sug) sugerencias.push(pre + g);
    }
  }
  if (!observaciones.length && !sugerencias.length) return null;
  return { observaciones, sugerencias };
}

// Feedback de un apartado según su tipo, dadas las secciones de ambos workshops.
export function feedbackDeSecciones(doc: Doc, w1: SeccionInforme[], w2: SeccionInforme[]): FB | null {
  if (doc.kind === "capitulo") return matchCapitulo(w1, doc);
  if (doc.codigo === "ANEXO_C") return feedbackAnexoC(w2);
  return null;
}
