"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Doc, Nivel } from "@/lib/content";
import { docTitle } from "@/lib/content";
import { useLang } from "./LanguageProvider";
import { LanguageToggle } from "./LanguageToggle";
import { MarkdownView } from "./MarkdownView";

export function Reader({ nivel, docs }: { nivel: Nivel; docs: Doc[] }) {
  const { t, lang } = useLang();
  const [activeCodigo, setActiveCodigo] = useState(docs[0]?.codigo ?? "");
  const [menuOpen, setMenuOpen] = useState(false);

  const active = docs.find((d) => d.codigo === activeCodigo) ?? docs[0];

  // Al cambiar de documento, subir al inicio del contenido
  useEffect(() => {
    document.getElementById("doc-top")?.scrollIntoView({ block: "start" });
  }, [activeCodigo]);

  const nivelLabel =
    nivel === "basica" ? t("home.basica") : t("home.superior");

  function selectDoc(codigo: string) {
    setActiveCodigo(codigo);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen">
      {/* Encabezado fijo */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={t("nav.index")}
          >
            <Bars />
          </button>
          <Link
            href="/"
            className="hidden items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand sm:inline-flex"
          >
            ← {t("nav.back")}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-brand">
              {nivelLabel}
            </p>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        {/* Índice — sidebar */}
        <aside
          className={`fixed inset-0 z-40 lg:static lg:z-auto lg:block ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          {/* fondo oscuro en móvil */}
          <div
            className="absolute inset-0 bg-black/30 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto border-r border-slate-200 bg-white p-4 lg:static lg:h-[calc(100vh-3.5rem)] lg:w-72 lg:max-w-none lg:bg-transparent">
            <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t("nav.index")}
            </p>
            <ul className="space-y-0.5">
              {docs.map((doc) => {
                const isActive = doc.codigo === active?.codigo;
                return (
                  <li key={doc.codigo}>
                    <button
                      onClick={() => selectDoc(doc.codigo)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition ${
                        isActive
                          ? "bg-brand/10 font-semibold text-brand"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {doc.badge && (
                        <span
                          className={`flex h-6 min-w-6 items-center justify-center rounded px-1 text-xs font-bold ${
                            isActive
                              ? "bg-brand text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {doc.badge}
                        </span>
                      )}
                      <span className="truncate">{docTitle(doc, lang)}</span>
                    </button>

                    {/* Secciones del documento activo */}
                    {isActive && doc.sections.length > 0 && (
                      <ul className="mb-1 ml-3 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
                        {doc.sections
                          .filter((s) => s.depth <= 3)
                          .map((s) => (
                            <li key={s.id}>
                              <a
                                href={`#${s.id}`}
                                onClick={() => setMenuOpen(false)}
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
        </aside>

        {/* Contenido */}
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
          <div id="doc-top" />
          {active && (
            <article className="mx-auto max-w-3xl">
              <div className="mb-5">
                {active.badge && active.kind === "capitulo" && (
                  <p className="text-sm font-semibold uppercase tracking-wide text-brand-light">
                    {docTitle(active, lang)}
                  </p>
                )}
                <h1 className="text-2xl font-extrabold leading-tight text-brand sm:text-3xl">
                  {active.subtitulo ?? docTitle(active, lang)}
                </h1>
                <p className="mt-2 inline-block rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
                  {t("reader.source")}
                </p>
              </div>
              <MarkdownView markdown={active.raw} />
            </article>
          )}
        </main>
      </div>
    </div>
  );
}

function Bars() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
