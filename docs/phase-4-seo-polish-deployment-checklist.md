# Phase 4 — SEO, Polish & Deployment · Context Checklist (Handoff)

> **Project:** Vision Values Holdings Limited (HKEX: 862) — corporate website revamp
> **Phase:** 4 — SEO, Polish & Deployment
> **Branch:** `main` (HEAD `7c2ada5` — "Code Refactoring")
> **Baseline:** 56 test files / **274 tests passing** · `npm run lint` clean (2 pre-existing warnings) · `npm run build` exit 0 (verified in Phase 3)
> **Companion docs:** `docs/phase-4-seo-polish-deployment.md` (the plan — **do not modify**) · `docs/developerGuide/developer-guide.md` (living guide) · `docs/PRD-visionvalues-revamp-v2.md` (requirements) · `docs/phase-3-checklist.md` (previous phase handoff)
> **Status:** 🟡 **IN PROGRESS** — code deliverables **4.1–4.7 complete** (2026-09-18): 4.1/4.2 `29a3956`, 4.3 `71a03ed`, 4.4 `32842a9`, 4.5 `b40b4b9`, 4.6 `a6d1518`, 4.7 `ab650c9` (+ test type fix `9035062`). Audits + operational items (4.8–4.12) remain — see §13 and §15. Verified: **64 test files / 300 tests passing** · `npx tsc --noEmit` clean · `npm run lint` clean (2 pre-existing warnings) · `npm run build` exit 0.

---

## 1. Purpose & how to use this document

This is a **handoff document**. It tells the developer *everything they need to know* before writing Phase 4
code: what already exists (and is reusable), the decided architecture, which files to create/touch, which tests
must stay green, and the pitfalls to avoid. Read the plan (`docs/phase-4-seo-polish-deployment.md`) alongside
it — that is the *task list*; this checklist is the *project-informed* companion.

Work through it in this order:

1. **§2–§3** — current-system snapshot and Phase-4 scope at a glance.
2. **§4–§5** — setup + key files (existing vs. to create).
3. **§6–§9** — DB schema, auth flow, env vars, third-party services.
4. **§10** — decisions already made (do not re-litigate).
5. **§11–§12** — testing requirements and pitfalls.
6. **§13–§14** — definition of done and PRD links.

---

## 2. Snapshot of the current system (verified)

### 2.1 Tooling & commands

