#!/usr/bin/env bash
# Prepares the database, then runs the API and the storefront behind the
# gateway on the public port.
set -euo pipefail

cd /app/apps/api
bunx medusa db:migrate
if [ "${SEED_ON_FIRST_BOOT:-}" = "true" ]; then
  bunx medusa exec ./src/scripts/seed-if-empty.ts
fi
if [ -n "${ADMIN_EMAIL:-}" ] && [ -n "${ADMIN_PASSWORD:-}" ]; then
  # Fails harmlessly when the user already exists.
  bunx medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD" >/dev/null 2>&1 || true
fi

PUBLIC_PORT="${PORT:-8080}"
(cd /app/apps/api && PORT=9000 bunx medusa start) &
(cd /app/apps/storefront && PORT=3000 bunx next start -p 3000) &
PORT="$PUBLIC_PORT" node /app/deploy/gateway.mjs &

# Exit when any process stops so the platform restarts the container.
wait -n
exit 1
