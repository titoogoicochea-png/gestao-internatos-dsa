// ─────────────────────────────────────────────────────────────────────────────
// Motor IA unificado con ESCALAMIENTO automático (cascada gratis → pago).
//
// Escalera por defecto (modo "auto"): el primero con clave configurada genera;
// si falla, agota cuota o trunca, escala al siguiente, hasta Claude Sonnet:
//
//   Groq → Gemini Flash → DeepSeek → Haiku → Sonnet
//
// El usuario también puede elegir un motor; si ese falla, sigue escalando hacia
// arriba (nunca se queda sin respuesta). Cada motor se activa solo si su clave
// API está presente (env o .env.local). Hoy en internados están: Gemini y
// Claude. Al agregar GROQ_API_KEY / DEEPSEEK_API_KEY, esos peldaños se suman solos.
// ─────────────────────────────────────────────────────────────────────────────
import { leerEnv, callGemini, callAnthropic, callOpenAICompat } from "./providers";

export type Motor =
  | "auto"
  | "groq" | "gemini-flash" | "deepseek" | "grok" | "chatgpt"
  | "gemini-pro" | "haiku" | "sonnet";

export type MotorReal = Exclude<Motor, "auto">;
export type Badge = "GRATIS" | "BARATO" | "PREMIUM";
type Proveedor = "groq" | "google" | "openai-compat" | "anthropic";

interface MotorDef {
  label: string;
  badge: Badge;
  proveedor: Proveedor;
  model: string;
  envKey: string;
  envKeyAlt?: string;
  baseUrl?: string;
  maxTokens: number;
}

export const MOTORES: Record<MotorReal, MotorDef> = {
  "groq":         { label: "Groq · Llama 3.3 70B", badge: "GRATIS", proveedor: "groq",          model: "llama-3.3-70b-versatile", envKey: "GROQ_API_KEY",      maxTokens: 8000 },
  "gemini-flash": { label: "Gemini 2.5 Flash",     badge: "GRATIS", proveedor: "google",        model: "gemini-2.5-flash",        envKey: "GEMINI_API_KEY",    envKeyAlt: "GOOGLE_API_KEY", maxTokens: 16000 },
  "deepseek":     { label: "DeepSeek Chat",        badge: "BARATO", proveedor: "openai-compat", model: "deepseek-chat",           envKey: "DEEPSEEK_API_KEY",  baseUrl: "https://api.deepseek.com/v1", maxTokens: 8000 },
  "grok":         { label: "Grok (xAI)",           badge: "BARATO", proveedor: "openai-compat", model: "grok-2-latest",           envKey: "XAI_API_KEY",       baseUrl: "https://api.x.ai/v1",         maxTokens: 8000 },
  "chatgpt":      { label: "ChatGPT · GPT-4o mini",badge: "BARATO", proveedor: "openai-compat", model: "gpt-4o-mini",             envKey: "OPENAI_API_KEY",    baseUrl: "https://api.openai.com/v1",   maxTokens: 16000 },
  "gemini-pro":   { label: "Gemini 2.5 Pro",       badge: "BARATO", proveedor: "google",        model: "gemini-2.5-pro",          envKey: "GEMINI_API_KEY",    envKeyAlt: "GOOGLE_API_KEY", maxTokens: 16000 },
  "haiku":        { label: "Claude Haiku 4.5",     badge: "BARATO", proveedor: "anthropic",     model: "claude-haiku-4-5-20251001", envKey: "ANTHROPIC_API_KEY", maxTokens: 16000 },
  "sonnet":       { label: "Claude Sonnet 4.6",    badge: "PREMIUM",proveedor: "anthropic",     model: "claude-sonnet-4-6",       envKey: "ANTHROPIC_API_KEY", maxTokens: 16000 },
};

// Orden de escalamiento (gratis → pago, hasta Sonnet). Grok/ChatGPT quedan fuera
// de la cascada por defecto; se re-agregan aquí cuando existan sus claves.
export const ESCALERA: MotorReal[] = ["groq", "gemini-flash", "deepseek", "haiku", "sonnet"];

export function esMotorValido(m: string): m is Motor {
  return m === "auto" || m in MOTORES;
}

