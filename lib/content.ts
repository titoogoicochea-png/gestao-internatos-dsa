import generated from "./content.generated.json";

export type Lang = "es" | "pt";
export type Nivel = "basica" | "superior";

export interface DocSection {
  id: string;
  text: string;
  depth: number;
}

export interface Doc {
  codigo: string;
  kind: "apresentacao" | "capitulo" | "anexo" | "referencias" | "outro";
  order: number;
  titulo_es: string;
  titulo_pt: string;
  badge: string | null;
  file: string;
  subtitulo: string | null;
  sections: DocSection[];
  raw: string;
}

interface GeneratedData {
  generatedAt: string | null;
  niveis: Record<string, Doc[]>;
}

const data = generated as unknown as GeneratedData;

export const NIVEIS: Nivel[] = ["basica", "superior"];

export function isNivel(v: string): v is Nivel {
  return v === "basica" || v === "superior";
}

export function getDocs(nivel: Nivel): Doc[] {
  return data.niveis[nivel] ?? [];
}

export function getDoc(nivel: Nivel, codigo: string): Doc | undefined {
  return getDocs(nivel).find((d) => d.codigo === codigo);
}

export function docTitle(doc: Doc, lang: Lang): string {
  return lang === "pt" ? doc.titulo_pt : doc.titulo_es;
}
