"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LanguageToggle } from "./LanguageToggle";
import { useLang } from "./LanguageProvider";

export function HomeClient({ nombre, rol }: { nombre: string; rol: string }) {
  const router = useRouter();
  const { t } = useLang();
  const isAdmin = rol === "admin" || rol === "propietario";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* ───────── Hero ───────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2F4156] via-[#3a5a72] to-[#567C8D] text-white">
        {/* formas decorativas */}
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#C8D9E6]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-80 w-80 rounded-full bg-[#567C8D]/40 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />

        <div className="relative mx-auto max-w-5xl px-4">
          {/* barra superior */}
          <div className="flex items-center justify-between py-4">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/90">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15 text-base">🏫</span>
              DSA · Internatos
            </span>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              {isAdmin && (
                <a
                  href="/respuestas"
                  className="hidden rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 sm:block"
                >
                  Respuestas
                </a>
              )}
              {isAdmin && (
                <a
                  href="/admin/usuarios"
                  className="hidden rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/10 sm:block"
                >
                  {t("home.user-management")}
                </a>
              )}
              <span className="hidden text-sm text-white/80 sm:block">{nombre}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/10"
              >
                {t("home.logout")}
              </button>
            </div>
          </div>

          {/* contenido del hero */}
          <div className="py-12 text-center sm:py-16">
            {nombre && (
              <p className="text-sm font-medium text-[#C8D9E6]">¡Hola, {nombre.split(" ")[0]}! 👋</p>
            )}
            <h1 className="mx-auto mt-2 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-[2.9rem]">
              {t("app.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85">
              {t("app.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* ───────── Tarjetas de módulos (suben sobre el hero) ───────── */}
      <main className="mx-auto -mt-10 max-w-5xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <ModuleCard
            number="1"
            href="/modulo1"
            icon="📖"
            title={t("home.modulo1.title")}
            desc={t("home.modulo1.desc")}
            cta={t("home.modulo1.cta")}
            accent="from-[#2F4156] to-[#567C8D]"
          />
          <ModuleCard
            number="2"
            href="/modulo2"
            icon="👥"
            title={t("home.modulo2.title")}
            desc={t("home.modulo2.desc")}
            cta={t("home.modulo2.cta")}
            accent="from-[#567C8D] to-[#8FB0BF]"
          />
          {isAdmin ? (
            <ModuleCard
              number="3"
              href="/modulo3"
              icon="📊"
              title={t("home.modulo3.title")}
              desc={t("home.modulo3.desc")}
              cta={t("home.modulo3.cta")}
              accent="from-[#3e566b] to-[#2F4156]"
              badge={t("home.badge-admin")}
            />
          ) : (
            <ModuleCard
              number="3"
              icon="📊"
              title={t("home.modulo3.title")}
              desc={t("home.modulo3.desc-locked")}
              cta={t("home.modulo3.cta-locked")}
              accent="from-[#3e566b] to-[#2F4156]"
              disabled
            />
          )}
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-center text-xs text-slate-400">
        {t("footer.note")}
      </footer>
    </div>
  );
}

function ModuleCard({
  number,
  href,
  icon,
  title,
  desc,
  cta,
  accent,
  badge,
  disabled,
}: {
  number: string;
  href?: string;
  icon: string;
  title: string;
  desc: string;
  cta: string;
  accent: string;
  badge?: string;
  disabled?: boolean;
}) {
  const { t } = useLang();
  const inner = (
    <>
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-[#C8D9E6] px-2.5 py-0.5 text-xs font-bold text-[#2F4156]">
          {badge}
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${accent} text-2xl shadow-md ${disabled ? "opacity-60 grayscale" : ""}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#567C8D]">
            {t("home.modulo-label")} {number}
          </p>
          <h2 className="mt-0.5 font-display text-xl font-bold leading-snug text-[#2F4156]">{title}</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">{desc}</p>
      {disabled ? (
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
          🔒 {cta}
        </span>
      ) : (
        <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#2F4156] px-4 py-2 text-sm font-semibold text-white transition-all group-hover:gap-2.5 group-hover:bg-[#567C8D]">
          {cta} <span aria-hidden>→</span>
        </span>
      )}
    </>
  );

  const base = "relative flex flex-col overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-[0_10px_30px_-12px_rgba(47,65,86,0.25)] ring-1 ring-slate-200/50";

  if (disabled || !href) {
    return <div className={`${base} opacity-80`}>{inner}</div>;
  }

  return (
    <Link href={href} className={`group ${base} transition-all duration-200 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_-15px_rgba(47,65,86,0.45)]`}>
      {inner}
    </Link>
  );
}
