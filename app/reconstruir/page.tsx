import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocs, NIVEIS } from "@/lib/content";
import { getReconstruidoArchivo } from "@/lib/reconstruido";
import { ReconstruirPicker, type NivelResumen } from "@/components/ReconstruirPicker";

export const dynamic = "force-dynamic";

export default async function ReconstruirPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const niveles: NivelResumen[] = NIVEIS.map((nivel) => {
    const docs = getDocs(nivel);
    const reconstruidos = docs.filter((d) => {
      const a = getReconstruidoArchivo(nivel, d.codigo);
      return !!(a.es || a.pt);
    }).length;
    return { nivel, total: docs.length, reconstruidos };
  });

  return <ReconstruirPicker niveles={niveles} />;
}
