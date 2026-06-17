import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDocs } from "@/lib/content";
import { getWorkSections } from "@/lib/sections-parser";
import { ANEXO_C_SUBDIMS } from "@/lib/anexo-c-sections";
import { TrabajoClient, type Assignment } from "@/components/TrabajoClient";

export default async function TrabajoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: suscRow } = await supabase
    .from("suscripciones")
    .select("grupo_id")
    .eq("usuario_id", user.id)
    .maybeSingle();

  if (!suscRow) redirect("/modulo2");

  const { data: grupo } = await supabase
    .from("grupos")
    .select("id, nombre, nivel, taller, descripcion, asignaciones(doc_codigo)")
    .eq("id", suscRow.grupo_id)
    .single();

  if (!grupo) redirect("/modulo2");

  const nivel = grupo.nivel as "basica" | "superior";
  const taller = (grupo.taller ?? "tarde1") as "tarde1" | "tarde2";
  const docs = getDocs(nivel);

  const assignments: Assignment[] = grupo.asignaciones.flatMap(
    (a: { doc_codigo: string }): Assignment[] => {
      const code = a.doc_codigo;

      if (taller === "tarde2") {
        // Anexo C subdimension
        const sub = ANEXO_C_SUBDIMS.find((s) => s.id === code);
        if (!sub) return [];
        return [{
          docCodigo: code,
          title: `${sub.codigo} — ${sub.titulo_es}`,
          parentTitle: sub.dimTitulo_es,
          sections: [{
            slug: code,
            title: sub.titulo_es,
            content: "",
          }],
          nivelLink: `/${nivel}?doc=99_anexoC#${sub.id}`,
        }];
      }

      // Tarde 1 — doc sections
      const docCode = code.includes("#") ? code.split("#")[0] : code;
      const doc = docs.find((d) => d.codigo === docCode);
      if (!doc) return [];

      const sections = getWorkSections(doc, code);
      if (sections.length === 0) return [];

      const parentTitle = code.includes("#")
        ? doc.sections_es.find((s) => s.id === code.split("#")[1])?.text ?? doc.titulo_es
        : doc.titulo_es;

      return [{
        docCodigo: code,
        title: parentTitle,
        parentTitle: doc.titulo_es,
        sections,
        nivelLink: `/${nivel}?doc=${docCode}`,
      }];
    }
  );

  const { data: observaciones } = await supabase
    .from("observaciones")
    .select("doc_codigo, seccion_id, texto")
    .eq("usuario_id", user.id)
    .eq("grupo_id", grupo.id);

  const initialComments: Record<string, string> = {};
  for (const obs of observaciones ?? []) {
    initialComments[`${obs.doc_codigo}::${obs.seccion_id}`] = obs.texto;
  }

  return (
    <TrabajoClient
      grupoId={grupo.id}
      grupoNombre={grupo.nombre}
      nivel={nivel}
      taller={taller}
      assignments={assignments}
      initialComments={initialComments}
    />
  );
}
