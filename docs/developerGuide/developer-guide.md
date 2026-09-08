# VVH Website Revamp — Developer Guide

> **Project:** Vision Values Holdings Limited (HKEX: 862) — corporate website revamp
> **Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Prisma (SQLite) · next-intl · TipTap · Vitest · Docker
> **Repo:** https://github.com/simon617/vvh (branch `phase-2b`)
> **Docs:** `docs/` contains the phase plans (PRD, phase-1…phase-4), checklists, task lists and this guide.
> **Tests:** 53 test files / **232 tests passing** · `npm run lint` clean (2 pre-existing warnings) · `npm run build` exit 0

---

## 1. What This Document Is

This is the **orientation guide** for any developer who needs to work on this codebase. It explains:

1. The **purpose of every folder** and what files belong where (for future enhancement/modification).
2. The **purpose of each file** and how files **link to one another**.
3. The **data flow** through the app (DB → server → page → client → API → DB).
4. **Important conventions / rules / gotchas** that a developer must know before changing code.

---

## 2. High-Level Architecture

```
┌─────────────────────────────┐
│  next-intl middleware        │  src/middleware.ts
│  - locale routing /en /zh    │  - sets x-pathname header
│  - guards /admin (JWT cookie)│
└──────────────┬──────────────┘
               ▼
┌────────────────────────────────────────────┐
│  App Router  src/app                        │
│  Root layout (font + globals.css)           │
│  └─ [locale]/layout.tsx  (public shell:     │
│       Header, Sidebar, Footer)              │
│     ├─ page.tsx  + 10 public page routes    │
│     │   (server components, DB-driven)      │
│     └─ admin/layout.tsx  (auth + AdminNav)  │
│         ├─ admin/pages, [slug], settings,   │
│         │  change-password, dashboard       │
│  └─ api/*   (REST endpoints, JWT-guarded)   │
│  └─ uploads/[...path]  (serves UPLOAD_DIR)  │
└──────────────┬──────────────┘
               ▼
┌────────────────────────────────────────────┐
│  Data layer  src/lib                        │
│  - pure helpers: navigation, placeholders,  │
│    directors, key-value, report-rows        │
│  - server-only DB access: page-content,     │
│    site-settings, auth, pages               │
│  - singleton Prisma client  src/lib/prisma   │
└──────────────┬──────────────┘
               ▼
┌────────────────────────────────────────────┐
│  Database  prisma/schema.prisma (SQLite)    │
│  AdminUser · Page · PageContent · Report ·  │
│  Announcement · SiteSetting                 │
└────────────────────────────────────────────┘
```

### Core data flow (public page render)

1. Browser requests `/en/financial-reports`.
2. `src/middleware.ts` runs next-intl middleware (locale), sets `x-pathname`, passes through.
3. `src/app/[locale]/financial-reports/page.tsx` (server component) calls
   `getPageData("financial-reports", locale)` from `src/lib/pages.ts`.
4. `pages.ts` loads the placeholder (from `src/lib/placeholders.ts`) as a fallback, then reads the
   `PageContent` row via `src/lib/page-content.ts` (→ Prisma).
   - Published row → DB content (`isDbContent: true`).
   - No row / unpublished → placeholder (`isDbContent: false`).
5. The page renders a layout component (`TemplateShell`, `ReportsTable`, `HomeTemplate`, …) with that data.
6. `generateMetadata()` (same module) exposes SEO from the DB/placeholder.

### Core data flow (admin edit)

1. Admin saves in `PageEditor` (or `KeyValueEditor`/`ReportsEditor`) → `PUT /api/pages/[slug]`.
2. The route (`src/app/api/pages/[slug]/route.ts`) checks `getSession()` (JWT), validates the body
   (`src/lib/page-content-validation.ts`), and calls `upsertPageContent` (`src/lib/page-content.ts`).
3. Row is upserted for that `(pageId, locale)` — EN and ZH are independent rows.
4. Public pages now render the saved content (step 3 of previous flow).

---

## 3. Directory Map — What Goes Where

### 3.1 Top-level folders

