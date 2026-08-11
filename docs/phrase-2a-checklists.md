# Phase 2A — Page Templates & Public Site — Handoff Checklist

> **Project:** Vision Values Holdings Limited — Website Revamp  
> **Phase:** 2A — Page Templates & Public Site  
> **Duration:** 1 week  
> **Complexity:** High  
> **Dependencies:** Phase 1 (Foundation & Infrastructure) — ✅ COMPLETE  
> **Status:** Phase 1 implementation finished; document prepared for Phase 2A development

---

## 1. Setup Instructions

### 1.1 Prerequisites

- **Node.js 18+** (LTS)
- **npm** (bundled with Node)
- *(Optional)* **Docker Desktop** — for production-like container testing

### 1.2 Fresh Clone Setup

```bash
# 1. Clone the repository
git clone https://github.com/simon617/vvh.git
cd vvh

# 2. Install dependencies
#    NOTE: postinstall automatically runs `prisma generate`
npm install

# 3. Create environment file
cp .env.example .env

# 4. Generate a JWT secret and add it to .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#    → copy the output into JWT_SECRET in .env

# 5. Verify database migration state (schema already migrated in Phase 1)
npx prisma migrate status
#    If migrations are pending: npx prisma migrate dev

# 6. Start the development server
npm run dev
```

### 1.3 Existing Project Setup (already cloned)

```bash
cd vvh
npm install          # if node_modules missing
npx prisma generate  # if Prisma client out of date
npm run dev
```

### 1.4 URLs to Verify After Startup

| Locale | Home | Sample Inner Page |
|--------|------|-------------------|
| English | `http://localhost:3000/en/` | `http://localhost:3000/en/board-of-directors` |
| Chinese | `http://localhost:3000/zh/` | `http://localhost:3000/zh/board-of-directors` |

### 1.5 Docker (Production-Like) Setup

```bash
docker-compose up -d --build
# App available at http://localhost:3000
# SQLite data persists in `sqlite-data` volume
# Uploads persist in `uploads` volume
```

> ⚠️ **Known limitation:** `docker-compose up -d` was NOT verified in Phase 1 because Docker Desktop engine was not running on the dev machine. If Docker is available, verify this before Phase 2A work begins (or after — do not let it block template development).

---

## 2. Key Files & Their Purpose

### 2.1 Already Implemented in Phase 1 (REUSE — do not recreate)

