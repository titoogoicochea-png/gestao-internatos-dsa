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

  if (myProfile?.rol !== "propietario") redirect("/");

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, nombre, email, rol, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-slate-400 hover:text-slate-600">← Inicio</a>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-brand">Gestión de usuarios</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-800">Gestión de usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">
            Asigna o revoca el rol de administrador a los usuarios registrados.
          </p>
        </div>

        <UsersAdmin profiles={profiles ?? []} currentUserId={user.id} />
      </main>
    </div>
  );
}
