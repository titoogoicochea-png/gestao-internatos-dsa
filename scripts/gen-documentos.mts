// Genera los .docx que van a aprobación, en dos documentos independientes porque
// así se aprueban: el Referencial (con los Anexos A y B) por un lado y el
// Formulario de Acreditación (el instrumento) por otro, cada uno en ES y PT.
//
//   npx tsx scripts/gen-documentos.mts "Documentos para aprobación"
//
// La presentación firmada por el Director de Educación de la DSA vive en
// content/institucional/<tipo>-<nivel>.<lang>.md.
//
// Las remisiones cruzadas se reescriben AQUÍ y no en el markdown fuente: en la web
// los tres anexos conviven en un solo documento y allí "Anexo C" es lo correcto.
// Al separarlos, esas menciones quedarían colgando.
import fs from "node:fs";
import path from "node:path";
import { getDocs } from "../lib/content";
import { getExtraDocs, getReconstruidoArchivo } from "../lib/reconstruido";
import { documentoADocxBase64, partirInstrumento, type Portada } from "../lib/md-docx";

type Nivel = "basica" | "superior";
type Lang = "es" | "pt";

const DESTINO = process.argv[2];
if (!DESTINO) throw new Error('Uso: npx tsx scripts/gen-documentos.mts "<carpeta de destino>"');
fs.mkdirSync(DESTINO, { recursive: true });

const NIVEL_ES = { basica: "Educación Básica", superior: "Educación Superior" } as const;
const NIVEL_PT = { basica: "Educação Básica", superior: "Educação Superior" } as const;

const institucional = (tipo: "referencial" | "formulario", nivel: Nivel, lang: Lang) =>
  fs.readFileSync(path.join("content", "institucional", `${tipo}-${nivel}.${lang}.md`), "utf8").trim();

// Reescrituras para el referencial, del que sale el instrumento.
const SIN_INSTRUMENTO: Record<Lang, [RegExp, string][]> = {
  es: [
    [/, y el Anexo C presenta el Instrumento de Evaluación para la Acreditación de Internados[^.]*\./,
     ". El Instrumento de Evaluación para la Acreditación se publica por separado, como *Formulario de Acreditación de Internados de la División Sudamericana*."],
    [/Tres anexos complementan el documento/, "Dos anexos complementan el documento"],
    [/en el instrumento de acreditación \(Anexo C\)/,
     "en el *Formulario de Acreditación de Internados de la División Sudamericana*"],
    [/del Instrumento de Acreditación \(Anexo C\)/,
     "del *Formulario de Acreditación de Internados de la División Sudamericana*"],
    [/es presentado íntegramente en el \*\*Anexo C\*\* de este documento/,
     "es presentado íntegramente en el *Formulario de Acreditación de Internados de la División Sudamericana*, publicado como documento independiente"],
  ],
  pt: [
    [/, e o Anexo C apresenta o Instrumento de Avaliação para a Acreditação de Internatos[^.]*\./,
     ". O Instrumento de Avaliação para a Acreditação é publicado separadamente, como *Formulário de Acreditação de Internatos da Divisão Sul-Americana*."],
    [/Três anexos complementam o documento/, "Dois anexos complementam o documento"],
    [/no instrumento de acreditação \(Anexo C\)/,
     "no *Formulário de Acreditação de Internatos da Divisão Sul-Americana*"],
    [/do Instrumento de Acreditação \(Anexo C\)/,
     "do *Formulário de Acreditação de Internatos da Divisão Sul-Americana*"],
    [/é apresentado integralmente no \*\*Anexo C\*\* deste documento/,
     "é apresentado integralmente no *Formulário de Acreditação de Internatos da Divisão Sul-Americana*, publicado como documento independente"],
  ],
};

