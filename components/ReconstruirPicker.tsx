import Link from "next/link";

export type NivelResumen = { nivel: "basica" | "superior"; total: number; reconstruidos: number };

const NIVEL_LABEL = { basica: "Educación Básica", superior: "Educación Superior" };
const NIVEL_ICON = { basica: "🏫", superior: "🎓" };
const NIVEL_ACCENT = { basica: "from-[#2F4156] to-[#567C8D]", superior: "from-[#567C8D] to-[#7fa0b2]" };

export function ReconstruirPicker({ niveles }: { niveles: NivelResumen[] }) {
  return (
    <div className="min-h-screen bg-[#EEF1F6]">
      <header className="bg-gradient-to-r from-[#2F4156] to-[#567C8D] text-white shadow-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">← Inicio</Link>
          <span className="text-sm font-semibold text-white">Módulo 4 · Documento reconstruido</span>
          <span className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-brand">Documento reconstruido</h1>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Versión del Referencial reescrita a partir de la validación participativa —incorporando las observaciones y sugerencias de los talleres—, en español y portugués. Elige el nivel para leerlo.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {niveles.map(({ nivel, total, reconstruidos }) => (
            <Link
              key={nivel}
              href={`/reconstruir/${nivel}`}
              className="group flex flex-col overflow-hidden rounded-3xl border border-white bg-white p-6 shadow-card ring-1 ring-slate-200/50 transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-start gap-4">
                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${NIVEL_ACCENT[nivel]} text-2xl shadow-md`}>
                  {NIVEL_ICON[nivel]}
                </div>
                <h2 className="self-center font-display text-xl font-bold leading-snug text-[#2F4156]">{NIVEL_LABEL[nivel]}</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                {reconstruidos > 0
                  ? `${reconstruidos} de ${total} apartados reconstruidos. Los demás se muestran con su texto original.`
                  : "Se muestra el texto original; los apartados reconstruidos irán apareciendo aquí."}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 self-start rounded-full bg-[#2F4156] px-4 py-2 text-sm font-semibold text-white transition-all group-hover:gap-2.5 group-hover:bg-[#567C8D]">
                Abrir lector <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
