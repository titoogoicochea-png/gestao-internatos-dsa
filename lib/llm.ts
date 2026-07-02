// Motor de IA multi-proveedor (server-only). Soporta Google Gemini y Anthropic Claude.

export type ModeloId = "gemini-2.5-flash" | "claude-haiku-4-5-20251001" | "claude-sonnet-4-6";

export type ModeloInfo = {
  id: ModeloId;
  label: string;
  proveedor: "google" | "anthropic";
  nota: string;
  envKey: string;
};

export const MODELOS: ModeloInfo[] = [
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (gratis)", proveedor: "google", nota: "Rápido y sin costo (capa gratuita de Google)", envKey: "GEMINI_API_KEY" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", proveedor: "anthropic", nota: "Rápido y económico", envKey: "ANTHROPIC_API_KEY" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", proveedor: "anthropic", nota: "Máxima calidad de análisis", envKey: "ANTHROPIC_API_KEY" },
];

export type SeccionInforme = {
  titulo: string;
  sintesis: string;
  puntos: string[];
};

export type InformeConsolidado = {
  resumenGeneral: string;
  secciones: SeccionInforme[];
};

// Cada "espacio" del Módulo 3 (consolidado / ideas fuerza) se guarda con su modelo y fecha.
export type ParteGuardada = { informe: InformeConsolidado; modelo: string; generadoEn: string };

// Se guardan ambos espacios en el mismo registro `informes` (jsonb contenido) por nivel+taller.
export type ContenidoInforme = { consolidado?: ParteGuardada; ideasFuerza?: ParteGuardada };

export type EspacioId = "consolidado" | "ideasFuerza";

export function esModeloValido(m: string): m is ModeloId {
  return MODELOS.some((x) => x.id === m);
}

type GeminiResp = { candidates?: { content?: { parts?: { text?: string }[] } }[] };
type AnthropicResp = { content?: { type: string; text?: string }[] };

async function callGemini(model: string, system: string, prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Falta configurar GEMINI_API_KEY en el servidor (Vercel → Environment Variables).");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json", maxOutputTokens: 8192 },
      }),
    }
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as GeminiResp;
  const text = (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("");
  if (!text) throw new Error("Gemini no devolvió contenido.");
  return text;
}

async function callAnthropic(model: string, system: string, prompt: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("Falta configurar ANTHROPIC_API_KEY en el servidor (Vercel → Environment Variables).");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      temperature: 0.3,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic (${res.status}): ${body.slice(0, 300)}`);
  }
  const data = (await res.json()) as AnthropicResp;
  const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  if (!text) throw new Error("Anthropic no devolvió contenido.");
  return text;
}

export async function generarTextoIA(modelo: ModeloId, system: string, prompt: string): Promise<string> {
  const info = MODELOS.find((m) => m.id === modelo);
  if (!info) throw new Error("Modelo no válido.");
  return info.proveedor === "google"
    ? callGemini(modelo, system, prompt)
    : callAnthropic(modelo, system, prompt);
}

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
          // Acepta el formato nuevo (puntos) o el viejo (obs/sug/com) por compatibilidad.
          puntos: Array.isArray(s?.puntos)
            ? arr(s.puntos)
            : [...arr(s?.observaciones), ...arr(s?.sugerencias), ...arr(s?.comentarios)],
        }))
      : [],
  };
}
