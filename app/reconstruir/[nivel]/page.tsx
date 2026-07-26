import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocs, isNivel } from "@/lib/content";
import { getReconstruidoArchivo } from "@/lib/reconstruido";
import { Reader } from "@/components/Reader";

// Lector del documento RECONSTRUIDO (mismo componente que el Módulo 1):
// capítulos desplegables con sus secciones, índice, toggle ES/PT y Anterior/Siguiente.
export const dynamic = "force-dynamic";

export default async function ReconstruirNivelPage({ params }: { params: { nivel: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
  const rol = profile?.rol ?? "usuario";
  const isAdmin = rol === "admin" || rol === "propietario";

  const { nivel } = params;
  if (!isNivel(nivel)) notFound();

  // Reemplaza el texto de cada apartado por su versión reconstruida (archivo).
  // El índice lateral se toma del texto reconstruido, porque sus títulos pueden
  // diferir de los del documento original (p. ej. el Capítulo III reorganizado).
  const reconstruidos: string[] = [];
  const docs = getDocs(nivel).map((d) => {
    const a = getReconstruidoArchivo(nivel, d.codigo);
    if (a.es || a.pt) reconstruidos.push(d.codigo);
    return {
      ...d,
      raw_es: a.es ?? d.raw_es,
      raw: a.pt ?? d.raw,
      sections_es: a.es ? a.sec_es ?? [] : d.sections_es,
      sections: a.pt ? a.sec_pt ?? [] : d.sections,
    };
  });

  return <Reader nivel={nivel} docs={docs} reconstruidos={reconstruidos} isAdmin={isAdmin} />;
}
