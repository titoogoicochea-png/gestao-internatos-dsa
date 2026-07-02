// Tipos del informe consolidado y parser tolerante del JSON de la IA.
// El motor de IA (multi-proveedor con escalamiento) vive en lib/ai/motores.ts.

export type SeccionInforme = {
  titulo: string;
  sintesis: string;
  puntos: string[];
};

export type InformeConsolidado = {
  resumenGeneral: string;
  secciones: SeccionInforme[];
};

// Cada "espacio" del Módulo 3 (consolidado / ideas fuerza) se guarda con su motor y fecha.
export type ParteGuardada = { informe: InformeConsolidado; modelo: string; generadoEn: string };

// Se guardan ambos espacios en el mismo registro `informes` (jsonb contenido) por nivel+taller.
export type ContenidoInforme = { consolidado?: ParteGuardada; ideasFuerza?: ParteGuardada };

export type EspacioId = "consolidado" | "ideasFuerza";

// Extrae y parsea el JSON del informe, tolerando ```fences``` o texto alrededor.
export function parseInforme(raw: string): InformeConsolidado {
  let t = raw.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);

  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
  type SeccionRaw = {
    titulo?: unknown; sintesis?: unknown; puntos?: unknown;
    observaciones?: unknown; sugerencias?: unknown; comentarios?: unknown;
  };
  const parsed = JSON.parse(t) as { resumenGeneral?: unknown; secciones?: SeccionRaw[] };
  return {
    resumenGeneral: typeof parsed.resumenGeneral === "string" ? parsed.resumenGeneral : "",
    secciones: Array.isArray(parsed.secciones)
      ? parsed.secciones.map((s) => ({
          titulo: String(s?.titulo ?? ""),
          sintesis: String(s?.sintesis ?? ""),
          puntos: Array.isArray(s?.puntos)
            ? arr(s.puntos)
            : [...arr(s?.observaciones), ...arr(s?.sugerencias), ...arr(s?.comentarios)],
        }))
      : [],
  };
}
