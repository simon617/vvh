#!/bin/sh
set -e

DB_FILE="/app/prisma/data/vvh.db"
DATA_DIR="/app/prisma/data"

echo "==> docker-entrypoint: starting up"

# Ensure the bind-mounted directory exists and is writable
mkdir -p "$DATA_DIR"

if [ ! -f "$DB_FILE" ]; then
  echo "==> No SQLite DB found at $DB_FILE — initializing..."
  npx prisma db push --skip-generate
  echo "==> Seeding baseline data..."
  npm run seed
  echo "==> Database initialized."
else
  echo "==> Existing SQLite DB found at $DB_FILE — skipping init."
  # Optional: keep schema in sync with the image on every boot
  # npx prisma db push --skip-generate
fi

echo "==> Handing off to: $@"
exec "$@"