| File | Purpose | Notes for Phase 2A |
|------|---------|-------------------|
| `src/app/[locale]/layout.tsx` | Locale layout wiring Header + Sidebar + Footer around `<main>` | ⚠️ **IMPORTANT:** Sidebar is rendered on ALL routes including Home. PRD Section 8.1 says Home should NOT have a sidebar. Decide: conditionally hide Sidebar on home route (check `x-pathname` header or use layout groups), or accept sidebar on home. |
| `src/app/layout.tsx` | Root layout (html/body + Inter font) | Not locale-aware; fine as-is |
| `src/components/layout/Header.tsx` | Deep Navy header with Logo (left) + LanguageSwitcher + MobileMenuToggle (right) | Height `h-20`. Already responsive. |
| `src/components/layout/Footer.tsx` | Deep Navy footer with copyright + Contact Us link | ⚠️ Copyright text is HARDCODED English — `t("footer.copyright")` exists in messages but unused. Fix for i18n parity. Contact link uses `/${locale}/contact`. |
| `src/components/layout/Sidebar.tsx` | Left sidebar (desktop only, `hidden md:block`, `w-64`) with grouped nav + active-state highlighting | **Already implements the full 4-group nav from PRD Section 2.3** and highlights current page. Can be refactored into `SidebarNav.tsx` per plan, or reused directly. |
| `src/components/layout/MobileMenu.tsx` | Full-screen slide-in overlay menu (`md:hidden`) with dark overlay + slide-in panel from right | ⚠️ "Menu" text and close button `aria-label` are HARDCODED English — use `useTranslations`. Already has all 10 nav items. Link clicks call `onClose`. |
| `src/components/layout/MobileMenuToggle.tsx` | Hamburger button (`md:hidden`) that opens MobileMenu via `useState` | Client component. Already works. |
| `src/components/layout/Logo.tsx` | Links to `/${locale}` and renders `/logo.svg` | - |
| `src/components/layout/LanguageSwitcher.tsx` | Client component; swaps `/{locale}` prefix in pathname using `useParams().locale` + `usePathname()` | ⚠️ **Known bug from Phase 1:** reported behavior inverted (deferred by user). Verify EN↔ZH switching preserves the current page for new Phase 2A routes. |
| `src/middleware.ts` | next-intl routing + admin auth guard | Sets `x-pathname` header. Skips `_next`, `api`, `images`, files with `.`. Admin routes require `token` cookie except login/setup. |
| `src/i18n.ts` | next-intl `getRequestConfig`; locales `["en", "zh"]`; default `"en"`; uses modern `requestLocale` pattern (NOT deprecated `locale` param) | - |
| `src/lib/auth.ts` | JWT sign/verify, bcrypt (cost 12), session helpers, admin CRUD | Phase 1 – unchanged |
| `src/lib/prisma.ts` | Prisma client singleton | - |
| `src/app/[locale]/admin/...` | All admin routes (login, setup, dashboard placeholder, layout with `AdminNav`) | Phase 1 – unchanged in 2A |
| `messages/en.json` / `messages/zh.json` | next-intl translations: `nav`, `header`, `footer`, `admin` namespaces | Add new UI strings for templates (breadcrumbs, section titles, table headers, form labels) here — NEVER hardcode in components |
| `tailwind.config.ts` | Brand color tokens: `primary` (Deep Navy `#1B2A4A`), `secondary` (Warm Red `#9B1B30`), `accent` (Gold `#C9A94E`), `sidebar` (Steel Blue `#4B6CB7`), `background`, `text`, `border` | Use these tokens — do NOT hardcode hex values in components |
| `next.config.js` | `output: "standalone"` (Docker), `images.unoptimized: true`, next-intl plugin pointing at `./src/i18n.ts` | - |
| `docker-compose.yml` | App + `sqlite-data` volume + `uploads` volume, restart `unless-stopped` | - |
| `Dockerfile` | Multi-stage Node 18+ build | - |
| `public/logo.svg` | Recreated SVG logo (Decision D16) | - |
| `scripts/backup.ts` / `scripts/reset-password.ts` | `npm run backup`, `npm run reset-password` | Phase 1 – unchanged |
| `package.json` | Scripts: `dev`, `build`, `start`, `lint`, `db:migrate`, `db:push`, `db:studio`, `postinstall` (prisma generate), `backup`, `reset-password` | - |

### 2.2 To Be Created in Phase 2A

