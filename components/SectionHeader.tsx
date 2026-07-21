import type { ReactNode } from "react";

/**
 * Encabezado de sección con acento de color: ícono dentro de un chip degradado
 * + título (y subtítulo opcional) + acción opcional alineada a la derecha.
 * Da ritmo y color al cuerpo de los módulos, en sintonía con las tarjetas del Inicio.
 */
export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
  accent = "from-[#2F4156] to-[#567C8D]",
}: {
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${accent} text-xl text-white shadow-[0_6px_16px_-6px_rgba(47,65,86,0.55)]`}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <h2 className="truncate font-display text-2xl font-bold leading-tight text-[#2F4156]">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