export function motorDisponible(m: MotorReal): boolean {
  const d = MOTORES[m];
  return !!(leerEnv(d.envKey) || leerEnv(d.envKeyAlt));
}

// Lista de motores activos hoy (para la UI / diagnóstico).
export function motoresActivos(): MotorReal[] {
  return (Object.keys(MOTORES) as MotorReal[]).filter(motorDisponible);
}

// ─── Llamada a UN motor concreto ─────────────────────────────────────────────
async function llamarMotor(p: {
  motor: MotorReal; systemPrompt: string; userPrompt: string; maxTokens?: number; json?: boolean;
}): Promise<{ text: string; truncated: boolean }> {
  const d = MOTORES[p.motor];
  const maxTokens = Math.min(p.maxTokens ?? d.maxTokens, d.maxTokens);
  const json = p.json !== false;
  const apiKey = leerEnv(d.envKey) || leerEnv(d.envKeyAlt);
  if (!apiKey) throw new Error(`Falta ${d.envKey} — motor no disponible`);

  if (d.proveedor === "anthropic") {
    const r = await callAnthropic({ apiKey, model: d.model, system: p.systemPrompt, user: p.userPrompt, maxTokens });
    return { text: r.text, truncated: r.stopReason === "max_tokens" };
  }
  if (d.proveedor === "google") {
    const r = await callGemini({ apiKey, model: d.model, system: p.systemPrompt, user: p.userPrompt, maxTokens, json });
    if (!r.text?.trim()) throw new Error("Gemini devolvió respuesta vacía");
    return { text: r.text, truncated: r.finishReason === "MAX_TOKENS" };
  }
  // groq + openai-compat comparten el endpoint OpenAI-compatible
  const baseUrl = d.baseUrl ?? "https://api.groq.com/openai/v1";
  const r = await callOpenAICompat({ baseUrl, apiKey, model: d.model, system: p.systemPrompt, user: p.userPrompt, maxTokens, json });
  return { text: r.text, truncated: r.finishReason === "length" };
}

// ─── Orden de intentos según el motor de partida ─────────────────────────────
export function escaleraDesde(motorInicial: Motor): MotorReal[] {
  if (motorInicial === "auto") return [...ESCALERA];
  const idx = ESCALERA.indexOf(motorInicial as MotorReal);
  if (idx >= 0) return ESCALERA.slice(idx);              // en la escalera: continúa hacia Sonnet
  return [motorInicial as MotorReal, "haiku", "sonnet"]; // fuera (ej. gemini-pro): escala a premium
}

export interface ResultadoEscalamiento {
  text: string;
  truncated: boolean;
  motorUsado: MotorReal;
}

// ─── Generación con escalamiento automático ──────────────────────────────────
export async function generarConEscalamiento(p: {
  motor: Motor; systemPrompt: string; userPrompt: string; maxTokens?: number; json?: boolean;
}): Promise<ResultadoEscalamiento> {
  const orden = escaleraDesde(p.motor);
  const errores: string[] = [];
  let truncadoFinal: ResultadoEscalamiento | null = null;

  for (const m of orden) {
    if (!motorDisponible(m)) continue;
    try {
      const r = await llamarMotor({ motor: m, systemPrompt: p.systemPrompt, userPrompt: p.userPrompt, maxTokens: p.maxTokens, json: p.json });
      if (r.truncated) {
        truncadoFinal = { ...r, motorUsado: m };
        errores.push(`[${m}] truncado`);
        continue; // respuesta cortada → probar un motor de mayor capacidad
      }
      return { ...r, motorUsado: m };
    } catch (e) {
      errores.push(`[${m}] ${(e instanceof Error ? e.message : String(e)).slice(0, 120)}`);
    }
  }

  if (truncadoFinal) {
    throw new Error("La respuesta de la IA se truncó incluso con los motores de mayor capacidad. Reduce el número de aportes e inténtalo de nuevo.");
  }
  throw new Error(
    orden.some(motorDisponible)
      ? `Todos los motores disponibles fallaron:\n${errores.join("\n")}`
      : "No hay ningún motor de IA con clave configurada. Agrega al menos GEMINI_API_KEY, ANTHROPIC_API_KEY o GROQ_API_KEY."
  );
}