| File | Purpose |
|------|---------|
| `src/app/[locale]/board-of-directors/page.tsx` | Board of Directors page (director cards) |
| `src/app/[locale]/corporate-details/page.tsx` | Corporate Details page (structured data table) |
| `src/app/[locale]/corporate-governance/page.tsx` | Corporate Governance page (rich text) |
| `src/app/[locale]/announcements/page.tsx` | Announcements page (HKEX-linked table, static placeholders) |
| `src/app/[locale]/financial-reports/page.tsx` | Financial Reports page (sortable table, static placeholders) |
| `src/app/[locale]/esg-reports/page.tsx` | ESG Reports page (sortable table, static placeholders) |
| `src/app/[locale]/lost-share-certificates/page.tsx` | Lost Share Certificates page (rich text) |
| `src/app/[locale]/corporate-communications/page.tsx` | Corporate Communications page (rich text) |
| `src/app/[locale]/contact/page.tsx` | Contact Us page (form UI only — backend in Phase 3) |
| `src/components/layout/ContentWithSidebar.tsx` | Shared layout: header image + breadcrumb + sidebar + content area (used by 8 of 10 pages) |
| `src/components/layout/DirectorCards.tsx` | Director card grid (2-col tablet, 1-col mobile, expandable bios) |
| `src/components/layout/ReportsTable.tsx` | Sortable reports table (horizontal scroll on mobile) |
| `src/components/layout/Breadcrumb.tsx` | Breadcrumb navigation component (WEB-03) |
| `src/lib/navigation.ts` | Navigation structure (menu items, slugs, labels) — centralize constants |
| `src/lib/placeholders.ts` | Placeholder content per page × locale (use real content from PRD Section 2.2 where available) |
| `src/lib/breadcrumbs.ts` | Pure `getBreadcrumbs(pathname, locale)` → `{label, href}[]` (Home → group → page) |
| `src/lib/pages.ts` | Data-fetching layer: `getPageData(slug, locale)` returns page props; initially from `placeholders.ts`, designed for Phase 2B DB swap |
| `src/app/[locale]/page.tsx` | **EXISTING Home template — needs enhancement** to match PRD 8.1 (hero banner + intro + key metrics + latest reports). Currently a simplified static version. |

> **⚠️ Important:** The Home page (`src/app/[locale]/page.tsx`) **already exists** from Phase 1 with hero + intro + metrics + latest-reports sections. Enhance it rather than recreate.

---

## 3. Database Schema Details

**Phase 2A uses hardcoded/static data.** The tables below exist and are migrated, but the frontend does NOT query them yet (CMS connection is Phase 2B). However, the schema defines constraints that the template slugs must respect.

### 3.1 `pages`

```
id          Int      @id @default(autoincrement())
slug        String   @unique            ← MUST match URL slugs (e.g., "board-of-directors")
menuOrder   Int      @default(0)        ← Determines sidebar ordering (Phase 2B)
parentSlug  String?                     ← Hierarchical nav (e.g., announcements under Investor Relations)
isVisible   Boolean  @default(true)
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
contents    PageContent[]
```

### 3.2 `page_contents`

```
id               Int      @id @default(autoincrement())
pageId           Int      (FK → pages.id, onDelete: Cascade)
locale           String   ('en' | 'zh')
isPublished      Boolean  @default(true)   ← Independent publish per locale (D8) — Phase 2B
title            String   (H1 heading)
metaTitle        String?
metaDescription  String?
heroImage        String?  (file path — Phase 2B upload)
contentHtml      String?  (WYSIWYG HTML — Phase 2B TipTap)
breadcrumbLabel  String?  (used for breadcrumb display)
updatedAt        DateTime @updatedAt
@@unique([pageId, locale])
```

### 3.3 `reports`

```
id          Int      @id @default(autoincrement())
category    String   ('financial' | 'esg')
locale      String   ('en' | 'zh')
title       String
yearPeriod  String?  (e.g., '2025', '2025 Interim')
description String?
filePath    String   (PDF path — uploads in Phase 3)
fileSize    Int?
isVisible   Boolean  @default(true)
sortOrder   Int      @default(0)
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt
```

### 3.4 `announcements`

```
id               Int      @id @default(autoincrement())
locale           String
title            String   (auto-fetched, editable fallback — Phase 3)
externalUrl      String   (HKEX link)
announcementDate DateTime?
isVisible        Boolean  @default(true)
sortOrder        Int      @default(0)
createdAt        DateTime @default(now())
updatedAt        DateTime @updatedAt
```

### 3.5 `admin_users` & `site_settings`

```
AdminUser: id, username (unique), password (bcrypt hash), role (default "admin"), createdAt
SiteSetting: id, key (unique), value, locale (nullable — NULL = applies to both)
```

### 3.6 Schema Notes