| Path | Purpose | What to put there / rules |
|------|---------|---------------------------|
| `src/` | All application source code. | Everything except DB migrations, ops scripts and docs. |
| `docs/` | PRD, phase plans, checklists, task lists, developer guide. | Update task lists when you change code (see §9.5). |
| `prisma/` | Database schema, migrations, seed. | Schema changes → new migration via `npm run db:migrate`. |
| `scripts/` | One-off Node/TS operational scripts (CLI). | Run with `tsx`. Do not import Next.js server-only modules here. |
| `messages/` | i18n translation files (`en.json`, `zh.json`). | Add a key to BOTH files whenever you add a new label. |
| `public/` | Build-time static assets served as-is (e.g. `/logo.svg`). | Logos, favicons, static PDFs you want bundled at build time. |
| `uploads/` | Runtime-uploaded files (images, report PDFs). **Not** served by Next static — served by the `/uploads/[...path]` route handler. | Header images, logos, report PDFs. Mirrored into Docker volume. |
| `.github/` | Skills / repo conventions used by agents. | Read `.github/skills/tdd` + `nextjs-developer` before adding feature code. |
| `backups/` | Created at runtime by `npm run backup`. | Ignore in git. |

### 3.2 `src/app` — routes (App Router)

| Path | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — loads global font + `globals.css`. |
| `src/app/globals.css` | Tailwind base/components/utilities + custom component classes (`.director-cards`, buttons). |
| `src/app/not-found.tsx` | Global 404 page. |
| `src/app/[locale]/` | Everything locale-scoped lives here. Public routes: `page.tsx` (home) + 9 section pages. |
| `src/app/[locale]/layout.tsx` | Public shell — Header, Sidebar, Footer, `NextIntlClientProvider`. |
| `src/app/[locale]/admin/` | Admin area (see §4.6). |
| `src/app/api/*` | REST endpoints (see §4.5). Auth-protected individually with `getSession()`. |
| `src/app/uploads/[...path]/route.ts` | Serves files from `UPLOAD_DIR`, path-traversal guarded. |

**Rule:** new public pages go under `src/app/[locale]/<slug>/` as Server Components by default.
**Rule:** `/api` and `/uploads` are **not** locale-prefixed.
### 3.3 `src/components` — reusable UI

| Path | Purpose | Put here |
|------|---------|----------|
| `src/components/layout/` | Public-site layout/presentation components (Header, Footer, Sidebar, TemplateShell, HomeTemplate, ReportsTable, DirectorCards, Breadcrumb, ContactForm, Logo, LanguageSwitcher, MobileMenu*, ContentWithSidebar). | Components rendered on the **public** site inside the `[locale]` layout. |
| `src/components/admin/` | CMS editor/form components (PageEditor, TipTapEditor, KeyValueEditor, ReportsEditor, LocaleTabs, ImageUploader, SettingsForm). | Components rendered inside the **admin** layout. |

**Rule:** client components start with `"use client"`. Server components (async functions) stay default.

### 3.4 `src/lib` — data access & pure helpers

| File | Kind | Purpose | Links to |
|------|------|---------|----------|
| `prisma.ts` | singleton | Global Prisma client. | Imported by every DB-access lib + routes + seed. |
| `auth.ts` | server | JWT + bcrypt: `getSession`, `hashPassword`, `comparePassword`, `adminExists`, `createAdminUser`, `validateAdmin`, `changePassword`. | Auth routes, admin layout, dashboard. |
| `page-content.ts` | server | CRUD for `Page`/`PageContent`: `getPageContent`, `getPageBySlug`, `upsertPageContent`, `listPagesWithContent`, `getRecentPageActivity`. | Public `getPageData`, `/api/pages*`, admin pages listing + dashboard. |
| `page-content-validation.ts` | pure | Validates PUT body shape. Kept **out** of the route (Next requires route files to export only HTTP handlers). | `/api/pages/[slug]`. |
| `site-settings.ts` | server | Global settings (`getSiteSetting`, `setSiteSetting`, `getSiteSettings`). | `/api/settings`, admin settings page. |
| `pages.ts` | server | `getPageData(slug, locale)` → `PagePlaceholder` with DB/placeholder resolution + `isDbContent`. | Every public page. |
| `placeholders.ts` | pure | Static default content for all 10 pages × 2 locales (the "until migrated" fallback) — **single source** for default content. The 3 report pages' default rows are stored here as a JSON report envelope (via `buildReportContent`). | `pages.ts`, seed, tests. |
| `navigation.ts` | pure | `NAV_SLUGS`, nav groups, labels (DRY source-of-truth for slugs). | All layouts, placeholders, seed. |
| `announcements.ts` | pure | HKEX Datalink iframe URL builder. | Announcements page. |
| `directors.ts` | pure | Director names/titles/categories/bios (fallback data). | Board page (fallback) + seed (→ CMS cards). |
| `breadcrumbs.ts` | pure | Breadcrumb item resolution. | `Breadcrumb` component. |
| `key-value.ts` | pure | Parse/build the `<table>` HTML used by the **corporate-details** key-value editor. | `KeyValueEditor`, tests. |
| `report-rows.ts` | pure | JSON envelope (`{"__type":"reports","rows":[...]}`) stored in `contentHtml` for report pages; parse/serialize. | `placeholders.ts` (builds placeholder envelope), `ReportsEditor`, report public pages, seed. |
| `uploads.ts` | pure | Upload validation/path helpers (images + documents), `resolveUploadPath`, `sanitizeFilename`, `getUploadUrl`. | Upload routes, `/uploads` serving, `logo.ts`. |
| `logo.ts` | pure | Logo file-path + write helpers. | `/api/logo`, tests. |

