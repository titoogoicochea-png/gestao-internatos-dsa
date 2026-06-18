import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LanguageToggle } from "@/components/LanguageToggle";

export default async function Modulo1Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
            ← Inicio
          </Link>
          <span className="text-sm font-semibold text-white">Módulo 1 · Referencial Original</span>
          <LanguageToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-brand">Referencial Original Completo</h1>
          <p className="mt-2 text-slate-600">Selecciona el nivel educativo que deseas consultar</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <NivelCard
            href="/basica"
            icon="🏫"
            title="Educación Básica"
            desc="Referencial para la gestión de internados de Educación Básica de la DSA."
            accent="from-[#2F4156] to-[#567C8D]"
          />
          <NivelCard
            href="/superior"
            icon="🎓"
            title="Educación Superior"
            desc="Referencial para la gestión de internados de Educación Superior de la DSA."
            accent="from-[#567C8D] to-[#7fa0b2]"
          />
        </div>
      </main>
    </div>
  );
}

function NivelCard({ href, title, desc, accent, icon }: {
  href: string; title: string; desc: string; accent: string; icon: string;
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
        Abrir documento <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