- **CamelCase field names in code** — Prisma maps to snake_case in SQLite. Use the camelCase names exactly (e.g., `menuOrder`, NOT `menu_order`).
- `contact_messages` table was **removed** per Decision D7 (email-only contact form, no DB storage).
- `DATABASE_URL="file:./data/vvh.db"` — SQLite file lives at `prisma/data/vvh.db`.
- Migrations live in `prisma/migrations/` — use `npx prisma migrate dev` for changes, NOT `db push` (D15).

---

## 4. Authentication Flow

### 4.1 Public Pages (Phase 2A scope)

- **No authentication required** — all public routes at `/en/*` and `/zh/*` must render without login.
- Middleware does NOT check auth on public routes (only paths containing `/admin`).

### 4.2 Admin Flow (from Phase 1 — unchanged in 2A)

```
1. First run: no admin user exists → /admin/setup → create account → redirect /admin/login
2. Login: POST /api/auth/login → validate via bcrypt → JWT signed (24h expiry)
           → set HTTP-only cookie "token" (httpOnly, sameSite=lax, secure in prod)
3. Admin routes: middleware checks token exists → AdminLayout server-side calls getSession()
           → if no valid session → redirect /{locale}/admin/login
4. Logout: POST /api/auth/logout → clears cookie
```

### 4.3 Key Auth Facts

| Fact | Value |
|------|-------|
| JWT payload | `{ userId, username, role }` |
| Session expiry | 24 hours (`SESSION_EXPIRY = "24h"`) |
| Bcrypt cost | 12 (`BCRYPT_ROUNDS`) |
| Cookie name | `token` |
| Cookie flags | `httpOnly: true`, `sameSite: "lax"`, `secure` only in production, `path: "/"` |
| Middleware exception paths | `/admin/login`, `/admin/setup` (no auth required) |
| `x-pathname` header | Set by middleware; used by `AdminLayout` to detect auth pages & by server components to know the original pathname |

### 4.4 Relevant Auth Files

- `src/middleware.ts` — route protection + i18n routing
- `src/lib/auth.ts` — JWT/bcrypt/session helpers
- `src/app/[locale]/admin/layout.tsx` — server-side session guard + `AdminNav`

---

## 5. Environment Variables

### 5.1 Full List (from `.env.example`)

| Variable | Required | Description | Used In |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | `file:./data/vvh.db` (SQLite path) | Prisma |
| `JWT_SECRET` | Yes | Random 64-char hex (generate with crypto.randomBytes) | Auth (Phase 1) |
| `SMTP_HOST` | No | Company SMTP server IP (IP-based auth, no credentials — D10) | **Phase 3** (contact form) |
| `SMTP_PORT` | No | SMTP port (default 25) | **Phase 3** |
| `SMTP_RECIPIENT` | No | Destination email for contact form | **Phase 3** |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://www.visionvalues.com.hk` | Future SEO/sitemap (Phase 4) |

### 5.2 Phase 2A Notes

- **No new environment variables are needed for Phase 2A.**
- ⚠️ `JWT_SECRET` has a **fallback** in `src/lib/auth.ts` (`"fallback-secret-change-me"`) — NEVER deploy with the fallback; always set a real secret in `.env`.
- `.gitignore` excludes `.env` — use `.env.example` for documentation.
- Docker: `docker-compose.yml` passes env vars through; `JWT_SECRET` must be in your shell environment or `.env` when running `docker-compose up`.

---

## 6. Third-Party Services / Tools

### 6.1 Runtime Dependencies (all self-hosted — no cloud services)

| Package | Version | Purpose | Phase |
|---------|---------|---------|-------|
| `next` | ^14.2.0 | Framework (App Router, SSR/SSG) | All |
| `react` / `react-dom` | ^18.3.0 | UI | All |
| `@prisma/client` | ^5.14.0 | ORM (SQLite) | All |
| `next-intl` | ^3.15.0 | i18n routing + translations | All |
| `jsonwebtoken` | ^9.0.2 | JWT sessions | Phase 1 |
| `bcryptjs` | ^2.4.3 | Password hashing | Phase 1 |
| `nodemailer` | ^6.9.13 | SMTP contact form | Phase 3 |
| `archiver` | ^7.0.1 | Backup zip | Phase 1 |

