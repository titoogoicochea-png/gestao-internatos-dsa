"use client";

import { useMemo, useState } from "react";

/** Países frecuentes de la DSA (sur de Sudamérica + Brasil) + algunos comunes. */
export const COUNTRIES = [
  { iso: "PE", name: "Perú",        dial: "51",  flag: "🇵🇪" },
  { iso: "BR", name: "Brasil",      dial: "55",  flag: "🇧🇷" },
  { iso: "AR", name: "Argentina",   dial: "54",  flag: "🇦🇷" },
  { iso: "BO", name: "Bolivia",     dial: "591", flag: "🇧🇴" },
  { iso: "CL", name: "Chile",       dial: "56",  flag: "🇨🇱" },
  { iso: "CO", name: "Colombia",    dial: "57",  flag: "🇨🇴" },
  { iso: "EC", name: "Ecuador",     dial: "593", flag: "🇪🇨" },
  { iso: "PY", name: "Paraguay",    dial: "595", flag: "🇵🇾" },
  { iso: "UY", name: "Uruguay",     dial: "598", flag: "🇺🇾" },
  { iso: "VE", name: "Venezuela",   dial: "58",  flag: "🇻🇪" },
  { iso: "MX", name: "México",      dial: "52",  flag: "🇲🇽" },
  { iso: "US", name: "USA/Canadá",  dial: "1",   flag: "🇺🇸" },
  { iso: "ES", name: "España",      dial: "34",  flag: "🇪🇸" },
];

const DEFAULT_DIAL = "51";

/** Separa un número E.164 guardado (ej. "+51987654321") en código de país y número nacional. */
export function splitPhone(value: string | null | undefined): { dial: string; number: string } {
  if (!value) return { dial: DEFAULT_DIAL, number: "" };
  const digits = value.replace(/\D/g, "");
  // Prefiere el código de país más largo que coincida (evita colisiones como 1 vs 591).
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find(c => digits.startsWith(c.dial));
  if (match) return { dial: match.dial, number: digits.slice(match.dial.length) };
  return { dial: DEFAULT_DIAL, number: digits };
}

export function PhoneInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (e164: string) => void;
  placeholder?: string;
}) {
  const init = useMemo(() => splitPhone(value), []); // se siembra una sola vez
  const [dial, setDial] = useState(init.dial);
  const [number, setNumber] = useState(init.number);

  function emit(d: string, n: string) {
    const clean = n.replace(/\D/g, "");
    onChange(clean ? `+${d}${clean}` : "");
  }

  return (
    <div className="flex gap-2">
      <select
        value={dial}
        onChange={e => { setDial(e.target.value); emit(e.target.value, number); }}
        className="rounded-lg border border-slate-300 px-2 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      >
        {COUNTRIES.map(c => (
          <option key={c.iso} value={c.dial}>{c.flag} +{c.dial}</option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        value={number}
        onChange={e => { const n = e.target.value.replace(/\D/g, ""); setNumber(n); emit(dial, n); }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}