**Rule:** `src/lib` modules that touch `prisma`/`next/headers` are **server-only** — never import them
into a client component; call `/api` instead. Pure modules (no server imports) are safe anywhere.

### 3.5 `src/test` — test utilities

| File | Purpose |
|------|---------|
| `setup.ts` | Vitest global setup (`jest-dom` matchers). |
| `utils.tsx` | `renderWithLocale()` — wraps a component in `NextIntlClientProvider` with EN or ZH messages. Use this in all component tests that use i18n. |
| `smoke.test.tsx` | Verifies the test harness works. |

### 3.6 `src` misc

| File | Purpose |
|------|---------|
| `i18n.ts` | next-intl config: locales `['en','zh']`, loads `messages/<locale>.json`. |
| `middleware.ts` | next-intl middleware + admin JWT cookie guard + `x-pathname` header. |
| `global.d.ts` | CSS module type shim. |

### 3.7 Config / root files

| File | Purpose |
|------|---------|
| `next.config.js` | next-intl plugin, `output: "standalone"`, images unoptimized. |
| `package.json` | Scripts + Prisma seed config. See §6. |
| `tsconfig.json` | `@/*` → `src/*` path alias. Always import via `@/...`, never relative for cross-folder. |
| `tailwind.config.ts` | Tailwind theme + `@tailwindcss/typography` plugin (used by `.prose`). |
| `vitest.config.ts` | Vitest config (jsdom, react plugin, alias, include `src/**/*.test.{ts,tsx}`). |
| `.env` / `.env.example` | Environment variables (see §7). |
| `docker-compose.yml` / `Dockerfile` | Containerized production-like setup with SQLite + uploads volumes. |
---

## 4. Routes, Public Pages, Admin, API — File-by-File

### 4.1 Internationalization & middleware

- **`src/i18n.ts`** — declares `locales = ['en', 'zh']`, `defaultLocale = 'en'`. Loads the matching
  `messages/<locale>.json`. Any unknown locale → `notFound()`.