### 6.2 Dev / Tooling

| Tool | Purpose |
|------|---------|
| `prisma studio` (`npm run db:studio`) | Visual DB inspection |
| `tsx` | Run TS scripts (backup, reset-password) |
| Tailwind CSS | Styling (v3.4, config in `tailwind.config.ts`) |
| Docker Desktop | Container testing (pending verification) |
| **vitest** + **@testing-library/react** + **jsdom** | Test framework for TDD (confirmed decision — see §8.3) |

### 6.3 External Web Services

- **None** — per PRD objective: self-hosted, no cloud dependency.
- Content sources for placeholders: PRD Section 2.2 content inventory (real text from live site).

---

## 7. Known Constraints / Decisions Already Made

### 7.1 Grilling Decisions (PRD Section 14) — Impact on Phase 2A

| # | Decision | Phase 2A Impact |
|---|----------|-----------------|
| D2 | Header images editable | Use placeholder images now; CMS upload in Phase 2B. Place a hero image area on every template. |
| D6 | Financial/ESG PDFs copied from old server | No action in 2A (templates only — static placeholder rows) |
| D7 | Contact form email-only, no DB | Build form UI with validation messages (EN+ZH) but no backend submission in 2A |
| D8 | Independent publish toggle per locale | Schema field exists; UI comes in Phase 2B. Templates must plan for both locales. |
| D9 | Docker compose deployment | Docker pending verification |
| D10 | SMTP IP-based auth, no credentials | Phase 3 |
| D11 | Policy/static PDFs pasted as WYSIWYG links | **No PDF component needed in templates** |
| D12 | Decorative sub-photos removed | **No sub-photo placeholders.** Layout is CSS-only. |
| D13 | GA4 ID in admin settings; auto sitemap + OG tags | Phase 4 |
| D14 | Director photos optional via WYSIWYG | **No separate photo field in DirectorCards.** Bio text only. |
| D15 | Manual backup; Prisma migrations | Use `npm run backup`; never `db push` for schema changes |
| D16 | Logo as SVG | Done in Phase 1 (`public/logo.svg`) |

### 7.2 Design Constraints (PRD Section 8.3 & 8.2)

- **Color tokens** (use Tailwind classes — `text-primary`, `bg-secondary`, `border-accent`, etc.):
  - Primary: Deep Navy `#1B2A4A`
  - Secondary: Warm Red `#9B1B30`
  - Accent: Gold `#C9A94E`
  - Background: White `#FFFFFF` / Light Grey `#F5F6F8`
  - Text: Dark Charcoal `#2D2D2D`
  - Borders: Mid Grey `#D1D5DB`
  - Sidebar headers: Steel Blue `#4B6CB7` (added in Phase 1)
- **Touch targets**: minimum 44×44px for all interactive elements.
- **Mobile**: single-column, full-width images, slide-in overlay menu, tables horizontally scroll (`overflow-x: auto`).
- **Bilingual parity**: identical layout quality for EN (Latin, compact) and ZH (CJK — can be more compact per line but longer strings overall). **Sidebar section headers** already use `locale === "en" ? "text-xs" : "text-sm"` — follow this pattern for CJK font sizing.

### 7.3 Carried-Over Known Issues from Phase 1

| Issue | Status | Impact |
|-------|--------|--------|
| Language switcher behavior reported inverted (EN/ZH toggle) | Deferred by user per phrase-1-implementation.md | Verify on every new Phase 2A page |
| `docker-compose up -d` not verified | Docker Desktop not running at Phase 1 | Test if Docker available |
| `npm run reset-password` interactive run pending | Core logic verified via automated test | Manual verify in real terminal |
| MobileMenu "Menu" text + close `aria-label` hardcoded English | Needs i18n fix | Should use `t()` from `nav`/`header` namespace |
| **Sidebar on Home** | ✅ **Decision (confirmed): KEEP sidebar on Home** — no hiding | Sidebar renders on all routes including `/en/` and `/zh/` home |

