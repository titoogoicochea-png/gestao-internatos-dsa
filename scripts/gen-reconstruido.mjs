// Lee los .md de /content/reconstruido/{basica,superior} y genera
// lib/reconstruido.generated.json = { [nivel]: { [codigo]: { es?, pt? } } }.
// Archivos: content/reconstruido/<nivel>/<CODIGO>.<es|pt>.md  (p. ej. CAP_I.pt.md)
// Se ejecuta antes de `dev` y `build` (ver package.json).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "content", "reconstruido");
const OUT = path.join(ROOT, "lib", "reconstruido.generated.json");
const NIVEIS = ["basica", "superior"];

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
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out));
const resumen = Object.keys(out).map((n) => `${n}: ${Object.keys(out[n]).length} apartado(s)`).join(" · ");
console.log("reconstruido.generated.json →", resumen || "(vacío)");
