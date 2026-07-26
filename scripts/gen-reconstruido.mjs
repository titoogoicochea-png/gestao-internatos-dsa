// Lee los .md de /content/reconstruido/{basica,superior} y genera
// lib/reconstruido.generated.json = { [nivel]: { [codigo]: { es?, pt?, sec_es?, sec_pt? } } }.
// Archivos: content/reconstruido/<nivel>/<CODIGO>.<es|pt>.md  (p. ej. CAP_I.pt.md)
// Además del texto se calcula su índice de secciones, porque el texto
// reconstruido puede tener títulos distintos a los del documento original y el
// lector debe navegar por los que realmente se muestran.
// Se ejecuta antes de `dev` y `build` (ver package.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import GithubSlugger from "github-slugger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "content", "reconstruido");
const OUT = path.join(ROOT, "lib", "reconstruido.generated.json");
const NIVEIS = ["basica", "superior"];

// Mismo criterio que scripts/gen-content.mjs, para que las anclas coincidan con
// las que genera rehype-slug al renderizar.
function secciones(raw) {
  const slugger = new GithubSlugger();
  let seenH1 = false, seenH2 = false, inFence = false;
  const sections = [];
  for (const line of raw.split(/\r?\n/)) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (!m) continue;
    const depth = m[1].length;
    const text = m[2].trim();
    const slug = slugger.slug(text);
    if (depth === 1) { seenH1 = true; continue; }
    if (depth === 2 && !seenH2) { seenH2 = true; continue; }
    if ((depth === 2 && !seenH1) || depth === 3 || depth === 4) {
      sections.push({ id: slug, text, depth });
    }
  }
  return sections;
}

const out = {};
for (const nivel of NIVEIS) {
  const d = path.join(DIR, nivel);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) {
    const m = f.match(/^(.+)\.(es|pt)\.md$/);
    if (!m) continue;
    const [, codigo, lang] = m;
    const md = fs.readFileSync(path.join(d, f), "utf8").trim();
    if (!md) continue;
    (out[nivel] ??= {});
    (out[nivel][codigo] ??= {});
    out[nivel][codigo][lang] = md;
    out[nivel][codigo][lang === "es" ? "sec_es" : "sec_pt"] = secciones(md);
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out));
const resumen = Object.keys(out).map((n) => `${n}: ${Object.keys(out[n]).length} apartado(s)`).join(" · ");
console.log("reconstruido.generated.json →", resumen || "(vacío)");