### 7.4 Template Type Mapping (PRD Section 8.1)

| Template | Pages | Key Layout Elements |
|----------|-------|---------------------|
| Home | `/`, `/en/`, `/zh/` | Hero banner + company intro + key metrics + latest reports (NO sidebar) |
| Content with Sidebar | corporate-governance, lost-share-certificates, corporate-communications | Header image + breadcrumb + left nav + rich text |
| Reports Table | financial-reports, esg-reports | Header image + breadcrumb + left nav + sortable/filterable table |
| Announcements | announcements | Header image + breadcrumb + left nav + HKEX-linked table |
| Contact | contact | Header image + breadcrumb + left nav + contact form |
| Directors | board-of-directors | Header image + breadcrumb + left nav + director cards |
| Blank/Text | corporate-details (data table variant) | Header image + breadcrumb + left nav + structured table |

---

## 8. Testing Requirements

### 8.1 Phase 2A Acceptance Tests

- [ ] All 10 pages render at `/en/*` AND `/zh/*` URLs (no 404, no layout breakage)
- [ ] Each page has correct header image area, breadcrumb, sidebar, and content
- [ ] Breadcrumb shows correct hierarchy per page (e.g., Home → Investor Relations → Financial Reports)
- [ ] Sidebar shows all pages grouped by category (Corporate Information / Corporate Governance / Investor Relations / Contact Us)
- [ ] Current page is highlighted in sidebar (active state)
- [ ] Hamburger menu appears on mobile (< 768px) and is hidden on desktop (≥ 768px)
- [ ] Hamburger menu slides in/out on tap; overlay closes on tap outside; close button works
- [ ] Language switcher toggles EN ↔ ZH **preserving the current page** (e.g., `/en/financial-reports` → `/zh/financial-reports`)
- [ ] All pages render correctly at **320px, 768px, 1920px** widths
- [ ] Tables horizontally scroll on mobile (no overflow cutoff, no page break)
- [ ] Director cards: correct grid (1-col mobile, 2-col tablet, 3+ col desktop)
- [ ] Director bios expandable/collapsible on mobile
- [ ] All touch targets ≥ 44×44px
- [ ] Contact form renders with EN + ZH labels and validation messages (form NOT submitted in 2A)
- [ ] 404 page from Phase 1 still works for unknown locale/routes

### 8.2 Regression Tests (Phase 1 must still pass)

- [ ] Admin setup flow creates user and redirects to login
- [ ] Login with valid credentials returns JWT cookie
- [ ] Login with invalid credentials shows error
- [ ] Protected admin routes redirect to login when unauthenticated
- [ ] JWT cookie cleared on logout
- [ ] Base layout renders correctly on mobile (320px) and desktop (1920px)
- [ ] SVG logo renders correctly in header
- [ ] `npm run backup` creates valid archive
- [ ] `npm run reset-password` updates password in DB (manual verify in real terminal)

### 8.3 i18n Testing

- [ ] Every new UI string added to BOTH `messages/en.json` and `messages/zh.json` — no hardcoded English in components
- [ ] Chinese text renders correctly at all breakpoints (no overflow, no clipping)
- [ ] Breadcrumb labels localized per current locale

> **Test framework decision (confirmed):** Use **vitest + @testing-library/react + jsdom** for TDD. Test seams agreed: navigation, placeholders, breadcrumbs, pages.ts, Breadcrumb, DirectorCards, ReportsTable, page templates. See `docs/phase-2a-tasklist.md` for the full task breakdown.

---

## 9. Common Pitfalls to Avoid

### 9.1 Pitfalls Identified in Phase 2A Planning Doc

