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

// Cookie legible por el servidor → permite renderizar SSR en el idioma correcto
// (sin parpadeo). Se mantiene sincronizada con localStorage y con la cuenta.
function writeLangCookie(l: Lang) {
  document.cookie = `lang=${l}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageProvider({
  children,
  initialLang = "es",
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  // El servidor ya resolvió el idioma (cookie o cuenta) → arrancamos con ese,
  // así el primer render ya sale en el idioma elegido y no hay cambio visible.
  const [lang, setLangState] = useState<Lang>(initialLang);

  const applyLang = (l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l === "pt" ? "pt-BR" : "es";
  };

  // Migración: usuarios que ya tenían su elección solo en localStorage (sin cookie).
  // La respetamos y sembramos la cookie para que los próximos loads salgan bien.
  useEffect(() => {
    const stored = window.localStorage.getItem("lang");
    if ((stored === "es" || stored === "pt") && stored !== initialLang) {
      applyLang(stored);
      writeLangCookie(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (l: Lang) => {
    applyLang(l);
    window.localStorage.setItem("lang", l);
    writeLangCookie(l);
    // Guarda la preferencia en la cuenta para que siga al usuario entre dispositivos.
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
