#!/bin/sh
set -e

DB_FILE="/app/prisma/data/vvh.db"
DATA_DIR="/app/prisma/data"

echo "==> docker-entrypoint: starting up"

# Ensure the bind-mounted directory exists and is writable
mkdir -p "$DATA_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "==> No SQLite DB found at $DB_FILE — initializing..."
  # The runtime image ships no npm/npx (removed in the Dockerfile to clear the
  # base-image package-manager findings), so call the local binaries through
  # their node_modules/.bin shims. `prisma db seed` would shell out to npx, so
  # the seed script is executed directly with the local tsx instead.
  /app/node_modules/.bin/prisma db push --skip-generate
  echo "==> Seeding baseline data..."
  /app/node_modules/.bin/tsx /app/prisma/seed.ts
  echo "==> Database initialized."
else
  echo "==> Existing SQLite DB found at $DB_FILE — skipping init."
  # Optional: keep schema in sync with the image on every boot
  # /app/node_modules/.bin/prisma db push --skip-generate
fi

echo "==> Handing off to: $@"
exec "$@"