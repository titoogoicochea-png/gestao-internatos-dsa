// Lee los .md de /content/{basica,superior} y genera lib/content.generated.json
// Se ejecuta automáticamente antes de `dev` y `build` (ver package.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUT = path.join(ROOT, "lib", "content.generated.json");

const NIVEIS = ["basica", "superior"];

// Orden y metadatos por archivo. titulo_es / titulo_pt son rótulos del índice.
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII"];

function fileMeta(filename) {
  const base = filename.replace(/\.md$/, "");
  if (base === "00_apresentacao") {
    return { codigo: "APRESENTACAO", kind: "apresentacao", order: 0,
      titulo_es: "Presentación", titulo_pt: "Apresentação", badge: null };
  }
  const cap = base.match(/^cap0?(\d+)$/);
  if (cap) {
    const n = Number(cap[1]);
    return { codigo: `CAP_${ROMAN[n]}`, kind: "capitulo", order: n,
      titulo_es: `Capítulo ${ROMAN[n]}`, titulo_pt: `Capítulo ${ROMAN[n]}`, badge: ROMAN[n] };
  }
  if (base === "98_referencias") {
    return { codigo: "REFERENCIAS", kind: "referencias", order: 99,
      titulo_es: "Referencias", titulo_pt: "Referências", badge: null };
  }
  const anexo = base.match(/^99_anexo([A-Z])$/);
  if (anexo) {
    const L = anexo[1];
    const order = 90 + L.charCodeAt(0) - "A".charCodeAt(0) + 1;
    return { codigo: `ANEXO_${L}`, kind: "anexo", order,
      titulo_es: `Anexo ${L}`, titulo_pt: `Anexo ${L}`, badge: L };
  }
  return { codigo: base.toUpperCase(), kind: "outro", order: 99,
    titulo_es: base, titulo_pt: base, badge: null };
}

// La conversión Word→Markdown dejó marcadores de negrita malformados (p. ej. `****`
// al concatenar dos negritas: `**Instrumento**** de ****Avaliação**`). Eso hace que
// react-markdown muestre `**` literales. Colapsamos las corridas de 3+ asteriscos
// para que las negritas vuelvan a quedar balanceadas, sin alterar el texto.
function normalizeMarkdown(s) {
  return s
    .replace(/\*{3,}/g, "") // ****  →  (une negritas adyacentes)
    .replace(/\*\*\s+\*\*/g, " "); // **  **  →  espacio (negritas vacías)
}

// Extrae el subtítulo (primer ## tras un # de capítulo) y la lista de secciones navegables.
function parseDoc(raw) {
  const lines = raw.split(/\r?\n/);
  const slugger = new GithubSlugger(); // mismo algoritmo que rehype-slug
  let subtitulo = null;
  let seenH1 = false;
  let seenH2 = false;
  let inFence = false;
  const sections = [];

  for (const line of lines) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (!m) continue;
    const depth = m[1].length;
    const text = m[2].trim();
    const slug = slugger.slug(text); // consume en orden documental para igualar a rehype-slug

    if (depth === 1) { seenH1 = true; continue; }
    if (depth === 2 && !seenH2) {
      seenH2 = true;
      if (!subtitulo) subtitulo = text;
      continue;
    }
    // Secciones navegables: ## (en docs sin H1, p.ej. apresentação) y ### / ####
    if (depth === 2 && !seenH1) {
      sections.push({ id: slug, text, depth });
    } else if (depth === 3 || depth === 4) {
      sections.push({ id: slug, text, depth });
    }
  }
  return { subtitulo, sections };
}

function build() {
  const data = { generatedAt: null, niveis: {} };
  for (const nivel of NIVEIS) {
    const dir = path.join(CONTENT_DIR, nivel);
    if (!fs.existsSync(dir)) {
      console.warn(`[gen-content] No existe ${dir}, se omite.`);
      continue;
    }
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    const docs = files.map((file) => {
      const raw = normalizeMarkdown(fs.readFileSync(path.join(dir, file), "utf8"));
      const meta = fileMeta(file);
      const { subtitulo, sections } = parseDoc(raw);
      return { ...meta, file, subtitulo, sections, raw };
    });
    docs.sort((a, b) => a.order - b.order);
    data.niveis[nivel] = docs;
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 0), "utf8");
  const counts = NIVEIS.map((n) => `${n}: ${(data.niveis[n] || []).length}`).join(", ");
  console.log(`[gen-content] Generado ${path.relative(ROOT, OUT)} (${counts})`);
}

build();
