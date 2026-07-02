"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function LoginPage() {
  const router = useRouter();
  const { t, setLang } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(t("auth.login_error"));
      setLoading(false);
      return;
    }

    // Aplica el idioma guardado en la cuenta (para que siga al usuario en cualquier dispositivo)
    const { data: { user } } = await supabase.auth.getUser();
    const idioma = user?.user_metadata?.idioma;
    if (idioma === "es" || idioma === "pt") setLang(idioma);

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <LanguageToggle />
        </div>
        {/* Logo / título */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">DSA · Internatos</p>
          <h1 className="mt-2 text-2xl font-extrabold text-brand">{t("auth.login_title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("auth.login_subtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t("auth.email_label")}</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              placeholder={t("auth.email_placeholder")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t("auth.password_label")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
          )}

          <div className="text-right">
            <a href="/olvide-contrasena" className="text-xs text-slate-400 hover:text-brand hover:underline">
              {t("auth.forgot_password_link")}
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
          >
            {loading ? t("auth.login_submitting") : t("auth.login_submit")}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {t("auth.no_account")}{" "}
          <Link href="/registro" className="font-semibold text-brand hover:underline">
            {t("auth.register_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
