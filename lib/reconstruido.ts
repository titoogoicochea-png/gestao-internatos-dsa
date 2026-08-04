// Acceso al contenido reconstruido subido como archivos (content/reconstruido/**),
// generado en build a lib/reconstruido.generated.json. Sirve al Módulo 4 como
// fuente del documento reconstruido (sin costo de API).
import data from "./reconstruido.generated.json";

export type Seccion = { id: string; text: string; depth: number };
export type ArchivoReconstruido = {
  es?: string;
  pt?: string;
  sec_es?: Seccion[];   // índice de secciones del texto reconstruido
  sec_pt?: Seccion[];
};

const RECON = data as unknown as Record<string, Record<string, ArchivoReconstruido>>;

export function getReconstruidoArchivo(nivel: string, codigo: string): ArchivoReconstruido {
  return RECON[nivel]?.[codigo] ?? {};
}

// Apartados que solo existen en el texto reconstruido: el documento reconstruido
// puede incorporar anexos que el original no traía (p. ej. el Anexo D de protocolos,
// pedido en los talleres). Como el lector y el Word recorren getDocs() —que sale del
// documento original—, hay que añadirlos aparte, en su lugar de orden.
const META: Record<string, { kind: Doc["kind"]; order: number; titulo_es: string; titulo_pt: string; badge: string | null }> = {};
for (const L of "ABCDEFGH") {
  META[`ANEXO_${L}`] = {
    kind: "anexo",
    order: 90 + L.charCodeAt(0) - "A".charCodeAt(0) + 1,
    titulo_es: `Anexo ${L}`,
    titulo_pt: `Anexo ${L}`,
    badge: L,
  };
}

type Doc = {
  codigo: string;
  kind: "apresentacao" | "capitulo" | "anexo" | "referencias" | "outro";
  order: number;
  titulo_es: string;
  titulo_pt: string;
  badge: string | null;
  file: string;
  subtitulo: string | null;
  subtitulo_es: string | null;
  sections: Seccion[];
  sections_es: Seccion[];
  raw: string;
  raw_es: string;
};

// Primer "## " del markdown: es el subtítulo que el lector muestra como título grande.
function subtitulo(md?: string): string | null {
  return md?.split(/\r?\n/).find((l) => /^##\s+/.test(l))?.replace(/^##\s+/, "").trim() ?? null;
}

export function getExtraDocs(nivel: string, codigosExistentes: string[]): Doc[] {
  const ya = new Set(codigosExistentes);
  return Object.entries(RECON[nivel] ?? {})
    .filter(([codigo]) => !ya.has(codigo) && META[codigo])
    .map(([codigo, a]) => ({
      codigo,
      ...META[codigo],
      file: "",
      subtitulo: subtitulo(a.pt),
      subtitulo_es: subtitulo(a.es),
      sections: a.sec_pt ?? [],
      sections_es: a.sec_es ?? [],
      raw: a.pt ?? "",
      raw_es: a.es ?? "",
    }))
    .sort((x, y) => x.order - y.order);
}
