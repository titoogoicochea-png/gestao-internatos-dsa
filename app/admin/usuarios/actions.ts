"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

/** Verifica que quien llama sea admin o propietario. Devuelve su id y rol. */
async function requireManager() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  const rol = myProfile?.rol;
  if (rol !== "admin" && rol !== "propietario") throw new Error("Sin permiso");
  return { userId: user.id, rol };
}

/** Un admin no puede gestionar a un propietario; el propietario puede con todos. */
async function assertCanManage(callerRol: string, targetId: string) {
  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", targetId)
    .single();
  if (!target) throw new Error("Usuario no encontrado");
  if (callerRol !== "propietario" && target.rol === "propietario") {
    throw new Error("Sin permiso");
  }
  return target;
}

export async function updateUserRole(userId: string, newRol: "admin" | "usuario") {
  const { userId: callerId, rol } = await requireManager();
  if (userId === callerId) throw new Error("No puedes cambiar tu propio rol");

  // Admin y propietario pueden cambiar roles, pero nunca los de un propietario
  // (cuenta protegida: no se puede degradar ni tocar al dueño).
  const target = await assertCanManage(rol, userId);
  if (target.rol === "propietario") {
    throw new Error("No puedes cambiar el rol de un propietario");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ rol: newRol })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/usuarios");
}

/** Editar nombre y celular (WhatsApp) de un usuario. */
export async function updateUserData(
  userId: string,
  data: { nombre: string; celular: string }
) {
  const { rol } = await requireManager();
  await assertCanManage(rol, userId);

  const nombre = data.nombre.trim();
  const celular = data.celular.trim() || null;
  if (!nombre) throw new Error("El nombre es obligatorio");

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ nombre, celular })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/usuarios");
}

function generarPasswordTemporal(): string {
  // Sin caracteres ambiguos (0/O, 1/l/I) para dictarla/copiarla sin errores.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = randomBytes(10);
  let out = "";
  for (let i = 0; i < 10; i++) out += chars[bytes[i] % chars.length];
  return out;
}

/**
 * Genera una contraseña temporal para otro usuario y marca que debe cambiarla
 * al iniciar sesión. Devuelve la contraseña en claro para que el admin la envíe
 * por WhatsApp (solo la ve quien ejecuta la acción).
 */
export async function resetUserPassword(userId: string) {
  const { userId: callerId, rol } = await requireManager();
  if (userId === callerId) {
    throw new Error("Usa el flujo normal para tu propia contraseña");
  }
  await assertCanManage(rol, userId);

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("nombre, celular")
    .eq("id", userId)
    .single();
  if (!target) throw new Error("Usuario no encontrado");

  const password = generarPasswordTemporal();
  const admin = createAdminClient();

  // Preserva los metadatos existentes (nombre, idioma, celular) y añade la marca.
  const { data: got, error: getErr } = await admin.auth.admin.getUserById(userId);
  if (getErr) throw new Error(getErr.message);
  const meta = got.user?.user_metadata ?? {};

  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
    user_metadata: { ...meta, debe_cambiar_password: true },
  });
  if (error) throw new Error(error.message);

  return {
    password,
    nombre: target.nombre,
    celular: target.celular ?? "",
  };
}
