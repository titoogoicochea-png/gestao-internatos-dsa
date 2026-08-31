import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Latido diario contra Supabase.
 *
 * Un proyecto gratuito de Supabase se pausa tras siete días sin actividad, y
 * despausarlo es a mano desde el panel: mientras tanto nadie puede entrar al
 * aplicativo. Una consulta al día deja seis días de margen sobre ese plazo.
 *
 * Lo dispara Vercel Cron (ver vercel.json). No hay nada visible para el usuario:
 * la respuesta es JSON para los registros del despliegue.
 */

export const runtime = "nodejs";
// Nunca se sirve desde caché: una respuesta cacheada no toca Supabase y el
// latido dejaría de latir sin que nadie lo notara.
export const dynamic = "force-dynamic";

/** Compara sin filtrar por tiempo cuántos caracteres coinciden. */
function coincideElSecreto(recibido: string, esperado: string): boolean {
  const a = createHash("sha256").update(recibido).digest();
  const b = createHash("sha256").update(esperado).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;

  // Sin secreto configurado se responde que no, en vez de dejar abierta una
  // ruta que cualquiera puede usar para golpear la base de datos.
  if (!secreto) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET no está configurado" },
      { status: 503 }
    );
  }

  const cabecera = request.headers.get("authorization") ?? "";
  const recibido = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : "";

  if (!recibido || !coincideElSecreto(recibido, secreto)) {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const empezado = Date.now();

  // Consulta real sobre una tabla real. `head: true` pide solo el conteo, sin
  // traerse ninguna fila. Si esto falla, el latido no ha servido de nada y tiene
  // que constar como fallo.
  try {
    const supabase = createAdminClient();
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({
      ok: true,
      comprobadoEn: new Date().toISOString(),
      baseDeDatos: { ok: true, perfiles: count ?? 0 },
      duracionMs: Date.now() - empezado,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: "La base de datos no respondió",
        detalle: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
