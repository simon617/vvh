#!/usr/bin/env bash
#
# cloudflare-ddns.sh — keep the www A record in sync with the ROUTER's dynamic
# public IP. Runs every 10 minutes via a systemd timer (see DEPLOYMENT.md,
# section "Dynamic public IP"). Also run it at boot / on network changes.
#
# Required env (set in /etc/systemd/system/cloudflare-ddns.service):
#   CF_API_TOKEN    scoped Cloudflare API token (Zone -> DNS -> Edit)
#   CF_ZONE_ID      zone id for visionvalues.com.hk (CF dashboard -> Overview)
#   CF_A_RECORD_ID  DNS record id for www.visionvalues.com.hk (API or CF dashboard URL)
#   CF_DOMAIN       www.visionvalues.com.hk
set -Eeuo pipefail

LOG_FILE="${DDNS_LOG:-/opt/vvh/logs/ddns.log}"
PUBLIC_IP=""

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"; }
fail() { log "ERROR: $*"; exit 1; }

: "${CF_API_TOKEN:?CF_API_TOKEN is required}"
: "${CF_ZONE_ID:?CF_ZONE_ID is required}"
: "${CF_A_RECORD_ID:?CF_A_RECORD_ID is required}"
: "${CF_DOMAIN:?CF_DOMAIN is required}"

# 1) Current public IPv4 address (multiple fallbacks).
for url in "https://api.ipify.org" "https://ifconfig.me/ip" "https://ipinfo.io/ip"; do
  PUBLIC_IP="$(curl -fsS --max-time 10 "$url" 2>/dev/null | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)"
  [ -n "$PUBLIC_IP" ] && break
done
[ -n "$PUBLIC_IP" ] || fail "Could not determine public IP"

# 2) Current A record value (needs dnsutils: apt-get install -y dnsutils).
DNS_IP="$(dig +short "$CF_DOMAIN" A 2>/dev/null | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)"

[ "$PUBLIC_IP" = "$DNS_IP" ] && { log "No change ($PUBLIC_IP)"; exit 0; }

log "IP changed: DNS=${DNS_IP:-unknown} public=$PUBLIC_IP — updating $CF_DOMAIN"

# 3) PATCH the A record via the Cloudflare API.
HTTP_CODE="$(curl -sS -o /tmp/cf-ddns-response.json -w '%{http_code}' --max-time 15 \
  -X PATCH "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${CF_A_RECORD_ID}" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "{\"content\":\"${PUBLIC_IP}\"}" || true)"

if [ "$HTTP_CODE" = "200" ]; then
  log "OK: A record for $CF_DOMAIN updated to $PUBLIC_IP"
else
  fail "Cloudflare API returned HTTP $HTTP_CODE (see /tmp/cf-ddns-response.json)"
fi