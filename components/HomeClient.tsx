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
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-brand">DSA · Internatos</span>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <span className="hidden text-sm text-slate-500 sm:block">
              {nombre}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Salir
            </button>
          </div>
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

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Módulo 1 */}
          <ModuleCard
            number="1"
            href="/modulo1"
            title="Referencial Original Completo"
            desc="Accede al referencial completo de gestión de internados adventistas DSA, en español y portugués."
            cta="Consultar referencial"
            accent="from-sky-600 to-brand"
            status="open"
          />

          {/* Módulo 2 */}
          <ModuleCard
            number="2"
            href="/modulo2"
            title="Grupos de Trabajo"
            desc="Únete a tu grupo de trabajo, revisa el contenido asignado y registra tus observaciones y sugerencias."
            cta="Ir a mi grupo"
            accent="from-emerald-600 to-emerald-800"
            status="open"
          />

          {/* Módulo 3 */}
          <ModuleCard
            number="3"
            href={isAdmin ? "/modulo3" : "/modulo3/ver"}
            title="Referencial Corregido"
            desc={isAdmin
              ? "Genera el documento actualizado incorporando las observaciones del grupo de trabajo."
              : "Consulta el referencial actualizado una vez que el administrador lo haya publicado."
            }
            cta={isAdmin ? "Generar documento" : "Ver documento"}
            accent="from-amber-500 to-amber-700"
            status="open"
            badge={isAdmin ? "Admin" : undefined}
          />
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-xs text-slate-400">
        {t("footer.note")}
      </footer>
    </div>
  );
}

function ModuleCard({
  number,
  href,
  title,
  desc,
  cta,
  accent,
  badge,
}: {
  number: string;
  href: string;
  title: string;
  desc: string;
  cta: string;
  accent: string;
  status: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className={`h-2 bg-gradient-to-r ${accent}`} />
      {badge && (
        <span className="absolute right-4 top-4 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          {badge}
        </span>
      )}
      <div className="p-6">
        <p className={`mb-2 text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${accent} bg-clip-text text-transparent`}>
          Módulo {number}
        </p>
        <h2 className="text-lg font-bold leading-snug text-slate-800">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all">
          {cta} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