// Reescrituras para el instrumento, que pasa a ser documento propio.
const COMO_DOCUMENTO: Record<Lang, [RegExp, string][]> = {
  es: [
    [/^#\s+ANEXO C\s*$/m, "# FORMULARIO DE ACREDITACIÓN DE INTERNADOS"],
    [/referida a los índices ILE e IVC \(Anexo A\)/,
     "referida a los índices ILE e IVC (Anexo A del *Referencial para la Gestión de Internatos Adventistas*)"],
  ],
  pt: [
    [/^#\s+ANEXO C\s*$/m, "# FORMULÁRIO DE ACREDITAÇÃO DE INTERNATOS"],
    [/referida aos índices ILE e IVC \(Anexo A\)/,
     "referida aos índices ILE e IVC (Anexo A do *Referencial para a Gestão de Internatos Adventistas*)"],
  ],
};

const aplicar = (md: string, reglas: [RegExp, string][]) =>
  reglas.reduce((t, [re, rep]) => t.replace(re, rep), md);

function apartados(nivel: Nivel, lang: Lang) {
  const base = getDocs(nivel);
  return [...base, ...getExtraDocs(nivel, base.map((d) => d.codigo))]
    .sort((a, b) => a.order - b.order)
    .map((d) => {
      const a = getReconstruidoArchivo(nivel, d.codigo);
      const md = (lang === "pt" ? a.pt ?? d.raw : a.es ?? d.raw_es) ?? "";
      return { codigo: d.codigo, markdown: md.trim() };
    })
    .filter((x) => x.markdown.length > 0);
}

const CITA_ES = "El internado es una comunidad formativa intencional donde la fe se vive, el carácter se forma y la misión se aprende.";
const CITA_PT = "O internato é uma comunidade formativa intencional onde a fé se vive, o caráter se forma e a missão se aprende.";

async function escribir(nombre: string, portada: Portada, docs: { markdown: string; horizontal?: boolean }[], lang: Lang) {
  const b64 = await documentoADocxBase64({ portada, docs, lang });
  const salida = path.join(DESTINO, `${nombre}.docx`);
  fs.writeFileSync(salida, Buffer.from(b64, "base64"));
  console.log(`  ✓ ${nombre}.docx  (${docs.length} bloques, ${Math.round(fs.statSync(salida).size / 1024)} KB)`);
}

for (const nivel of ["basica", "superior"] as const) {
  for (const lang of ["es", "pt"] as const) {
    const es = lang === "es";
    const secciones = apartados(nivel, lang);
    const cabecera = {
      organizacion: es ? "DIVISIÓN SUDAMERICANA" : "DIVISÃO SUL-AMERICANA",
      departamento: es ? "Departamento de Educación" : "Departamento de Educação",
      nivel: es ? NIVEL_ES[nivel] : NIVEL_PT[nivel],
      anio: "2026",
    };

    // 1. Referencial, sin el instrumento.
    await escribir(
      es
        ? `Referencial para la Gestión de Internados — ${NIVEL_ES[nivel]} — Español`
        : `Referencial para a Gestão de Internatos — ${NIVEL_PT[nivel]} — Português`,
      {
        ...cabecera,
        titulo: es
          ? "REFERENCIAL PARA LA GESTIÓN DE INTERNADOS ADVENTISTAS DE LA DIVISIÓN SUDAMERICANA"
          : "REFERENCIAL PARA A GESTÃO DE INTERNATOS ADVENTISTAS DA DIVISÃO SUL-AMERICANA",
        cita: es ? CITA_ES : CITA_PT,
      },
      [
        { markdown: institucional("referencial", nivel, lang) },
        ...secciones
          .filter((s) => s.codigo !== "ANEXO_C")
          .map((s) => ({ markdown: aplicar(s.markdown, SIN_INSTRUMENTO[lang]) })),
      ],
      lang
    );

    // 2. Formulario de acreditación. Secciones I y II en vertical; desde la III, horizontal.
    const instrumento = secciones.find((s) => s.codigo === "ANEXO_C");
    if (!instrumento) throw new Error(`Falta el instrumento en ${nivel}/${lang}`);
    await escribir(
      es
        ? `Formulario de Acreditación de Internados — ${NIVEL_ES[nivel]} — Español`
        : `Formulário de Acreditação de Internatos — ${NIVEL_PT[nivel]} — Português`,
      {
        ...cabecera,
        titulo: es
          ? "FORMULARIO DE ACREDITACIÓN DE INTERNADOS DE LA DIVISIÓN SUDAMERICANA"
          : "FORMULÁRIO DE ACREDITAÇÃO DE INTERNATOS DA DIVISÃO SUL-AMERICANA",
        cita: es
          ? "Acompañamiento filosófico, administrativo y pedagógico de los internados adventistas."
          : "Acompanhamento filosófico, administrativo e pedagógico dos internatos adventistas.",
      },
      [
        { markdown: institucional("formulario", nivel, lang) },
        ...partirInstrumento(aplicar(instrumento.markdown, COMO_DOCUMENTO[lang])),
      ],
      lang
    );
  }
}