| Command | Result |
|---------|--------|
| `npm test` (vitest) | 56 files / **274 tests** passing (2026-09-18). Full suite ~5 min on this machine; if `fork` worker timeouts appear use `npx vitest run --max-workers=2`. |
| `npm run lint` | clean — only 2 **pre-existing warnings** (`admin/setup` useEffect deps; `Logo <img>`) |
| `npm run build` | exit 0 (standalone output; public + admin + API routes) |
| `npm run dev` | dev server on `http://localhost:3000` |
| `npm run seed` | `prisma db seed` — upserts the **9 CMS `Page` rows** + EN/ZH content rows; **prunes** `announcements` (no `pages` row). `site_settings` rows come from admin settings, not the seed. |
| `npm run db:migrate` / `db:push` | `prisma migrate dev` / `prisma db push` (SQLite; `prisma/migrations/` exists) |
| `npm run import:content` | idempotent report-PDF import into the `page_contents` envelope |
| `npm run backup` / `reset-password` | ops scripts |
| Docker | `docker-compose up -d --build` (see §4; gap: no runtime `prisma migrate deploy`, §12 #9) |

### 2.2 What already exists that Phase 4 reuses (do NOT rebuild)

- **GA4 ID is already configurable in admin settings.** Deliverable 4.3 (D13, WEB-09) was implemented in Phase 2B:
  setting key **`ga4_tracking_id`** in `site_settings` (global, `locale = NULL`), saved via `SettingsForm.tsx` → `PUT /api/settings`. What's missing is only the **script injection** — no `next/script` anywhere.
  > ⚠️ Plan §7.3 says `ga_tracking_id` — follow the code: **`ga4_tracking_id`** (`src/app/api/settings/route.ts`).
- **404 page exists** (`src/app/not-found.tsx`) but is hardcoded-English and minimal. 4.7 = localize + polish + confirm HTTP 404.
- **Root `/` redirect likely already works.** `src/middleware.ts` uses next-intl `createMiddleware` with
  `localePrefix: "always"` — next-intl 301s `/` → `/en` automatically. **Verify, don't rebuild** (4.2 / URL-03 / TD-28).
- **SEO meta fields already rendered** — every page's `generateMetadata` returns `{ title, description }` from `getPageData`. 4.6 = extend to Open Graph.
- **`getPageData` (`src/lib/pages.ts`)** resolves slug → placeholder-or-DB content with SEO fallbacks — the single source for metadata + sitemap.
- **`getUploadUrl` (`src/lib/uploads.ts`)** builds absolute upload URLs from `NEXT_PUBLIC_SITE_URL` — reuse for `og:image`/sitemap.
- **9 CMS slugs + 1 static page** make up the public site (see §3 / §6).

### 2.3 Data-state notes that affect the sitemap

- `pages` table has **9 rows**; the public `/en|zh/announcements` page is a **static page with no DB row** — a pure "query `pages`" sitemap silently omits it. Include announcements explicitly (§12 #3).
- `home` slug maps to `/en/` and `/zh/` (no `/home` segment).
- A locale with **no row or an unpublished row** renders the **placeholder** (deliberate, no 404, D8) — decide sitemap treatment (§12 #3).

---

## 3. Scope at a glance (what Phase 4 delivers)

| # | Deliverable | Where it lands |
|---|-------------|----------------|
| 4.1 | 301 redirects (old ASP / `/eng`·`/chi` → new clean URLs) | `next.config.js` `async redirects()` (**TD-26** — NOT middleware) |
| 4.2 | Root `/` → `/en/` | already handled by next-intl middleware — verify |
| 4.3 | GA4 script (ID from admin settings) | `next/script` in `[locale]/layout.tsx` (+ optional `GAScript` component) |
| 4.4 | Auto-generated `sitemap.xml` (published × locales) | new route handler (TD-27 / §5.2) |
| 4.5 | `robots.txt` | new route handler (or static `app/robots.txt`) |
| 4.6 | Open Graph meta | shared `src/lib/metadata.ts` + per-page `generateMetadata` |
| 4.7 | 404 page | polish `not-found.tsx` + new `src/app/[locale]/not-found.tsx` |
| 4.8 | Lighthouse ≥ 85 mobile / ≥ 95 desktop | audit + fix iteratively |
| 4.9 | WCAG 2.1 AA (axe-core) | audit + fix |
| 4.10 | Final testing: cross-browser, broken links, content review | manual |
| 4.11 | Docker end-to-end verification | fix first-boot DB bootstrap if missing (§12 #9) |
| 4.12 | PDF migration cleanup | content/manual, uses `npm run import:content` |

**No schema changes expected in this phase** — sitemap/metadata read existing tables.

---

## 4. Setup instructions

```bash
# 1) Dependencies (Node 18+, npm)
npm install

# 2) Environment — copy example and fill in secrets
cp .env.example .env              # PowerShell:  Copy-Item .env.example .env
#    generate a JWT secret:
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#    set NEXT_PUBLIC_SITE_URL to the production HTTPS origin (needed for absolute sitemap/OG URLs)

# 3) Database (SQLite; prisma/migrations exists)
npm run db:migrate                # apply schema to prisma/data/vvh.db
npm run seed                      # upsert 9 Page rows + EN/ZH content rows

# 4) Dev server
npm run dev                       # http://localhost:3000

# 5) Production-mode sanity check
npm run build && npm start

# 6) Docker (production)
docker-compose up -d --build

# 7) Phase-4 verification once 4.1–4.7 are implemented
curl -I http://localhost:3000/eng/corp_board.asp      # expect 301 -> /en/board-of-directors
curl -I http://localhost:3000/                        # expect 301 -> /en/
curl http://localhost:3000/sitemap.xml                # XML, only published pages
curl http://localhost:3000/robots.txt                 # Sitemap: line present
curl -I http://localhost:3000/en/no-such-page         # 404 + custom page
```

> **Notes**
> - The full vitest suite can exhaust `fork` workers on this slow Windows box. If you see
>   `Failed to start forks worker`, re-run with `npx vitest run --max-workers=2`.
> - There is **no `README.md`** — the developer guide (`docs/developerGuide/developer-guide.md`) is the setup doc.
---

## 5. Key files & their purpose

### 5.1 Existing files you will touch / extend

| File | Purpose | Phase-4 relevance |
|------|---------|-------------------|
| `next.config.js` | `output: "standalone"`, `images.unoptimized`, next-intl plugin | **Add `async redirects()`** (TD-26) for 4.1 |
| `src/middleware.ts` | next-intl `localePrefix: "always"`; admin cookie guard; `x-pathname` header; **skips any path containing a `.`** | Root `/`→`/en` (4.2, verify); dot-paths pass through; do **not** put redirects here |
| `src/app/[locale]/layout.tsx` | Public shell (Header/Sidebar/Footer + `NextIntlClientProvider`) | Inject GA4 `<Script>` (4.3); consider default OG metadata |
| `src/app/[locale]/<slug>/page.tsx` (×10) | Server components; each has `generateMetadata` returning `{ title, description }` | Extend to Open Graph via shared helper (4.6) |
| `src/app/not-found.tsx` | Global 404 (hardcoded English) | Polish + localize (4.7); keep as fallback |
| `src/lib/pages.ts` | `getPageData(slug, locale)` — placeholder→DB resolution + SEO fallbacks | Single source for metadata & sitemap data |
| `src/lib/page-content.ts` | `getPageContent`, `listPagesWithContent`, `getPageBySlug` | Sitemap queries published rows |
| `src/lib/site-settings.ts` | `getSiteSetting(key)` (global rows) | Read `ga4_tracking_id` server-side for 4.3 |
| `src/lib/uploads.ts` | `getUploadUrl` (absolute), `mimeTypeForUpload` | Absolute `og:image` / sitemap URLs |
| `src/app/api/settings/route.ts` | GET/PUT global settings | `ALLOWED_SETTINGS = ["site_name", "ga4_tracking_id"]` — already GA4-ready |
| `src/components/admin/SettingsForm.tsx` | Admin settings form (site name, GA4, logo) | Already saves GA4 ID — no change expected |
| `messages/en.json` + `zh.json` | next-intl translations | **Add 404 keys to BOTH** (§12 #5) |
| `docker-compose.yml` / `Dockerfile` | Standalone + volumes (`sqlite-data`, `uploads`) | 4.11 end-to-end verification; first-boot DB bootstrap gap (§12 #9) |
| `prisma/seed.ts` | 9 Page rows + content | Reference for slugs/URLs |
| `tools/*.ps1` | Old-site PDF download scripts | **Real old-site URL patterns** — good reference for the 301 table |

### 5.2 Files to create (per plan §7.2)

| File | Purpose | Notes |
|------|---------|-------|
| `src/lib/redirects.ts` *(recommended)* | Pure table of old→new URL mappings | Extract from `next.config.js` so vitest can test it directly (§12 #8) |
| `src/app/sitemap.xml/route.ts` | Dynamic sitemap (4.4) | URL = `/sitemap.xml`; see TD-27 note below + caching pitfall §12 #7 |
| `src/app/robots.txt/route.ts` | `robots.txt` (4.5) | Point `Sitemap:` at the absolute sitemap URL; can also be static `app/robots.txt` |
| `src/lib/metadata.ts` | Open Graph helper (4.6) | Build `Metadata` from `PagePlaceholder` (title/description/OG/alternates) |
| `src/components/layout/GAScript.tsx` | GA4 client component (4.3) | `next/script` `strategy="afterInteractive"`; renders nothing when ID empty |
| `src/app/[locale]/not-found.tsx` | Localized 404 (4.7) | i18n keys + Back-to-Home link using the current locale |

> **TD-27 watch-out:** the plan's decision row says "Dynamic API route at `/api/sitemap.xml`", but its own
> §7.2 file table (and `robots.txt` convention) imply the root `/sitemap.xml`. **Recommend `/sitemap.xml`** —
> SEO convention, PRD wording ("sitemap.xml"), and it bypasses the middleware `/api` exclusion cleanly. Pick one
> URL and make `robots.txt` reference it. (Next.js 14 metadata `sitemap.ts` is an alternative, but a plain route
> handler keeps the DB-querying logic consistent with this codebase's route-handler style.)

---

## 6. Database schema details

**Source of truth:** `prisma/schema.prisma`. Provider is **`sqlite`**, DB file `prisma/data/vvh.db`
(gitignored; Docker mounts a named volume at that path). Six models; **four are active**,
`reports` and `announcements` are **RESERVED / NOT USED** (TD-30 Option A, Phase 3).

| Model / table | Active? | Phase-4 relevant fields |
|---------------|---------|-------------------------|
| `AdminUser` (`admin_users`) | ✅ | `username`, `password` (bcrypt), `role`, `createdAt` |
| `Page` (`pages`) | ✅ | `slug` (unique), `menuOrder`, `parentSlug`, `isVisible` — **9 rows** seeded; `home`, `board-of-directors`, `corporate-details`, `corporate-governance`, `financial-reports`, `esg-reports`, `lost-share-certificates`, `corporate-communications`, `contact` |
| `PageContent` (`page_contents`) | ✅ | `pageId`+`locale` (unique pair), **`isPublished`**, **`metaTitle`**, **`metaDescription`**, `heroImage`, `title`, `contentHtml` (may hold JSON report envelope), `breadcrumbLabel`, `updatedAt` |
| `SiteSetting` (`site_settings`) | ✅ | `key` (unique), `value`, `locale` — global rows use **`locale = NULL`**. Keys: `site_name`, **`ga4_tracking_id`** |
| `Report` (`reports`) | ⛔ RESERVED | Do **not** build against it (envelope in `contentHtml` instead) |
| `Announcement` (`announcements`) | ⛔ RESERVED | Do **not** build against it (Datalink iframe instead) |

### Phase-4 read patterns (no writes, no migrations)

- **Sitemap (4.4):** read `Page` × `PageContent`; include a `{slug, locale}` when the row is **`isPublished = true`**. Build URL from slug (see §2.3 `home` mapping) + locale prefix (`/en/`, `/zh/`). Absolute URLs via `NEXT_PUBLIC_SITE_URL`.
- **Metadata / OG (4.6):** `metaTitle`/`metaDescription` (fall back to placeholder via `getPageData`), `heroImage` (→ absolute via `getUploadUrl`) with logo fallback (TD-29).
- **GA4 (4.3):** `getSiteSetting("ga4_tracking_id")` — global row; value may be `null`/`""` → then load no script.

---

## 7. Authentication flow

- **Sessions = JWT** in an HTTP-only cookie named `token` (24 h expiry), signed with `JWT_SECRET`
  (`src/lib/auth.ts`: `signToken` / `verifyToken` / `getSession` / `requireSession`). Passwords: bcrypt (12 rounds).
- **Middleware (`src/middleware.ts`)** only checks **cookie presence** for `/{locale}/admin/*` (login/setup exempt,
  `redirect` query param); it does **not** validate the JWT and **skips** `/api*`, `/_next`, `/images`, `/favicon.ico`,
  and any path containing a `.`. Public pages have no auth.
- **Every API route self-guards** with `requireSession()` — returns `{ session, error }` (401 `Unauthorized` when
  absent). This replaced the old inline `getSession()` guards (Phase-3 refactor) in
  `pages`, `pages/[slug]`, `settings`, `change-password`, `logo`, `upload/image`, `upload/pdf`.
  `auth/me` and `auth/setup` still use `getSession()` directly — leave them.
- **Phase 4 adds NO auth.** `sitemap.xml`, `robots.txt`, 301 redirects, root redirect, GA4, OG tags and the 404
  page are **public**; do not add `requireSession()`/`getSession()` to them (middleware matcher already excludes
  `/api`, and bare paths with dots already pass through).
- **Admin settings** (`/api/settings`) is the only writer to `ga4_tracking_id` (JWT-guarded).

---

## 8. Environment variables

> Template: `.env.example`. Docker supplies defaults in `docker-compose.yml` (`${VAR:-default}`).
> `.env` is gitignored.

| Variable | Required | Where used | Phase-4 note |
|----------|----------|-----------|--------------|
| `DATABASE_URL` | Yes | `prisma/schema.prisma` (SQLite, e.g. `file:./data/vvh.db`) | Docker volume `sqlite-data` |
| `JWT_SECRET` | Yes (prod!) | `src/lib/auth.ts` | Falls back to a dev secret — **must set in prod/Docker** |
| `NEXT_PUBLIC_SITE_URL` | Yes for SEO | `src/lib/uploads.ts` (`getUploadUrl`); metadata | **Sitemap + OG absolute URLs must use the production HTTPS origin** |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_RECIPIENT` | Contact form only | `api/contact/send` | Phase 3, unaffected |
| `UPLOAD_DIR` | No (default `./uploads`) | uploads lib/routes | Docker volume `uploads` |
| `MAX_FILE_SIZE` (default 5 MB) / `MAX_DOC_SIZE` (default 50 MB) | No | `src/lib/uploads.ts` | Not in `.env.example`, but read by code |
| `LOGO_FILE_PATH` | **Test-only** | `src/lib/logo.ts` | Sets logo write target in tests; do not set in prod |
| `NEXT_PUBLIC_GA_ID` | No (new, optional) | *(to add)* | Plan §7.5 suggests an env default for GA4, overridable by admin settings. **Decision needed:** if added, admin value should win (plan says "overridable in admin settings"). Precedence: `site_settings.ga4_tracking_id` (if set) → `NEXT_PUBLIC_GA_ID` → no script. |
| `NEXT_TELEMETRY_DISABLED` | No | `Dockerfile` only | Build-time |

### Docker-only notes

- `docker-compose.yml` passes `JWT_SECRET`, `SMTP_*`, `NEXT_PUBLIC_SITE_URL`, `UPLOAD_DIR`, `MAX_FILE_SIZE`;
  it does **not** currently pass `MAX_DOC_SIZE` — add it if the container must change the 50 MB default.
- `NEXT_PUBLIC_*` vars are baked at **build time** — they must be present when `docker-compose build`/`npm run build` runs, not just at container start.

---

## 9. Third-party services / tools

| Service / tool | Status | Purpose / Phase-4 role |
|----------------|--------|------------------------|
| **Google Analytics 4** | ⚪ **NEW (4.3)** | Tracking script; measurement ID stored in `site_settings.ga4_tracking_id` (admin-configurable, D13) |
| **SMTP server** | ✅ Phase 3 | Contact form (IP-based auth, no credentials, D10); `SMTP_HOST`/`SMTP_PORT`/`SMTP_RECIPIENT` |
| **Datalink announcements** | ✅ Phase 2A/3 | `/en|zh/announcements` renders the Datalink page in an `<iframe>` (no DB row) — remember it for sitemap |
| **Docker / docker-compose** | ✅ Phase 1 | Production deploy (D9); standalone Next server; volumes for SQLite + uploads |
| **Lighthouse** | ⚪ audit (4.8) | Target ≥ 85 mobile / ≥ 95 desktop |
| **axe-core** (via Lighthouse or devtools) | ⚪ audit (4.9) | WCAG 2.1 AA automated checks |
| **npm registry (Next 14, React 18, next-intl 3, Prisma 5.14, Tailwind 3, Vitest 4)** | ✅ | Framework deps — no new runtime deps anticipated for Phase 4 |

> **No new third-party accounts required** unless GA4 was never created — the ID itself can be entered later
> via `/admin/settings` without code changes.

---

## 10. Known constraints & decisions already made

**Do not re-litigate these — they are recorded decisions.**

1. **TD-30 Option A (Phase 3 plan):** `reports` and `announcements` tables are RESERVED/UNUSED. Build nothing against them.
2. **TD-26 (Phase 4):** 301 redirects go in `next.config.js` `async redirects()`, **not** middleware/custom server.
3. **TD-27:** sitemap is **dynamic** (DB-driven), not a static file. URL choice `/sitemap.xml` vs `/api/sitemap.xml` is open (§5.2 TD-27 note) — pick once.
4. **TD-28:** root `/` → **always `/en/`** (no browser-language detection).
5. **TD-29:** `og:image` = hero image if set, else site logo (`/logo.svg`).
6. **TD-30 (Phase 4 plan):** GA4 loaded client-side via `<Script>` `strategy="afterInteractive"`.
   > ⚠️ **Label collision:** "TD-30" is reused across phase documents with different meanings (Phase-3 "Option A" = reports architecture; Phase-4 = analytics loading). Qualify by phase when discussing.
7. **D8:** independent publish toggle per locale → sitemap must filter per-locale `is_published`.
8. **Published rule:** no content row **or** unpublished row → public page renders the **placeholder** (no 404). Sitemap treatment is an open decision (§12 #3).
9. **D13:** GA4 ID configurable via admin settings — already implemented (`ga4_tracking_id`).
10. **D9 / D15:** Docker compose is the deployment target; Prisma migrations must support CI/CD. **Gap:** the Dockerfile/compose run no `prisma migrate deploy`/`db push` — verify/fix first-boot bootstrap for 4.11 (§12 #9).
11. **next-intl `localePrefix: "always"`** — all public URLs are `/en|zh/...`; middleware auto-redirects `/` and handles locale.
12. **`output: "standalone"` + `images.unoptimized`** in `next.config.js` — do not remove without revisiting the Dockerfile.
13. **Uploads are served dynamically** by `/uploads/[...path]` (traversal-guarded), **not** from `public/` — runtime-uploaded files never get static-embedded.
14. **Route modules export only HTTP handlers; logic lives in `src/lib/`** (Next.js type-checks route exports). Follow this for the new sitemap/robots/metadata code and keep libs kebab-case.
15. **i18n:** every UI string must be added to **both** `messages/en.json` and `messages/zh.json`.
16. **Pre-existing lint warnings** (`admin/setup` useEffect deps; `Logo <img>`) are accepted — do not "fix" them as part of Phase 4 unless they block Lighthouse/axe targets.

---

## 11. Testing requirements

### 11.1 Baseline (must stay green)

- `npm test` — **56 files / 274 tests** (2026-09-18). New work must not break any existing test.
- `npm run lint` — no **new** warnings (2 pre-existing accepted).
- `npm run build` — exit 0.

### 11.2 Test conventions (follow the existing ones)

- Vitest 4; config `vitest.config.ts` (alias `@` → `src`, default env **jsdom**, `include: src/**/*.test.{ts,tsx}`).
- Route tests needing `fs`/`Buffer`/`FormData` start with `// @vitest-environment node`.
- Lib unit tests live at `src/lib/*.test.ts`; route tests colocated as `route.test.ts`; component tests `.test.tsx`.
- **Mock only at system boundaries** (`mocking.md` convention): Prisma client, the filesystem, and `@/lib/auth`
  (`getSession` + `requireSession` via `vi.hoisted` + `vi.mock` — see any `src/app/api/*/route.test.ts`).
- Never mock own components/modules; test public seams.

### 11.3 New tests to write (suggested TDD order)

1. **`src/lib/redirects.ts` + `redirects.test.ts`** — pure mapping table: every PRD §11 old→new pair; case/path edge;
   assert no mapping source collides with a new locale route (`/en|zh/...`); helper used by `next.config.js redirects()`.
2. **`src/lib/metadata.ts` + `metadata.test.ts`** (4.6) — OG output from a `PagePlaceholder`/`getPageData` result:
   en/zh, hero image → absolute URL via `getUploadUrl`, **fallback to logo** when hero null, missing description → omitted/empty.
3. **Sitemap route test** (4.4) — published rows × locales only; **unpublished excluded**; `home` → `/en/`,`/zh/`;
   **announcements URL emitted explicitly**; absolute URLs use `NEXT_PUBLIC_SITE_URL`; empty DB → valid empty `<urlset>`; XML content-type.
4. **robots.txt route test** (4.5) — `User-agent: *`, `Allow: /`, `Sitemap: <absolute sitemap URL>`; content-type `text/plain`.
5. **GA script component test** (4.3) — renders nothing when ID empty/absent; emits `next/script` with `G-...` id when set (strategy afterInteractive).
6. **404 page tests** (4.7) — component renders localized heading + Back-to-Home linking to the **current** locale; route returns HTTP 404 (integration or route-level assertion).
7. **Middleware root-redirect test** (4.2, optional) — hard in vitest; prefer a manual `curl` (see §4 step 7) plus a small export if you extract the locale-defaulting logic into a lib.
8. **`[locale]` layout test** (4.3) — GA script only when setting present (mock `getSiteSetting`).

### 11.4 Manual / acceptance checks (from plan §7.8 — repeat as checklist)

- [ ] All old ASP URLs return **301** to the correct new URL (curl each mapping in PRD §11).
- [ ] Root `/` returns 301 → `/en/`.
- [ ] Unknown old URLs (`/eng/nope.asp`, `/chi/whatever`) fall back sanely (home redirect or 404 — decide).
- [ ] New routes still work — `/en/board-of-directors`, `/zh/...` are **not** caught by any redirect rule.
- [ ] `/sitemap.xml` lists all published EN+ZH pages (incl. announcements, `/en/`,`/zh/`); excludes unpublished.
- [ ] `/robots.txt` valid, points at absolute sitemap URL.
- [ ] 404 page renders with site chrome + locale-aware Home link; HTTP status is 404 (curl `-I` shows `404`).
- [ ] GA4 script present in page HTML when ID set; **absent** when empty (and still loads in production build).
- [ ] `og:title/og:description/og:image` present on each public page (view-source; test a social debugger).
- [ ] Lighthouse **≥ 85 mobile / ≥ 95 desktop**; axe **WCAG 2.1 AA** pass.
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge.
- [ ] Broken-link crawl; all PDF downloads work (`/uploads/reports/...`).
- [ ] Docker: fresh `docker-compose up -d --build` → schema bootstrapped, seed present, redirects/sitemap/GA4/404 all work end-to-end.

---

## 12. Common pitfalls to avoid

1. **Implementing redirects in middleware** — next-intl middleware **skips any path containing a `.`** (early
   `NextResponse.next()`); old `.asp`/`.php` URLs would never reach it. Use `next.config.js` `redirects()` (TD-26),
   and **test that new routes still resolve** (`/en/board-of-directors` must not be caught by a wildcard rule).
2. **Double-handling root `/`** — next-intl already 301s `/` → `/en`. Do not add a second `/` redirect in
   `next.config.js` (it would conflict/loop). Verify, don't rebuild.
3. **Sitemap omissions/inclusions** — three traps: (a) `announcements` has **no `pages` row** — emit its URL
   explicitly; (b) `home` maps to `/en/`,`/zh/` not `/en/home`; (c) pages with **no row or unpublished row** render
   publicly (placeholder fallback) — decide and document whether the sitemap lists them (recommend: list only
   `is_published = true` DB rows; agree what to do pre-content-migration). Filter hard on `is_published`.
4. **Relative `og:image`** — social crawlers require absolute URLs. `heroImage` from the DB is a relative path
   (`/uploads/...`) — wrap with `getUploadUrl`; logo fallback = `\`${NEXT_PUBLIC_SITE_URL}/logo.svg\`` (TD-29).
5. **404 not localized / wrong Home link** — the existing `not-found.tsx` is hardcoded English with `href="/en"`.
   Add a `[locale]/not-found.tsx` **and** add the new message keys to **BOTH** `en.json` and `zh.json` (missing
   keys render literally). Keep the root fallback too.
6. **GA4 loading unguarded / tracking null** — read `ga4_tracking_id` server-side (global row, `locale = NULL`);
   if the value is null/empty, render **no script** (privacy). Prefer the site setting over an env default
   (plan: "overridable in admin settings"). No PII in event payloads.
7. **`/sitemap.xml` GET handler being statically optimized** — in Next.js 14, a GET route handler that does not
   use a dynamic API is statically rendered once **at build time** (empty DB in a fresh Docker build → empty
   sitemap). Force dynamic behaviour (e.g. `export const dynamic = "force-dynamic"` or reading `request.url`),
   then re-test after building.
8. **Untestable redirect table** — `next.config.js` cannot be unit-tested in vitest. Extract the old→new mapping
   to `src/lib/redirects.ts`, unit-test the table, and have `next.config.js` consume it (TD-26).
9. **Docker first-boot has no DB bootstrap** — `Dockerfile`/`docker-compose.yml` never run
   `prisma migrate deploy` (or `db push`) and `npm run seed` isn't wired in. A **fresh** volume would have an
   empty schema at runtime (`SELECT` fails). For 4.11 either add a migrate+seed step (entrypoint) or document
   the manual `docker compose exec app npm run ...` procedure — decide and verify from scratch.
10. **Robots/sitemap URLs not absolute** — `Sitemap:` must be `https://www.visionvalues.com.hk/sitemap.xml`
    (from `NEXT_PUBLIC_SITE_URL`), not `/sitemap.xml`. Validate with a crawler/validator.
11. **Redirect catch-all leaking** — an unmatched `/eng/*` → home catch-all is fine, but never expose internal
    paths (`/admin`, `/api`, query strings). Keep query params out of 301 targets.
12. **Lighthouse deps** — `images.unoptimized: true` and the `<img>` logo hurt LCP; run Lighthouse early and
    iterate (preload hero, `loading="lazy"` below fold, font preload). Contrast: verify against the PRD §8.3 palette.
13. **Ignoring existing conventions** — new routes/logic must follow §10 #14 (handler-only routes, kebab-case
    libs) and the mocking rules (§11.2) so the suite stays consistent and green.
14. **Editing the plan doc** — `docs/phase-4-seo-polish-deployment.md` is the approved plan; **do not modify it**.
    Record deviations/decisions in this checklist instead.

---

## 13. Definition of done / sign-off checklist

- [x] **§11.1 baseline stays green** — `npm test` **64 files / 300 tests** (2026-09-18), `npx tsc --noEmit` clean, `npm run lint` clean (2 pre-existing warnings), `npm run build` exit 0.
- [x] Deliverables **4.1–4.7 implemented** and unit/integration tested (§11.3 → §15 work log).
- [ ] All §11.4 manual/acceptance checks pass (redirects, sitemap, robots, 404, GA4, OG tags, Lighthouse ≥85/≥95, axe AA, cross-browser, broken links, PDFs) — automated/subset done; the browser-based + audit + Docker items remain (see §15).
- [ ] Docker verification (4.11): fresh volume deploys with schema + seed + all SEO features working; first-boot gap (§12 #9) resolved.
- [ ] PDF migration cleanup (4.12) reconciled against the content migration checklist (`docs/phase-2-content-migration-checklist.md`).
- [x] Phase-4 work committed with clear messages (commits listed in §15).
- [x] `docs/developerGuide/developer-guide.md` updated (new §4.6 SEO routes & metadata, §4.7 admin, schema/env/route notes, `requireSession` wording).
- [ ] This checklist's **Status header** flipped to ✅ COMPLETE, with the audit + Docker items finished and their results recorded.

---

## 14. Links to relevant PRD sections

| Reference | Where | Content |
|-----------|-------|---------|
| **PRD §7.4** | `docs/PRD-visionvalues-revamp-v2.md:206` | Public Website requirements — **WEB-07** (editable meta), **WEB-08** (404), **WEB-09** (GA4 configurable), **WEB-10** (auto sitemap.xml), **WEB-11** (Open Graph) |
| **PRD §7.5** | `:222` | URL Migration — **URL-01** (clean URL pattern), **URL-02** (301 old ASP → new), **URL-03** (root `/` redirect) |
| **PRD §11** | `:400` | Public Page URL structure **and the 301 redirect mapping table** (old → new) — the source of truth for 4.1 |
| **PRD §12** | `:435` | Non-Functional Requirements — Performance (Lighthouse ≥85/≥95), Accessibility (WCAG 2.1 AA), SEO, Security, Backup, Migrations (D15), Deployment (D9), Analytics (D13) |
| **PRD §14** | `:461` | Grilling Decisions log — **D13** (SEO/Analytics), **D15** (backup & migrations), D9 (Docker) |
| **PRD "Phase 4"** | `:549` | Phase 4 scope bullets (the source for the plan's deliverable list) |
| **Phase-4 plan doc** | `docs/phase-4-seo-polish-deployment.md` | TD-26…TD-30 (decisions), §7.8 (testing checklist), §7.10 (plan's pitfalls), §7.11 (its PRD links) |
| **Developer guide** | `docs/developerGuide/developer-guide.md` | Architecture, directory map, data flow, conventions — read before editing |
| **Previous handoff** | `docs/phase-3-checklist.md` | Phase-3 decisions still in force (announcements static, report envelope, contact form) |

---
*This checklist was generated 2026-09-18 from the current `main` (`7c2ada5`) working tree. Re-verify baseline
numbers if the Phase-3 refactor changes the test count before you start.*

---

## 15. Phase-4 implementation log & decisions (2026-09-18)

### 15.1 Commits

| # | Commit | Deliverable | Tests added |
|---|--------|-------------|-------------|
| 1 | `29a3956` | 4.1+4.2 — 301 redirects in `next.config.js` (`statusCode: 301` + `/eng`·`/chi` catch-alls); root `/` verified as next-intl middleware behaviour | `src/lib/redirects.test.ts` (4 tests) |
| 2 | `71a03ed` | 4.3 — `GAScript` component wired into `[locale]/layout.tsx`, keyed off `site_settings.ga4_tracking_id` | `GAScript.test.tsx` (3) |
| 3 | `32842a9` | 4.4 — `/sitemap.xml` route + `src/lib/sitemap.ts` (`dynamic = "force-dynamic"`) | `sitemap.test.ts` (6) + `sitemap.xml/route.test.ts` (2) |
| 4 | `b40b4b9` | 4.5 — `/robots.txt` route + `src/lib/robots.ts` | `robots.test.ts` (2) + `robots.txt/route.test.ts` (2) |
| 5 | `a6d1518` | 4.6 — `src/lib/metadata.ts` (`buildPageMetadata`) wired through all 10 public `generateMetadata` | `metadata.test.ts` (4) |
| 6 | `ab650c9` | 4.7 — localized `[locale]/not-found.tsx` + polished root `not-found.tsx`; `notFound.*` i18n keys (en+zh) | `not-found.test.tsx` (2) |
| 7 | `9035062` | test type fix — explicit `Redirect` cast so `npx tsc --noEmit` is clean | — |
| 8 | `c6156fd` | sitemap builder fix — `Array.from(unique.values())` instead of spreading a `MapIterator` (fails under the default es5 tsconfig target) | — |
| 9 | `ff3c15a` | docs — developer guide SEO section + this checklist's work log / decisions / status | — |

### 15.2 Decisions recorded during implementation

1. **Sitemap URL is `/sitemap.xml`** (root, not `/api/sitemap.xml` as TD-27's wording suggested) — SEO convention, PRD wording, and it passes through the middleware dot-skip cleanly. `robots.txt` points at it.
2. **Redirects use `statusCode: 301`** in `next.config.js` — `permanent: true` maps to **308**, not 301; explicit `statusCode: 301` satisfies the PRD/tests literally (TD-26).
3. **`announcements` is included in the sitemap statically** (both locales) because it has no `pages` DB row but is a live public route (TD-30 Option A).
4. **`home` maps to `/en/` and `/zh/`** in the sitemap (no `/home` segment).
5. **Root `/` redirect is NOT added to config** — the next-intl middleware (`localePrefix: "always"`) already 301s `/`→`/en` (URL-03). Verified by omission-test + documented.
6. **GA4 reads only `site_settings.ga4_tracking_id`** — the optional `NEXT_PUBLIC_GA_ID` env default was **not** added; admin setting remains the single source (D13, "overridable in admin settings"). Script renders nothing when unset.
7. **Sitemap GET route opts out of static optimization** with `export const dynamic = "force-dynamic"` — a plain (non-`request`-reading) GET route would otherwise be rendered once at build time (empty DB → empty sitemap in a fresh Docker build).
8. **`[locale]/not-found.tsx` imports the message JSONs directly** instead of `getTranslations` — under vitest, `next-intl/server` resolves to its **client** build where `getTranslations` throws, and there is no existing `[locale]/layout` test to mask it. Direct JSON import is deterministic in both test and production.
9. **`route.ts` helper rule enforced (again, per repo convention):** sitemap/robots logic lives in `src/lib/sitemap.ts` / `src/lib/robots.ts`; metadata in `src/lib/metadata.ts`.
10. **tsconfig has no `target`** (defaults to `es5` in tsc/next build) — avoid spreading `Map.values()` in app code; use `Array.from(...)` (`MapIterator` spread errors under es5). `npx tsc --noEmit` is the fast local gate that reproduces `next build`'s type errors.

### 15.3 Remaining (manual / operational)

- [ ] 4.8 Lighthouse ≥85 mobile / ≥95 desktop (run against a deployed instance; fix findings iteratively).
- [ ] 4.9 axe-core WCAG 2.1 AA scan.
- [ ] 4.10 cross-browser (Chrome/Firefox/Safari/Edge) + broken-link crawl + final content review.
- [ ] 4.11 Docker fresh-volume end-to-end (includes resolving the first-boot `prisma migrate deploy`/seed gap — §12 #9).
- [ ] 4.12 PDF migration cleanup vs `docs/phase-2-content-migration-checklist.md`.