#!/usr/bin/env bash
#
# deploy.sh — production deploy (with automatic rollback) for vvh.
# Runs ON the server as user `deploy`. Invoked by GitHub Actions over SSH:
#   cd /opt/vvh && ./deploy.sh ghcr.io/simon617/vvh:<tag>
#
# Flow: pull image -> (optional migrate) -> recreate container -> healthcheck
#       -> on failure: roll back to the previously deployed image tag -> alert.
set -Eeuo pipefail

# Explicit PATH so non-interactive SSH shells find docker/curl every time.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

BASE_DIR="/opt/vvh"
COMPOSE_FILE="$BASE_DIR/docker-compose.prod.yml"
ENV_FILE="$BASE_DIR/.env"
LOG_FILE="$BASE_DIR/logs/deploy.log"
LAST_IMAGE_FILE="$BASE_DIR/.last_image"
NEW_IMAGE="${1:-}"

HEALTH_URL="http://127.0.0.1:3000/api/health"
HEALTH_RETRIES=30
HEALTH_INTERVAL=3

export COMPOSE_PROJECT_NAME="vvh"

ts() { date '+%Y-%m-%d %H:%M:%S %z'; }
log() { echo "[$(ts)] $*" | tee -a "$LOG_FILE"; }
fail() { log "ERROR: $*"; exit 1; }
info() { log "$*"; }

if [ -z "$NEW_IMAGE" ]; then
  fail "No image supplied. Usage: $0 ghcr.io/simon617/vvh:<tag>"
fi

mkdir -p "$BASE_DIR/logs"
touch "$LOG_FILE"
chmod 660 "$LOG_FILE" 2>/dev/null || true

PREV_IMAGE=""
[ -f "$LAST_IMAGE_FILE" ] && PREV_IMAGE="$(cat "$LAST_IMAGE_FILE")"

# MIGRATE_ON_DEPLOY comes from the server .env (never echoed).
MIGRATE_ON_DEPLOY="$(sed -n 's/^MIGRATE_ON_DEPLOY=//p' "$ENV_FILE" 2>/dev/null || true)"

healthcheck() {
  local tries="${1:-$HEALTH_RETRIES}"
  for _ in $(seq 1 "$tries"); do
    if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$HEALTH_INTERVAL"
  done
  return 1
}

log "==> Deploying $NEW_IMAGE (previous: ${PREV_IMAGE:-none})"
export VVH_IMAGE="$NEW_IMAGE"

# --- Pull the new image ---
info "Pulling image..."
docker compose -f "$COMPOSE_FILE" pull app \
  || fail "docker compose pull failed. Is the server logged in to ghcr.io?
           Run: echo \"\$GHCR_PULL_TOKEN\" | docker login ghcr.io -u <user> --password-stdin"

# --- Optional migrations (flag-controlled; Prisma CLI must ship in the image) ---
if [ "${MIGRATE_ON_DEPLOY:-false}" = "true" ]; then
  info "MIGRATE_ON_DEPLOY=true -> applying database migrations"
  if docker compose -f "$COMPOSE_FILE" exec -T app sh -c "test -x ./node_modules/.bin/prisma" 2>/dev/null; then
    docker compose -f "$COMPOSE_FILE" exec -T app ./node_modules/.bin/prisma migrate deploy \
      || fail "Prisma migrations failed. Aborting before restart."
  else
    info "Runtime image does not ship the Prisma CLI — skipping migrate (see DEPLOYMENT.md §Migrations)."
  fi
fi

# --- Recreate the container ---
info "Recreating container..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans app \
  || fail "docker compose up failed."

# --- Healthcheck with rollback ---
if healthcheck; then
  info "OK: healthcheck passed on $NEW_IMAGE"
  echo "$NEW_IMAGE" > "$LAST_IMAGE_FILE"
else
  log "FAIL: healthcheck failed on $NEW_IMAGE after $((HEALTH_RETRIES * HEALTH_INTERVAL))s"
  if [ -n "$PREV_IMAGE" ]; then
    log "Rolling back to $PREV_IMAGE..."
    export VVH_IMAGE="$PREV_IMAGE"
    docker compose -f "$COMPOSE_FILE" up -d --remove-orphans app \
      || log "CRITICAL: container could not be recreated for rollback."
    if healthcheck; then
      info "OK: rollback to $PREV_IMAGE succeeded"
      echo "$PREV_IMAGE" > "$LAST_IMAGE_FILE"
    else
      log "CRITICAL: rollback image is ALSO unhealthy. Manual intervention required.
            Last good image: ${PREV_IMAGE}. Inspect: docker logs vvh-app --tail 100"
    fi
  else
    log "CRITICAL: no previous image to roll back to. Manual intervention required."
  fi
  exit 1
fi

# --- Housekeeping ---
info "Pruning dangling images..."
docker image prune -f >/dev/null 2>&1 || true

info "==> deploy.sh finished OK ($NEW_IMAGE)"