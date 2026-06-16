"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/content";
import { t as translate } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = window.localStorage.getItem("lang");
    if (stored === "es" || stored === "pt") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("lang", l);
    document.documentElement.lang = l === "pt" ? "pt-BR" : "es";
  };

  const t = (key: string) => translate(lang, key);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang debe usarse dentro de LanguageProvider");
  return ctx;
}
