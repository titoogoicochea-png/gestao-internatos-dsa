import type { Doc } from "./content";

export interface WorkSection {
  slug: string;
  title: string;
  content: string; // markdown
}

/**
 * Returns the leaf sections for a given assignment code.
 * docCodigo examples:
 *   "CAP_III#31-d1--identidad-espiritual-y-misional"  → #### sections under D1
 *   "CAP_IV"                                          → deepest-level sections of the doc
 */
export function getWorkSections(doc: Doc, docCodigo: string): WorkSection[] {
  const parentSlug = docCodigo.includes("#") ? docCodigo.split("#")[1] : null;
  const secs = doc.sections_es;

  let lo = 0;
  let hi = secs.length;
  let leafDepth: number;

  if (parentSlug) {
    const pi = secs.findIndex((s) => s.id === parentSlug);
    if (pi === -1) return [];
    const pd = secs[pi].depth;
    lo = pi + 1;
    for (let i = pi + 1; i < secs.length; i++) {
      if (secs[i].depth <= pd) { hi = i; break; }
    }
    leafDepth = pd + 1;
  } else {
    leafDepth = secs.reduce((max, s) => Math.max(max, s.depth), 0);
    if (leafDepth === 0) return [];
  }

  const leaves = secs.slice(lo, hi).filter((s) => s.depth === leafDepth);

  return leaves.map((sec) => ({
    slug: sec.id,
    title: sec.text,
    content: extractContent(doc.raw_es, sec.text, sec.depth),
  }));
}

function extractContent(raw: string, headingText: string, depth: number): string {
  const lines = raw.split("\n");
  const prefix = "#".repeat(depth);
  const target = normalize(headingText);

  let started = false;
  const out: string[] = [];

  for (const line of lines) {
    if (!started) {
      if (line.startsWith(prefix + " ") && normalize(line.slice(depth + 1)) === target) {
        started = true;
      }
    } else {
      const m = line.match(/^(#{1,6})\s/);
      if (m && m[1].length <= depth) break;
      out.push(line);
    }
  }

  return out.join("\n").trim();
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}
