"use client";

import { useLang } from "./LanguageProvider";

// Nombres de idioma traducidos según el idioma activo (en PT: "Espanhol"), con etiqueta neutra.
const OPTIONS = [
  { code: "es", key: "auth.lang-es", tag: "ES" },
  { code: "pt", key: "auth.lang-pt", tag: "PT-BR" },
] as const;

/**
 * Selector de idioma amplio para las pantallas de acceso (registro / login).
 * Cambia el idioma de toda la app al instante (vía LanguageProvider).
 */
export function LanguageChoice() {
  const { lang, setLang, t } = useLang();
  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((o) => {
        const active = lang === o.code;
        return (
          <button
            key={o.code}
            type="button"
            onClick={() => setLang(o.code)}
            aria-pressed={active}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${
              active
                ? "border-[#2F4156] bg-[#2F4156] text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-[#567C8D]/60 hover:bg-slate-50"
            }`}
          >
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${
                active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {o.tag}
            </span>
            {t(o.key)}
          </button>
        );
      })}
    </div>
  );
}
