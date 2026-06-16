import { notFound } from "next/navigation";
import { getDocs, isNivel, NIVEIS } from "@/lib/content";
import { Reader } from "@/components/Reader";

export function generateStaticParams() {
  return NIVEIS.map((nivel) => ({ nivel }));
}

export default function NivelPage({ params }: { params: { nivel: string } }) {
  const { nivel } = params;
  if (!isNivel(nivel)) notFound();

  const docs = getDocs(nivel);
  if (docs.length === 0) notFound();

  return <Reader nivel={nivel} docs={docs} />;
}
