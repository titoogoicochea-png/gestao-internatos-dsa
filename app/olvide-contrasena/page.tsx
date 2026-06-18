"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/LanguageProvider";

export default function OlvideContrasenaPage() {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://referencial-gestao-internatosdsa.vercel.app/auth/callback?next=/auth/reset-password",
    });

    setLoading(false);

    if (error) {
      setError(t("auth.forgot_error"));
      return;
    }

    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">DSA · Internatos</p>
          <h1 className="mt-2 text-2xl font-extrabold text-brand">{t("auth.forgot_title")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("auth.forgot_subtitle")}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-slate-800">{t("auth.forgot_sent_title")}</p>
              <p className="mt-2 text-sm text-slate-500">
                {t("auth.forgot_sent_before")} <span className="font-medium">{email}</span> {t("auth.forgot_sent_after")}
              </p>
              <p className="mt-3 text-xs text-slate-400">{t("auth.forgot_sent_spam")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
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

              {error && (
                <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
              >
                {loading ? t("auth.forgot_submitting") : t("auth.forgot_submit")}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-brand hover:underline">
            {t("auth.back_to_login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
