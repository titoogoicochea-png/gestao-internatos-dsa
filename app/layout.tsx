import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { createClient } from "@/lib/supabase/server";
import type { Lang } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gestão de Internatos DSA",
  description:
    "Referencial para la Gestión de Internados Adventistas de la División Sudamericana — Educación Básica y Superior.",
};

// Resuelve el idioma en el servidor: cookie (elección explícita del dispositivo)
// y, si no hay, el idioma guardado en la cuenta. Así el SSR ya sale en el idioma
// correcto en TODOS los módulos, sin parpadeo ni cambios al navegar.
async function resolveInitialLang(): Promise<Lang> {
  const cookieLang = (await cookies()).get("lang")?.value;
  if (cookieLang === "es" || cookieLang === "pt") return cookieLang;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const idi = user?.user_metadata?.idioma;
    if (idi === "es" || idi === "pt") return idi;
  } catch {
    // sin sesión / sin conexión → idioma por defecto
  }
  return "es";
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLang = await resolveInitialLang();

  return (
    <html lang={initialLang === "pt" ? "pt-BR" : "es"}>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <LanguageProvider initialLang={initialLang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
