# Phase 2B — Admin CMS Editor — Handoff Checklist

> **Project:** Vision Values Holdings Limited — Website Revamp
> **Phase:** 2B — Admin CMS Editor
> **Duration:** 1 week
> **Complexity:** High
> **Dependencies:** Phase 1 (Foundation & Infrastructure) — ✅ COMPLETE · Phase 2A (Page Templates & Public Site) — ✅ COMPLETE
> **Status:** ✅ **COMPLETE** — All 26 Phase 2B tasks + follow-up enhancements (Tasks 27–30) delivered; follow-up review confirms **237 tests passing**, `npm run lint` clean (2 pre-existing Phase-1 warnings), `npm run build` exits 0. See §8.4 for the still-pending manual browser pass.
> **Source docs:** `docs/phase-2b-admin-cms-editor.md` (phase plan) · `docs/phrase-2a-checklists.md` (Phase 2A handoff) · `docs/phase-2a-implementation.md` · `docs/phase-2a-tasklist.md` · `docs/PRD-visionvalues-revamp-v2.md`

---

## 1. Setup Instructions

### 1.1 Prerequisites

- **Node.js 18+** (LTS) — the project targets `node:18-alpine` in the Dockerfile and uses Node 18/Next 14/React 18 conventions.
- **npm** (bundled with Node)
- *(Optional)* **Docker Desktop** — for production-like container testing (see §1.5). ⚠️ **Docker engine was not running on the dev machine during Phase 1/2A, so `docker-compose up -d` was never fully verified.** Do not let it block CMS work.
- **SQLite** — the database file is `prisma/data/vvh.db`; no separate DB server is required.

### 1.2 Fresh Clone Setup

```bash
# 1. Clone the repository
git clone https://github.com/simon617/vvh.git
cd vvh

# 2. Install base dependencies
#    NOTE: postinstall hook automatically runs `prisma generate`
npm install

# 3. Create environment file
cp .env.example .env

# 4. Generate a JWT secret and add it to .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#    → copy the output into JWT_SECRET in .env

# 5. NEW IN PHASE 2B — install WYSIWYG + typography packages (NOT yet installed)
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tailwindcss/typography

# 6. Verify database migration state
npx prisma migrate status
#    If pending: npx prisma migrate dev
#
# 7. NEW IN PHASE 2B — apply the pages seed (see §3.4).
#    The current single migration DOES NOT insert the 10 Page rows.
#    Create/apply a seed and re-run: npx prisma migrate dev

# 8. Start the development server
npm run dev
```

### 1.3 Existing Project Setup (already cloned)

```bash
cd vvh
npm install            # if node_modules missing
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tailwindcss/typography
npx prisma generate    # if Prisma client out of date
npm run dev
```

### 1.4 URLs to Verify After Startup

| Area | URL | Expected |
|------|-----|----------|
| Admin login | `http://localhost:3000/en/admin/login` | Login form (or `setup` on first run) |
| Admin setup (first run) | `http://localhost:3000/en/admin/setup` | Create the initial admin account |
| Admin pages (after 2B) | `http://localhost:3000/en/admin/pages` | 10-row pages table |
| Public site EN | `http://localhost:3000/en/` | Rendering site (Phase 2A) |
| Public site ZH | `http://localhost:3000/zh/` | Rendering site (Phase 2A) |

> **Admin routes are locale-prefixed** (`/en/admin/*`, `/zh/admin/*`) because the whole app lives under `[locale]`. Login at `/admin/login` and `/admin/setup` are public (exempt from the auth middleware); all other `/admin` routes require a JWT cookie.

### 1.5 Docker (Production-Like) Setup

```bash
docker-compose up -d --build
# App available at http://localhost:3000
# SQLite data persists in `sqlite-data` volume  (maps to /app/prisma/data)
# Uploads persist in `uploads` volume          (maps to /app/uploads)  ← NEW for Phase 2B
```

> The `uploads` volume is already declared in `docker-compose.yml`. Any image upload feature **must** write inside the `/uploads` directory so it survives container restarts. Verify the upload volume works in Docker if you have Docker available.

---

## 2. Key Files & Their Purpose

### 2.1 Already Implemented in Phase 1 (REUSE — do not recreate)

