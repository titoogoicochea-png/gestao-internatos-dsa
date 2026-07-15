import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service role — SOLO para usar dentro de server actions ("use server").
 * Tiene privilegios de administrador (bypassa RLS y accede a la Auth Admin API),
 * por eso NUNCA debe importarse en código que llegue al navegador.
 *
 * Requiere la variable de entorno SUPABASE_SERVICE_ROLE_KEY
 * (Supabase → Project Settings → API → service_role key).
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Agrégala en .env.local y en Vercel para poder restablecer contraseñas."
    );
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
