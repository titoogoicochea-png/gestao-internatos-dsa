// Genera los .docx del documento reconstruido COMPLETO —un solo archivo por nivel
// e idioma, con los tres anexos juntos—, replicando lo que descarga el botón
// "Word" del lector sin pasar por la autenticación.
//
//   npx tsx scripts/gen-word-completo.mts "Documentos reconstruidos"
//
// Para los dos documentos que van a aprobación por separado, ver gen-documentos.mts.
import fs from "node:fs";
import path from "node:path";
import { getDocs } from "../lib/content";
import { getExtraDocs, getReconstruidoArchivo } from "../lib/reconstruido";
import { documentoADocxBase64, partirInstrumento, type Portada } from "../lib/md-docx";

const DESTINO = process.argv[2];
if (!DESTINO) throw new Error('Uso: npx tsx scripts/gen-word-completo.mts "<carpeta de destino>"');
fs.mkdirSync(DESTINO, { recursive: true });

const NIVEL_ES = { basica: "Educación Básica", superior: "Educación Superior" } as const;
const NIVEL_PT = { basica: "Educação Básica", superior: "Educação Superior" } as const;

for (const nivel of ["basica", "superior"] as const) {
  for (const lang of ["es", "pt"] as const) {
    const es = lang === "es";
    const base = getDocs(nivel);
    const docs = [...base, ...getExtraDocs(nivel, base.map((d) => d.codigo))]
      .sort((a, b) => a.order - b.order)
      .flatMap((d) => {
        const a = getReconstruidoArchivo(nivel, d.codigo);
        const md = ((lang === "pt" ? a.pt ?? d.raw : a.es ?? d.raw_es) ?? "").trim();
        // El instrumento va en vertical hasta la Sección II; desde la III, horizontal.
        return d.codigo === "ANEXO_C" ? partirInstrumento(md) : [{ markdown: md }];
      })
      .filter((x) => x.markdown.length > 0);

    const portada: Portada = {
      organizacion: es ? "DIVISIÓN SUDAMERICANA" : "DIVISÃO SUL-AMERICANA",
      departamento: es ? "Departamento de Educación" : "Departamento de Educação",
      titulo: es
        ? "REFERENCIAL PARA LA GESTIÓN DE INTERNADOS ADVENTISTAS DE LA DIVISIÓN SUDAMERICANA"
        : "REFERENCIAL PARA A GESTÃO DE INTERNATOS ADVENTISTAS DA DIVISÃO SUL-AMERICANA",
      nivel: es ? NIVEL_ES[nivel] : NIVEL_PT[nivel],
      cita: es
        ? "El internado es una comunidad formativa intencional donde la fe se vive, el carácter se forma y la misión se aprende."
        : "O internato é uma comunidade formativa intencional onde a fé se vive, o caráter se forma e a missão se aprende.",
      anio: "2026",
    };

    const nombre = `Referencial Internatos DSA — ${es ? NIVEL_ES[nivel] : NIVEL_PT[nivel]} — ${es ? "Español" : "Português"}.docx`;
    const salida = path.join(DESTINO, nombre);
    fs.writeFileSync(salida, Buffer.from(await documentoADocxBase64({ portada, docs, lang }), "base64"));
    console.log(`  ✓ ${nombre}  (${docs.length} bloques, ${Math.round(fs.statSync(salida).size / 1024)} KB)`);
  }
}
