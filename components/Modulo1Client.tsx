"use client";

import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { LanguageToggle } from "@/components/LanguageToggle";

export function Modulo1Client() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
            ← {t("nav.back")}
          </Link>
          <span className="text-sm font-semibold text-white">{t("m1.breadcrumb")}</span>
          <LanguageToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-brand">{t("m1.title")}</h1>
          <p className="mt-2 text-slate-600">{t("m1.subtitle")}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <NivelCard
            href="/basica"
            icon="🏫"
            title={t("home.basica")}
            desc={t("home.basica.desc")}
            cta={t("home.open")}
            accent="from-[#2F4156] to-[#567C8D]"
          />
          <NivelCard
            href="/superior"
            icon="🎓"
            title={t("home.superior")}
            desc={t("home.superior.desc")}
            cta={t("home.open")}
            accent="from-[#567C8D] to-[#7fa0b2]"
          />
        </div>
      </main>
    </div>
  );
}

function NivelCard({ href, title, desc, accent, icon, cta }: {
  href: string; title: string; desc: string; accent: string; icon: string; cta: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-card ring-1 ring-slate-200/50 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-4">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-2xl shadow-md`}>
          {icon}
        </div>
        <h2 className="self-center font-display text-xl font-bold leading-snug text-[#2F4156]">{title}</h2>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">{desc}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 self-start rounded-full bg-[#2F4156] px-4 py-2 text-sm font-semibold text-white transition-all group-hover:gap-2.5 group-hover:bg-[#567C8D]">
        {cta} <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
