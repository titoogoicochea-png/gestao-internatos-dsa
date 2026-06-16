"use client";

import { useLang } from "./LanguageProvider";

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex rounded-full border border-slate-300 bg-white p-0.5 text-sm shadow-sm">
      <button
        onClick={() => setLang("es")}
        className={`rounded-full px-3 py-1 font-medium transition ${
          lang === "es" ? "bg-brand text-white" : "text-slate-600 hover:text-brand"
        }`}
        aria-pressed={lang === "es"}
      >
        ES
      </button>
      <button
        onClick={() => setLang("pt")}
        className={`rounded-full px-3 py-1 font-medium transition ${
          lang === "pt" ? "bg-brand text-white" : "text-slate-600 hover:text-brand"
        }`}
        aria-pressed={lang === "pt"}
      >
        PT
      </button>
    </div>
  );
}
