import type { Lang } from "./content";

type Dict = Record<string, string>;

const es: Dict = {
  "app.title": "Referencial para la Gestión de Internados DSA",
  "app.subtitle": "Validación participativa — Educación Básica y Superior",
  "home.choose": "Elige el referencial que vas a consultar",
  "home.basica": "Educación Básica",
  "home.basica.desc": "Referencial para la gestión de internados de Educación Básica de la DSA.",
  "home.superior": "Educación Superior",
  "home.superior.desc": "Referencial para la gestión de internados de Educación Superior de la DSA.",
  "home.open": "Abrir documento",
  "nav.index": "Índice",
  "nav.back": "Inicio",
  "nav.sections": "Secciones",
  "reader.source": "Contenido en portugués (fuente oficial).",
  "reader.pickDoc": "Selecciona un capítulo en el índice.",
  "lang.label": "Idioma",
  "lang.es": "Español",
  "lang.pt": "Português",
  "footer.note": "Documento de referencia · Comité de Gestión de Internados DSA",
};

const pt: Dict = {
  "app.title": "Referencial para a Gestão de Internatos DSA",
  "app.subtitle": "Validação participativa — Educação Básica e Superior",
  "home.choose": "Escolha o referencial que vai consultar",
  "home.basica": "Educação Básica",
  "home.basica.desc": "Referencial para a gestão de internatos de Educação Básica da DSA.",
  "home.superior": "Educação Superior",
  "home.superior.desc": "Referencial para a gestão de internatos de Educação Superior da DSA.",
  "home.open": "Abrir documento",
  "nav.index": "Índice",
  "nav.back": "Início",
  "nav.sections": "Seções",
  "reader.source": "Conteúdo em português (fonte oficial).",
  "reader.pickDoc": "Selecione um capítulo no índice.",
  "lang.label": "Idioma",
  "lang.es": "Español",
  "lang.pt": "Português",
  "footer.note": "Documento de referência · Comitê de Gestão de Internatos DSA",
};

const dicts: Record<Lang, Dict> = { es, pt };

export function t(lang: Lang, key: string): string {
  return dicts[lang][key] ?? dicts.es[key] ?? key;
}
