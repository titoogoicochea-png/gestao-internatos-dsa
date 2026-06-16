"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// Paleta por dimensión del Anexo C (§8 del MANUAL)
const DIM_BANNER: Record<string, string> = {
  "1": "#1F3A5F",
  "2": "#14532D",
  "3": "#7C1D1D",
  "4": "#78350F",
  "5": "#3B0764",
};
const DIM_HEADER: Record<string, string> = {
  "1": "#2E5A9C",
  "2": "#166534",
  "3": "#B91C1C",
  "4": "#B45309",
  "5": "#6D28D9",
};

function nodeText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (!node.children) return "";
  return node.children.map(nodeText).join("");
}

function columnCount(node: any): number {
  // node = <table>; busca la primera fila y cuenta sus celdas
  const find = (n: any): any => {
    if (!n || !n.children) return null;
    for (const c of n.children) {
      if (c.tagName === "tr") return c;
      const r = find(c);
      if (r) return r;
    }
    return null;
  };
  const tr = find(node);
  if (!tr) return 0;
  return (tr.children || []).filter(
    (c: any) => c.tagName === "th" || c.tagName === "td"
  ).length;
}

export function MarkdownView({ markdown }: { markdown: string }) {
  return (
    <div className="doc">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          table({ node, children }) {
            const cols = columnCount(node);
            const text = nodeText(node).trim();

            // Banner de una sola columna → dimensión / subdimensión / nota
            if (cols === 1) {
              const dim = text.match(/DIMENS[ÃA]O\s*(\d+)/i);
              if (dim) {
                return (
                  <span
                    className="dim-banner"
                    style={{ background: DIM_BANNER[dim[1]] ?? "#1F3A5F" }}
                  >
                    {text}
                  </span>
                );
              }
              const sub = text.match(/^\s*\*?\*?(\d+)\.(\d+)/);
              if (sub) {
                const isIVC = /IVC|VITALIDADE/i.test(text);
                const color = isIVC ? "#5B21B6" : DIM_HEADER[sub[1]] ?? "#2E5A9C";
                return (
                  <span className="subdim-banner" style={{ background: color }}>
                    {text}
                  </span>
                );
              }
              return <span className="note-banner">{text}</span>;
            }

            return (
              <div className="tbl-wrap">
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
