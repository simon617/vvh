#!/usr/bin/env bash
#
# backup-prod.sh — nightly snapshot of the SQLite DB + uploads named volumes.
# Runs via systemd timer on the server as user `deploy` (see DEPLOYMENT.md,
# section "Backups").
#
# Restore: extract the archive, then copy files into the volume:
#   docker run --rm -v vvh_sqlite-data:/data -v /opt/vvh/backups:/backup \
#     alpine sh -c "tar xzf /backup/sqlite-<stamp>.tar.gz -C /data"
#
# NOTE: file-level tar while the app is running is safe enough at this site's
# low write rate (SQLite journaling checkpoints on close). If write rate grows,
# move to Postgres and switch this to pg_dump (documented in DEPLOYMENT.md).
set -Eeuo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/vvh/backups}"
SQLITE_VOLUME="${SQLITE_VOLUME:-vvh_sqlite-data}"
UPLOADS_VOLUME="${UPLOADS_VOLUME:-vvh_uploads}"
KEEP_DAILY="${KEEP_DAILY:-14}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"

docker run --rm \
  -v "${SQLITE_VOLUME}:/data:ro" \
  -v "${BACKUP_DIR}:/backup" \
  alpine sh -c "tar czf /backup/sqlite-${STAMP}.tar.gz -C /data ."

docker run --rm \
  -v "${UPLOADS_VOLUME}:/data:ro" \
  -v "${BACKUP_DIR}:/backup" \
  alpine sh -c "tar czf /backup/uploads-${STAMP}.tar.gz -C /data ."

# Retention (keep the last KEEP_DAILY snapshots of each kind).
ls -1t "${BACKUP_DIR}"/sqlite-*.tar.gz 2>/dev/null | tail -n +$((KEEP_DAILY + 1)) | xargs -r rm -f
ls -1t "${BACKUP_DIR}"/uploads-*.tar.gz 2>/dev/null | tail -n +$((KEEP_DAILY + 1)) | xargs -r rm -f

echo "[$(date '+%Y-%m-%d %H:%M:%S')] backup-prod.sh OK — sqlite-${STAMP}.tar.gz uploads-${STAMP}.tar.gz" \
  >> /opt/vvh/logs/backup.log