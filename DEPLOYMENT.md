# vvh — Production Deployment Guide

**Repository:** `https://github.com/simon617/vvh` · **App:** Next.js 14 (App Router) + `next-intl` + Prisma/SQLite
**Registry:** `ghcr.io/simon617/vvh` · **Production host:** Ubuntu 22.04/24.04 at `10.0.2.7` (NAT) — publicly `202.77.49.35`
**Domains:** `www.visionvalues.com.hk` (app) and `visionvalues.com.hk` (301 → www) · **DNS:** Cloudflare (zone to be moved)
**Status:** ✅ Generated for `main`. ⬜ Manual phases below are pending — follow them in order.

> **Operator model.** This guide is split into *automatable* steps (files already in this repo) and *manual* steps
> (GitHub UI, Cloudflare UI, router UI, Ubuntu `sudo`, DNS). Run the manual steps exactly as written, redact logs to
> `setup.log`, and **stop on any failure** — do not continue blindly. Secrets are never printed.

---

## Table of contents

1. [Architecture & topology](#1-architecture--topology)
2. [Pre-flight checks (Phase 0)](#2-pre-flight-checks-phase-0)
3. [Cloudflare DNS (Phase 1a)](#3-cloudflare-dns-phase-1a)
4. [Router / NAT port forwarding (Phase 1b)](#4-router--nat-port-forwarding-phase-1b)
5. [GitHub setup (Phase 1c)](#5-github-setup-phase-1c)
6. [Repo files overview](#6-repo-files-overview)
7. [Ubuntu hardening (Phase 2)](#7-ubuntu-hardening-phase-2)
8. [Install Docker, Compose, Nginx, Certbot (Phase 3)](#8-install-docker-compose-nginx-certbot-phase-3)
9. [Create /opt/vvh (Phase 4)](#9-create-optvvh-phase-4)
10. [Nginx + TLS via Certbot (Phase 5)](#10-nginx--tls-via-certbot-phase-5)
11. [First pipeline run & deploy (Phase 6)](#11-first-pipeline-run--deploy-phase-6)
12. [Post-deploy validation (Phase 7)](#12-post-deploy-validation-phase-7)
13. [Rollback](#13-rollback)
14. [Logs, monitoring, backups, maintenance (Phase 8)](#14-logs-monitoring-backups-maintenance-phase-8)
15. [Dynamic public IP & DDNS](#15-dynamic-public-ip--ddns)
16. [Schema migrations (SQLite upgrade path)](#16-schema-migrations-sqlite-upgrade-path)
17. [Troubleshooting](#17-troubleshooting)
18. [Validation cheat sheet](#18-validation-cheat-sheet)
19. [Security & secret-handling protocol](#19-security--secret-handling-protocol)

---

## 1. Architecture & topology

```text
                          Internet
                             │
                     ┌───────▼────────┐
                     │  Router / CPE  │    Public IP 202.77.49.35 (may be DYNAMIC)
                     │  (port-forward)│
                     └───────┬────────┘
                             │ NAT
                   ┌─────────▼─────────┐
                   │  Ubuntu server    │  Internal IP 10.0.2.7
                   │  UFW: 22/80/443   │
                   └─────────┬─────────┘
        ┌────────────────────┼──────────────────────┐
        ▼                    ▼                      ▼
   sshd (22)           nginx (80/443)          Docker Engine
   · deploy user       · TLS termination       · vvh-app container
   · key-only auth     · apex→www 301          · 127.0.0.1:3000:3000
   · fail2ban          · proxy app            · volumes: vvh_sqlite-data,
                        · security headers       vvh_uploads

GitHub Actions (github.com/simon617/vvh)
  · CI  -> npm ci / lint / test / build          (every PR + push to main)
  · SEC -> npm audit, Gitleaks, Trivy, CodeQL, Dependabot
  · DEP -> build → Trivy scan → push ghcr.io → SSH deploy → healthcheck → rollback
```

Key decisions (pronounced, not assumed):

| Topic | Decision |
|---|---|
| Node / runtime | **Node 22 LTS** (`node:22-alpine`); Next.js `output: "standalone"`; non-root `nextjs` user. (Brief said Node 20, but the dependency tree requires ≥22 — `@testing-library/jest-dom@7` — and Node 20 is EOL since 2026-04; your dev box runs Node 24.) |
| Package manager | **npm** (`package-lock.json` confirmed; no pnpm/yarn) |
| Database | **SQLite via Prisma**, named volume `vvh_sqlite-data`; seeded DB baked into the image (fresh-volume bootstrap), server `.env` holds runtime config |
| Registry auth | Push: built-in `GITHUB_TOKEN` (`packages: write`). Server pull: PAT `GHCR_PULL_TOKEN` (`read:packages`) |
| TLS issuance | **DNS-01 via Certbot `certbot-dns-cloudflare`** (works even if the ISP blocks 80/443). HTTP-01 documented as fallback |
| Reverse proxy | Nginx on the **host**, `server_name www.visionvalues.com.hk visionvalues.com.hk;`, apex→www 301, proxy to `127.0.0.1:3000` |
| Deploy model | GitHub Actions builds/pushes the image, then SSHes as `deploy` and runs `/opt/vvh/deploy.sh` (pull → optional migrate → up → healthcheck → rollback) |
| Health | `GET /api/health` (added to this repo) → compose `HEALTHCHECK` + `deploy.sh` curl loop |
| Kill switch | Actions **variable** `DEPLOY_ENABLED` (`true` after Phase 5) gates the deploy job — safe pushes before then |

## 2. Pre-flight checks (Phase 0)

Labels used throughout: **GitHub UI** · **GitHub file** · **Ubuntu terminal** · **Router / NAT UI** · **DNS provider UI** · **Local Windows** · **Optional/recommended**.

### 2.1 A records today (verified 2026-10-05)

```text
www.visionvalues.com.hk    A    202.77.49.34   ← old Apache/CentOS host (live placeholder site)
visionvalues.com.hk        A    202.77.49.34
```

Both records still point at the **old host** (`202.77.49.34` — HTTP 301→HTTPS, Apache). Until DNS is repointed to
`202.77.49.35`, `Nginx here cannot be verified from the public internet`. This is expected and planned.

### 2.2 Run these checks first

**Local Windows** — verify you can actually talk to the new box:

```powershell
# SSH reachability (will ask for the root password if the port is open)
Test-NetConnection -ComputerName 202.77.49.35 -Port 22 -InformationLevel Quiet
# And 80/443:
Test-NetConnection -ComputerName 202.77.49.35 -Port 80  -InformationLevel Quiet
Test-NetConnection -ComputerName 202.77.49.35 -Port 443 -InformationLevel Quiet
```

> Note: if this Windows machine is **on the same LAN/NAT** as the server, those reachability results tell you nothing
> about the public path. The definitive test is from a non-local network (phone hotspot / 4G):
>
> ```text
> nc -zv 202.77.49.35 22
> nc -zv 202.77.49.35 80
> nc -zv 202.77.49.35 443
> ```
>
> If **80/443 are blocked by the ISP**, the plan still works because TLS uses **DNS-01**. Only the HTTP→HTTPS redirect
> would be unreachable from the internet — contact the ISP or use Cloudflare Tunnel (appendix note) as a fix.

**Local Windows** — tooling available:

```powershell
gh auth status          # GitHub CLI signed in? (needed for API-driven setup; UI steps work without it)
ssh -V                  # OpenSSH client
openssl version
docker --version        # Docker Desktop
git --no-pager remote -v   # must show origin https://github.com/simon617/vvh.git
```

Goals of Phase 0:

- [x] Repo state confirmed (origin set, `main`).
- [x] DNS of both names recorded (old IP `202.77.49.34`, target `202.77.49.35`).
- [ ] `22` reachable from a **non-local** network (else fix router forward before anything else).
- [ ] Decisions for Cloudflare token scope + registrar NS change confirmed (below).

### 2.3 ⚠️ BLOCKING FINDING — Next.js 14.x critical advisories

`npm audit` reports **critical/high advisories for `next@14.2.35`** (the newest 14.x):
RCE via the Image Optimizer (AVIF), RSC deserialization DoS, request smuggling, SSRF in rewrites, cache-poisoning,
etc. npm ships **no patched 14.x** — the effective fix is a breaking upgrade to **Next 15/16** (with `next-intl@4`).
Mitigations currently in place: `images.unoptimized = true` in `next.config.js` (Image-Optimizer paths are inert) and
the app is not yet publicly reachable.

**Action items before/at go-live (ranked):**

1. **Plan the Next 15 → 16 upgrade** on a branch (`npm i next@15 next-intl@4`, run `npm run build`, fix breakages,
   update `next.config.js` api diffs, re-run vitest). Repeat for 16 once 15 is green. This is the #1 security item.
2. Keep the `npm audit` CI step **report-only** until #1 lands, then **remove `continue-on-error`** in
   `security.yml` (comments in the file explain exactly where).
3. Do not expose the admin/editor endpoints to the internet — enforce the authorization middleware and (recommended)
   an additional IP allow-list in `nginx.conf` for `/api/auth` and `/api/upload` if editors connect from fixed IPs.
4. Re-run `npm audit --omit=dev` after the upgrade; target **0 critical/high** in production deps.

> This single issue is why the image gate (Trivy) is set to `CRITICAL` — keep it strict. The dependency gate will
> become strict again after the framework upgrade.

**Ubuntu terminal** — initial login as root (from a machine you trust):

```bash
ssh root@202.77.49.35
cat /etc/os-release            # expect Ubuntu 22.04/24.04
nproc && free -h && df -h /    # capacity sanity check
```

Follow the rest of this document in order. **Do not** skip the hardening phase on a public box.

## 3. Cloudflare DNS (Phase 1a)

**DNS provider UI** — decision from pre-flight: **move the zone to Cloudflare**. This unlocks DNS-01 Certbot automation
and the DDNS script, and lets you keep serving the old site until the designed cutover.

### 3.1 Add the zone to Cloudflare

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Add a site** → `visionvalues.com.hk` → select the **Free** plan.
2. Cloudflare shows **two nameservers** (e.g. `anya.ns.cloudflare.com`, `bob.ns.cloudflare.com` — copy YOUR two).
3. At the current registrar (likely an HKDNR-authorised registrar), edit the domain's **nameservers** to those two.
   - This is the DNS cutover. It does *not* touch web hosting yet — only *authoritative* DNS moves.
   - ⏱ Propagation typically 15 min–24 h, checked with `dig visionvalues.com.hk NS +short`.

> While the zone is pending, add the records below — they go live atomically with your nameservers.

### 3.2 Required records (add in Cloudflare, grey cloud / DNS-only)

| Type | Name | Value | Proxy | TTL |
|---|---|---|---|---|
| A | `www` | `202.77.49.35` | DNS only | 300 (during cutover) |
| A | `@` (root) | `202.77.49.35` | DNS only | 300 (during cutover) |
| CAA | `@` | `0 issue "letsencrypt.org"` | — | Auto |

Notes:

- **Grey cloud (DNS-only)** — Nginx on your server must see real client IPs, and the VM IP is fixed inside the LAN. Use
  the orange cloud later only after verifying (then `X-Forwarded-For` still works, but HSTS/proxy quirks apply).
- **CAA** allows only Let's Encrypt. Cloudflare's own edge certificate needs its own CAA (`comodoca.com` / `digicert.com`)
  if you ever proxy through Cloudflare — *grey cloud avoids that entirely*.
- TTL: keep **300 s** for the cutover, raise to **Auto / 3600** once stable (see §3.5).

### 3.3 Delay the cutover (recommended)

Because a live site currently serves on `202.77.49.34`, use this **pre-cutover checklist** before switching the NS:

- [ ] **Back up** the current zone: `dig visionvalues.com.hk A +short`, `dig www.visionvalues.com.hk A +short`,
  `dig visionvalues.com.hk MX +short`, `dig visionvalues.com.hk TXT +short`, `dig visionvalues.com.hk NS +short`
  → save to `setup.log` (excluding keys).
- [ ] Screenshot the registrar control panel DNS records (incl. MX for e-mail if any).
- [ ] **Confirm with the old host that the domain can be released / NS changed** (some hosting plans hold NS).
- [ ] Choose a **low-traffic window** (this is an investor-facing corporate site — weekend morning HK time).
- [ ] **24 h before**: lower TTL to 300 s on the current provider *if editable*.
- [ ] Perform the NS change.
- [ ] After propagation (below): verify old vs new A records, then proceed to Phase 5-cert + Phase 6-deploy.

If people must reach the new site **before** NS move completes, you can temporarily add an **A record on the old host's
DNS** for `www` → `202.77.49.35` — but the canonical path is the Cloudflare NS move.

### 3.4 Verification

From a non-local network / `Local Windows`:

```powershell
Resolve-DnsName www.visionvalues.com.hk            # → should show 202.77.49.35 after cutover
Resolve-DnsName visionvalues.com.hk
Resolve-DnsName visionvalues.com.hk -Type NS       # → Cloudflare nameservers
```

```bash
dig www.visionvalues.com.hk +short
dig visionvalues.com.hk +short
dig visionvalues.com.hk NS +short
```

Also check propagation from the outside at [whatsmydns.net](https://www.whatsmydns.net).

### 3.5 After stability

- Raise TTL to **Auto / 3600** for all records.
- Leave CAA as-is (`0 issue "letsencrypt.org"`).

### 3.6 Cloudflare API token (needed for Certbot + DDNS)

**DNS provider UI** → My Profile → **API Tokens** → Create Token → *Edit zone DNS* (`Zone:DNS:Edit`) scoped to
`visionvalues.com.hk` only. Create **two tokens** (least privilege per consumer) or one and reuse carefully:

1. `CF_DNS_CHALLENGE_TOKEN` — used by **certbot-dns-cloudflare** (renewals). Scope: `Zone:DNS:Edit`.
2. `CF_DDNS_TOKEN` — used by **cloudflare-ddns.sh**. Same scope; can be a separate token so each service can be revoked independently.

> Never paste these tokens into `DEPLOYMENT.md`, `setup.log`, GitHub secrets UI screenshots, or commit them. They live
> only in `/etc/letsencrypt/cloudflare.ini` (mode 600) and `/etc/cloudflare-ddns.env` (mode 600).

## 4. Router / NAT port forwarding (Phase 1b)

**Router / NAT UI** — the server is `10.0.2.7` behind a NAT router with public `202.77.49.35`.
Without these three rules the site is unreachable **and** Certbot HTTP-01 fails (we use DNS-01, but the redirect still needs 80/443):

| External port (WAN) | Internal host | Internal port | Protocol | Purpose |
|---|---|---|---|---|
| 22 | `10.0.2.7` | 22 | TCP | SSH admin + GitHub Actions deploy (update to 2222→22 if you change sshd port) |
| 80 | `10.0.2.7` | 80 | TCP | HTTP→HTTPS 301 redirect + ACME HTTP-01 fallback |
| 443 | `10.0.2.7` | 443 | TCP | HTTPS app |

Steps (router brand will differ):

1. Router admin page (check the manual / `ipconfig` gateway; often `192.168.1.1`).
2. Find **Port Forwarding / Virtual Server / NAT**.
3. Create the three rules above (protocol TCP). Use the *internal* host `10.0.2.7` — **give the server a DHCP reservation / static lease** so `10.0.2.7` never changes.
4. Save/apply; reboot the WAN link only if the router requires it.

**Ubuntu terminal** — the server firewall must match (done in §7):

```bash
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
```

Validation (from a non-local network): `nc -zv 202.77.49.35 22` / `80` / `443` — all three must report `succeeded`.

> Opening only 22 is insufficient — without 80/443 the site 404s externally and (if you ever fall back to HTTP-01) the
> certificate can never be issued.

## 5. GitHub setup (Phase 1c)

### 5.1 Repository settings

**GitHub UI** → `simon617/vvh` → **Settings**:

1. **General → Pull Requests**: enable *Allow auto-merge* (`Optional/recommended`).
2. **Actions → General → Workflow permissions**: select **Read and write** (needed for GHCR `packages: write` via
   `GITHUB_TOKEN`) and enable *Allow GitHub Actions to create and approve pull requests* (Dependabot). Save.
3. **Packages (GHCR)**: enabled by default; the first push in Phase 6 creates the package. Once it exists, open the
   package → **Package settings → Danger Zone → Change visibility** and keep it **private** (server pulls with a token).

### 5.2 Branch protection for `main`

**GitHub UI** → Settings → Branches → **Add branch protection rule**:

- Branch: `main`
- ☑ **Require a pull request before merging** · ☑ *Require approvals* = **1**
- ☑ **Require status checks to pass before merging** → add **`ci`** (job name in `ci.yml`). After the first green
  security run, also add `gitleaks`, `trivy-fs`, `npm audit (production deps)` and `CodeQL`.
- ☑ **Do not allow bypassing the above settings**
- ☐ *Require signed commits* — enable if you sign commits (`Optional/recommended`).
- Save.

### 5.3 Environments (manual approval gate)

**GitHub UI** → Settings → Environments → **New environment** → name `production`:

- ☑ **Required reviewers** → add yourself (or a team). Every deploy waits for your approval.
- ☑ *Deployment branch = `main`*.
- Leave environment secrets empty — runtime app secrets live in `/opt/vvh/.env` (GitHub only carries transport secrets).

### 5.4 Actions secrets & variables

**Variables** (Settings → Secrets and variables → Actions → Variables → New):

| Name | Value | Notes |
|---|---|---|
| `DEPLOY_ENABLED` | `false` | Flip to `true` only after Phase 5 (server + nginx ready). |
| `NEXT_PUBLIC_SITE_URL` | `https://www.visionvalues.com.hk` | Build-time inline value (also defaulted in workflows). |

**Secrets** (Actions → Secrets → New):

| Name | Value |
|---|---|
| `SSH_HOST` | `202.77.49.35` |
| `SSH_USER` | `deploy` |
| `SSH_PORT` | `22` (or `2222` if you moved sshd — §7.7) |
| `SSH_PRIVATE_KEY` | private key from §5.5 (never the `.pub`) |
| `SSH_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 202.77.49.35` output (run after the server exists) |
| `GHCR_PULL_TOKEN` | GitHub PAT with **`read:packages`** — used on the *server*, not in Actions |

> `GHCR_PULL_TOKEN` is a PAT because `GITHUB_TOKEN` works only inside Actions jobs. Push-side needs **no PAT** — the
> workflow declares `permissions: packages: write` and logs in with `GITHUB_TOKEN`.

### 5.5 Generate the deploy SSH key (Local Windows)

```powershell
ssh-keygen -t ed25519 -a 100 -f "$env:USERPROFILE\.ssh\vvh_deploy" -C "github-actions-deploy@vvh"
Get-Content "$env:USERPROFILE\.ssh\vvh_deploy.pub"
```

- The **`.pub` string** → install on the server in §7.1.
- The **private key file** content → `SSH_PRIVATE_KEY` secret.
- Back it up offline — losing it means reinstalling keys.

### 5.6 Cutover trigger

After Phase 5, flip `DEPLOY_ENABLED` → `true` and push to `main` (or **Actions → Deploy → Run workflow**).

---

## 6. Repo files overview

| File | What it does |
|---|---|
| `.github/workflows/ci.yml` | `npm ci` → lint → vitest → `next build` → `tsc --noEmit` on PRs + pushes to `main` |
| `.github/workflows/security.yml` | `npm audit` (gate), Gitleaks (SARIF), Trivy FS (SARIF, report-only), CodeQL; weekly cron |
| `.github/workflows/deploy.yml` | Build → Trivy image gate (fails on CRITICAL) → push `:latest` + `:sha` → SSH deploy (gated by `DEPLOY_ENABLED` + `production` env) |
| `.github/dependabot.yml` | Weekly npm + GitHub Actions bump PRs, grouped |
| `Dockerfile` | Multi-stage `node:22-alpine`; standalone build; seeded SQLite baked in; non-root `nextjs` user; `ARG NEXT_PUBLIC_SITE_URL` |
| `docker-compose.prod.yml` | Server compose: `ghcr.io/simon617/vvh`, `127.0.0.1:3000:3000`, `env_file: .env`, named volumes, healthcheck |
| `nginx.conf` | Host Nginx: 80→https, apex→www 301, TLS, security headers/CSP/gzip/WebSockets, `proxy_pass http://127.0.0.1:3000` |
| `deploy.sh` | Server-side deploy: pull → optional migrate → up → healthcheck with retries → rollback to previous tag |
| `.env.example` | Complete env template (`.env` gitignored; server copy `/opt/vvh/.env`) |
| `.dockerignore` | Shrinks build context; excludes secrets, logs, dev tooling, deploy assets |
| `src/app/api/health/route.ts` | Liveness endpoint used by compose + deploy.sh + uptime monitors |

## 7. Ubuntu hardening (Phase 2)

All commands are **Ubuntu terminal**, run as `root` over `ssh root@202.77.49.35`. This phase is **under your manual
control** (it's server-life-changing: network, sshd, users). Run each block, then validate.

### 7.1 Create the `deploy` user and install the deploy key

```bash
adduser --disabled-password --gecos "vvh deploy user" deploy
usermod -aG sudo deploy

# Authorized keys: existing root key + the GitHub Actions deploy key from §5.5
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh
cp /root/.ssh/authorized_keys /home/deploy/.ssh/authorized_keys 2>/dev/null || true
cat >> /home/deploy/.ssh/authorized_keys <<'EOF'
<paste-the-public-key-from-.pub-here>
EOF

# Keep the file owned by deploy; also add 127.0.0.1 (non-root can't root-login later)
chown deploy:deploy /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys

# Validate from a SECOND terminal BEFORE locking anything down:
#   local> ssh deploy@202.77.49.35   → must work with your key
```

### 7.2 Lock down sshd

Edit `/etc/ssh/sshd_config` — set/verify:

```nginx
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
UsePAM yes
# If you changed the port:
# Port 2222
```

Apply **after** confirming `deploy` can log in (7.1):

```bash
sudo sshd -t                       # syntax check (run as root: sshd -t)
systemctl reload ssh
```

> ⚠️ If you set `Port 2222`, first open UFW: `ufw allow 2222/tcp`, then update router forward `2222 → 10.0.2.7:22`,
> and change the `SSH_PORT` secret. Never close the session until a fresh SSH works on the new port.

### 7.3 UFW

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # or 2222
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status numbered   # expect 22,80,443 ALLOW
```

### 7.4 fail2ban

```bash
apt-get update && apt-get install -y fail2ban
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled   = true
port      = ssh
maxretry  = 5
bantime   = 1h
findtime  = 10m
EOF
systemctl enable --now fail2ban
fail2ban-client status sshd
```

### 7.5 unattended-upgrades

```bash
apt-get install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades   # answer "Yes" to auto-update
systemctl enable --now unattended-upgrades apt-daily-upgrade.timer
systemctl list-timers | grep -E "apt|unattended"
```

### 7.6 Harden sysctl (Optional/recommended)

```bash
cat >> /etc/sysctl.d/99-vvh-hardening.conf <<'EOF'
net.ipv4.conf.all.rp_filter=1
net.ipv4.conf.default.rp_filter=1
net.ipv4.tcp_syncookies=1
net.ipv6.conf.all.disable_ipv6=0
EOF
sysctl --system
```

### 7.7 Optional: move SSH off port 22

Do this **only** if you want to hide from mass scanners: set `Port 2222` in sshd_config, `ufw allow 2222/tcp`,
router-forward `2222 → 10.0.2.7:22`, and set `SSH_PORT=2222` in GitHub. Keep 22 free for possible future use.

### 7.8 Validate

```bash
sudo -l           # as deploy: sudo works
last -15          # confirm no failed root logins piling up
grep -E "Failed|Accepted" /var/log/auth.log | tail -5
```

## 8. Install Docker, Compose, Nginx, Certbot (Phase 3)

**Ubuntu terminal**, now as `deploy` with `sudo`:

### 8.1 Base packages + Docker Engine + Compose plugin

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg dnsutils git htop

# Docker Engine + Compose plugin via the official convenience script (or the
# saved docker apt-repo instructions on docs.docker.com — both are equivalent).
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh
sudo systemctl enable --now docker

# Compose plugin ships with the script; verify:
docker compose version        # Docker Compose version v2.x

# Allow the deploy user to drive docker WITHOUT sudo:
sudo usermod -aG docker deploy
```

⚠️ **Log out and back in** (`exit`, `ssh deploy@202.77.49.35`) so the `docker` group applies. Then:

```bash
docker run --rm hello-world   # must work without sudo
```

### 8.2 Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl enable --now nginx
curl -sI http://127.0.0.1 | head -3   # default page → 200
```

### 8.3 Certbot + Cloudflare DNS plugin

```bash
sudo apt-get install -y certbot python3-certbot-nginx python3-certbot-dns-cloudflare
certbot --version
```

---

## 9. Create /opt/vvh (Phase 4)

### 9.1 Directories and file ownership

```bash
sudo mkdir -p /opt/vvh/logs /opt/vvh/backups /opt/vvh/bin
sudo chown -R deploy:deploy /opt/vvh
mkdir -p /var/www/certbot && sudo chown -R deploy:deploy /var/www/certbot
```

### 9.2 Copy the deploy files from this repo

From **Local Windows** (repo root):

```powershell
scp docker-compose.prod.yml deploy.sh deploy@202.77.49.35:/opt/vvh/
scp nginx.conf deploy@202.77.49.35:/opt/vvh/nginx.conf
scp scripts/cloudflare-ddns.sh scripts/backup-prod.sh deploy@202.77.49.35:/opt/vvh/bin/
```

Then on the server (as `deploy`):

```bash
chmod +x /opt/vvh/deploy.sh /opt/vvh/bin/*.sh
# make scripts executable for systemd/cron (they run as deploy)
sudo ln -s /opt/vvh/scripts /opt/vvh/bin   # optional convenience
```

> Alternative without `scp` keys: download from GitHub
> `curl -fsSLO https://raw.githubusercontent.com/simon617/vvh/main/docker-compose.prod.yml` (etc.) into `/opt/vvh`.

### 9.3 Server `.env` (secrets live here — never commit)

Generate a strong `JWT_SECRET` and create `/opt/vvh/.env`:

```bash
cd /opt/vvh
openssl rand -hex 32    # <- use the output as JWT_SECRET
cat > /opt/vvh/.env <<'EOF'
# ---- Database (SQLite) ----
DATABASE_URL="file:./data/vvh.db"

# ---- Authentication (from openssl rand -hex 32) ----
JWT_SECRET="REPLACE_WITH_RANDOM_HEX"

# ---- SMTP (contact form) ----
SMTP_HOST=""
SMTP_PORT="25"
SMTP_RECIPIENT=""

# ---- Site (must match the GitHub variable / build arg) ----
NEXT_PUBLIC_SITE_URL="https://www.visionvalues.com.hk"

# ---- Uploads ----
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="5242880"

# ---- Deployment ----
MIGRATE_ON_DEPLOY="false"
EOF
chmod 600 /opt/vvh/.env
chown deploy:deploy /opt/vvh/.env
```

> GitHub only needs `NEXT_PUBLIC_SITE_URL` (build-time); **runtime secrets are configured here once**, so Actions never
> echo them. If SMTP is already working in dev, copy those values here.

### 9.4 GHCR login for the `deploy` user

Create the PAT (**GitHub UI**: [github.com/settings/tokens](https://github.com/settings/tokens/new) →
fine-grained, `read:packages` only) and store it server-side:

```bash
read -s -p "GHCR_PULL_TOKEN: " GHCR_PULL_TOKEN   # never typed into shell history visibly
mkdir -p ~/.config
printf '%s' "$GHCR_PULL_TOKEN" > ~/.config/ghcr_pull_token && chmod 600 ~/.config/ghcr_pull_token
echo "$GHCR_PULL_TOKEN" | docker login ghcr.io -u simon617 --password-stdin
# verify:
docker pull ghcr.io/simon617/vvh:latest 2>&1 | tail -2   # works after Phase 6 pushes the first image
```

### 9.5 Validate the compose file

```bash
cd /opt/vvh
docker compose -f docker-compose.prod.yml config --quiet && echo "compose OK"
```

(Expect a warning about `VVH_IMAGE` defaulting to `:latest` — that's fine; `deploy.sh` overrides it.)

| File | Owner | Perms |
|---|---|---|
| `/opt/vvh/.env` | `deploy:deploy` | `600` |
| `docker-compose.prod.yml` | `deploy:deploy` | `644` |
| `deploy.sh` | `deploy:deploy` | `700` |
| `/opt/vvh/logs/*.log` | `deploy:deploy` | `660` |

## 10. Nginx + TLS via Certbot (Phase 5)

**Ubuntu terminal**, as `deploy`. Do the **certificate first** (DNS-01), then the site config, so Nginx never references
a missing cert file.

### 10.1 Issue the certificate (DNS-01, Cloudflare)

```bash
# 1) Cloudflare credentials for certbot (the DNS challenge token from §3.6):
sudo tee /etc/letsencrypt/cloudflare.ini >/dev/null <<'EOF'
dns_cloudflare_api_token = REPLACE_WITH_CF_DNS_CHALLENGE_TOKEN
EOF
sudo chmod 600 /etc/letsencrypt/cloudflare.ini
sudo chown root:root /etc/letsencrypt/cloudflare.ini

# 2) Issue (creates the cert under /etc/letsencrypt/live/www.visionvalues.com.hk):
sudo certbot certonly \
  --authenticator dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  --dns-cloudflare-propagation-seconds 20 \
  -d www.visionvalues.com.hk -d visionvalues.com.hk \
  --email admin@visionvalues.com.hk \
  --agree-tos --no-eff-email --keep-until-expiring

# 3) Validate:
sudo certbot certificates
```

> **Why DNS-01 by default?** Your ISP may block inbound 80/443 (pre-flight still pending). DNS-01 only needs outbound
> DNS + the Cloudflare API token — no open ports, works behind any NAT.
>
> **HTTP-01 fallback** (if ports 80/443 are provably reachable): skip 10.1 and instead run after 10.3:
> `sudo certbot certonly --nginx -d www.visionvalues.com.hk -d visionvalues.com.hk`. The `.well-known` location block
> in `nginx.conf` is already present for the challenge.
>
> **Wildcard** (`*.visionvalues.com.hk`) is only possible via DNS-01 — repeat 10.1 adding `-d "*.visionvalues.com.hk"`.

### 10.2 Install the Nginx site config

```bash
sudo cp /opt/vvh/nginx.conf /etc/nginx/sites-available/vvh.conf
sudo ln -sfn /etc/nginx/sites-available/vvh.conf /etc/nginx/sites-enabled/vvh.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/certbot
sudo nginx -t
sudo systemctl reload nginx
```

The config (`nginx.conf` in this repo) gives you: HTTP→HTTPS 301, apex→www 301, TLS 1.2/1.3, stapling, HSTS/security
headers/CSP, gzip, WebSocket upgrade headers, long-cache for `/_next/static/`, upload size.

### 10.3 Auto-renewal

```bash
# Dry-run the renewal path (uses the same cloudflare.ini automatically):
sudo certbot renew --dry-run
# Don't disable the packaged random timer:
sudo systemctl list-timers | grep certbot
# Fallback if the timer is missing:
#   sudo systemctl enable --now certbot.timer
```

Renewals happen automatically when the cert is <60 days from expiry; Nginx picks up new certs on reload. Add
`--deploy-hook 'systemctl reload nginx'` to the renew job only if you customise renewal.

### 10.4 HSTS rollout

`nginx.conf` ships HSTS with `max-age=31536000`. **Do not** publish a year-long HSTS until you're sure the whole site
works on HTTPS. Recommended: first set `max-age=3600`, verify for ~1–2 weeks, then raise to `31536000` (and consider
`includeSubDomains` + preload later). Each change: `sudo nginx -t && sudo systemctl reload nginx`.

### 10.5 Validate TLS locally (even before DNS finishes cutting over)

```bash
curl -sI http://www.visionvalues.com.hk -H 'Host: www.visionvalues.com.hk' --resolve www.visionvalues.com.hk:80:127.0.0.1 | head -5
curl -skI https://www.visionvalues.com.hk --resolve www.visionvalues.com.hk:443:127.0.0.1 | head -8
curl -skI https://visionvalues.com.hk    --resolve visionvalues.com.hk:443:127.0.0.1 | head -3   # expect 301
```

---

## 11. First pipeline run & deploy (Phase 6)

This is the merge moment. **Order matters:** Phase 5 must be complete, and (recommended) the Cloudflare NS move done so
`dig www.visionvalues.com.hk +short` returns `202.77.49.35`.

1. **GitHub UI** — ensure: `DEPLOY_ENABLED=true`, all secrets set (§5.4), `production` env has your reviewer account.
2. **Merge** this repo's deployment work to `main` (see `git log`/PR). Push triggers **ci** + **security**.
3. **Actions → Deploy** runs automatically after `build-push`; approve the **`production`** environment prompt.
4. Watch the **Deploy over SSH** step → it runs `/opt/vvh/deploy.sh ghcr.io/simon617/vvh:<sha>` which:
   pulls → recreates `vvh-app` → waits on `/api/health` (30×3s) → writes `.last_image`.
5. First run also creates volumes `vvh_sqlite-data` + `vvh_uploads` and populates the DB from the baked image.

If anything fails, see §17 (troubleshooting) and §13 (rollback) before re-running.

## 12. Post-deploy validation (Phase 7)

Run **Ubuntu terminal** first, then **Local Windows** / any non-local network.

### 12.1 On the server

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
#   vvh-app  ghcr.io/simon617/vvh:sha-…  Up (healthy)  127.0.0.1:3000->3000/tcp

docker logs vvh-app --tail 30
docker compose -f /opt/vvh/docker-compose.prod.yml ps
tail -5 /opt/vvh/logs/deploy.log        # shows the deployed sha + OK
```

### 12.2 From outside (Local Windows)

```powershell
# DNS now points at the new box:
nslookup www.visionvalues.com.hk
# App + TLS:
curl.exe -sI https://www.visionvalues.com.hk | Select-Object -First 10     # 200, valid cert
curl.exe -sI https://visionvalues.com.hk | Select-Object -First 6           # 301 → www
curl.exe -sI http://www.visionvalues.com.hk  | Select-Object -First 6       # 301 → https
# Security headers on the main site:
curl.exe -sI https://www.visionvalues.com.hk | Select-String -Pattern "strict-transport|x-frame|x-content|content-security|referrer"
# Health endpoint:
(Invoke-WebRequest -UseBasicParsing https://www.visionvalues.com.hk/api/health).Content
```

```bash
curl -I https://www.visionvalues.com.hk          # 200 + TLS OK
curl -I https://visionvalues.com.hk              # 301 -> Location: https://www.visionvalues.com.hk/
curl -I http://www.visionvalues.com.hk           # 301 -> https
```

### 12.3 TLS audit

```bash
# On any machine with openssl/ssllabs reachability:
echo | openssl s_client -connect www.visionvalues.com.hk:443 -servername www.visionvalues.com.hk 2>/dev/null | grep -E "subject=|issuer=|Verify return"
# + scan at https://www.ssllabs.com/ssltest/analyze.html?d=www.visionvalues.com.hk (Optional/recommended)
```

### 12.4 Rollback drill

```bash
# Deploy a deliberately broken tag to prove the rollback path (Optional):
cd /opt/vvh && cat .last_image
#   → expect: ghcr.io/simon617/vvh:<good-sha>
./deploy.sh ghcr.io/simon617/vvh:nonexistent-tag   # pull fails -> clean exit, app untouched
# Real coverage: if the app were unhealthy, deploy.sh restores .last_image. To rehearse,
# set HEALTH_RETRIES low temporarily and deploy the previous tag from git history.
```

---

## 13. Rollback

Three independent layers, in order of preference:

1. **Automatic (deploy.sh)** — if `/api/health` fails after a deploy, `deploy.sh` re-`up`s the **previous tag** from
   `.last_image` and exits `1` (visible red in Actions). This needs the previous image to still be present locally
   (it is — `docker image prune -f` only removes *dangling*, not tagged, images).
2. **Manual instant** (as `deploy`): `cd /opt/vvh && ./deploy.sh ghcr.io/simon617/vvh:<known-good-sha>`.
3. **Guaranteed from GHCR** — every `main` push keeps a per-`sha` tag forever (immutable history):
   `docker pull ghcr.io/simon617/vvh:<sha>` +  `./deploy.sh ghcr.io/simon617/vvh:<sha>`.

Link to a known-good sha is in `.last_image`, the Actions run summary, or the GHCR package page.

**Rollback of data** is handled separately — SQLite + uploads are persistent volumes and are **never** deleted by a
deploy. Restore point-in-time from §14.4 backups if needed.

---

## 14. Logs, monitoring, backups, maintenance (Phase 8)

### 14.1 Logging

```bash
# App
docker logs vvh-app --tail 100
docker logs -f --tail 50 vvh-app
# Deploy script
tail -50 /opt/vvh/logs/deploy.log
# Nginx (rotated weekly by logrotate)
tail -50 /var/log/nginx/error.log
tail -50 /var/log/nginx/access.log
```

### 14.2 Monitoring (recommended)

- **Uptime Kuma** (self-host, 2 min to set up on any box) or **UptimeRobot** → monitor
  `https://www.visionvalues.com.hk/api/health` every 1–5 min; alert to email/Telegram.
- Watch **cert expiry** too: `certbot renew --dry-run` weekly via cron, or an UptimeRobot "SSL check".
- Actionable dashboard (Optional/recommended): install `netdata` (`wget -O /tmp/netdata.sh https://get.netdata.cloud/kickstart.sh && bash /tmp/netdata.sh`) — bind it to `127.0.0.1` only, never expose publicly.

### 14.3 Maintenance checklist

```text
Daily    docker image prune -f                (deploy.sh does this per deploy; cron for idle periods)
Weekly   certbot renew --dry-run; apt-get update && sudo apt-get upgrade (unattended-upgrades handles security)
Monthly  backup restore drill — restore last backup into a scratch volume, boot, /api/health
On each release: confirm git tag == GHCR tag == .last_image
```

### 14.4 Backups

`/opt/vvh/bin/backup-prod.sh` snapshots both named volumes nightly (installed below):

```bash
# systemd timer (Ubuntu terminal, as deploy):
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/vvh-backup.service <<'EOF'
[Unit]
Description=vvh nightly backup (SQLite + uploads)
[Service]
Type=oneshot
ExecStart=/opt/vvh/bin/backup-prod.sh
EOF
cat > ~/.config/systemd/user/vvh-backup.timer <<'EOF'
[Unit]
Description=Run vvh backup nightly
[Timer]
OnCalendar=*-*-* 03:20:00
Persistent=true
[Install]
WantedBy=timers.target
EOF
systemctl --user daemon-reload
systemctl --user enable --now vvh-backup.timer
loginctl enable-linger deploy      # allow user services to run without login
systemctl --user list-timers | grep vvh-backup
```

**Off-box copy is mandatory** — a single-disk server is not a backup. Weekly `rsync -av /opt/vvh/backups/ backup-host:/vvh-backups/` (or rclone to any object store). Test a restore at least monthly:

```bash
docker run --rm -v vvh_sqlite-data:/data -v /opt/vvh/backups:/backup alpine sh -c "tar xzf /backup/sqlite-<stamp>.tar.gz -C /data"
```

## 15. Dynamic public IP & DDNS

`202.77.49.35` appears to be a static-looking IP on a business line, but residential-type links can renumber. Plan for
it — the blast radius of an IP change is: GitHub Actions `SSH_HOST` target, DNS A records (`www` + apex), and any
monitoring/whitelist entries (they all follow DNS if you automate it).

### 15.1 Detect an IP change

```bash
# Manual / cron probe — compare to the A record:
curl -fsS https://api.ipify.org            # current public IP
dig +short www.visionvalues.com.hk A       # what the world resolves
```

### 15.2 Options (pick per connection type)

| Option | Effort | Covers |
|---|---|---|
| **Static IP from ISP** (recommended for a corporate site) | phone call/order | everything permanently |
| **DDNS via Cloudflare API** (this repo: `/opt/vvh/bin/cloudflare-ddns.sh`) | ~10 min | DNS A record (`www`), which GitHub Actions + monitoring can also follow |
| DuckDNS / No-IP (hosted DDNS, if you don't need Cloudflare-wildcard flows) | 5 min | DNS only, then alias `www`→that name |

### 15.3 Install the Cloudflare DDNS script

```bash
# 1) Create the env file (challenge token from §3.6 / second token):
sudo tee /etc/cloudflare-ddns.env >/dev/null <<'EOF'
CF_API_TOKEN=REPLACE_WITH_CF_DDNS_TOKEN
CF_ZONE_ID=REPLACE_WITH_ZONE_ID
CF_A_RECORD_ID=REPLACE_WITH_A_RECORD_ID
CF_DOMAIN=www.visionvalues.com.hk
EOF
sudo chmod 600 /etc/cloudflare-ddns.env

# Get ZONE_ID: CF dashboard → zone → Overview → right rail. 
# Get A_RECORD_ID: curl -sS "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records?type=A&name=www.visionvalues.com.hk" \
#   -H "Authorization: Bearer $CF_API_TOKEN"  → copy result[0].id

# 2) systemd timer (as deploy):
cat > ~/.config/systemd/user/cloudflare-ddns.service <<'EOF'
[Unit]
Description=Update Cloudflare A record with current public IP
After=network-online.target
Wants=network-online.target
[Service]
Type=oneshot
EnvironmentFile=/etc/cloudflare-ddns.env
ExecStart=/opt/vvh/bin/cloudflare-ddns.sh
EOF
cat > ~/.config/systemd/user/cloudflare-ddns.timer <<'EOF'
[Unit]
Description=Run Cloudflare DDNS every 10 minutes
[Timer]
OnBootSec=2min
OnUnitActiveSec=10min
Persistent=true
[Install]
WantedBy=timers.target
EOF
systemctl --user daemon-reload
systemctl --user enable --now cloudflare-ddns.timer
systemctl --user list-timers | grep cloudflare

# 3) First run + log:
systemctl --user start cloudflare-ddns.service
tail -3 /opt/vvh/logs/ddns.log
```

### 15.4 After an IP change

- A record + all monitoring follow **automatically** (script PATCHes Cloudflare).
- **If** the router's WAN IP changed but the script couldn't update (token revoked / CF outage) — manual fix:
  update the A record in Cloudflare, then re-run `systemctl --user start cloudflare-ddns.service`.
- GitHub Actions `SSH_HOST` still points at the old IP → update the secret once (this is the one manual touch point).

---

## 16. Schema migrations (SQLite upgrade path)

**Current model:** the image is *seeded at build time* (`prisma db push` + `npm run seed`) and the SQLite file is
**baked into the image**; a fresh named volume initialises from that baked DB on first boot. Consequences:

- First deploy: zero-touch bootstrap. ✅
- Schema changes later: the *existing* volume keeps its old schema — the baked DB only affects fresh volumes. ⚠️

**Recommended upgrade procedure for a schema change:**

1. Author migration `npx prisma migrate dev --name <change>` locally → commit new migration files.
2. Push to `main` → new image builds.
3. **Apply to the live DB** before (or as part of) the deploy, using a scratch container that has the Prisma CLI:

```bash
# One-time helper — build a migration image from the repo (as deploy):
git clone --depth 1 https://github.com/simon617/vvh.git /tmp/vvh-migrate
cd /tmp/vvh-migrate
docker run --rm \
  -v "$PWD":/src -w /src \
  -v vvh_sqlite-data:/data \
  -e DATABASE_URL=file:/data/vvh.db \
  -e CI=true \
  node:22-alpine sh -c "apk add --no-cache openssl && npm ci --ignore-scripts && npx prisma generate && npx prisma migrate deploy"
# Back up first: /opt/vvh/bin/backup-prod.sh
```

4. Then deploy normally (image schema + DB schema now match).

**When SQLite becomes a bottleneck** (concurrent writes / multi-instance), move to Postgres: swap `provider` to
`postgresql`, run Postgres as a second compose service (named volume), `DATABASE_URL=postgresql://...`, and let
`deploy.sh` run `prisma migrate deploy` (enable `MIGRATE_ON_DEPLOY=true`). Keep backups switching to `pg_dump`.

## 17. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| SSH `Permission denied (publickey)` | Wrong key / wrong user / root login disabled too early | Confirm you're `deploy`, key is in `~/.ssh/authorized_keys` (mode 600, owner deploy), `PubkeyAuthentication yes`. If you locked yourself out, use the cloud console/VNC to fix sshd, then disable password auth again. |
| `docker: permission denied` | `deploy` not in the `docker` group / stale session | `sudo usermod -aG docker deploy`, log out/in, `docker run --rm hello-world`. |
| GHCR pull denied | Server token lacks `read:packages`; package private; token expired/revoked | Re-create the PAT (fine-grained, `read:packages`), `echo "$TOKEN" \| docker login ghcr.io -u simon617 --password-stdin`. Check package visibility in GHCR settings. |
| Nginx 502 Bad Gateway | App down / not yet healthy / proxy target wrong | `docker ps` → is `vvh-app` `Up (healthy)`? `docker logs vvh-app --tail 50`. Confirm `proxy_pass http://127.0.0.1:3000` and that compose binds `127.0.0.1:3000:3000` (no port clash with Nginx). |
| Site shows old cert / certificate verify failed | DNS cutover in progress; cert names mismatch; HSTS cached | Wait for `dig +short` → `202.77.49.35`; `sudo certbot certificates`; test in a private/incognito window (`chrome://net-internals/#hsts` to clear). |
| HTTP-01 challenge failed / port 80 blocked by ISP | No forward, ISP blocks inbound 80/443 | Stay on **DNS-01** (§10.1). Cloudflare Tunnel `cloudflared` is the last-resort fallback (appendix note below). |
| DNS not propagating | TTL caching / registrar lock / NS pending | `dig +trace visionvalues.com.hk NS`; TTL §3.5; wait; `whatsmydns.net`. |
| Apex→www redirect loop | Redirect in two places (Next + nginx) | Only `nginx.conf` redirects the apex; keep Cloudflare grey-cloud so requests hit Nginx directly. |
| Health check failing in deploy.sh | App crash on boot (env/DB/chmod) | `docker logs vvh-app --tail 100`; check server `.env`; confirm volume `vvh_sqlite-data`; verify `DATABASE_URL=file:./data/vvh.db` resolves from `/app` inside the container. |
| Next env vars missing at runtime | NEXT_PUBLIC_* are inlined at BUILD time; runtime `env_file` can't fix them | Keep `NEXT_PUBLIC_SITE_URL` in sync as the `deploy.yml` build arg + GitHub variable (§5.4). |
| GitHub Actions cannot reach server | NAT broken; ISP filters GitHub egress; UFW | `nc -zv 202.77.49.35 22` from a phone hotspot; re-check forwards; `ufw status`; run `ssh -v` in CI to see the runner's egress IP. |
| Public IP changed → deploy broken | Router re-dial; stale A record / `SSH_HOST` secret | §15.4: craft Cloudflare A records fixed (or trust DDNS), update `SSH_HOST` secret. |
| Deploy job skipped | `DEPLOY_ENABLED` is `false` | Flip variable to `true` after Phase 5, re-run workflow. |
| Certificate won't renew | Token scope changed / zone missing / rate-limit | `sudo certbot renew --dry-run -v`; verify `cloudflare.ini` is 600; check LE logs at `/var/log/letsencrypt`. |

> **Appendix note — Cloudflare Tunnel (`cloudflared`) final fallback.** If the ISP blocks ALL inbound ports: install
> `cloudflared`, authenticate to the zone, create a public tunnel for `www.visionvalues.com.hk` → `http://127.0.0.1:3000`.
> SSH for GitHub Actions can then ride the tunnel too (`cloudflared access`), making port 22 optional. You must then
> enable the orange (proxied) cloud and switch real-IP handling to `X-Forwarded-For`/`CF-Connecting-IP` (headers are
> already proxied in `nginx.conf`). This is a contingency, not the primary path.

## 18. Validation cheat sheet

| Check | Command | Expected |
|---|---|---|
| Ports | `nc -zv 202.77.49.35 22` / `80` / `443` (non-local) | `succeeded` × 3 |
| SSH as deploy | `ssh deploy@202.77.49.35` | key-based login, no password prompt |
| DNS | `dig www.visionvalues.com.hk +short` | `202.77.49.35` |
| App up | `docker ps` | `vvh-app   Up (healthy)` |
| Health | `curl -fsS https://www.visionvalues.com.hk/api/health` | `{"ok":true,...}` |
| Site | `curl -I https://www.visionvalues.com.hk` | `200`, valid TLS, HSTS header |
| Apex redirect | `curl -I https://visionvalues.com.hk` | `301` → `Location: https://www.visionvalues.com.hk/` |
| Pipeline | GitHub Actions → Deploy run | green, `deploy.sh … OK`, `.last_image` updated |
| Security tab | GitHub → Security → Code scanning | SARIF results from Gitleaks/Trivy/CodeQL |
| Renewal | `sudo certbot renew --dry-run` | `Congratulations, all simulated renewals succeeded` |

---

## 19. Security & secret-handling protocol

1. **Never** echo: `JWT_SECRET`, any `CF_*` token, `GHCR_PULL_TOKEN`, `SSH_PRIVATE_KEY`, or `.env` content.
   If a transcript must be kept, redact first:
   ```bash
   sed -E 's/(JWT_SECRET|CF_API_TOKEN|GHCR_PULL_TOKEN|-----BEGIN[^-]*KEY-----).*/\1=<REDACTED>/g' \
     server-transcript.txt > setup.log
   ```
2. `setup.log` — keep a running log of every operator command (local + server) with the redaction above. It is
   `.dockerignore`d; keep it locally, never commit it.
3. Rotation on (suspected) leak:
   - GHCR PAT → revoke at [github.com/settings/tokens](https://github.com/settings/tokens) → re-login on the server.
   - CF token → rotate in the CF dashboard → restart `cloudflare-ddns.service` + `certbot renew --force-renewal`.
   - Deploy key → remove from `~deploy/.ssh/authorized_keys`, generate a new pair, update `SSH_PRIVATE_KEY`.
4. Approval gating: every production deploy pauses at the `production` environment reviewers; sshd/UFW/nginx/certbot
   changes on the server are manual by design.
5. Least privilege: PATs scoped (`read:packages`) · CF tokens scoped (`Zone:DNS:Edit`) · `deploy` sudo only for
   installs/Nginx · app container runs as non-root `nextjs`.

---

**Done.** This document, plus the repo files it describes, is a complete runbook. The order that matters: Cloudflare zone
→ router forwards → GitHub secrets → server hardening → Docker/Nginx/Certbot → flip `DEPLOY_ENABLED=true` → merge →
approve → validate. Every phase is idempotent or validated before the next."