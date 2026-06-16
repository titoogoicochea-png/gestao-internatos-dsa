import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";

export default async function Modulo1Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-brand">
            ← Inicio
          </Link>
          <span className="text-sm font-semibold text-brand">Módulo 1 · Referencial Original</span>
          <LanguageToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-brand">Referencial Original Completo</h1>
          <p className="mt-2 text-slate-600">Selecciona el nivel educativo que deseas consultar</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <NivelCard
            href="/basica"
            title="Educación Básica"
            desc="Referencial para la gestión de internados de Educación Básica de la DSA."
            accent="from-sky-600 to-brand"
          />
          <NivelCard
            href="/superior"
            title="Educación Superior"
            desc="Referencial para la gestión de internados de Educación Superior de la DSA."
            accent="from-emerald-600 to-emerald-800"
          />
        </div>
      </main>
    </div>
  );
}

function NivelCard({ href, title, desc, accent }: {
  href: string; title: string; desc: string; accent: string;
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
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all">
          Abrir documento →
        </span>
      </div>
    </Link>
  );
}