| File | Purpose | Notes for Phase 2B |
|------|---------|-------------------|
| `src/lib/auth.ts` | bcrypt hashing (12 rounds), JWT sign/verify, cookie session (`getSession`), `createAdminUser`, `validateAdmin`, `adminExists` | **Single source of truth for auth.** Reuse `getSession()` inside every CMS API route. Extend here for `changePassword` (verify current, re-hash, update). |
| `src/middleware.ts` | Guards `/admin` routes; redirects unauthenticated users to `/{locale}/admin/login?redirect=...` | ⚠️ **Skip-list includes `/api`, `/_next`, `/images`.** It only checks cookie *presence* (not validity) and does **not** run for `/api/*`. **Every API route must verify the JWT via `getSession()`.** |
| `src/lib/prisma.ts` | Global Prisma client singleton | Import `prisma` from here in all CMS data/API code. |
| `src/app/[locale]/admin/layout.tsx` | Admin shell; renders `AdminNav` around `<main>`; calls `getSession()`; redirects if none; login/setup render standalone | New admin pages live inside this layout automatically. |
| `src/app/[locale]/admin/AdminNav.tsx` | Top nav (VVH CMS, Dashboard, username, Logout) | Extend with **Pages**, **Settings**, **Change Password** links. `admin.pages` / `admin.settings` / `admin.changePassword` i18n keys already exist. |
| `src/app/api/auth/login/route.ts` | `POST` — sets `token` httpOnly cookie (24h) | Reference for cookie pattern. |
| `src/app/api/auth/setup/route.ts` | `HEAD` (exists?→409) + `POST` (create first admin) | Reuses `adminExists`/`createAdminUser`. |
| `src/app/api/auth/me/route.ts` | `GET` — returns session user | Reference for `getSession()` in API routes. |
| `src/app/api/auth/logout/route.ts` | `POST` — clears cookie | |
| `scripts/reset-password.ts` | CLI reset (`npm run reset-password`) | **REUSE/VERIFY this phase** (2B.9) so it resets the same hashed password the in-app flow writes. |
| `public/logo.svg` + `src/components/layout/Logo.tsx` | Current header logo + renderer | Logo upload (2B.7) must write to a path `<Logo/>` loads. |

### 2.2 Implemented in Phase 2A (REUSE / extend — the public read path)

| File | Purpose | Notes for Phase 2B |
|------|---------|-------------------|
| `src/lib/pages.ts` | `getPageData(slug, locale)` — **the public read seam** | ⚠️ Currently **synchronous** and returns placeholder data. Phase 2B swaps it to query `pages`/`page_contents` via Prisma. **Making it async is a breaking change affecting all 10 public pages** — see Pitfalls §9.1. |
| `src/lib/placeholders.ts` | `PagePlaceholder` per `{slug, locale}` (title, metaTitle, metaDescription, breadcrumb, heroImage?, contentHtml) | Serves as the shape for the DB read path and the **fallback** until Phase 2.5 content migration. |
| `src/app/[locale]/<slug>/page.tsx` (×10 templates) | Each calls `generateMetadata` + a template component that uses `getPageData` | All 10 must keep working after the DB swap. See §2.4 for template-specific caveats. |
| `src/components/layout/ContentWithSidebar.tsx` | Renders `contentHtml` via `dangerouslySetInnerHTML` + `.prose` | The render path WYSIWYG HTML flows through. Already expects HTML body content. |
| `reports.ts` / `directors.ts` / `corporateCommunications.ts` / `announcements.ts` (+ `ReportsTable.tsx`, `DirectorCards.tsx`…) | Phase 2A data/layout layers for specialized pages | ⚠️ Not all content is simple `contentHtml` — see §2.4 scope caveat. |

### 2.3 Files to CREATE in Phase 2B

| File | Purpose |
|------|---------|
| `src/app/[locale]/admin/pages/page.tsx` | Admin pages listing — table of 10 pages, published status per locale, edit links (2B.1) |
| `src/app/[locale]/admin/pages/[slug]/page.tsx` | Page editor — EN/ZH tabs, TipTap WYSIWYG, header image upload, SEO fields, publish toggles (2B.2, 2B.5, 2B.6) |
| `src/components/admin/TipTapEditor.tsx` | Limited WYSIWYG (bold, italic, paragraph, heading, link only) (2B.3) |
| `src/components/admin/LocaleTabs.tsx` | EN/ZH tab switcher using URL `?tab=en|zh`, preserves unsaved state |
| `src/components/admin/ImageUploader.tsx` | Header image upload with preview (2B.4) |
| `src/app/[locale]/admin/settings/page.tsx` | Admin settings — GA4 tracking ID, site name (2B.10) |
| `src/app/[locale]/admin/change-password/page.tsx` | In-app password change (2B.8) |
| `src/app/[locale]/admin/page.tsx` (extend) | Admin dashboard overview with recent activity (2B.11 — currently a placeholder) |
| `src/app/api/upload/image/route.ts` | `POST` — validate + write image to uploads, return URL (TD-13/14) |
| `src/app/api/pages/route.ts` | `GET` — list pages with per-locale published status |
| `src/app/api/pages/[slug]/route.ts` | `GET` (content per locale) / `PUT` (save per locale) |
| `src/app/api/settings/route.ts` | `GET`/`PUT` site settings |
| `src/app/api/auth/change-password/route.ts` | `POST` — change admin password |
| `src/lib/page-content.ts` | Server-side DB helpers for `PageContent` (used by the DB-aware `getPageData`) |
| `src/lib/site-settings.ts` | Server-side helpers for `site_settings` (GA4 ID, site name) |
| `prisma/seed.ts` (new) | Seeds the 10 `Page` rows (see §3.4) |

