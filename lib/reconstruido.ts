// Acceso al contenido reconstruido subido como archivos (content/reconstruido/**),
// generado en build a lib/reconstruido.generated.json. Sirve al Módulo 4 como
// fuente del documento reconstruido (sin costo de API).
import data from "./reconstruido.generated.json";

type Lang = "es" | "pt";
const RECON = data as Record<string, Record<string, Partial<Record<Lang, string>>>>;

export function getReconstruidoArchivo(nivel: string, codigo: string): { es?: string; pt?: string } {
  return RECON[nivel]?.[codigo] ?? {};
}
