# vvh — Production Deployment Guide

**Repository:** `https://github.com/simon617/vvh` · **App:** Next.js 16 (App Router) + `next-intl` 4 + Prisma/SQLite
**Registry:** `ghcr.io/simon617/vvh` · **Production host:** Ubuntu 22.04/24.04 at `10.0.2.7` (NAT) — publicly `202.77.49.35`
**Domains:** `www.visionvalues.com.hk` (app) and `visionvalues.com.hk` (301 → www) · **DNS:** kept with the existing provider (no Cloudflare zone move)
**Status:** ✅ Generated for `main`. ⬜ Manual phases below are pending — follow them in order.

> **Operator model.** This guide is split into *automatable* steps (files already in this repo) and *manual* steps
> (GitHub UI, DNS provider UI, firewall / router UI, Ubuntu `sudo`). Run the manual steps exactly as written, redact logs to
> `setup.log`, and **stop on any failure** — do not continue blindly. Secrets are never printed.

---

## Table of contents

1. [Architecture & topology](#1-architecture--topology)
2. [Pre-flight checks (Phase 0)](#2-pre-flight-checks-phase-0)
3. [DNS & switchover plan (Phase 1a)](#3-dns--switchover-plan-phase-1a)
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
15. [Dynamic public IP](#15-dynamic-public-ip)
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
  · PR  -> CI + Security            (required status checks — they gate the merge, §5.2)
  · push -> CI + Security + Deploy: Deploy first waits for the same commit's
            CI/Security (§5.7), then build → Trivy image gate (CRITICAL) →
            push ghcr.io → SSH deploy → healthcheck → rollback
  · weekly -> scheduled Security    · manual -> Deploy (skips the wait)
```

Key decisions (pronounced, not assumed):

| Topic | Decision |
|---|---|
| Node / runtime | **Node 24 LTS** (`node:24-alpine`); Next.js `output: "standalone"`; non-root `nextjs` user. (Dependency tree requires ≥22 — `@testing-library/jest-dom@7`; Node 20 is EOL since 2026-04; the whole project is pinned to 24 — `.nvmrc`, `package.json engines`, CI, Docker.) |
| Package manager | **npm** (`package-lock.json` confirmed; no pnpm/yarn) |
| Database | **SQLite via Prisma**, named volume `vvh_sqlite-data`; seeded DB baked into the image (fresh-volume bootstrap), server `.env` holds runtime config |
| Registry auth | Push: built-in `GITHUB_TOKEN` (`packages: write`). Server pull: PAT `GHCR_PULL_TOKEN` (`read:packages`) |
| TLS issuance | **HTTP-01 via Certbot (webroot)** — needs ports 80/443 forwarded to this server (already required for the site itself) |
| DNS & cutover | DNS stays with the existing provider (no Cloudflare, no NS change); switchover = change the **firewall routing/NAT rule** from the old web server to the new one (§3) |
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

Both records still point at the **old host** (`202.77.49.34` — HTTP 301→HTTPS, Apache) and will **stay that way** — this
plan does **not** change DNS. The cutover is a **firewall routing** change (§3.2), so `Nginx here cannot be verified
from the public internet` until the firewall routes web traffic to this box. Pre-verify the new box directly (§10.5).

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
> If **80/443 are blocked by the ISP**, the plan **cannot** proceed: the site itself needs inbound 80/443 via the
> firewall (§3.2, §4) and Certbot uses **HTTP-01** (§10.1). Contact the ISP to open them.

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
- [x] DNS of both names recorded (old IP `202.77.49.34`, new server `202.77.49.35`) — DNS stays untouched.
- [ ] `22` reachable from a **non-local** network (else fix router forward before anything else).
- [ ] Firewall switchover route (old → new web server) confirmed with the network admin (§3).

### 2.3 ✅ RESOLVED — Next.js 14.x critical advisories (upgraded to Next.js 15.5.29)

`npm audit` used to report **critical advisories for `next@14.2.35`** (the newest 14.x): RCE via the Image
Optimizer (AVIF), RSC deserialization DoS, request smuggling, SSRF in rewrites, cache-poisoning, etc. npm ships
**no patched 14.x**, so the effective fix was a breaking framework upgrade — **now landed** on branch
`security/next-15-upgrade`:

| Before | After |
|---|---|
| `next@14.2.35` | `next@15.5.29` |
| `react` / `react-dom` 18 | `react` / `react-dom` 19.3.1 |
| `next-intl` 3 | `next-intl` 4.14.9 |
| `eslint-config-next` 14 | `eslint-config-next` 15 |

`npm audit` now reports **0 critical** — the 3 critical RCEs and the 25 `next` advisories are gone at the source
rather than merely mitigated. 21 advisories remain overall (14 moderate, 7 high).

**Breakages fixed by the upgrade** — Next 15 made the request APIs asynchronous:

- `params` / `searchParams` are `Promise<…>` in every page, layout and route handler and are awaited before use
  (`src/app/[locale]/**`, `src/app/api/pages/[slug]/route.ts`, `src/app/uploads/[...path]/route.ts`).
- `cookies()` / `headers()` are async: `src/lib/auth.ts` (`getSession`, `setAuthCookie` and `clearAuthCookie` are
  all `async` now) and `src/components/layout/ContentWithSidebar.tsx`.
- `TemplateShell` stays deliberately **synchronous** (React only supports async components on the server), so the
  async pages resolve `x-pathname` and pass it down as a `pathname` prop — breadcrumb behaviour is unchanged.
- Tests call async server components as plain functions, so every `{ params: { … } }` became
  `{ params: Promise.resolve({ … }) }`; `src/lib/redirects.test.ts` now pins `// @vitest-environment node`
  because importing `next.config.js` pulls in `next-intl/plugin`, whose filename resolution breaks under jsdom.

**Still open — keep the `npm audit` CI step REPORT-ONLY.** `npm audit --omit=dev --audit-level=high` still exits
non-zero, so `continue-on-error` in `.github/workflows/security.yml` must stay until these clear:

| Finding | Where | Fix |
|---|---|---|
| `postcss` ≤ 8.5.22 — XSS via unescaped `</style>`, arbitrary `.map` file read (high) | **bundled inside `next@15.5.29`** (`node_modules/next/node_modules/postcss`) | ✅ **Cleared** — `next@16.4.6` bundles a patched `postcss`. See §2.4. |
| `nodemailer` < 10.4.0 (high) | contact-form SMTP (`src/lib/email.ts`) | ✅ **Cleared** — `nodemailer@10.5.0` (§2.5). |
| `postcss-selector-parser` < 6.1.5 / `@tailwindcss/typography` (moderate) | build-time only (Tailwind) | ✅ **Cleared** — transitive `overrides` pin to `^6.1.5` (§2.5). |

**Action items (ranked):**

1. ✅ **Done — Next 15 → 16 upgrade landed** (`next@16.4.6`, Turbopack build, `next lint` → ESLint CLI). This was
   also the fix for the `postcss` finding above; full notes in **§2.4**.
2. ✅ **Done — `nodemailer@10.5.0` landed** and the contact form re-tested (§2.5).
3. ✅ **Done — the `npm audit` CI step is now BLOCKING.** `continue-on-error` was removed from
   `security.yml`; `npm audit --omit=dev --audit-level=high` exits 0 (§2.5).
4. Do not expose the admin/editor endpoints to the internet — enforce the authorization middleware and (recommended)
   an additional IP allow-list in `nginx.conf` for `/api/auth` and `/api/upload` if editors connect from fixed IPs.

> This class of finding is why the image gate (Trivy) is pinned to `CRITICAL` — keep it strict. The dependency gate
> is now strict too (item 3 above is done) — see §2.5, which also makes the **image** scan clean (0 findings).

**Ubuntu terminal** — initial login as root (from a machine you trust):

```bash
ssh root@202.77.49.35
cat /etc/os-release            # expect Ubuntu 22.04/24.04
nproc && free -h && df -h /    # capacity sanity check
```

Follow the rest of this document in order. **Do not** skip the hardening phase on a public box.

### 2.4 ✅ RESOLVED — Next.js 15 → 16 upgrade (clears the bundled `postcss` high)

Landed on branch `NextJS-16-Upgrade`. This was action item 1 of §2.3 and *is* the fix for the `postcss` finding in
the table above.

| Before | After |
|---|---|
| `next@15.5.29` | `next@16.4.6` — bundles `postcss@8.5.23` (was ≤ 8.5.22 → high) |
| `next-intl@4.14.9` | `next-intl@4.14.10` |
| `eslint` 8 + `.eslintrc.json` | `eslint@9` + flat `eslint.config.mjs` |
| `eslint-config-next@15.5.29` | `eslint-config-next@16.4.6` |
| `react` / `react-dom` 19.3.1, TypeScript `^5.4` | unchanged — no React/TS change needed |

**Breaking changes handled**

- **`middleware.ts` → `proxy.ts`** (Next 16 renamed the convention; `middleware` is deprecated, not removed). The
  file is now `src/proxy.ts` exporting `proxy()`, with `config.matcher` unchanged. The build's route table prints
  `ƒ Proxy` and behaviour is identical.
- **`next lint` removed** → `"lint": "eslint ."` against the flat `eslint.config.mjs`, which spreads
  `eslint-config-next/core-web-vitals`. That preset already registers `@typescript-eslint/parser` for `**/*.ts(x)`,
  so no separate `/typescript` import is needed and no type-aware rules were introduced.
- **Turbopack is the default builder** for dev *and* build (`next build --webpack` opts out). `next.config.js`
  needed **no** change — the next-intl plugin detects Next ≥ 16 and injects the Turbopack `resolveAlias` itself.
- **`tsconfig.json` is rewritten by the build**: `jsx: "react-jsx"` (mandatory) and `.next/dev/types/**/*.ts` added
  to `include`. Committed as-is.
- **`src/lib/uploads.ts`** now marks its dynamic `path.resolve` with `/*turbopackIgnore: true*/`. Turbopack can't
  statically scope `UPLOAD_DIR`, so without it the *whole project* is traced into `.next/standalone` (269.9 MB →
  122.7 MB locally) — and the Dockerfile copies that directory into the image.
- **Two new `react-hooks` v7 lints.** `set-state-in-effect` flagged two deliberate, commented effects in
  `ReportsTable.tsx` (page clamping + `?page=N` restore that must not run during SSR). Pinned to `warn` in
  `eslint.config.mjs`; refactoring them is a follow-up, not a blocker.

**Verification** — `npm run typecheck` 0 · `npm test` **335 tests / 66 files green** · `npm run lint` **0 errors**
(6 warnings) · `npm run build` (Turbopack) 0, plus a route smoke test against **both** `next start` and the
standalone artifact (`node .next/standalone/server.js`): `/` → 307 `/en`; `/eng/corp_board.asp` → 301
`/en/board-of-directors`; `/chi/major.asp` → 301 `/zh/announcements`; `/en`, `/zh`, `/sitemap.xml`, `/robots.txt`,
`/api/health` → 200; `/en/admin/pages` → 307 to the admin login; unknown page → 404 (rendered by the **global**
`src/app/not-found.tsx` when no `[locale]` child route matches — see §2.6 for which boundary handles which path).
`/en/admin/login` → **200** is the key assertion: the admin layout renders standalone only when the proxy-set
`x-pathname` header reaches `headers()`, so this proves middleware → request header propagation still works on 16.
⚠️ **`docker build` was not run** (no Docker daemon in that environment) — run
`docker build -t vvh:next16 .` before deploying.

**Deferred item now resolved:** the non-fatal `TypeError` that `src/app/[locale]/not-found.tsx` logged when Next
renders the 404 boundary without route props is fixed — see §2.6. The `nodemailer` < 10.4.0 item from §2.3 was
already **resolved** — see §2.5.

### 2.5 ✅ RESOLVED — Dependency highs cleared + npm/corepack removed from the runtime image

Closes the remaining §2.3 action items (2 and 3) **and** every Trivy image finding.

**Dependency bumps**

| Before | After | Why |
|---|---|---|
| `nodemailer@^6.9.13` | `nodemailer@10.5.0` | clears the three `addressparser`/raw-option highs on the contact-form SMTP path (`src/lib/email.ts`). `@types/nodemailer` was dropped — v10 ships its own types. |
| `archiver@^7.0.1` | `archiver@8.0.0` | drops the vulnerable `glob`/`archiver-utils` chain used by `scripts/backup.ts` (nightly backups). v8 is **ESM-only** and no longer exports the `archiver("zip", …)` factory, so the script now uses `new ZipArchive({ zlib: { level: 9 } })` and awaits `finalize()` (now a `Promise<void>`). |
| `@types/archiver@^6` | `@types/archiver@^8` | matches the v8 API (named class exports only). |
| `vitest@4.1.10` | `vitest@4.1.12` | dev-only, but clears a `vite` advisory in the test tree. |
| *(no overrides)* | `overrides`: `postcss-selector-parser@^6.1.5`, `minimatch@^11.0.1` (under `readdir-glob` and `@typescript-eslint/typescript-estree`), `undici@^7.30.2`, `vite@^8.3.8` | transitive pins that force the patched versions where no upstream release depends on them yet (Tailwind/glob/ESLint/jsdom chains). |

`npm audit` (full tree) and `npm audit --omit=dev --audit-level=high` both now report **0 vulnerabilities**, so
`continue-on-error` was removed from the `npm-audit` job in `.github/workflows/security.yml` — the production
dependency audit is a **blocking** CI gate.

**npm/corepack removed from the runtime image**

Most image findings were never app dependencies: they came from the **npm and corepack trees bundled inside
`node:24-alpine`** (`usr/local/lib/node_modules/npm/node_modules/…`). In `docs/SecurityReview.txt`, 18 of the 69
Trivy alerts are `usr/...` paths (`undici`, `glob`, `minimatch`, `brace-expansion`, `ip-address`,
`postcss-selector-parser`). Upgrading npm is not a fix — npm 12 still bundles vulnerable copies — so the **runtime
image no longer ships the package manager at all**:

- `Dockerfile` (runner stage) deletes `/usr/local/lib/node_modules/{npm,corepack}` and the
  `npm`/`npx`/`corepack`/`yarn`/`yarnpkg`/`pnpm`/`pnpx` shims in `/usr/local/bin`, **after** the `npm install` that
  seeds the runtime CLI deps. npm stays available in the **builder** stage.
- `docker-entrypoint.sh` calls the local binaries directly — `/app/node_modules/.bin/prisma db push` and
  `/app/node_modules/.bin/tsx /app/prisma/seed.ts`. The seed is run with `tsx` rather than `prisma db seed`, because
  the Prisma seed runner shells out to `npx` (which no longer exists at runtime). `deploy.sh` already invoked
  `./node_modules/.bin/prisma` for `MIGRATE_ON_DEPLOY`, so it needs no change.
- The Alpine `zlib` package is upgraded during the build (`apk upgrade --no-cache zlib`, `1.3.2-r1 → 1.4-r0`),
  clearing CVE-2026-4738 — the last non-npm image finding.

**Verification (local Docker Desktop, `vvh:next16`)**

- `docker build` → OK. `docker run --entrypoint sh …`: `/usr/local/lib/node_modules` is **empty** and no
  `npm`/`npx`/`corepack` is on `PATH`.
- **Fresh volume:** entrypoint logged `No SQLite DB found … initializing` → `prisma db push` → seed (9 pages / 18
  `page_contents` rows) → `node server.js` → **Next.js 16.4.6 ready**.
- **Existing volume:** recreated container logged `Existing SQLite DB found … skipping init` (no re-seed).
- **Route smoke test** from inside the container: `/api/health`, `/en`, `/zh`, `/sitemap.xml`, `/robots.txt`,
  `/en/admin/login` → **200**; `/eng/corp_board.asp` → **301** `/en/board-of-directors`; `/chi/major.asp` →
  **301** `/zh/announcements`; unknown page → **404**.
- **Trivy image scan** (`--severity MEDIUM,HIGH,CRITICAL --ignore-unfixed`) → **0 findings**.
- Host gates re-run: `npm run typecheck` 0 · `npm test` **335 tests / 66 files green** · `npm run lint` **0 errors**
  · `npm run build` (Turbopack) 0 · `npm run backup` produced a working zip through the archiver-8 API.

### 2.6 ✅ RESOLVED — localized 404 boundary survives a render without route props

Next 16 can mount the `[locale]/not-found` boundary **without route props**, so `params` resolves to `undefined` and
the destructure threw `TypeError: Cannot destructure property 'locale' of '(intermediate value)' as it is undefined`
— logged by `npm run dev` on start-up and on every dev-mode 404. The response was still HTTP 404 (Next fell back to
the global `src/app/not-found.tsx`), but the stack trace broke the "clean dev console" gate.

- `src/app/[locale]/not-found.tsx` — `params` is now optional
  (`params?: Promise<{ locale?: string } | undefined>`) and locale resolution is wrapped in `try`/`catch` with an
  `"en"` fallback. `headers()` throwing outside a request scope is caught by the same guard. Resolution precedence
  is unchanged: middleware `x-locale` header → route param → `"en"`.
- `src/app/[locale]/not-found.test.tsx` — four tests added (route-param fallback when `x-locale` is absent; boundary
  called with no props at all; `params` resolving to `undefined`; `headers()` throwing
  ``"`headers` was called outside a request scope"``). The file is now **6 tests** and the whole suite is green
  (`npm test` → **339 tests / 66 files**).

**A/B check** (dev server on 4321, original destructure restored and then re-applied): `/en/nope` and `/zh/nope`
return **404** with the same `h2` (`Page Not Found`) and the same locale links in both runs. Note that a path whose
`[locale]` segment has no matching child route resolves to the **global** `src/app/not-found.tsx` — the root file is
English-only by design (`src/app/not-found.tsx` header comment: "the few non-locale paths that reach the router"), which
is why `/xx/nope` is not localized in dev *or* `next start`. The `[locale]` boundary is what renders when `notFound()`
is thrown *inside* a matched `[locale]` route (e.g. `src/app/[locale]/layout.tsx` for an unknown locale, or the admin
`pages/[slug]` editor for an unknown slug). The only difference between the two A/B runs is that the `TypeError` no
longer reaches stderr, so the fix removes the console error without altering the 404 response.

**Reaching the `[locale]` boundary over HTTP** (dev, port 4321). The boundary is used when `notFound()` is thrown
*inside* a matched `[locale]` route — e.g. the admin editor at `/{locale}/admin/pages/[slug]` with an unknown slug
(`src/app/[locale]/admin/pages/[slug]/page.tsx`). With a valid session cookie:

| Request | Result |
|---|---|
| `/en/admin/pages` | 200 — control: proves the session works and the chrome renders |
| `/en/admin/pages/nope` | **404** — boundary payload carries `"children":"Page Not Found"` + `Back to Home` |
| `/zh/admin/pages/nope` | **404** — boundary payload carries `"children":"頁面未找到"` + `返回首頁` |

So the 404 copy is localized end-to-end for `zh`, and **no `TypeError` reaches stderr** in any of these runs (the
pre-fix A/B run above logged it). Two honest caveats about that check:

- Next 16 streams this boundary render inside its own `#__next_error__` document shell (no `[locale]` chrome in the
  SSR HTML — the boundary arrives via the streamed RSC payload, which is where the strings above were read). That is
  pre-existing Next behaviour and is unchanged by the fix.
- The session was minted with the app's own `signToken` secret (JWT-only `getSession()`), so **no admin password or
  DB row was touched**. `/nope.txt` (a dotted path the proxy skips) renders Next's bare `#__next_error__` 404 without
  the boundary, which is why it is not used as the assertion.

## 3. DNS & switchover plan (Phase 1a)

**Decision:** keep DNS hosting with the **existing provider** — **no zone move to Cloudflare**, no NS change, no API
tokens. The names keep resolving to their current address, and DNS is never touched during the cutover.

### 3.1 DNS today (unchanged)

| Type | Name | Value | Notes |
|---|---|---|---|
| A | `www` | `202.77.49.34` | unchanged — the whole switchover is firewall-side |
| A | `@` | `202.77.49.34` | unchanged |
| MX / TXT | (existing) | (existing) | e-mail etc. untouched — nothing moves between providers |

### 3.2 Switchover = firewall routing (not DNS)

The old web server (Apache/CentOS on `202.77.49.34`) keeps its DNS identity. When the new server is staged (Phases 0–4)
and validated, the cutover is a single **firewall change**:

1. In the **firewall**, change the **routing / NAT rule** for the site's inbound web traffic so it is forwarded to the
   **new web server** (`10.0.2.7`) instead of the old web server. Ports 80 and 443 must be covered (22 for the deploy
   pipeline rides the new server's own forward — see §4).
2. Do **not** touch a single DNS record — no TTL drops, no NS change, no propagation wait.
3. **Rollback = revert the firewall rule** back to the old web server — instant and DNS-independent.

Pre-cutover checklist:

- [ ] DNS records backed up / screenshot from the current provider (A, MX, TXT) → save to `setup.log`.
- [ ] New server fully deployed and validated on the staging address (Phases 2–6) **before** the rule change.
- [ ] Old server left running so the flip is a pure routing delta, instantly reversible.
- [ ] Confirm with the network admin which firewall rule currently targets the old web server.
- [ ] Choose a **low-traffic window** (this is an investor-facing corporate site — weekend morning HK time).

> ⚠️ **TLS ordering:** the Phase 5 certificate is issued with **HTTP-01**, which needs Let's Encrypt to reach this
> server on port 80 — so the firewall must already route port 80 here when Phase 5 runs (§10.1).

### 3.3 Verification

After the firewall rule is in place:

```powershell
Resolve-DnsName www.visionvalues.com.hk            # unchanged — still the recorded address
curl.exe -sI https://www.visionvalues.com.hk | Select-Object -First 10   # now served by the NEW server
```

```bash
curl -sI https://www.visionvalues.com.hk          # expected: 200 from the new box
```

TLS/certificate sanity: §10.5. Full post-deploy validation: §12.

## 4. Router / NAT port forwarding (Phase 1b)

**Router / NAT UI** — the server is `10.0.2.7` behind a NAT router with public `202.77.49.35`.
Without these three rules the site is unreachable **and** Certbot HTTP-01 cannot issue the certificate (the HTTP→HTTPS redirect also needs 80):

| External port (WAN) | Internal host | Internal port | Protocol | Purpose |
|---|---|---|---|---|
| 22 | `10.0.2.7` | 22 | TCP | SSH admin + GitHub Actions deploy (update to 2222→22 if you change sshd port) |
| 80 | `10.0.2.7` | 80 | TCP | HTTP→HTTPS 301 redirect + ACME HTTP-01 challenge |
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

> Opening only 22 is insufficient — without 80/443 the site 404s externally and the **HTTP-01** certificate (the method
> used in §10.2) can never be issued.

## 5. GitHub setup (Phase 1c)

### 5.1 Repository settings

**GitHub UI** → `simon617/vvh` → **Settings**:

1. **General → Pull Requests**: enable *Allow auto-merge* (`Optional/recommended`).
2. **Actions (Left side) → General → Workflow permissions**: select **Read and write** (needed for GHCR `packages: write` via
   `GITHUB_TOKEN`) and enable *Allow GitHub Actions to create and approve pull requests* (Dependabot). Save.
3. **Packages (GHCR)**: enabled by default; workflow runs (Phase 6) and pushes container image to GHCR. Once it exists, open the
   package (Right-hand sidebar, below About) → **Package settings → Danger Zone → Change visibility** and keep it **private** (server pulls with a token).
Flow : GitHub repot > Actions > workflow run > build image > logs into GHCR with GITHUB_TOKEN > pushes image to GHCR

### 5.2 Branch protection for `main`
- direct pushes to main are allowed by default unless we explicitly lock down the branch

**GitHub UI** → Settings → Branches (left panel) → Add classic branch protection rule → **Add rule**:

- Branch: `main`
- ☑ **Require a pull request before merging** · ☑ *Require approvals* = **1**
- ☑ **Require status checks to pass before merging** 
Action : merge button will be greyed out until this specific check passes. You can only select checks that have run on the main branch (a PR targeting it recently). It CI / ci does not appear, trigger a workflow run on main first.
→ add **`CI / ci`** now. After the first green security run, also
  require **`Security / npm audit (production deps)`**, **`Security / Gitleaks secret scan`**,
  **`Security / Trivy filesystem scan`** and **`Security / CodeQL`** — type each as `<workflow name> / <job name>`
  exactly as shown here. `npm audit` is still report-only (`continue-on-error`), but its *job* still concludes
  `success`, so requiring it does not block merges. ⚠ Do not rename workflow/job names without also updating this rule
  and the `REQUIRED_CHECKS` list in `deploy.yml` (§5.7).
- ☑ **Do not allow bypassing the above settings**
- ☐ *Require signed commits* — enable if you sign commits (`Optional/recommended`).
- Save.

### 5.3 Environments (manual approval gate)

**GitHub UI** → Settings → Environments → **New environment** → name `production`:

- ☑ **Required reviewers** → add yourself (or a team). Every deploy waits for your approval.
- ☑ *Deployment branch = `main`*.
- Leave environment secrets empty — runtime app secrets live in `/opt/vvh/.env` (GitHub only carries transport secrets).

### 5.4 Actions secrets & variables

**Variables** (GitHub UI → Repository → Settings → Secrets and variables (left panel) → Actions → Variables → New repository variable):

| Name | Value | Notes |
|---|---|---|
| `DEPLOY_ENABLED` | `false` | Flip to `true` only after Phase 5 (server + nginx ready). |
| `NEXT_PUBLIC_SITE_URL` | `https://www.visionvalues.com.hk` | Build-time inline value (also defaulted in workflows). |

**Secrets** (Actions → Secrets → New repository variable):

| Name | Value |
|---|---|
| `SSH_HOST` | `202.77.49.35` |
| `SSH_USER` | `deploy` |
| `SSH_PORT` | `22` (or `2222` if you moved sshd — §7.7) |
| `SSH_PRIVATE_KEY` | private key from §5.5 (entire contents, including -----BEGIN OPENSSH PRIVATE KEY----- and -----END OPENSSH PRIVATE KEY----- lines) . Workflow uses private key to authenticate with public key on the Ubuntu server during deployment phase CD. |
| `SSH_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 202.77.49.35` output (fetch server's ed25519 host key. Run after the server exists) |
| `GHCR_PULL_TOKEN` | GitHub PAT with **`read:packages`** scope — used on the *server*, not in Actions. Use by server to pull container image from GitHub Container Registry |

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

### 5.7 CI → Security → Deploy ordering (how the sequence is enforced)

GitHub Actions has no cross-workflow `needs:`. Chaining workflows with `workflow_run` would be fragile here (the weekly
Security run would trigger a Deploy, rapid pushes would queue up runs) and would serialise every push into
CI → Security → Deploy. So "CI green before Security before Deploy" is enforced with **three layers of gates**:

| Layer | Gate | Where | Enforces |
|---|---|---|---|
| 1. Merge gate (should this code be allowed onto main)| Branch protection required checks (§5.2) | PR time | Nothing merges to `main` unless `CI / ci` + the Security jobs are green — Deploy only ever sees merge-gated commits. |
| 2. Same-push ordering (Has this exact commit proven itself) | `wait-for-checks` step in `deploy.yml` | Push to `main` | Deploy builds/pushes only after the *same* commit's CI + Security check-runs succeed. Skipped on manual `workflow_dispatch` — an operator-initiated override. |
| 3. Runtime gate (is the artifact actually safe to ship)| Trivy **image** scan (`exit-code: 1` on CRITICAL) | Build time, `deploy.yml` | No image with unfixed CRITICAL vulns is pushed to GHCR or deployed. |

**What actually runs per trigger** (simplified so a push to `main` is not triplicated):

| Trigger | `ci.yml` | `security.yml` | `deploy.yml` |
|---|---|---|---|
| PR to `main` | lint, test, build, typecheck | npm audit, Gitleaks, Trivy FS, CodeQL | — |
| Push to `main` | same as PR | npm audit, Gitleaks, CodeQL (Trivy FS **skipped** — the image gate below covers main) | wait → build → image scan → push → SSH deploy |
| Weekly schedule | — | all four | — |
| Manual dispatch | — | all four | build/deploy immediately (skips wait) |

**Why the remaining per-push work is not redundant:** PR runs are the *decision* (they gate the merge, §5.2); the push
runs re-verify the exact SHA about to be deployed — the signal layer 2 waits on. The one previously duplicated scan
(`trivy-fs`, report-only) is now skipped on push because the Deploy image gate enforces the same class of findings
against the actual artifact. The `npm ci`/npm-11 boilerplate is shared via `.github/actions/node-setup`, so the
toolchain pin lives in one place for CI + Security (the Dockerfile copy installs inside the image and is inherently
separate).

---

## 6. Repo files overview

| File | What it does |
|---|---|
| `.github/workflows/ci.yml` | Shared Node setup → lint → vitest → `next build` → `tsc --noEmit` on PRs + pushes to `main` |
| `.github/workflows/security.yml` | `npm audit` (report-only), Gitleaks (SARIF), Trivy FS (SARIF, report-only — **skipped on push**), CodeQL; weekly cron |
| `.github/workflows/deploy.yml` | `wait-for-checks` (push only, §5.7) → build → Trivy image gate (fails on CRITICAL) → push `:latest` + `:sha` → SSH deploy (gated by `DEPLOY_ENABLED` + `production` env) |
| `.github/actions/node-setup/action.yml` | Shared Node 24 + npm 11 install for CI/Security — the npm 11 pin lives in exactly one place |
| `.github/dependabot.yml` | Weekly npm + GitHub Actions bump PRs, grouped |
| `Dockerfile` | Multi-stage `node:24-alpine`; standalone build; seeded SQLite baked in; non-root `nextjs` user; `ARG NEXT_PUBLIC_SITE_URL` |
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
# create a new user without asking for password, and generate 
adduser --disabled-password --gecos "vvh deploy user" deploy

# grant administrative mode
usermod -aG sudo deploy

# Authorized keys: existing root key + the GitHub Actions deploy key from §5.5

# creates the /home/deploy/.ssh directory with strict permissions (700) and assigns its ownership to the # # deploy user and group
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
# Users cannot log in by typing a password
Edit `/etc/ssh/sshd_config` — set/verify:

```nginx
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
UsePAM yes

# notice that some settings are override by /etc/ssh/sshd_config.d/50-cloud-init.conf
PasswordAuthentication yes

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
clear
systemctl enable --now fail2ban
fail2ban-client status sshd
```

### 7.5 Upgrades
## Staging Server (unattended-upgrades)
```bash
#  installs and turns on automatic security updates, then verifies they're scheduled to run daily
apt-get install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades   # answer "Yes" to auto-update
systemctl enable --now unattended-upgrades apt-daily-upgrade.timer
systemctl list-timers | grep -E "apt|unattended"
```
### Production Server
install and enable automatic background security updates :
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades   # Select "Yes"


Edit the configuration file to configure rules and behaviors for automatic updates :
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades

Locate and set the following (if commented, remove the // :
Unattended-Upgrade::Automatic-Reboot "false";   # Disable auto reboot

Prevent needrestart from Automatically Restarting Docker / containerd :
sudo mkdir -p /etc/needrestart/conf.d
sudo tee /etc/needrestart/conf.d/docker-exclude.conf <<'EOF'
$nrconf{override_rc} = {
    qr(^docker\.service$) => 0,
    qr(^containerd\.service$) => 0,
};
EOF

Turns on auto background security updates and run everyday, even reboot :
sudo systemctl enable --now unattended-upgrades apt-daily-upgrade.timer
systemctl list-timers | grep -E "apt|unattended"

Regular Maintenance Checks :
cat /var/log/unattended-upgrades/unattended-upgrades.log
cat /var/run/reboot-required

manually restart Docker and verify: 
sudo systemctl restart docker && docker ps


### 7.6 Harden sysctl (Optional/recommended)

sysctl --system : modify Linux kernel parameters at runtime
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
sudo -l              # list privilege for current uesr
sudo -l -U deploy

last -15          # confirm no failed root logins piling up
grep -E "Failed|Accepted" /var/log/auth.log | tail -5
```

## 8. Install Docker, Compose, Nginx, Certbot (Phase 3)

**Ubuntu terminal**, now as `deploy` with `sudo`:
sudo -u deploy -i

Create a configuration file :
sudo visudo -f /etc/sudoers.d/deploy-nopasswd

Add the following line (deploy is granted full administrative privileges via sudo without typing a password):
deploy ALL=(ALL) NOPASSWD: ALL

Press Ctrl+X and then Y

sudo chmod 0440 /etc/sudoers.d/deploy-nopasswd

### 8.1 Base packages + Docker Engine + Compose plugin

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg dnsutils git htop
dpkg -l ca-certificates curl gnupg dnsutils git htop  # confirm the installation

# Docker Engine + Compose plugin via the official convenience script (or the
# saved docker apt-repo instructions on docs.docker.com — both are equivalent).
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sudo sh /tmp/get-docker.sh
sudo systemctl enable --now docker  # enable auto start
systemctl is-enabled docker # check whether docker is auto start
systemctl status docker # check status

# Compose plugin ships with the script; verify:
docker compose version        # Docker Compose version v2.x

# Add user deploy to docker group, aloows user to run Docker commands without sudo :
sudo usermod -aG docker deploy
```

⚠️ **Log out and back in** (`exit`, `ssh deploy@202.77.49.35`) so the `docker` group applies. Then:

```bash
docker run --rm hello-world   # must work without sudo
```


# Certbot asks for security certificates. proves to Let's Encrypt's server that you own the website, it then writes the SSL security rules directly into Nginx configuration file so your site instantly loads securely over HTTPs

### 8.2 Nginx

```bash
sudo apt-get install -y nginx
sudo systemctl enable --now nginx
curl -sI http://127.0.0.1 | head -3   # default page → 200
```

### 8.3 Certbot (nginx plugin)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
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
# scp -i c:\Users\simonleung\.ssh\vvh_deploy docker-compose.prod.yml deploy.sh - deploy@202.77.49.35:/opt/vvh/
scp docker-compose.prod.yml deploy.sh deploy@202.77.49.35:/opt/vvh/
scp nginx.conf deploy@202.77.49.35:/opt/vvh/nginx.conf
scp scripts/backup-prod.sh deploy@202.77.49.35:/opt/vvh/bin/
```

Then on the server (as `deploy`):

```bash
chmod +x /opt/vvh/deploy.sh /opt/vvh/bin/*.sh
# make scripts executable for systemd/cron (they run as deploy)
# create a symbolic link : source  shortcut destination
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

Create the PAT 
Profile icon > Settings > Developer Settings > Personal access token > Tokens (classic) > Generate new token (classic)
Paste the token value into the GHCR_PULL_TOKEN secret (for reference only, not used by GitHub)
(**GitHub UI**: [github.com/settings/tokens](https://github.com/settings/tokens/new) →
fine-grained, `read:packages` only) and store it server-side:

```bash (After generating the PAT, you run this on the Ubuntu server.)
# securely prompt you for a GitHub token and save it into a hidden, password-protected file so your scripts can use it later 
# - p "GHCR_PULL_TOKEN: " : display text prompt
# GHCR_PULL_TOKEN : variable that stores whatever value you type next
read -s -p "GHCR_PULL_TOKEN: " GHCR_PULL_TOKEN   # never typed into shell history visibly
mkdir -p ~/.config
printf '%s' "$GHCR_PULL_TOKEN" > ~/.config/ghcr_pull_token && chmod 600 ~/.config/ghcr_pull_token

Below command authenticates the server to GHCR so it can pull your images. Docker stores the credential locally (usually in ~/.docker/config.json), so you only do this once per server.
# print token value and pipe to right side, read password directly from the pipe
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

**Ubuntu terminal**, as `deploy`. The certificate is issued with **HTTP-01** — DNS stays with the existing provider, so
Let's Encrypt must reach this server on port 80. That means the **firewall switchover for port 80 must already be in
place** (§3.2) before this phase; otherwise the challenge for `www.visionvalues.com.hk` is answered by the **old** web
server.

### 10.1 Install the site config (with a placeholder cert)

`nginx.conf` references `/etc/letsencrypt/live/www.visionvalues.com.hk/`, so put a temporary self-signed certificate at
that exact path first — Nginx must never reference a missing cert file.

```bash
# 1) Placeholder cert at the real cert paths (replaced by the real one in 10.2):
sudo mkdir -p /etc/letsencrypt/live/www.visionvalues.com.hk
sudo openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
  -keyout /etc/letsencrypt/live/www.visionvalues.com.hk/privkey.pem \
  -out    /etc/letsencrypt/live/www.visionvalues.com.hk/fullchain.pem \
  -subj "/CN=www.visionvalues.com.hk"

# 2) Install the site config:
sudo cp /opt/vvh/nginx.conf /etc/nginx/sites-available/vvh.conf
sudo ln -sfn /etc/nginx/sites-available/vvh.conf /etc/nginx/sites-enabled/vvh.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo mkdir -p /var/www/certbot
sudo nginx -t
sudo systemctl reload nginx
```

The config (`nginx.conf` in this repo) gives you: HTTP→HTTPS 301, apex→www 301, TLS 1.2/1.3, stapling, HSTS/security
headers/CSP, gzip, WebSocket upgrade headers, long-cache for `/_next/static/`, upload size. It also serves
`/.well-known/acme-challenge/` from `/var/www/certbot` for the HTTP-01 challenge.

### 10.2 Issue the real certificate (HTTP-01)

```bash
# Issue (creates the cert under /etc/letsencrypt/live/www.visionvalues.com.hk):
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d www.visionvalues.com.hk -d visionvalues.com.hk \
  --email admin@visionvalues.com.hk \
  --agree-tos --no-eff-email --keep-until-expiring

# Validate + apply:
sudo certbot certificates
sudo nginx -t && sudo systemctl reload nginx
```

> **Why HTTP-01?** DNS stays with the existing provider (no Cloudflare zone, no DNS API), so Let's Encrypt must reach
> this server on port 80 — which the firewall switchover (§3.2) makes possible. Issuing before the switchover would
> deliver the challenge to the **old** web server. Renewals reuse the same webroot path and are automatic (§10.3).

### 10.3 Auto-renewal

```bash
# Dry-run the renewal path:
sudo certbot renew --dry-run
# Don't disable the packaged random timer:
sudo systemctl list-timers | grep certbot
# Fallback if the timer is missing:
#   sudo systemctl enable --now certbot.timer
```

Renewals happen automatically when the cert is <60 days from expiry. Nginx reads the cert at startup/reload, so register
the reload hook once — it persists in the renewal config and reload is skipped when nothing changed:
`sudo certbot renew --deploy-hook 'systemctl reload nginx'`.

### 10.4 HSTS rollout

`nginx.conf` ships HSTS with `max-age=31536000`. **Do not** publish a year-long HSTS until you're sure the whole site
works on HTTPS. Recommended: first set `max-age=3600`, verify for ~1–2 weeks, then raise to `31536000` (and consider
`includeSubDomains` + preload later). Each change: `sudo nginx -t && sudo systemctl reload nginx`.

### 10.5 Validate TLS locally (before the firewall cutover moves public traffic here)

```bash
curl -sI http://www.visionvalues.com.hk -H 'Host: www.visionvalues.com.hk' --resolve www.visionvalues.com.hk:80:127.0.0.1 | head -5
curl -skI https://www.visionvalues.com.hk --resolve www.visionvalues.com.hk:443:127.0.0.1 | head -8
curl -skI https://visionvalues.com.hk    --resolve visionvalues.com.hk:443:127.0.0.1 | head -3   # expect 301
```

---

## 11. First pipeline run & deploy (Phase 6)

This is the merge moment. **Order matters:** Phase 5 must be complete, and the firewall switchover (§3.2) done so the
site is served by this box — DNS itself is never changed.

1. **GitHub UI** — ensure: `DEPLOY_ENABLED=true`, all secrets set (§5.4), `production` env has your reviewer account.
2. **Merge** the deployment PR via the UI. Branch protection (§5.2) requires **CI + Security green**, so the merge
   itself is the CI/security gate. The merge push then triggers **ci** + **security** + **deploy**.
3. **Actions → Deploy** — `build-push` first waits for the same commit's CI/Security check-runs (no chained workflows;
   see §5.7), builds, runs the Trivy image gate and pushes to GHCR. Then approve the **`production`** environment
   prompt.
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
# Site is now served by the new box (DNS unchanged — still resolves to the recorded address):
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

## 15. Dynamic public IP

`202.77.49.35` appears to be a static-looking IP on a business line, but residential-type links can renumber. Plan for
it — the blast radius of an IP change is: GitHub Actions `SSH_HOST` target, the A record at the existing DNS provider,
the firewall routing rule (§3.2), and any monitoring/whitelist entries.

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
| **Manual A-record update at the existing DNS provider** | ~10 min per change | DNS A record (`www` + apex); `SSH_HOST` and firewall targets stay a manual touch point |
| DuckDNS / No-IP (hosted DDNS) | 5 min | DNS only, then alias `www` → that name |

### 15.3 After an IP change

- Update the **A record** in the existing DNS provider's control panel (or its DDNS service, if offered).
- Update the GitHub **`SSH_HOST`** secret to the new IP (the one manual deploy touch point).
- Re-point the **firewall routing/NAT rule** (§3.2) and any monitoring/whitelist entries to the new IP.

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
  node:24-alpine sh -c "apk add --no-cache openssl && npm ci --ignore-scripts && npx prisma generate && npx prisma migrate deploy"
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
| Site shows old cert / certificate verify failed | Firewall switchover not done; cert names mismatch; HSTS cached | Confirm the firewall routes 80/443 to this server (§3.2) and the cert covers both names (`sudo certbot certificates`); test in a private/incognito window (`chrome://net-internals/#hsts` to clear). |
| HTTP-01 challenge failed / port 80 blocked by ISP | No firewall forward on 80; old server still answering; ISP blocks inbound 80/443 | Confirm the firewall routes port 80 to this server (§3.2, §4). If the ISP truly blocks inbound 80/443, contact the ISP — the site cannot be served publicly without them. |
| Old site still served after switchover | Firewall routing rule not changed / still targets the old server | Re-check the firewall rule (§3.2) — DNS was never changed, so it always shows the recorded address; only the web server behind it changes. |
| Apex→www redirect loop | Redirect in two places (Next + nginx) | Only `nginx.conf` redirects the apex; no DNS proxy sits in front, so requests hit Nginx directly. |
| Health check failing in deploy.sh | App crash on boot (env/DB/chmod) | `docker logs vvh-app --tail 100`; check server `.env`; confirm volume `vvh_sqlite-data`; verify `DATABASE_URL=file:./data/vvh.db` resolves from `/app` inside the container. |
| Next env vars missing at runtime | NEXT_PUBLIC_* are inlined at BUILD time; runtime `env_file` can't fix them | Keep `NEXT_PUBLIC_SITE_URL` in sync as the `deploy.yml` build arg + GitHub variable (§5.4). |
| GitHub Actions cannot reach server | NAT broken; ISP filters GitHub egress; UFW | `nc -zv 202.77.49.35 22` from a phone hotspot; re-check forwards; `ufw status`; run `ssh -v` in CI to see the runner's egress IP. |
| Public IP changed → deploy broken | Router re-dial; stale A record / `SSH_HOST` secret | Update the A record at the existing DNS provider and the `SSH_HOST` secret (§15.3). |
| Deploy job skipped | `DEPLOY_ENABLED` is `false` | Flip variable to `true` after Phase 5, re-run workflow. |
| Deploy stuck at *Wait for CI & Security on this commit* | A required check-run failed/cancelled, or the commit's check-runs were superseded by another push | Open the commit's Actions runs and fix the red/cancelled check. The wait times out after ~30 min. A manual `workflow_dispatch` bypasses the wait (operator override). |
| Certificate won't renew | Port 80 not forwarded; `/.well-known` not served; rate-limit | `sudo certbot renew --dry-run -v`; confirm firewall 80 → this server (§3.2) and the `/.well-known/acme-challenge/` block in `nginx.conf`; check LE logs at `/var/log/letsencrypt`. |

> **Switchover rollback.** Reverting the cutover is a one-step firewall change — point the routing/NAT rule back at the
> old web server (§3.2). There is no DNS propagation to wait out, because DNS was never changed.

## 18. Validation cheat sheet

| Check | Command | Expected |
|---|---|---|
| Ports | `nc -zv 202.77.49.35 22` / `80` / `443` (non-local) | `succeeded` × 3 |
| SSH as deploy | `ssh deploy@202.77.49.35` | key-based login, no password prompt |
| DNS (unchanged) | `dig www.visionvalues.com.hk +short` | existing A record (firewall routes to the new server) |
| App up | `docker ps` | `vvh-app   Up (healthy)` |
| Health | `curl -fsS https://www.visionvalues.com.hk/api/health` | `{"ok":true,...}` |
| Site | `curl -I https://www.visionvalues.com.hk` | `200`, valid TLS, HSTS header |
| Apex redirect | `curl -I https://visionvalues.com.hk` | `301` → `Location: https://www.visionvalues.com.hk/` |
| Pipeline | GitHub Actions → Deploy run | green, `deploy.sh … OK`, `.last_image` updated |
| Security tab | GitHub → Security → Code scanning | SARIF results from Gitleaks/Trivy/CodeQL |
| Renewal | `sudo certbot renew --dry-run` | `Congratulations, all simulated renewals succeeded` |

---

## 19. Security & secret-handling protocol

1. **Never** echo: `JWT_SECRET`, `GHCR_PULL_TOKEN`, `SSH_PRIVATE_KEY`, or `.env` content.
   If a transcript must be kept, redact first:
   ```bash
   sed -E 's/(JWT_SECRET|GHCR_PULL_TOKEN|-----BEGIN[^-]*KEY-----).*/\1=<REDACTED>/g' \
     server-transcript.txt > setup.log
   ```
2. `setup.log` — keep a running log of every operator command (local + server) with the redaction above. It is
   `.dockerignore`d; keep it locally, never commit it.
3. Rotation on (suspected) leak:
   - GHCR PAT → revoke at [github.com/settings/tokens](https://github.com/settings/tokens) → re-login on the server.
   - Deploy key → remove from `~deploy/.ssh/authorized_keys`, generate a new pair, update `SSH_PRIVATE_KEY`.
4. Approval gating: every production deploy pauses at the `production` environment reviewers; sshd/UFW/nginx/certbot
   changes on the server are manual by design.
5. Least privilege: PATs scoped (`read:packages`) · `deploy` sudo only for installs/Nginx · app container runs as
   non-root `nextjs`.

---

**Done.** This document, plus the repo files it describes, is a complete runbook. The order that matters: DNS untouched →
firewall switchover (route old → new web server) → router forwards → GitHub secrets → server hardening →
Docker/Nginx/Certbot → flip `DEPLOY_ENABLED=true` → merge → approve → validate. Every phase is idempotent or validated
before the next."