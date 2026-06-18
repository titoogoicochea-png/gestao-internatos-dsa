#!/usr/bin/env bash
# ============================================================
# Respaldo de la base de datos Supabase (esquema public).
# Uso:  npm run backup
# Requiere:  pg_dump instalado + DATABASE_URL en .env.local
# Genera:  backup-AAAA-MM-DD-HHMM.sql (no se sube a git)
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "❌ No encuentro .env.local en $(pwd)"; exit 1
fi

# Lee DATABASE_URL (última línea) y la limpia de comillas rectas/tipográficas y corchetes
DBURL=$(grep -E '^[[:space:]]*DATABASE_URL=' .env.local | tail -1 | cut -d= -f2- \
  | perl -CS -pe 's/[\x{201C}\x{201D}\x{2018}\x{2019}"\x{27}\[\]]//g; s/^\s+//; s/\s+$//')
if [ -z "${DBURL:-}" ]; then
  echo "❌ Falta DATABASE_URL en .env.local"; exit 1
fi

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "❌ pg_dump no está instalado. Instálalo con:"
  echo "   brew install libpq && brew link --force libpq"; exit 1
fi

OUT="backup-$(date +%Y-%m-%d-%H%M).sql"
echo "⏳ Respaldando esquema public → $OUT ..."
pg_dump "$DBURL" --schema=public --no-owner --no-privileges -f "$OUT"

SIZE=$(ls -lh "$OUT" | awk '{print $5}')
echo "✅ Backup creado: $OUT ($SIZE)"
echo "   Filas por tabla:"
awk '/^COPY public\./ { t=$2; c=0; d=1; next }
     d && /^\\\.$/    { printf "     %-26s %d\n", t, c; d=0; next }
     d                { c++ }' "$OUT"
echo "💡 Guarda una copia fuera del proyecto (o ya está en OneDrive si sincroniza)."