1. **Building templates in isolation without testing on mobile** — Test each template at 320px immediately after creating it.
2. **Forgetting Chinese text length differences** — CJK text is often more compact per character but can be longer in total. Test both locales at every breakpoint.
3. **Hardcoding navigation URLs** — Always prefix with the locale from route params (e.g., `` href={`/${locale}/financial-reports`} ``). NEVER hardcode `/en/`.
4. **Sidebar not reflecting current route** — Ensure active-state comparison handles both `/${locale}` and `/${locale}/slug` paths. The existing `Sidebar.tsx` handles this via `pathname === item.href` — preserve this when refactoring.
5. **Breadcrumb showing wrong locale labels** — Breadcrumb labels must come from current locale (use `t()` or a `[locale]`-keyed data file, NOT from English-only constants).
6. **Not handling 404 for missing locale pages** — Both locales must have all 10 pages. If one locale is missing a page, render a clear 404 or redirect to the other locale.

### 9.2 New Pitfalls Found During Code Review

7. **Sidebar renders on Home** — `src/app/[locale]/layout.tsx` wraps ALL routes (including `/en/` home) with the Sidebar. **✅ RESOLVED (confirmed decision): sidebar stays on Home.** No hiding logic needed. PRD Section 8.1's "no sidebar" for Home is intentionally overridden by this decision.

8. **Hardcoded strings in existing components** — `MobileMenu.tsx` header ("Menu"), its close `aria-label`, and `Footer.tsx` copyright text are hardcoded English despite `t()` translations being available. Fix these for i18n parity (add keys to `messages/*.json` and use `useTranslations`).

9. **MobileMenu layout on wide screens** — MobileMenu panel uses `max-w-sm` with `fixed inset-y-0 right-0` — verify it reads well in Chinese (`max-w-sm` = 384px may truncate long ZH labels like 環境、社會及管治報告; consider `w-full` with padding or slightly wider panel).

10. **Server vs Client component boundaries** — Public page templates should be **Server Components by default** (they render static/placeholder content). Only add `"use client"` where interactivity is needed (director bio expand/collapse, table sorting, form validation). Remember `useTranslations` works in server components via `getTranslations()` from `next-intl/server`, or pass locale as prop.

11. **`x-pathname` header dependency** — Server components that need the original pathname must read `headers().get("x-pathname")` (set by middleware). This is how `Sidebar.tsx` could detect home — but note `Sidebar.tsx` is currently a client component using `usePathname()`, which also works.

12. **Don't use deprecated Next.js APIs** — Phase 1 intentionally uses the `requestLocale` pattern (next-intl v3.22+). Do NOT introduce `params.locale` in server components for i18n — use `getTranslations({ locale })` / locale from params only for URL prefixing. Follow the existing `Header locale={locale}` / `Sidebar locale={locale}` prop-passing pattern.

13. **CSS-only placeholder images** — For header image areas, use CSS gradient/background placeholders (e.g., `bg-gradient-to-br from-primary to-primary/80`) — do NOT add decorative `<img>` sub-photos (D12). Header hero image upload comes in Phase 2B.

14. **Preparing for CMS connection (Phase 2B)** — Even though 2A uses static data, structure placeholder content in `src/lib/placeholders.ts` keyed by `{ slug, locale }` so swapping to DB-driven content in 2B is mechanical. The page components should accept data via props from a single data-fetching layer (e.g., a `getPageData(slug, locale)` function in `src/lib/pages.ts`) rather than hardcoding markup inside each page file.

15. **`Title`/`metadata` consistency** — Each page should export `generateMetadata` (or static `metadata`) with a localized page title. Root `layout.tsx` already has default metadata. Phase 2A is a good time to wire per-page metadata from `placeholders.ts`.

---

## 10. Links to Relevant PRD Sections

