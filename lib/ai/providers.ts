// Adaptadores de proveedores para el Motor IA (server-only, todo por fetch, sin SDKs).
// Cada uno recibe la apiKey ya resuelta y devuelve { text, ... } con reintentos.
import { readFileSync } from "fs";

// Lee una clave de env o, como respaldo en local, de .env.local.
export function leerEnv(name?: string): string | undefined {
  if (!name) return undefined;
  const v = process.env[name]?.trim();
  if (v) return v;
  try {
    const raw = readFileSync(process.cwd() + "/.env.local", "utf-8");
    return raw.match(new RegExp(`(?:^|\\n)${name}=([^\\n\\r]+)`))?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── OpenAI-compatible (DeepSeek, Grok/xAI, ChatGPT, Groq) ───────────────────
export async function callOpenAICompat(p: {
  baseUrl: string; apiKey: string; model: string;
  system: string; user: string; maxTokens: number; json?: boolean;
}): Promise<{ text: string; finishReason: string }> {
  let res: Response | null = null;
  let lastErr = "";
  for (let intento = 1; intento <= 3; intento++) {
    res = await fetch(`${p.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.apiKey}` },
      body: JSON.stringify({
        model: p.model,
        messages: [{ role: "system", content: p.system }, { role: "user", content: p.user }],
        max_tokens: p.maxTokens,
        temperature: 0.3,
        ...(p.json !== false ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (res.ok) break;
    lastErr = await res.text();
    if (!RETRYABLE.has(res.status) || intento === 3) break;
    await sleep((res.status === 429 ? 5000 : 2000) * intento);
  }
  if (!res || !res.ok) throw new Error(`${p.model} HTTP ${res?.status}: ${lastErr.slice(0, 300)}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string }; finish_reason?: string }> };
  const text = data.choices?.[0]?.message?.content ?? "";
  const finishReason = data.choices?.[0]?.finish_reason ?? "";
  if (!text.trim()) throw new Error(`${p.model} devolvió respuesta vacía`);
  return { text, finishReason };
}

// ─── Google Gemini (REST) ────────────────────────────────────────────────────
export async function callGemini(p: {
  apiKey: string; model: string; system: string; user: string; maxTokens: number; json?: boolean;
}): Promise<{ text: string; finishReason: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${p.model}:generateContent?key=${p.apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: p.system }] },
    contents: [{ role: "user", parts: [{ text: p.user }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: p.maxTokens,
      ...(p.json !== false ? { responseMimeType: "application/json" } : {}),
    },
  };
  let res: Response | null = null;
  let lastErr = "";
  for (let intento = 1; intento <= 4; intento++) {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) break;
    lastErr = await res.text();
    if (lastErr.includes("prepayment") || lastErr.includes("billing") || lastErr.includes("exceeded your current quota")) {
      throw new Error(`Gemini ${p.model} HTTP ${res.status}: ${lastErr.slice(0, 400)}`);
    }
    if (!RETRYABLE.has(res.status) || intento === 4) break;
    await sleep(2000 * Math.pow(2, intento - 1));
  }
  if (!res || !res.ok) throw new Error(`Gemini ${p.model} HTTP ${res?.status}: ${lastErr.slice(0, 400)}`);
  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: { text?: string }[] }; finishReason?: string }> };
  const candidate = data.candidates?.[0];
  if (!candidate) throw new Error(`Gemini ${p.model}: respuesta sin candidates.`);
  const text = (candidate.content?.parts ?? []).map((part) => part.text ?? "").join("");
  return { text, finishReason: String(candidate.finishReason ?? "") };
}

// ─── Anthropic Claude (Messages API por fetch) ───────────────────────────────
export async function callAnthropic(p: {
  apiKey: string; model: string; system: string; user: string; maxTokens: number;
}): Promise<{ text: string; stopReason: string }> {
  let res: Response | null = null;
  let lastErr = "";
  for (let intento = 1; intento <= 3; intento++) {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": p.apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: p.model,
        max_tokens: p.maxTokens,
        temperature: 0.3,
        system: p.system,
        messages: [{ role: "user", content: p.user }],
      }),
    });
    if (res.ok) break;
    lastErr = await res.text();
    if (!RETRYABLE.has(res.status) || intento === 3) break;
    await sleep((res.status === 429 ? 5000 : 2000) * intento);
  }
  if (!res || !res.ok) throw new Error(`Anthropic ${p.model} HTTP ${res?.status}: ${lastErr.slice(0, 300)}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[]; stop_reason?: string };
  const text = (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  if (!text.trim()) throw new Error("Anthropic devolvió respuesta vacía");
  return { text, stopReason: String(data.stop_reason ?? "") };
}
