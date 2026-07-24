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

  // Reemplaza el texto de cada apartado por su versión reconstruida (archivo),
  // conservando toda la estructura del documento (secciones, títulos, etc.).
  const reconstruidos: string[] = [];
  const docs = getDocs(nivel).map((d) => {
    const a = getReconstruidoArchivo(nivel, d.codigo);
    if (a.es || a.pt) reconstruidos.push(d.codigo);
    return { ...d, raw_es: a.es ?? d.raw_es, raw: a.pt ?? d.raw };
  });

  return <Reader nivel={nivel} docs={docs} reconstruidos={reconstruidos} isAdmin={isAdmin} />;
}
