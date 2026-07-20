"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Doc, Nivel } from "@/lib/content";
import { docTitle } from "@/lib/content";
import { useLang } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";
import { MarkdownView } from "./MarkdownView";
import { AnexoCView } from "./AnexoCView";

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// El encabezado de la página ya muestra el título del documento. Quitamos del
// cuerpo SOLO los encabezados iniciales que repiten ese título (p. ej. "# CAPÍTULO I"
// o "## NUESTRA ESENCIA"); el texto del contenido queda intacto.
function stripLeadingTitles(raw: string, doc: Doc, lang: "es" | "pt"): string {
  const titles = new Set(
    [docTitle(doc, lang), lang === "es" ? doc.subtitulo_es : doc.subtitulo, doc.titulo_es, doc.titulo_pt]
      .filter((x): x is string => !!x)
      .map(norm)
  );
  const lines = raw.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }            // saltar líneas en blanco iniciales
    const m = line.match(/^(#{1,6})\s+(.*)$/);            // ¿encabezado?
    if (m && titles.has(norm(m[2]))) { i++; continue; }   // sí, y duplica el título → quitar
    break;                                                 // primer contenido real → parar
  }
  return lines.slice(i).join("\n").replace(/^\n+/, "");
}

export function Reader({ nivel, docs }: { nivel: Nivel; docs: Doc[] }) {
  const { t, lang } = useLang();
  const [activeCodigo, setActiveCodigo] = useState(docs[0]?.codigo ?? "");
  // Drawer móvil
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Sidebar desktop: visible por defecto
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const mainRef = useRef<HTMLElement>(null);
  const activeIndex = Math.max(0, docs.findIndex((d) => d.codigo === activeCodigo));
  const active = docs[activeIndex] ?? docs[0];
  const prevDoc = docs[activeIndex - 1];
  const nextDoc = docs[activeIndex + 1];

  // Al cambiar documento, llevar el contenido al inicio (sin mover el sidebar)
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [activeCodigo]);

  const nivelLabel =
    nivel === "basica" ? t("home.basica") : t("home.superior");

  function selectDoc(codigo: string) {
    setActiveCodigo(codigo);
    setDrawerOpen(false);
  }

  return (
    // Altura total de la pantalla; el layout interno se ocupa de no hacer scroll global
    <div className="flex h-screen flex-col overflow-hidden">

      {/* ── Encabezado ── */}
      <header className="z-30 shrink-0 bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md backdrop-blur">
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Botón menú móvil */}
          <button
            className="rounded-md p-2 text-white hover:bg-white/10 lg:hidden"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={t("nav.index")}
          >
            <Bars />
          </button>
          {/* Botón colapsar/expandir sidebar — solo desktop */}
          <button
            className="hidden rounded-md p-2 text-white hover:bg-white/10 lg:flex"
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? t("reader.hide_index") : t("reader.show_index")}
            aria-label={sidebarOpen ? t("reader.hide_index") : t("reader.show_index")}
          >
            {sidebarOpen ? <PanelClose /> : <PanelOpen />}
          </button>

          <Link
            href="/"
            className="hidden items-center gap-1 text-sm font-medium text-white/80 hover:text-white sm:inline-flex"
          >
            ← {t("nav.back")}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {nivelLabel}
            </p>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* ── Cuerpo: sidebar + contenido ── */}
      <div className="flex min-h-0 flex-1">

        {/* ── Sidebar desktop (sticky via flex column) ── */}
        {sidebarOpen && (
          <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
            <SidebarContent
              docs={docs}
              active={active}
              lang={lang}
              t={t}
              onSelect={selectDoc}
              onAnchorClick={() => {}}
            />
          </aside>
        )}

        {/* ── Drawer móvil (overlay) ── */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-r border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t("nav.index")}
                </span>
                <button
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  onClick={() => setDrawerOpen(false)}
                  aria-label={t("reader.close_index")}
                >
                  <X />
                </button>
              </div>
              <SidebarContent
                docs={docs}
                active={active}
                lang={lang}
                t={t}
                onSelect={selectDoc}
                onAnchorClick={() => setDrawerOpen(false)}
              />
            </aside>
          </div>
        )}

        {/* ── Contenido principal (scroll independiente) ── */}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto bg-[#EEF1F6]">
          <div className="px-4 py-8 sm:px-8">
            {active && (
              <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200/70 bg-white p-7 shadow-card sm:p-12">
                <div className="mb-6 border-b border-slate-100 pb-5">
                  {active.badge && active.kind === "capitulo" && (
                    <p className="text-sm font-semibold uppercase tracking-wide text-brand-light">
                      {docTitle(active, lang)}
                    </p>
                  )}
                  <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-brand sm:text-[2.2rem]">
                    {(lang === "es" ? active.subtitulo_es : active.subtitulo) ?? docTitle(active, lang)}
                  </h1>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#C8D9E6]/50 px-3 py-1 text-xs font-medium text-[#2F4156]">
                    <span aria-hidden>🌐</span> {t("reader.source")}
                  </p>
                </div>
                {active.codigo === "ANEXO_C"
                  ? <AnexoCView raw={lang === "es" ? active.raw_es : active.raw} />
                  : <MarkdownView markdown={stripLeadingTitles(lang === "es" ? active.raw_es : active.raw, active, lang)} />
                }

                {/* Navegación entre capítulos — evita volver al índice */}
                {(prevDoc || nextDoc) && (
                  <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-stretch sm:justify-between">
                    {prevDoc ? (
                      <button
                        onClick={() => selectDoc(prevDoc.codigo)}
                        className="group inline-flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-left text-brand shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#567C8D]/40 hover:shadow-card sm:max-w-[48%]"
                      >
                        <span
                          aria-hidden
                          className="shrink-0 text-lg transition-transform group-hover:-translate-x-0.5"
                        >
                          ←
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                            {t("reader.prev_up")}
                          </span>
                          <span className="block truncate text-sm font-semibold">
                            {docTitle(prevDoc, lang)}
                          </span>
                        </span>
                      </button>
                    ) : (
                      <span className="hidden sm:block" />
                    )}

                    {nextDoc && (
                      <button
                        onClick={() => selectDoc(nextDoc.codigo)}
                        className="group inline-flex min-w-0 items-center gap-3 rounded-2xl bg-gradient-to-r from-[#2F4156] to-[#567C8D] px-5 py-3 text-right text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-card-hover sm:max-w-[48%] sm:ml-auto"
                      >
                        <span className="min-w-0">
                          <span className="block text-xs font-medium uppercase tracking-wide text-white/70">
                            {t("reader.next_up")}
                          </span>
                          <span className="block truncate text-sm font-semibold">
                            {docTitle(nextDoc, lang)}
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className="shrink-0 text-lg transition-transform group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </article>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ── Contenido del sidebar (compartido entre desktop y drawer móvil) ──
function SidebarContent({
  docs,
  active,
  lang,
  t,
  onSelect,
  onAnchorClick,
}: {
  docs: Doc[];
  active: Doc | undefined;
  lang: "es" | "pt";
  t: (k: string) => string;
  onSelect: (codigo: string) => void;
  onAnchorClick: () => void;
}) {
  // Cada capítulo puede expandir/colapsar sus secciones de forma independiente.
  // Al cargar, el doc activo aparece expandido.
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(active ? [active.codigo] : [])
  );

  // Cuando el doc activo cambia (navegación externa), auto-expandir ese doc.
  useEffect(() => {
    if (active) {
      setExpanded((prev) => {
        if (prev.has(active.codigo)) return prev;
        return new Set([...prev, active.codigo]);
      });
    }
  }, [active?.codigo]);

  function toggleExpand(codigo: string, hasSections: boolean) {
    if (!hasSections) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  }

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {t("nav.index")}
      </p>
      <ul className="space-y-0.5">
        {docs.map((doc) => {
          const isActive = doc.codigo === active?.codigo;
          const activeSections = lang === "es" ? doc.sections_es : doc.sections;
          const hasSections = activeSections.filter((s) => s.depth <= 3).length > 0;
          const isExpanded = expanded.has(doc.codigo);

          return (
            <li key={doc.codigo}>
              {/* Fila del capítulo: botón de navegación + chevron de acordeón */}
              <div
                className={`flex items-center rounded-lg transition ${
                  isActive ? "bg-[#2F4156]/10 ring-1 ring-inset ring-[#2F4156]/15" : "hover:bg-slate-100"
                }`}
              >
                {/* Botón principal — navega al doc */}
                <button
                  onClick={() => onSelect(doc.codigo)}
                  className={`flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-sm ${
                    isActive ? "font-semibold text-brand" : "text-slate-700"
                  }`}
                >
                  {doc.badge ? (
                    <span
                      className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-md px-1 text-xs font-bold shrink-0 ${
                        isActive
                          ? "bg-gradient-to-br from-[#2F4156] to-[#567C8D] text-white shadow-sm"
                          : "bg-[#C8D9E6] text-[#2F4156]"
                      }`}
                    >
                      {doc.badge}
                    </span>
                  ) : null}
                  <span className="truncate">{docTitle(doc, lang)}</span>
                </button>

                {/* Chevron — solo si hay secciones */}
                {hasSections && (
                  <button
                    onClick={() => toggleExpand(doc.codigo, hasSections)}
                    className={`shrink-0 px-2 py-2 text-slate-400 transition hover:text-brand ${
                      isActive ? "text-brand/60" : ""
                    }`}
                    aria-label={isExpanded ? t("reader.collapse_sections") : t("reader.expand_sections")}
                  >
                    <Chevron open={isExpanded} />
                  </button>
                )}
              </div>

              {/* Sub-secciones — visibles si está expandido */}
              {isExpanded && hasSections && (
                <ul className="mb-1 ml-3 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                  {activeSections
                    .filter((s) => s.depth <= 3)
                    .map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          onClick={onAnchorClick}
                          className="block truncate rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-brand"
                          title={s.text}
                        >
                          {s.text}
                        </a>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ── Iconos ──
function Bars() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function X() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// Panel cerrado → flecha apuntando a la derecha (expandir)
function PanelOpen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="13 9 17 12 13 15" />
    </svg>
  );
}

// Panel abierto → flecha apuntando a la izquierda (colapsar)
function PanelClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <polyline points="15 9 11 12 15 15" />
    </svg>
  );
}

// Chevron acordeón: ▶ cerrado → ▼ abierto
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className={`transition-transform duration-200 ${open ? "rotate-90" : ""}`}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
