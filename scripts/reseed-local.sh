#!/usr/bin/env bash
# Rebuilds the local database from apps/api's seed. The current publishable API
# key is carried over so a running storefront keeps working with its existing env.
# Run with the API stopped, from a shell where DATABASE_URL is set.
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL must be set}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="${DATABASE_URL##*/}"
DB_NAME="${DB_NAME%%\?*}"
ADMIN_URL="${DATABASE_URL%/*}/postgres"
BACKUP="${TMPDIR:-/tmp}/${DB_NAME}-$(date +%Y%m%d-%H%M%S).dump"

OLD_KEY=$(psql "$DATABASE_URL" -Atc "select token from api_key where type = 'publishable' and deleted_at is null order by created_at limit 1" 2>/dev/null || true)

echo "→ Backing up $DB_NAME to $BACKUP"
pg_dump -Fc "$DATABASE_URL" -f "$BACKUP"

echo "→ Recreating $DB_NAME"
psql "$ADMIN_URL" -v ON_ERROR_STOP=1 \
  -c "DROP DATABASE IF EXISTS \"$DB_NAME\" WITH (FORCE)" \
  -c "CREATE DATABASE \"$DB_NAME\""

cd "$ROOT/apps/api"
echo "→ Running migrations"
bunx medusa db:migrate
echo "→ Seeding"
bun run seed

if [ -n "$OLD_KEY" ]; then
  echo "→ Restoring publishable API key"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
    "update api_key set token = '$OLD_KEY', redacted = '${OLD_KEY:0:6}***${OLD_KEY: -3}' where type = 'publishable'"
fi

rm -rf "$ROOT/apps/storefront/.next/cache/fetch-cache"

echo "✓ Done. Start the API again and restart the storefront dev server."
