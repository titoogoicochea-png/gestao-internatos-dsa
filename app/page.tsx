"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function Home() {
  const { t } = useLang();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-brand">DSA · Internatos</span>
          <LanguageToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="mx-auto max-w-3xl text-3xl font-extrabold leading-tight text-brand sm:text-4xl">
            {t("app.title")}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            {t("app.subtitle")}
          </p>
        </div>

        <p className="mb-6 text-center text-sm font-medium uppercase tracking-wide text-slate-500">
          {t("home.choose")}
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <NivelCard
            href="/basica"
            title={t("home.basica")}
            desc={t("home.basica.desc")}
            cta={t("home.open")}
            accent="from-sky-600 to-brand"
          />
          <NivelCard
            href="/superior"
            title={t("home.superior")}
            desc={t("home.superior.desc")}
            cta={t("home.open")}
            accent="from-emerald-600 to-emerald-800"
          />
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400">
        {t("footer.note")}
      </footer>
    </div>
  );
}

function NivelCard({
  href,
  title,
  desc,
  cta,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  cta: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`h-2 bg-gradient-to-r ${accent}`} />
      <div className="p-6">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2">
          {cta}
          <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