| PRD Section | Content | Phase 2A Relevance |
|-------------|---------|--------------------|
| Section 2.1 | Page Inventory (all 10 pages + URLs) | Exact slugs for routes: `/en/board-of-directors`, `/en/corporate-details`, `/en/corporate-governance`, `/en/announcements`, `/en/financial-reports`, `/en/esg-reports`, `/en/lost-share-certificates`, `/en/corporate-communications`, `/en/contact` |
| Section 2.2 | Content Detail Per Page (EN + ZH text) | **Source for placeholder content** — use real text where available |
| Section 2.3 | Navigation Structure (sidebar grouping) | Sidebar/mobile menu structure — **already implemented in `Sidebar.tsx` and `MobileMenu.tsx`** |
| Section 7.4 | Public Website Requirements (WEB-01…WEB-04) | WEB-01 (10 pages render), WEB-02 (hamburger), WEB-03 (breadcrumb), WEB-04 (language switcher) |
| Section 8.1 | Template Types (7 templates) | Each page's layout blueprint |
| Section 8.2 | Mobile Behavior | Hamburger overlay, single-column, table scroll, 44×44px touch targets, director card grid |
| Section 8.3 | Color Palette | Tailwind tokens (already configured in `tailwind.config.ts`) |
| Section 8.4 | Images | Logo (D16 done), header banners (placeholder now, CMS in 2B), no sub-photos (D12) |
| Section 9 | Data Model | Schema constraints for future CMS; `pages.slug` naming convention |
| Section 11 | Public Page URL Structure | Route naming: `/${locale}/{slug}` scheme; old ASP redirects are Phase 4 |
| Section 14 | Grilling Decisions (D2, D7, D8, D11, D12, D14) | Constraint source for templates (see Section 7.1 above) |

---

## Appendix A: Phase 2A Deliverable Checklist (From Phase 2A Planning)

| # | Deliverable | Status |
|---|-------------|--------|
| 2A.1 | Home page template (hero + intro + metrics + latest reports) | ⬜ Enhance existing `page.tsx` |
| 2A.2 | Board of Directors template (director cards) | ⬜ Create |
| 2A.3 | Corporate Details template (data table) | ⬜ Create |
| 2A.4 | Corporate Governance template (rich text) | ⬜ Create |
| 2A.5 | Announcements template (HKEX-linked table) | ⬜ Create |
| 2A.6 | Financial Reports template (sortable table) | ⬜ Create |
| 2A.7 | ESG Reports template (sortable table) | ⬜ Create |
| 2A.8 | Lost Share Certificates template (rich text) | ⬜ Create |
| 2A.9 | Corporate Communications template (rich text) | ⬜ Create |
| 2A.10 | Contact Us template (static form UI) | ⬜ Create |
| 2A.11 | Breadcrumb navigation (WEB-03) | ⬜ Create `Breadcrumb.tsx` |
| 2A.12 | Mobile hamburger menu (WEB-02) | ✅ **Already done in Phase 1** — verify + i18n fix |
| 2A.13 | Sidebar navigation (grouped) | ✅ **Already done in Phase 1** — verify + decide Home behavior |

## Appendix B: Quick Reference — Route Slug ↔ Template ↔ PRD Page Name

| Route (after `/{locale}`) | Template Type | PRD Page # | PRD Name |
|---------------------------|---------------|------------|----------|
| `/` | Home | 1 | Home |
| `/board-of-directors` | Directors | 2 | Board of Directors |
| `/corporate-details` | Blank/Text (data table) | 3 | Corporate Details |
| `/corporate-governance` | Content with Sidebar | 4 | Corporate Governance |
| `/announcements` | Announcements | 5 | Announcements & Circulars |
| `/financial-reports` | Reports Table | 6 | Financial Reports |
| `/esg-reports` | Reports Table | 7 | ESG Reports |
| `/lost-share-certificates` | Content with Sidebar | 8 | Lost Share Certificates |
| `/corporate-communications` | Content with Sidebar | 9 | Corporate Communications |
| `/contact` | Contact | 10 | Contact Us |

---

*End of Phase 2A Handoff Checklist — prepared from PRD v2.1, Phase 1 docs, and full code review of the implemented Phase 1 codebase.*