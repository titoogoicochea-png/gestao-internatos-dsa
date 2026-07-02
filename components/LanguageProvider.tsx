"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Lang } from "@/lib/content";
import { t as translate } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  const applyLang = (l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l === "pt" ? "pt-BR" : "es";
  };

  useEffect(() => {
    const stored = window.localStorage.getItem("lang");
    if (stored === "es" || stored === "pt") {
      applyLang(stored);
      return;
    }
    // Sin elección local aún → usa el idioma guardado en la cuenta (si hay sesión).
    // Así la preferencia sigue al usuario en un dispositivo/navegador nuevo.
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        const idioma = data.user?.user_metadata?.idioma;
        if (idioma === "es" || idioma === "pt") {
          applyLang(idioma);
          window.localStorage.setItem("lang", idioma);
        }
      })
      .catch(() => {});
  }, []);

  const setLang = (l: Lang) => {
    applyLang(l);
    window.localStorage.setItem("lang", l);
    // Guarda la preferencia en la cuenta (best-effort; sin sesión simplemente se ignora).
    createClient().auth.updateUser({ data: { idioma: l } }).catch(() => {});
  };

  const t = (key: string) => translate(lang, key);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang debe usarse dentro de LanguageProvider");
  return ctx;
}
