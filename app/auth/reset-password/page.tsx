"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LanguageProvider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { t } = useLang();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forced, setForced] = useState(false);

  // Detecta si llegó obligado por una contraseña temporal.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.debe_cambiar_password) setForced(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError(t("auth.passwords_mismatch"));
      return;
    }
    if (password.length < 6) {
      setError(t("auth.password_too_short"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    // Cambia la contraseña y limpia la marca de "debe cambiar".
    const { error } = await supabase.auth.updateUser({
      password,
      data: { debe_cambiar_password: false },
    });

    if (error) {
      setError(t("auth.reset_error"));
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">DSA · Internatos</p>
          <h1 className="mt-2 text-2xl font-extrabold text-brand">{t("auth.reset_title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("auth.reset_subtitle")}</p>
        </div>

        {forced && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-700">
            {t("auth.reset_forced_banner")}
          </p>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t("auth.new_password_label")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder={t("auth.password_min_placeholder")}
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

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t("auth.confirm_password_label")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                placeholder={t("auth.confirm_password_placeholder")}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
          >
            {loading ? t("auth.reset_submitting") : t("auth.reset_submit")}
          </button>
        </form>

        {forced && (
          <p className="mt-5 text-center">
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-brand hover:underline"
            >
              {t("auth.reset_logout")}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