- **`src/middleware.ts`** — 
  1. Skips `_next`, `api`, `images`, `favicon.ico`, any path with a dot.
  2. For `/admin/*` (after stripping the locale prefix): allows `login` & `setup`; otherwise requires the
     JWT cookie `token` (presence check only), else redirects to `/{locale}/admin/login?redirect=...`.
  3. Runs next-intl locale middleware for everything else.
  4. Adds the **`x-pathname`** header so server components can read the original path (used by
     `Breadcrumb` and the admin layout's auth-page detection).
  - ⚠️ **The middleware does NOT validate the JWT** and does NOT run for `/api/*`. Every API route must
    call `getSession()` itself.

### 4.2 Public pages (`src/app/[locale]/`)

Each public page is an async Server Component that:
1. Exports `generateMetadata()` (SEO from `getPageData`).
2. Calls `getPageData(slug, locale)`; `notFound()` when `null` (unknown slug).
3. Renders a layout component with the resolved data.

| Page | route | Renders |
|------|-------|---------|
| Home | `page.tsx` | `HomeTemplate` (hero + metrics + reports sections). |
| Board of Directors | `board-of-directors/` | `TemplateShell` + `DirectorCards` (fallback) OR raw CMS content rendered as `.director-cards` grid when DB content present. |
| Corporate Details | `corporate-details/` | `ContentWithSidebar` (renders `contentHtml` — a key/value table when edited via CMS). |
| Corporate Governance | `corporate-governance/` | `ContentWithSidebar` (rich text + PDF links). |
| Lost Share Certificates | `lost-share-certificates/` | `ContentWithSidebar`. |
| Announcements | `announcements/` | `TemplateShell` + Datalink iframe (`getAnnouncementsUrl`). |
| Financial Reports | `financial-reports/` | `TemplateShell` + `ReportsTable` (rows via `getReportRows` from DB or placeholder envelope). |
| ESG Reports | `esg-reports/` | `TemplateShell` + `ReportsTable`. |
| Corporate Communications | `corporate-communications/` | `TemplateShell` + `ReportsTable`. |
| Contact | `contact/` | `TemplateShell` + `ContactForm`. |

> **Note:** report pages keep their i18n-hook usage inside a private sync `*View` component because
> `useTranslations` can only run while rendering (inside the provider). The async page fetches data,
> then returns `<View ...>` which calls `useTranslations` during render.
### 4.3 Public layout/presentation components (`src/components/layout/`)

| File | Purpose | Links |
|------|---------|-------|
| `Header.tsx` | Top header (Logo + LanguageSwitcher + MobileMenuToggle). | `[locale]/layout.tsx`. |
| `Footer.tsx` | Footer with copyright (i18n). | `[locale]/layout.tsx`. |
| `Sidebar.tsx` | Left nav (client, uses `getNavGroups`). | `[locale]/layout.tsx`. |
| `Logo.tsx` | Renders `/logo.svg`; custodian of the "logo path" contract. | Header; `/api/logo` writes the file it loads. |
| `LanguageSwitcher.tsx` | EN⇄ZH toggle. | Header. |
| `MobileMenuToggle.tsx` / `MobileMenu.tsx` | Mobile nav hamburger + panel. | Header. |
| `TemplateShell.tsx` | Inner-page hero (image or gradient) + breadcrumb + children. | Most public pages. |
| `HomeTemplate.tsx` | Home hero + key metrics + latest reports section. | `/en`. |
| `ContentWithSidebar.tsx` | Rich-text page shell (hero + breadcrumb + content). Reads `getPageData`; renders `contentHtml`. | corporate/governance/lost-share pages. |
| `ReportsTable.tsx` | Sortable + paginated Date/Document table (client). | The 3 report pages. |
| `DirectorCards.tsx` | Interactive director card grid (client, expandable bios) — **fallback** before CMS content exists. | Board page (only when `isDbContent === false`). |
| `Breadcrumb.tsx` | Breadcrumb from `x-pathname` + `getBreadcrumbItems`. | TemplateShell/ContentWithSidebar. |
| `ContactForm.tsx` | Contact form UI (submit is Phase 3). | Contact page. |

### 4.4 Admin components (`src/components/admin/`)

| File | Purpose | Links |
|------|---------|-------|
| `PageEditor.tsx` | Bilingual editor page controller. Holds EN/ZH drafts, dirty state, publish toggles, Save (PUT). **Chooses the content editor per slug** via `PAGE_EDITOR_TYPES` (`wysiwyg` | `keyvalue` | `reports`). | Admin `pages/[slug]` page; renders the editors below. |
| `TipTapEditor.tsx` | Limited WYSIWYG (bold/italic/paragraph/heading/link; link auto `rel=noopener` `target=_blank`). | `PageEditor` (default). |
| `KeyValueEditor.tsx` | Row editor (Label/Value) that reads/writes the `<table>` HTML via `key-value.ts`. | `PageEditor` for `corporate-details`. |
| `ReportsEditor.tsx` | Row editor (Date/Document/PDF upload) using `report-rows.ts`; uploads via `/api/upload/pdf`. | `PageEditor` for the 3 report pages. |
| `LocaleTabs.tsx` | EN/ZH tab switch via `?tab=en|zh` URL param (with unsaved-changes guard). | `PageEditor`. |
| `ImageUploader.tsx` | File picker + client validation + preview; POST to a configurable endpoint. | `PageEditor` (hero), `SettingsForm` (logo). |
| `SettingsForm.tsx` | Admin settings form (site_name, GA4, logo). Uses i18n namespace `admin.settingsForm`. | `/admin/settings` page. |
### 4.5 API routes (`src/app/api/`)

All API routes must call `getSession()` themselves (middleware does not cover `/api/*`).

| Route | File | Method(s) | Purpose |
|-------|------|-----------|---------|
| `/api/auth/login` | `auth/login/route.ts` | POST | Validates credentials, sets `token` httpOnly cookie (24h). |
| `/api/auth/logout` | `auth/logout/route.ts` | POST | Clears the cookie. |
| `/api/auth/me` | `auth/me/route.ts` | GET | Returns the current session user. |
| `/api/auth/setup` | `auth/setup/route.ts` | POST/HEAD | First-run admin account creation (409 if exists). |
| `/api/auth/change-password` | `auth/change-password/route.ts` | POST | Verifies current password, writes new bcrypt hash. |
| `/api/pages` | `pages/route.ts` | GET | Lists pages (+ per-locale status) for the admin listing. |
| `/api/pages/[slug]` | `pages/[slug]/route.ts` | GET/PUT | Read / upsert page content for one slug. Body validated by `page-content-validation.ts`. |
| `/api/settings` | `settings/route.ts` | GET/PUT | Reads / saves global `site_name`, `ga4_tracking_id` (locale `null`). |
| `/api/logo` | `logo/route.ts` | POST | Replaces the site logo (writes via `src/lib/logo.ts`). |
| `/api/upload/image` | `upload/image/route.ts` | POST | Header/hero image → `UPLOAD_DIR/images/`. |
| `/api/upload/pdf` | `upload/pdf/route.ts` | POST | Report document → `UPLOAD_DIR/reports/<locale>/`. |
| `/uploads/[...path]` | `uploads/[...path]/route.ts` | GET | Serves uploaded files (MIME map incl. `application/pdf`; path-traversal guarded). |

> **Next.js route-module rule:** a `route.ts` may only export HTTP handler functions
> (`GET/POST/PUT/…`). Any helper must live in `src/lib` (e.g. `logo.ts`, `page-content-validation.ts`,
> `uploads.ts`). The build type-checks this and fails otherwise.

### 4.6 Admin routes (`src/app/[locale]/admin/`)

| Route | File | Purpose |
|-------|------|---------|
| `/admin/layout.tsx` | `layout.tsx` | Auth shell: reads session, redirects to login when absent, renders `AdminNav`. Login/setup render standalone. |
| `/admin` (dashboard) | `page.tsx` | Overview counts + recent activity (`listPagesWithContent`, `getRecentPageActivity`). |
| `/admin/pages` | `pages/page.tsx` | Table of all pages with per-locale published status + Edit links. |
| `/admin/pages/[slug]` | `pages/[slug]/page.tsx` | Loads EN+ZH rows → `<PageEditor/>`. Unknown slug → `notFound()`. |
| `/admin/settings` | `settings/page.tsx` | Loads site settings → `<SettingsForm/>`. |
| `/admin/change-password` | `change-password/page.tsx` | In-app password change form. |
| `/admin/login` | `login/page.tsx` | Login form (public). |
| `/admin/setup` | `setup/page.tsx` | First-run account creation (public). |
---

## 5. Database (Prisma + SQLite)

### 5.1 Schema (`prisma/schema.prisma`)

| Model | Purpose | Notes |
|-------|---------|-------|
| `AdminUser` | Admin accounts. | Password = bcrypt hash (12 rounds). |
| `Page` | One row per public page slug. | `slug` unique; `menuOrder` controls admin-listing order; `isVisible`. |
| `PageContent` | Per-page × per-locale content. | **One row per `(pageId, locale)`** (`@@unique([pageId, locale])`). Fields: `title`, `metaTitle`, `metaDescription`, `heroImage`, `contentHtml`, `breadcrumbLabel`, `isPublished`. |
| `Report` | Financial/ESG report metadata. | **NOT USED (TD-30 Option A)** — reports live in `contentHtml` JSON envelope (`report-rows.ts`). Reserved; candidate for removal. |
| `Announcement` | Announcement metadata. | **NOT USED (TD-30 Option A)** — announcements use the Datalink iframe. Reserved; candidate for removal. |
| `SiteSetting` | Global key/value settings. | `key` unique; `locale` nullable — global settings have `locale = NULL`. |

### 5.2 Seed (`prisma/seed.ts`) + `src/lib` helpers

- `prisma/seed.ts` upserts:
  - the **10 `Page` rows** (slugs come from `src/lib/navigation.ts` `NAV_SLUGS`), and
  - **20 `PageContent` rows** (10 pages × `en`/`zh`) using the placeholder content, custom builders for:
    - `board-of-directors` → director-card HTML (`directorCardsHtml`),
    - `corporate-governance` → governance PDF-link HTML (`governanceHtml`),
    - `financial-reports` / `esg-reports` / `corporate-communications` → report JSON envelope
      (`buildReportContent`).
- Re-running the seed is **idempotent** (`upsert`).

### 5.3 Data files

- SQLite file: `prisma/data/vvh.db` (`DATABASE_URL="file:./data/vvh.db"`).
- Migrations live in `prisma/migrations/`.

---

## 6. Commands (`package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Local dev server. |
| `build` | `next build` | Production build. |
| `start` | `next start` | Serve production build. |
| `lint` | `next lint` | ESLint. |
| `test` | `vitest run` | Run all tests. |
| `test:watch` | `vitest` | Watch mode. |
| `db:migrate` | `prisma migrate dev` | Create/apply migrations. |
| `db:push` | `prisma db push` | Push schema without migration file (dev). |
| `db:studio` | `prisma studio` | Browser DB viewer. |
| `seed` / `content:migrate` | `prisma db seed` | Runs `prisma/seed.ts` (idempotent). |
| `postinstall` | `prisma generate` | Auto-generates Prisma client on install. |
| `backup` | `tsx scripts/backup.ts` | Archives SQLite + uploads. |
| `reset-password` | `tsx scripts/reset-password.ts` | CLI admin password reset (bcrypt 12 rounds — compat with in-app change). |
---

## 7. Environment Variables

| Var | Used by | Purpose |
|-----|---------|---------|
| `DATABASE_URL` | Prisma | SQLite file path (`file:./data/vvh.db`). |
| `JWT_SECRET` | `src/lib/auth.ts` | Signs/verifies admin session tokens. |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/uploads.ts` (`getUploadUrl`) | Builds absolute upload URLs. |
| `UPLOAD_DIR` | upload helpers/routes | Uploads root (default `./uploads`). |
| `MAX_FILE_SIZE` | upload helpers | Image upload limit (default 5 MB). |
| `MAX_DOC_SIZE` | upload helpers | Report/document upload limit (default 50 MB). |
| `SMTP_HOST`/`SMTP_PORT`/`SMTP_RECIPIENT` | (future contact form) | Phase 3. |
| `LOGO_FILE_PATH` | `src/lib/logo.ts` | Test-only override for logo writes. |

---

## 8. Testing Conventions

- Framework: **Vitest** + Testing Library (`jest-dom`). Config in `vitest.config.ts` (jsdom, `@` → `src`).
- Test files live **next to the code** (`*.test.ts` / `*.test.tsx`) — this is a deliberate pattern.
- **Use `renderWithLocale(ui, "en"|"zh")`** (from `src/test/utils.tsx`) for any component that calls
  `useTranslations`; it wraps in `NextIntlClientProvider` with the real `messages/*.json`.
- **Server-component tests:** `await Component({ params: ... })` to resolve the JSX, then render it,
  e.g. `renderWithLocale(await BoardOfDirectorsPage({ params: { locale: "en" } }))`.
  Mock `getPageData` (`@/lib/pages`) via `vi.mock` + `vi.hoisted`.
- **Route tests** use `next/server` `NextRequest`.
- **Database boundary:** mock `@/lib/page-content` / `@/lib/auth` / Prisma at the module seam —
  never hit a real SQLite DB in unit tests (`src/lib/pages.test.ts`, `page-content.test.ts`, etc. are
  examples).
- **Run:** `npm test` (full), or `npx vitest run <path>` for a subset.
---

## 9. Conventions, Rules & Gotchas (read before touching code)

1. **Server vs Client components.** Public pages and data access stay server-side. Only add
   `"use client"` where interactivity is genuinely needed (editor forms, tabs, expand/collapse,
   table sorting, upload pickers). Server-only libs (`auth`, `page-content`, `site-settings`,
   `pages`) must never be imported into client components — call `/api` instead.

2. **Route modules export only HTTP handlers.** A `route.ts` that exports a helper function breaks
   `next build` (Next type-checks all exports). Put helpers in `src/lib` (see `logo.ts`,
   `page-content-validation.ts`, `uploads.ts`).

3. **Locale routing.** Everything user-facing is under `[locale]` (`/en/...`, `/zh/...`). `api` and
   `uploads` are not locale-prefixed. `generateMetadata` must be async because it awaits `getPageData`.

4. **`useTranslations` timing.** Server components can call `useTranslations` only while rendering
   inside the provider. That's why report pages split into an async data wrapper + a sync `*View`
   component (see §4.2 note). Message keys must exist in **both** `messages/en.json` and
   `messages/zh.json`, or `t()` returns the key name literally.

5. **i18n namespace collisions.** Namespaces inside `admin` must not overlap with nav-label strings.
   (The `admin.settings` label was once clobbered by the settings-form key — fixed by renaming the
   form namespace to `admin.settingsForm`.) Keep one namespace per top-level purpose.

6. **`getPageData` resolution** (`src/lib/pages.ts`): published DB row → DB content
   (`isDbContent: true`); missing row **or unpublished** → placeholder (`isDbContent: false`). There is
   **no 404 for unpublished locales** — the seeded placeholder is shown instead. (This intentionally
   overrides the earlier D8 404 behavior.)

7. **Content format by page type.** The CMS editor is chosen by `PAGE_EDITOR_TYPES` in `PageEditor.tsx`:
   - default → **WYSIWYG** (`TipTapEditor`) — paragraphs/headings/bold/italic/links; tables are NOT supported.
   - `corporate-details` → **key/value** (`KeyValueEditor`) — stores `<table>` HTML (`key-value.ts`).
   - `financial-reports`/`esg-reports`/`corporate-communications` → **reports** (`ReportsEditor`) —
     stores a JSON envelope (`report-rows.ts`) consumed by `ReportsTable` on the public page.
   When adding a new structured page, register its slug here and add a matching public render path.
8. **Uploads must stay relative.** Store `/uploads/...` paths in the DB; construct absolute URLs at
   render time (`getUploadUrl`). `uploads/` are served by the `/uploads` route handler (not `public/`),
   so runtime uploads survive `output: "standalone"` and the Docker volume.

9. **Logo contract.** `Logo.tsx` loads `/logo.svg`. In dev, `/api/logo` overwrites `public/logo.svg`;
   in a standalone prod build it writes to `UPLOAD_DIR/logo.svg` (served at `/uploads/logo.svg`) —
   which `Logo.tsx` does **not** currently load. A production follow-up is documented in the
   phase-2b checklist if logo replacement is needed in prod.

10. **Admin security.** Middleware only checks cookie presence for `/admin/*` and skips `/api`
    entirely — every API route calls `getSession()` and returns 401 when absent. Keep this pattern
    for new endpoints.

11. **PDFs / reports.** Public reports come from `page_contents.contentHtml` — a JSON report
    envelope read by `getReportRows()` (`src/lib/report-rows.ts`). The default rows live in
    `placeholders.ts` (the single static-content source) as an envelope too. The `Report`/`Announcement`
    tables are **NOT USED** (TD-30 Option A): announcements render the Datalink iframe; reports stay in
    the envelope. Within the CMS: D11 — policy PDFs are pasted as WYSIWYG links; D6 — files live
    under `uploads/reports/<locale>/`.

12. **Slug sync.** When adding a page, keep slugs in sync across `navigation.ts` (nav source of truth),
    `placeholders.ts` (fallback content), and `prisma/seed.ts` (seed). They share `NAV_SLUGS`.

13. **Tests to keep green.** Target the current count on `npm test` (53 files / 232 tests);
    `npm run lint` should be clean apart from the two pre-existing Phase-1 warnings
    (`admin/setup` useEffect deps, `Logo` `<img>`); `npm run build` exits 0.

14. **Docs discipline.** Every code change is expected to update `docs/phase-2b-tasklist.md`
    (Files Modified + commit) so the work is traceable. Phase plans/checklists should stay in sync
    with behaviors (e.g. unpublished→placeholder).

---

*End of VVH Developer Guide. See also `docs/phase-2b-tasklist.md` (work log / file trace) and the
phase docs for the history and rationale behind the current architecture.*