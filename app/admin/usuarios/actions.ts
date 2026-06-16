"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRol: "admin" | "usuario") {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (myProfile?.rol !== "propietario") throw new Error("Sin permiso");
  if (userId === user.id) throw new Error("No puedes cambiar tu propio rol");

  const { error } = await supabase
    .from("profiles")
    .update({ rol: newRol })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/usuarios");
}