### 2.4 Scope Caveat — Which Content is CMS-Editable in 2B?

The Phase 2A public pages are **not all driven by a single `contentHtml` field**. Before wiring "all 10 pages to the DB", confirm scope with the PM and record the decision:

- **Rich-text / content-with-sidebar pages** (`corporate-governance`, `lost-share-certificates`, `corporate-details`, `board-of-directors`) → map naturally to `PageContent.contentHtml`. ✅ CMS-editable in 2B.
- **Home** → HTML body from `contentHtml`; hero is currently a gradient `div`. Decide whether hero image/metrics are CMS fields or just `heroImage`.
- **Reports pages** (`financial-reports`, `esg-reports`), **corporate-communications**, **announcements** → use **separate data layers** (`reports.ts`, `corporateCommunications.ts`, announcements **iframe**), not plain `contentHtml`. These map to the `reports` / `announcement` tables in **Phase 3**. In 2B, keep them on placeholders (or map only their intro/body to `contentHtml`) — do **not** build the Phase 3 report-management UI here.

> **Recommended 2B scope (confirm with PM):** wire the `contentHtml`-driven pages to the DB; leave reports/announcements for Phase 3. Update this section when decided.

---
## 3. Database Schema Details

Source of truth: `prisma/schema.prisma`. Provider is **`sqlite`**, DB file `prisma/data/vvh.db`. Five tables exist; **three are active for Phase 2B** (`pages`, `page_contents`, `site_settings`). `reports` and `announcements` are **Phase 3** but already migrated.

### 3.1 `AdminUser` (Phase 1 — reuse)

| Column | Type | Notes |
|--------|------|-------|
| `id` | Int PK autoincrement | |
| `username` | String `@unique` | Login name |
| `password` | String | **bcrypt hash** (12 rounds), never plaintext |
| `role` | String, default `"admin"` | Only role today |
| `createdAt` | DateTime default now | |

### 3.2 `Page` (Phase 1 — seed in 2B §3.4)

| Column | Type | Notes |
|--------|------|-------|
| `id` | Int PK autoincrement | |
| `slug` | String `@unique` | **Match the navigation slugs exactly** (see §3.4) |
| `menuOrder` | Int default `0` | Drives sidebar/mobile menu order |
| `parentSlug` | String? | For grouping in the sidebar nav |
| `isVisible` | Bool default `true` | Page-level visibility (distinct from locale publish toggle) |
| `createdAt` / `updatedAt` | DateTime | Hooks into `PageContent` via `contents` relation |

### 3.3 `PageContent` (Phase 1 — written by the editor in 2B)

| Column | Type | Notes |
|--------|------|-------|
| `id` | Int PK autoincrement | |
| `pageId` | Int FK → `Page.id`, `onDelete: Cascade` | One `Page` has many contents (one row per locale) |
| `locale` | String | `"en"` or `"zh"` |
| `isPublished` | Bool default `true` | **Independent per locale** (Decision D8) |
| `title` | String | Page H1 title |
| `metaTitle` | String? | SEO title |
| `metaDescription` | String? | SEO description |
| `heroImage` | String? | **Store the relative path** (e.g. `/uploads/images/xyz.jpg`), construct absolute URL at render from `NEXT_PUBLIC_SITE_URL` |
| `contentHtml` | String? | The WYSIWYG HTML body |
| `breadcrumbLabel` | String? | Breadcrumb label |
| `updatedAt` | DateTime | |
| Unique | `@@unique([pageId, locale])` | **One row per (page, locale)** — upsert on save |

> **Bilingual model:** there is **no single row with EN and ZH columns**. EN and ZH are **separate rows** in `page_contents`, linked by the same `page_id`. The editor saves each locale independently.

### 3.4 Seed Data Required (NEW — do not skip)

The single existing migration (`20260730023614_init/migration.sql`) **creates the tables but inserts no rows**. Phase 2B **must seed `pages`** or the `/admin/pages` editor has nothing to edit:

| slug | Page (EN) | FragRoute after `/{locale}` |
|-------|-----------|------------------|
| `home` | Home | `/` |
| `board-of-directors` | Board of Directors | `/board-of-directors` |
| `corporate-details` | Corporate Details | `/corporate-details` |
| `corporate-governance` | Corporate Governance | `/corporate-governance` |
| `announcements` | Announcements & Circulars | `/announcements` |
| `financial-reports` | Financial Reports | `/financial-reports` |
| `esg-reports` | ESG Reports | `/esg-reports` |
| `lost-share-certificates` | Lost Share Certificates | `/lost-share-certificates` |
| `corporate-communications` | Corporate Communications | `/corporate-communications` |
| `contact` | Contact Us | `/contact` |

