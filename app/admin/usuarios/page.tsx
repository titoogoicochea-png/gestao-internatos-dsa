import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsersAdmin } from "@/components/UsersAdmin";

export default async function AdminUsuariosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (myProfile?.rol !== "propietario" && myProfile?.rol !== "admin") redirect("/");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nombre, email, celular, rol, created_at")
    .order("created_at", { ascending: true });

  // Grupos a los que pertenece cada usuario
  const { data: suscripciones } = await supabase
    .from("suscripciones")
    .select("usuario_id, grupos(nombre, taller)");

  const gruposByUser: Record<string, { nombre: string; taller: string }[]> = {};
  for (const s of suscripciones ?? []) {
    const raw = s.grupos;
    const g = (Array.isArray(raw) ? raw[0] : raw) as { nombre: string; taller: string } | null;
    if (!g) continue;
    (gruposByUser[s.usuario_id] ??= []).push(g);
  }
  for (const id in gruposByUser) {
    gruposByUser[id].sort((a, b) => (a.taller ?? "").localeCompare(b.taller ?? ""));
  }

  return (
    <UsersAdmin
      profiles={profiles ?? []}
      currentUserId={user.id}
      currentUserRole={myProfile.rol}
      gruposByUser={gruposByUser}
    />
  );
}
