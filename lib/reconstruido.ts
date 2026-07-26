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
