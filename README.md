# Gestão de Internatos DSA — Lector bilingüe

Aplicación web (Next.js) que **lee los documentos `.md`** de los referenciais de
internados adventistas de la DSA (Educación **Básica** y **Superior**) y los muestra
como un documento navegable, mobile-first, con interfaz **bilingüe (Español / Português)**.

Es el **primer módulo** del proyecto descrito en `MANUAL.md` (el Lector, §9.5). No incluye
todavía login, base de datos, comentarios ni informes con IA — eso se añade por etapas
sobre esta base (ver «Próximos pasos»).

## Qué hace hoy

- Página de inicio con elección de nivel (Básica / Superior).
- Lector con **índice lateral**: Apresentação, Capítulos I–VII, Anexos y Referências.
- Sub-índice por capítulo (secciones 3.1, 3.2, …) con saltos de ancla.
- Render de **Markdown + tablas GFM**.
- **Anexo C** con los **colores por dimensión** del MANUAL (§8).
- Selector de idioma **ES / PT** en la interfaz (se recuerda en el navegador).
- El **contenido** se muestra en su fuente oficial **pt-BR** (la traducción al español
  del contenido es un paso posterior, ver «Próximos pasos»).

## Cómo correrlo en local

```bash
npm install
npm run dev      # genera el contenido y arranca http://localhost:3000
```

> El script `npm run gen:content` (que corre solo antes de `dev` y `build`) lee
> `content/basica/*.md` y `content/superior/*.md` y genera `lib/content.generated.json`.

## Cómo actualizar el contenido

1. Edita o reemplaza los `.md` dentro de `content/basica/` o `content/superior/`.
2. Corre `npm run gen:content` (o simplemente `npm run dev` / `npm run build`).

Convenciones de los archivos (ver `scripts/gen-content.mjs`):
`00_apresentacao.md`, `cap01.md … cap07.md`, `98_referencias.md`,
`99_anexoA.md` / `99_anexoB.md`, `99_anexoC.md`.

## Cómo desplegarlo en Vercel (`…vercel.app`)

Esta carpeta (`app-internatos`) es la raíz del proyecto desplegable.

**Opción A — con GitHub (recomendada):**
1. Sube esta carpeta a un repositorio de GitHub (ver «Git» abajo).
2. En [vercel.com](https://vercel.com) → *Add New → Project* → importa el repo.
3. Vercel detecta Next.js automáticamente. No hay variables de entorno por ahora.
4. *Deploy*. Obtendrás una URL `https://<tu-proyecto>.vercel.app`.

**Opción B — con la CLI de Vercel (sin GitHub):**
```bash
npm i -g vercel
vercel            # primera vez: responde las preguntas
vercel --prod     # publica a producción
```

> Nota: esta carpeta vive dentro de OneDrive, cuya ruta tiene acentos y espacios.
> Por eso `npm run build` **falla en local** (un problema conocido de Next.js con rutas
> no-ASCII), pero `npm run dev` funciona, y **el build en Vercel funciona** porque allí
> la ruta es limpia (`/vercel/path0`). Si quisieras construir en local, copia el proyecto
> a una ruta sin acentos (p. ej. `~/Projects/app-internatos`).

## Git

```bash
cd app-internatos
git init
git add .
git commit -m "Lector bilingüe de los referenciais DSA"
# luego crea el repo en GitHub y:
# git remote add origin <url>
# git push -u origin main
```

## Próximos pasos (según MANUAL.md)

- **Traducción del contenido pt→es** (`texto_es`) revisable por el admin.
- **Supabase**: auth, inscripción, grupos con cupos, comentarios con RLS.
- **IA**: generación de informes por grupo (Gemini / Claude) y exportación DOCX.
- i18n con `next-intl`, dashboard de progreso, gestión de usuarios.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · react-markdown + remark-gfm + rehype-slug.
