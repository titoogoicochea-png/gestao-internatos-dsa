import { getDocs } from "@/lib/content";
import { ANEXO_C_SUBDIMS, ANEXO_C_DIMS } from "@/lib/anexo-c-sections";

export type Nivel = "basica" | "superior";
export type Taller = "tarde1" | "tarde2";

// Aportes agrupados por capítulo (Workshop 1) o por dimensión (Workshop 2).
// No se separan por tipo: todos los aportes (observaciones/sugerencias/comentarios) van juntos.
export type GrupoTema = {
  clave: string;
  titulo: string;
  orden: number;
  aportes: string[];
};

type ObsRow = { doc_codigo: string; tipo: string | null; texto: string };

export function agruparAportes(nivel: Nivel, taller: Taller, obs: ObsRow[]): GrupoTema[] {
  const mapa = new Map<string, GrupoTema>();
  const docs = taller === "tarde1" ? getDocs(nivel) : [];

  function bucket(clave: string, titulo: string, orden: number): GrupoTema {
    let g = mapa.get(clave);
    if (!g) {
      g = { clave, titulo, orden, aportes: [] };
      mapa.set(clave, g);
    }
    return g;
  }

  for (const o of obs) {
    if (!o.texto || !o.texto.trim()) continue;

    let g: GrupoTema;
    if (taller === "tarde2") {
      // Agrupar por dimensión del Anexo C
      const sub = ANEXO_C_SUBDIMS.find((s) => s.id === o.doc_codigo);
      const dimNum = sub?.dimNum ?? "9";
      const dim = ANEXO_C_DIMS.find((d) => d.num === dimNum);
      const titulo = dim ? `Dimensión ${dim.num} — ${dim.titulo_es}` : "Otra dimensión";
      g = bucket(`dim-${dimNum}`, titulo, Number(dimNum) || 99);
    } else {
      // Agrupar por capítulo (documento)
      const chapterCode = o.doc_codigo.includes("#") ? o.doc_codigo.split("#")[0] : o.doc_codigo;
      const idx = docs.findIndex((d) => d.codigo === chapterCode);
      const doc = idx >= 0 ? docs[idx] : undefined;
      const titulo = doc
        ? doc.subtitulo_es
          ? `${doc.titulo_es} — ${doc.subtitulo_es}`
          : doc.titulo_es
        : chapterCode;
      g = bucket(chapterCode, titulo, idx >= 0 ? idx : 99);
    }

    g.aportes.push(o.texto.trim());
  }

  return Array.from(mapa.values()).sort((a, b) => a.orden - b.orden);
}