Set `menuOrder` to the documented sidebar order (see PRD §2.3 / `src/lib/navigation.ts`). A seed script (`prisma/seed.ts`) run after migration (or a new migration with `INSERTs`) is the recommended approach.

### 3.5 `SiteSetting` (used by admin settings — 2B.10)

| Column | Type | Notes |
|--------|------|-------|
| `id` | Int PK | |
| `key` | String `@unique` | e.g. `ga4_tracking_id`, `site_name` |
| `value` | String? | Value (stringified) |
| `locale` | String? | **`null` = global** (GA4 ID and site name are global, not per-locale) — Pitfall §9.7 |

### 3.6 `Report` and `Announcement` (Phase 3 — out of 2B scope)

Both already have tables from the initial migration but are **not** managed in 2B. Do not build CRUD for them here.

---
## 4. Authentication Flow

The auth system is from Phase 1 and is **complete — reuse, do not rewrite.**

### 4.1 Flow (as implemented)

1. **First run:** visit `/{locale}/admin/setup` → `POST /api/auth/setup` creates the first `AdminUser` (username + bcrypt hashed password). `HEAD /api/auth/setup` returns `409` once any admin exists (drives the client redirect to login).
2. **Login:** `POST /api/auth/login` → `validateAdmin()` compares bcrypt → `signToken(payload)` mints a JWT (`expiresIn: 24h`) → sets the `token` cookie:
   - `httpOnly: true` (XSS protection)
   - `secure: process.env.NODE_ENV === "production"`
   - `sameSite: "lax"`
   - `maxAge: 60*60*24` (24 h), `path: "/"`
3. **Route guarding:** `src/middleware.ts` intercepts paths containing `/admin`. It **exempts** `/admin/login` and `/admin/setup`; for all other admin paths it checks for a `token` cookie. **No token → redirect** to `/{locale}/admin/login?redirect=<original path>`. ⚠️ It checks cookie **presence only**, and it **skips `/api/*` entirely**.
4. **Session read (server components):** `getSession()` (in `auth.ts`) reads the cookie and `verifyToken`. Admin pages (e.g. `admin/layout.tsx`) use it to render username and block access.
5. **Logout:** `POST /api/auth/logout` clears the cookie; the client does a full `window.location.assign` so the middleware re-runs (avoids stale layout).

### 4.2 What Phase 2B Must Add

| Deliverable | Requirement |
|-------------|-------------|
| **In-app password change (2B.8)** | `POST /api/auth/change-password` — must call `getSession()`, verify the **current** password with `comparePassword`, reject weak/mismatched new, then write a **new bcrypt hash** via `hashPassword` and update `AdminUser.password`. |
| **Protect all new CMS APIs** | `/api/pages*`, `/api/settings`, `/api/upload/image`, `/api/auth/change-password` — each route must start by verifying `getSession()` and return `401` if absent. **Do not rely on the middleware** (it skips `/api`). |
| **CLI reset (2B.9)** | Verify `npm run reset-password` produces a hash compatible with the in-app change flow (same bcrypt function/rounds). |
| **UI auth flow (client)** | Pages editor/settings/change-password forms live under the protected `[locale]/admin` layout. On login success use `window.location.assign` (not client router) to guarantee fresh middleware re-run — see the existing login page comment. |

### 4.3 Session / token rules to respect

- Token payload shape: `JwtPayload { userId, username, role }`.
- Never store plaintext passwords anywhere.
- `JWT_SECRET` must be set in `.env` (see §5); there is a **non-production fallback** in `auth.ts` — never leave it unset in production.
- Cookie is **not** cleared by a hard browser close automatically within 24 h; add an explicit logout if UX requires it.

---
## 5. Environment Variables Needed

Reference template: `.env.example`. Current `.env` only carries the Phase 1 variables listed below.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | SQLite connection string, e.g. `file:./data/vvh.db` (relative to Prisma). Used by `prisma/schema.prisma`. |
| `JWT_SECRET` | ✅ Yes | 64-hex random string (generate via the recipe in §1.2). Signed auth cookie. **Do not commit a real secret.** |
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | e.g. `https://www.visionvalues.com.hk` or `http://localhost:3000` in dev. Used to build **absolute URLs for uploaded images** rendered on public pages (Pitfall §9.5). |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_RECIPIENT` | No (Phase 3) | For the contact-form email handler. Not needed for 2B; keep present to avoid churn. |

### 5.1 NEW variables to add for Phase 2B

| Variable | Required | Description |
|----------|----------|-------------|
| `UPLOAD_DIR` | No | Override the upload directory root (default `./uploads`). Image upload writes under `<UPLOAD_DIR>/images/`. |
| `MAX_FILE_SIZE` | No | Maximum upload size in bytes (default `5242880` = 5 MB). Enforced server-side (TD-14). |
| `NODE_ENV` | No (production only) | When `"production"`, cookies become `secure` and the Prisma global is not memoized (see `prisma.ts`). |

> **Docker note:** `docker-compose.yml` explicitly passes `DATABASE_URL`, `JWT_SECRET`, `SMTP_*`, `NEXT_PUBLIC_SITE_URL`, and `NODE_ENV=production`. **Add `UPLOAD_DIR`/`MAX_FILE_SIZE` here too** if you rely on them, and ensure `/app/uploads` is writable by the `nextjs` user.

---

## 6. Third-Party Services / Tools

| Service / Tool | Purpose | Phase 2B status |
|----------------|---------|-----------------|
| **Prisma** (`@prisma/client` ^5.14.0) | ORM — schema already migrated; use for all CMS reads/writes | ✅ Installed |
| **bcryptjs** ^2.4.3 | Password hashing (12 rounds) | ✅ Installed |
| **jsonwebtoken** ^9.0.2 | JWT sign/verify for admin session | ✅ Installed |
| **next-intl** ^3.15.0 | Locale routing (`/en`, `/zh`) + `useTranslations` i18n | ✅ Installed |
| **next** ^14.2.0 / **react** ^18.3.0 | App framework (App Router, Server + Client components) | ✅ Installed |
| **@tiptap/react** | WYSIWYG editor base | ❌ **NOT installed — install in 2B** |
| **@tiptap/starter-kit** | Base TipTap extensions (customize to limited toolbar, TD-12) | ❌ **NOT installed — install in 2B** |
| **@tiptap/extension-link** | Link support in WYSIWYG | ❌ **NOT installed — install in 2B** |
| **@tailwindcss/typography** | `.prose` classes to render WYSIWYG HTML on public pages | ❌ **NOT installed — install in 2B** |
| **vitest** ^4.1.10 + **@testing-library/react** ^16.3.2 + **jsdom** | Test framework (Phase 2A infra) | ✅ Installed |
| **tsx** ^4.11.0 | Runs `scripts/*.ts` (CLI reset-password / backup) | ✅ Installed |
| **Nodemailer** ^6.9.13 | Email — **Phase 3 only**, ignore for 2B | ✅ Installed (unused) |

> **Installation (run once):**
> ```bash
> npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tailwindcss/typography
> ```
> Then add `require("@tailwindcss/typography")` to the `plugins` array in `tailwind.config.ts` (currently `plugins: []`). Verify `npm run build` picks up the new `.prose` utilities.

---
## 7. Known Constraints / Decisions Made

### 7.1 Product decisions (from PRD / grilling session) — binding

| # | Decision | Impact on 2B |
|----|----------|--------------|
| **D4** | One consistent limited WYSIWYG editor across all content types (TipTap) | Build/reuse a single `TipTapEditor` component; keep the toolbar identical everywhere. |
| **D8** | Independent publish toggle per locale | `PageContent` has per-row `isPublished`; the editor shows **two** toggles (EN/ZH). Public routes must honor the active locale's toggle (Pitfall §9.6). |
| **D2** | Header images are editable per page (file upload) | Image upload per page → `heroImage`; shown on the public page hero/banner. |
| **D14** | Director photos handled via WYSIWYG content (no separate photo field) | No photo field; images are just pasted into the editor's rich content. |
| **D11** | Policy/static PDFs pasted as links in WYSIWYG (no separate document manager) | Keep it that way — do not build a PDF manager in 2B. |
| **D13** | GA4 ID configurable in admin settings | `site_settings` global key; implemented this phase (2B.10). |
| **D3** | In-app password change (P0) + CLI reset | Implement `/api/auth/change-password` + verify `npm run reset-password` (2B.8, 2B.9). |
| Cancelled | **(was considered)** Director "4 categories" | No — PRD defines **2** categories on the Board page (Executive + Independent Non-Executive). Keep as Phase 2A built it. |

### 7.2 Technical decisions (from the phase plan) — recommended defaults

| # | Decision | Recommended option |
|---|---|---|
| **TD-12** | TipTap setup | `StarterKit`, keep only **bold, italic, paragraph, heading**; remove bulletList, blockquote, code. Add link extension. |
| **TD-13** | Image upload handling | API route at `/api/upload/image` that writes to `<UPLOAD_DIR>/images/` and returns a URL. |
| **TD-14** | File upload validation | **Both** client and server: type jpg/jpeg/png/svg/webp; size ≤5 MB (`MAX_FILE_SIZE`). |
| **TD-15** | Tab state management | URL search params `?tab=en` / `?tab=zh` (browser back/forward works, shareable). |
| **TD-16** | Auto-save vs manual save | Manual **Save** button; show an "Unsaved changes" indicator when the form is dirty; warn before switching tabs with unsaved edits. |
| **TD-17** | Unpublished page behavior | `notFound()` (404) is simplest and standard; missing locale falls back to the other locale where sensible. |

### 7.3 Non-negotiable engineering constraints

- **WYSIWYG output must be safe HTML** — verify TipTap's sanitisation and wrap public rendering in `.prose` (typography plugin) so it matches site styles.
- **WYSIWYG links:** external URLs should use `rel="noopener noreferrer"` (`target="_blank"`).
- **Store relative image paths in DB** — never absolute; build the absolute URL at render time from `NEXT_PUBLIC_SITE_URL` (Docker/dev/localhost differences).
- **Admin settings (GA4 ID, site name) are global** — `locale = NULL` in `site_settings`.
- **Never unpublish both locales accidentally** — confirm dialog + warning unless both locales would be unpublished.
- **`getPageData` returns plain object currently** — if it becomes `async`, every public page/component that imports it must `await` it.

---
## 8. Testing Requirements

### 8.1 Test framework (established in Phase 2A — reuse it)

- **vitest + @testing-library/react + jsdom** (see `vitest.config.ts`). Setup files: `src/test/setup.ts`, helpers `src/test/utils.tsx` (`renderWithLocale`).
- Run the suite with **`npm test`** (vitest run). Phase 2A ended at **93 passing tests** — do not break them.
- Follow the **`tdd` skill**: Red → Green, one test → one minimal implementation, **test at seams only**, commit each completed vertical slice.

### 8.2 Recommended seams to test in Phase 2B

| Seam | What to assert |
|------|----------------|
| `getPageData` / `page-content.ts` | Returns DB content for a known `{slug, locale}`; returns `null`/404 for unknown/absent locale; falls back correctly per published state. |
| Admin pages listing | Renders a row per page with per-locale published status and edit links. |
| Page editor | EN/ZH tabs; switching tabs preserves unsaved state; publishing one locale does not affect the other. |
| `TipTapEditor` | Toolbar exposes exactly: bold, italic, paragraph, heading, link — and nothing else. |
| `ImageUploader` / `/api/upload/image` | Rejects non-image types and `> MAX_FILE_SIZE`; stores under uploads root; returns a usable URL. |
| `/api/pages/[slug]` | `GET` returns content; unauthorised `PUT` → 401; `PUT` upserts `PageContent` for the locale. |
| `/api/settings` | `GET`/`PUT` round-trips `site_name` / `ga4_tracking_id` with `locale = NULL`. |
| `/api/auth/change-password` | Wrong current → 400/401; success re-hashes and logs the user out or keeps session as designed. |
| Public pages | After save, public page shows DB (non-placeholder) content; **unpublished locale → placeholder fallback (no 404)** (Tasks 21, 28). |

### 8.3 Acceptance checklist (from `docs/phase-2b-admin-cms-editor.md` §7.8)

> ✅ = implemented + covered by automated tests/code review. The final **manual browser pass** is tracked separately in §8.4.

- [x] Admin sees all 10 pages in the `/admin/pages` listing *(Task 17; seeds §3.4)*
- [x] Admin can open a page editor by clicking a page *(Task 18; editor route + test)*
- [x] Editor shows two tabs: EN and ZH *(LocaleTabs + PageEditor test)*
- [x] Switching tabs preserves unsaved content (client-side state) *(dirty-state drafts per locale; test)*
- [x] TipTap toolbar only shows: bold, italic, link, paragraph, heading *(TipTapEditor test)*
- [x] Can upload a header image; preview shown after upload *(ImageUploader + /api/upload/image tests)*
- [x] Can set meta title and meta description *(PageEditor fields → PUT persisted)*
- [x] Can toggle published/unpublished independently for EN and ZH *(D8; per-locale row upsert)*
- [x] Saving updates the `page_contents` table *(GET/PUT /api/pages/[slug] + upsertPageContent tests)*
- [x] Public page shows published content (not placeholder) *(DB-aware getPageData → pages.test)*
- [x] Unpublished locale shows placeholder content (not 404) — *revised behavior (Task 28): unpublished → `getPageData` falls back to the seeded placeholder*
- [x] Admin can change password in-app *(POST /api/auth/change-password + UI page + tests)*
- [x] Admin settings saves and retrieves the GA4 tracking ID *(/api/settings round-trip tests)*
- [x] Logo upload replaces the header logo *(/api/logo writes file `<Logo/>` loads — dev; see §8.4 gap note for prod)*

### 8.4 Full acceptance run (end of phase)

- [x] `npm test` (all existing + new pass) — **237 tests passing (55 files)**
- [x] `npm run lint` clean (except pre-existing Phase-1 warnings: `admin/setup` useEffect deps, `Logo` `<img>`) — verified
- [x] `npm run build` succeeds; all 10 public routes build — **exit 0** (after extracting route helper exports so Next.js route type-checks pass)
- [ ] **Manual browser pass through §8.3 at 320 / 768 / 1920 px** — *pending human QA on a running `npm run dev`; cannot be executed in the automated environment.*

**Phase 2B follow-up enhancements (Tasks 27–30, commits `3bae0c6` + `cd2afe6`):**
- **Key-value editor** for `corporate-details` (structured label/value table; WYSIWYG can't edit tables).
- **Shared paginated report editor** (`ReportsEditor`) for `financial-reports` / `esg-reports` / `corporate-communications` — date + document title + PDF upload (`/api/upload/pdf`) per locale; renders through the existing paginated `ReportsTable`.
- **`admin.settings` i18n bug fix** — renamed the settings-form namespace to `admin.settingsForm` so the nav label resolves (was leaking the key path).
- **Unpublished → placeholder fallback** revision (Task 28).

> **Known residual items (not blocking code delivery):**
> - **2B.9 CLI reset interactive run** — `scripts/reset-password.ts` uses `bcrypt.hash(password, 12)`, byte-compatible with the in-app `hashPassword` (`BCRYPT_ROUNDS=12`). Core logic interoperable; a full interactive `npm run reset-password` run should be confirmed manually in a real terminal (matches the Phase 1 note).
> - **Logo upload in production (standalone build)** — dev writes `public/logo.svg` (what <Logo/> loads at /logo.svg); production writes to <UPLOAD_DIR>/logo.svg served at /uploads/logo.svg, which is NOT currently the path <Logo/> renders. Logo replace is fully verified in dev; see the note below the Ready-to-Build summary for a production follow-up.
> - **GA4 analytics tag rendering** — out of 2B scope by design (PRD §13.x / Phase 4). 2B only makes the ID configurable; it is *not* yet injected on the public site.

---
## 9. Common Pitfalls to Avoid

These combine the pitfalls from `docs/phase-2b-admin-cms-editor.md` §7.10 **with code-grounded ones found during review of the actual Phase 1/2A codebase.**

1. **Making `getPageData` async without updating all callers.** `src/lib/pages.ts` is currently synchronous and imported by **all 10 public pages**, `ContentWithSidebar`, and `generateMetadata`. If it becomes async, **compile breaks across every page.** Do this as one intentional vertical slice (or keep it synchronous by pre-fetching).
2. **Trusting middleware for API auth.** `src/middleware.ts` **skips `/api`** (matcher and skip-list). Any CMS API without its own `getSession()` check is unauthenticated. Guard every `/api/upload`, `/api/pages`, `/api/settings`, `/api/auth/*` route.
3. **TipTap toolbar too complex.** Limit to **bold, italic, paragraph, heading, link**. InitStarterKit and strip bulletList/blockquote/code; otherwise non-technical admins get formatting chaos and the public layout breaks.
4. **Not sanitising WYSIWYG HTML.** `ContentWithSidebar` uses `dangerouslySetInnerHTML`. Rely on TipTap's sanitisation but verify; strip scripts/event handlers on save if needed.
5. **Storing absolute image URLs.** Save relative paths (e.g. `/uploads/images/x.jpg`) and build the full URL at render from `NEXT_PUBLIC_SITE_URL`. Absolute URLs break across dev/localhost/docker/domain changes (Pitfall #7 in the plan).
6. **Not checking publish state on the public route.** The public route must check the **current locale's `isPublished`**. If published → DB content; if a row exists but is unpublished → fall back to the seeded placeholder (revised in Task 28; no 404). Do not leak empty drafts.
7. **Admin settings leaking to one locale.** GA4 ID and site name are global (`locale = NULL` in `site_settings`). Reading a single locale row would wrongly scope them.
8. **Forgetting to seed `pages`.** The migration creates empty tables. Without the 10 `Page` rows, `/admin/pages` (2B.1) is empty and the editor can’t open (Pitfall #4 in the plan).
9. **`.prose` not styled because the Tailwind typography plugin isn’t registered.** `tailwind.config.ts` has `plugins: []`. Until `@tailwindcss/typography` is installed **and** added to `plugins`, rich HTML renders unstyled on public pages.
10. **Uploads not persisted / not reachable in Docker or production.** Keep uploads under `/uploads` (already a mapped volume in `docker-compose.yml`) and serve them publicly. With `output: "standalone"`, ensure static-file serving of `/uploads` works; otherwise use a route handler.
11. **Assuming one row holds both languages.** `page_contents` has **one row per locale** (`@@unique([pageId, locale])`). Save/upsert each locale separately; don’t overwrite EN when saving ZH.
12. **Client-only upload validation.** Always re-validate type/size on the server (`MAX_FILE_SIZE`), otherwise a crafted request stores arbitrary files.
13. **Losing edits on tab switch / leaving page.** Show an “Unsaved changes” indicator and warn before switching EN⇄ZH or navigating away (TD-15/TD-16).
14. **Building Phase 3 report management by mistake.** Do not add CRUD for `Report`/`Announcement` in 2B; that belongs to Phase 3. Keep those public pages on placeholders.

---
## 10. Links to Relevant PRD Sections

| Ref / Doc | Section / Content |
|-----------|-------------------|
| **PRD** `docs/PRD-visionvalues-revamp-v2.md` — §7.1 | Content Editing (CMS) Requirements — **CMS-01 … CMS-11** (the functional spec for 2B) |
| **PRD** §8.4 | Images — header banners editable per page; logo (**D16**); no sub-photos (**D12**) |
| **PRD** §9 | Data Model — `pages` slug naming, `page_contents` per-locale rows, editability |
| **PRD** §9.2–9.3 | `pages` and `page_contents` table specs (schema used in checklist §3) |
| **PRD** §10.1 | Admin Routes — `/admin/pages`, `/admin/pages/[slug]`, `/admin/settings`, `/admin/change-password` |
| **PRD** §14 | Grilling Decisions — D2, D3, D4, D8, D11, D13, D14 (binding, see §7.1) |
| **PRD** §16 | Risks — admin complexity, language inconsistency (simple UI + per-locale publish) |
| **Phase plan** `docs/phase-2b-admin-cms-editor.md` | Deliverables 2B.1–2B.12, decisions TD-12…TD-17, risks, context checklist |
| **2A handoff** `docs/phrase-2a-checklists.md` | Prior handoff — same structure; app setup, styling tokens, nav order |
| **2A impl** `docs/phase-2a-implementation.md` | What shipped in 2A (test counts, page templates, iframe/reports decisions) |
| **2A tasklist** `docs/phase-2a-tasklist.md` | Task breakdown + decisions (sidebar-on-home, vitest choice) |

---

## Ready-to-Build Summary (quick checklist)

> All items marked `[x]` below are **already implemented** in Phase 2B (see §8.3 §8.4 and `docs/phase-2b-tasklist.md` for commit references).

- [x] `npm install` + TipTap & typography packages (§1.2, §6); register typography plugin (§6) — Task 1
- [x] Seed the 10 `pages` rows (§3.4) — Task 4
- [x] Add `UPLOAD_DIR` / `MAX_FILE_SIZE` to `.env` (and `docker-compose.yml` if used) (§5) — Task 2
- [x] Build `/api/pages` + `/api/pages/[slug]` (GET/PUT) with `getSession()` guard (§9.2) — Tasks 9–10
- [x] Build `/api/upload/image` with client+server validation (§7.2 TD-13/14) — Task 11
- [x] Build `/api/settings`, `/api/auth/change-password` (§4.2) — Tasks 12–13
- [x] Build `/admin/pages` listing + `/admin/pages/[slug]` editor (TipTap, LocaleTabs, ImageUploader) (§2.3) — Tasks 17–18
- [x] Build `/admin/settings` + `/admin/change-password` UI; extend `AdminNav` (§2.1) — Tasks 19–20
- [x] Wire `getPageData`/`page-content.ts` to the DB (async-aware) and update all 10 public pages (§2.2, §9.1) — Tasks 21–22
- [x] Honor per-locale `isPublished` → placeholder fallback on public routes (§3.3, §9.6, revised Task 28)
- [x] Logo upload replaces `public/logo.svg` (§2.3) — Task 19 (dev-verified; prod follow-up noted in §8.4)
- [x] Run full acceptance: tests, lint, build, manual pass (§8.3–§8.4) — Tasks 26 (§8.4: manual browser pass pending human QA)

---

> **Production logo follow-up (from §8.4):** `Logo.tsx` renders `/logo.svg`. In dev, `/api/logo` overwrites `public/logo.svg` so the header updates. In a standalone prod build only build-time `public/` assets are served at `/logo.svg`, while the upload is written to `<UPLOAD_DIR>/logo.svg` (→ `/uploads/logo.svg`). To make logo replacement work in production, route `Logo.tsx` to read the uploaded logo (e.g. serve `/logo.svg` from a small dynamic handler or have the header load the stored upload path). Not required for the 2B dev/acceptance flow.

---

*End of Phase 2B Handoff Checklist — prepared from PRD v2.1, `docs/phase-2b-admin-cms-editor.md`, and a full code review of the Phase 1/2A codebase. Does not replace or modify the original `docs/phase-2b-admin-cms-editor.md`.*
