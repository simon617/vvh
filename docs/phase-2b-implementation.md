# Phase 2B — Admin CMS Editor — Implementation Plan

> **Project:** Vision Values Holdings Limited — Website Revamp
> **Phase:** 2B — Admin CMS Editor
> **Status:** ✅ **COMPLETE** — all 26 tasks executed (plus follow-up Tasks 27–30) ; review confirms **239 tests passing**, lint clean (2 pre-existing Phase-1 warnings), `npm run build` exit 0.
> **Duration:** 1 week · **Complexity:** High
> **Companion docs:**
> - `docs/phase-2b-checklist.md` — **handoff checklist (source of truth for this plan)**
> - `docs/phase-2b-admin-cms-editor.md` — phase plan (deliverables 2B.1–2B.12, decisions TD-12…TD-17)
> - `docs/PRD-visionvalues-revamp-v2.md` — PRD v2.1 (§7.1 CMS, §8.4 images, §9 data model, §10.1 admin routes, §14 decisions)
> - `docs/phase-2a-tasklist.md` / `docs/phase-2a-page-templates-public-site.md` — prior phase's plan/structure (this doc mirrors its task format)

**Skills applied (per this repo's `.github/skills`):**
> - `tdd` — every coding task is a **red → green vertical slice**: one test, one minimal implementation, test at **pre-agreed seams only**, never against internals, never horizontal slices.
> - `nextjs-developer` — follow App Router conventions held by this codebase (`src/app` route groups, `[locale]` prefix, Server Components for DB reads, Client Components at interactivity boundaries, `generateMetadata` for SEO, unoptimized image strategy already configured).

---

## 1. Confirmed Decisions (from review)

These are binding before coding. Both the checklist and the phase plan (§5 / §7) require them; the plan below encodes them.

| # | Decision | Value | Where it lands |
|---|----------|-------|----------------|
| **D2** | Header images editable per page as file upload | Uploaded to `<UPLOAD_DIR>/images/`, stored **relative** in `PageContent.heroImage` | Phase B (Task 8), Phase C (Task 11), Phase D (Tasks 16, 18) |
| **D3** | In-app password change (P0) + CLI reset (already exists, verify) | `POST /api/auth/change-password`; re-run `npm run reset-password` | Phase C (Task 13), Phase G |
| **D4** | One consistent limited WYSIWYG editor for all content types (TipTap) | Single `TipTapEditor` client component; toolbar = **bold, italic, paragraph, heading, link only** | Phase D (Task 15) |
| **D8** | Independent publish toggle per locale (default pages all published) | Per-locale `is_published`; **two** toggles in the editor; `notFound()` 404 on public route when a locale is unpublished | Phase D (Task 18), Phase E (Task 21) |
| **D11** | Policy/static PDFs pasted as links in WYSIWYG (no separate document manager) | TipTap link button only; no PDF management UI in 2B | Phase D (Task 15) |
| **D13** | GA4 ID configurable in admin settings | `site_settings` global key (`locale = NULL`) | Phase B (Task 6), Phase C (Task 12), Phase D (Task 19) |
| **D14** | Director photos via WYSIWYG content (no separate photo field) | Images pasted into rich text; no director-photo field | Phase D (Task 15) |
| **Scope** | Reports / Announcements / Contact submit stay **Phase 3** | No CRUD for `Report`/`Announcement`; keep those public pages on placeholders | All phases (see §2) |

### 1.1 Technical decisions (from checklist §7.2 — recommended defaults)

| # | Decision | Recommended option |
|---|---|---|
| TD-12 | TipTap setup | StarterKit, keep bold, italic, paragraph, heading; strip bulletList, blockquote, code from the StarterKit. Add link extension. |
| TD-13 | Image upload handling | `/api/upload/image` → writes to `<UPLOAD_DIR>/images/`, returns URL |
| TD-14 | Upload validation | **Both** client and server: jpg/jpeg/png/svg/webp, size ≤ `MAX_FILE_SIZE` (default 5242880) |
| TD-15 | Locale tab state management | URL search params: `?tab=en` / `?tab=zh` (shareable, back/forward works) |
| TD-16 | Save model | Manual **Save**; "Unsaved changes" indicator when dirty; warn before switching tabs/leaving |
| TD-17 | Unpublished page behavior | `notFound()` (404); missing locale falls back to the other locale where sensible |

### 1.2 Test seams & framework (agreed up front)

- **Framework (Phase 2A, reused):** vitest + @testing-library/react + jsdom. Run suite with **`npm test`**. Do not break the existing **93 passing** Phase 2A tests.
- **Seams under test for 2B (public boundaries only):** `src/lib/page-content.ts`, `src/lib/site-settings.ts`, `src/lib/uploads.ts`, auth `changePassword`, TipTap/editor render seams, ImageUploader + `/api/upload/image`, `/api/pages/*`, `/api/settings`, `/api/auth/change-password`, and the DB-aware `getPageData`. Full seam table in §3.
- **Mock only at system boundaries** (per `mocking.md`): the Prisma client at the DB boundary (or an in-memory/local SQLite test DB), the filesystem in upload tests, and `next/headers` / `getSession` where unavoidable. **Never mock our own components/modules.**
---

## 2. Scope & Deliverable Map

Every checklist deliverable (2B.1 … 2B.12) is covered by at least one task. Tasks are vertical slices — each leaves the app buildable and the suite green.

| Deliverable | Covered by task(s) |
|-------------|---------------------|
| 2B.1 Admin pages listing `/admin/pages` | Tasks 14 (nav link), 17 (listing page) |
| 2B.2 Page editor `/admin/pages/[slug]` (EN/ZH tabs) | Tasks 15, 16, 18 |
| 2B.3 TipTap WYSIWYG (limited toolbar) | Tasks 1, 15 |
| 2B.4 Header image upload + logo upload | Tasks 8 (uploads helper), 11 (API), 16 (ImageUploader), 18 (editor), 19 (logo) |
| 2B.5 SEO fields per locale | Tasks 18 (editor), 22 (metadata render) |
| 2B.6 Independent publish toggles per locale | Tasks 18 (editor), 21 (public 404) |
| 2B.7 Logo upload replaces `public/logo.svg` | Task 19 |
| 2B.8 In-app password change | Tasks 7 (lib), 13 (API), 20 (UI) |
| 2B.9 CLI reset works with CMS admin flow | Phase G (Task 26 verify) |
| 2B.10 Admin settings (GA4 ID, site name) | Tasks 6 (lib), 12 (API), 19 (UI) |
| 2B.11 Admin dashboard `/{locale}/admin` | Task 23 |
| 2B.12 Public pages read from `page_contents` | Phase E (Tasks 21–22) |

> **Explicitly out of 2B scope:** `reports` / `announcement` table CRUD, report/PDF management UI, contact form email sending (all Phase 3). Financial/ESG/communications/announcements public pages stay on their Phase 2A data layers / iframe during 2B (see checklist §2.4 and the scope note in §2 above).

---

## 3. Seams Under Test

Agreed before coding (per the `tdd` skill, no test is written at an unconfirmed seam). Each seam is a public boundary of a module or route the tests reach into.

| Seam | Module / route | Behavior asserted |
|------|----------------|-------------------|
| `page-content` lib | `src/lib/page-content.ts` | `getPageContent(slug, locale)` returns row or null; `upsertPageContent(...)` creates-on-miss / updates-on-hit (one row per locale); `listPagesWithContent()` returns all 10 slugs with per-locale published flags |
| `site-settings` lib | `src/lib/site-settings.ts` | `getSetting(key)` (global, `locale=NULL`), `setSetting(key, value)` round-trip |
| `uploads` lib | `src/lib/uploads.ts` | `sanitizeFilename`, `assertAllowedImage(name)` (type + max size), `getUploadUrl(relativePath)` builds absolute URL from `NEXT_PUBLIC_SITE_URL` |
| auth `changePassword` | `src/lib/auth.ts` | wrong current → reject; weak/mismatch new → reject; success re-hashes and persists |
| `GET/PUT /api/pages/[slug]` | `src/app/api/pages/[slug]/route.ts` | unauth → 401; GET returns content; PUT upserts only the target locale |
| `GET /api/pages` | `src/app/api/pages/route.ts` | list shape with per-locale status |
| `POST /api/upload/image` | `src/app/api/upload/image/route.ts` | rejects wrong type / oversize; writes under uploads; returns URL |
| `GET/PUT /api/settings` | `src/app/api/settings/route.ts` | unauth → 401; round-trips site_name / ga4_tracking_id |
| `POST /api/auth/change-password` | `src/app/api/auth/change-password/route.ts` | requires session; verifies current; re-hashes new |
| `TipTapEditor` | `src/components/admin/TipTapEditor.tsx` | toolbar exposes exactly bold / italic / paragraph / heading / link (no others) |
| `LocaleTabs` | `src/components/admin/LocaleTabs.tsx` | tab state from `?tab=` param; preserves edits across switches |
| `ImageUploader` | `src/components/admin/ImageUploader.tsx` | validates client-side; shows preview + errors |
| Public read seam | `src/lib/pages.ts` (DB-aware `getPageData`) | known slug returns DB row; unknown slug → null; unpublished current locale → null/**404**; fallback to other locale where design says so |
---

## 4. Task Breakdown (vertical slices)

### Phase A — Infrastructure & Seed (no product behavior yet)

#### Task 1: Install TipTap + typography, register Tailwind plugin
- **Files:** `package.json` (add deps), `tailwind.config.ts` (`plugins: []` → add `@tailwindcss/typography`), `package-lock.json`
- **Install:** `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tailwindcss/typography`
- **Acceptance:** `npm test` (existing 93) still passes; `npm run build` succeeds; `.prose` utility available in Tailwind build.
- **TDD note:** infrastructure — verify with the existing suite + a build, not a new test file.

#### Task 2: Upload env configuration
- **Files:** `.env.example`, `.env`, `docker-compose.yml`
- Add `UPLOAD_DIR` (default `./uploads`) and `MAX_FILE_SIZE` (default `5242880` = 5 MB) keys. Passthrough in `docker-compose.yml`.
- **Acceptance:** dev server boots; env values available.

#### Task 3: Create `uploads` directory + public serving path
- **Files:** `uploads/images/` (new dir), `next.config.js` (if needed for standalone static serving), possibly `src/app/api/upload/image/route.ts` stub later
- Use `output: "standalone"` (already set); confirm `/uploads/*` is reachable in dev (Next serves `/public` and `public/`; if `uploads` stays outside `public`, serve it in Task 11's route handler — see pitfall #10 in checklist §9).
- **Acceptance:** a dropped-in `uploads/images/test.png` is fetchable at `/uploads/images/test.png` in dev.

#### Task 4: Seed the 10 `pages` rows
- **Files:** `prisma/seed.ts` (new), `package.json` (`prisma.seed` field), `prisma/migrations/<timestamp>_seed_pages/migration.sql` (or run seed after `migrate dev`)
- Insert the 10 slugs **exactly** as in checklist §3.4 (`home`, `board-of-directors`, `corporate-details`, `corporate-governance`, `announcements`, `financial-reports`, `esg-reports`, `lost-share-certificates`, `corporate-communications`, `contact`) with `menuOrder` matching `src/lib/navigation.ts`.
- **Acceptance:** `npx prisma studio` shows 10 rows; `SELECT` via Prisma returns them.

> ⚠️ **Pitfall alert (§9.8):** without this seed, `/admin/pages` is empty and the editor can't open.

### Phase B — Data Layer (pure logic, test-first)

#### Task 5: `src/lib/page-content.ts`
- **Files:** `src/lib/page-content.ts`, `src/lib/page-content.test.ts`
- Functions: `getPageContent(slug, locale)`, `upsertPageContent(pageId|slug, locale, data)`, `listPagesWithContent()` (returns 10 slugs + per-locale `isPublished`), `pageLocales(slug)`.
- Uses `prisma` from `src/lib/prisma.ts`. DB reads are server-only (never import into client components; if needed client-side, fetch through the API).
- **TDD (red → green):** same shape as the Phase 2A `getPageData` contract — rows for `{slug, locale}` exist, upsert creates then updates (one row per locale, `@@unique([pageId, locale])`), unknown → null. Mock the Prisma client at the DB boundary (see `mocking.md`); prefer an in-memory/local SQLite test DB where practical.
- **Acceptance:** seam tests green; no changes to public pages yet.

#### Task 6: `src/lib/site-settings.ts`
- **Files:** `src/lib/site-settings.ts`, `src/lib/site-settings.test.ts`
- Functions: `getSetting(key)`, `setSetting(key, value)` — global rows only (`locale = NULL`), e.g. keys `site_name`, `ga4_tracking_id`.
- **TDD:** round-trip a known value; unknown key → null; does not mix locale rows.
- **Acceptance:** seam tests green.

#### Task 7: `src/lib/auth.ts` — add `changePassword`
- **Files:** `src/lib/auth.ts`, `src/lib/auth.test.ts` (new; if non-existent file)
- Add `changePassword(userId, currentPassword, newPassword)`: validate current via `comparePassword`, reject length < 8 / mismatch, write new hash via `hashPassword` (12 rounds, same as `createAdminUser`).
- **TDD:** correct current + valid new → updates hash; wrong current → throws/returns error; short new → rejected.
- **Acceptance:** seam test green; existing login/setup tests unaffected.

#### Task 8: `src/lib/uploads.ts`
- **Files:** `src/lib/uploads.ts`, `src/lib/uploads.test.ts`
- Functions: `assertAllowedImage(name, size)` (jpg/jpeg/png/svg/webp, ≤ `MAX_FILE_SIZE`), `sanitizeFilename(name)` (strip path traversal, keep extension), `getUploadUrl(relativePath)` (prefix from `NEXT_PUBLIC_SITE_URL`), `uploadsDir()` (honors `UPLOAD_DIR`).
- **TDD:** rejects bad type/oversize/every-path; produces safe filenames; yields absolute URL.
- **Acceptance:** seam tests green.

> **nextjs-developer note:** keep uploads logic pure and deterministic (no `next/headers`) so it's unit-testable; the route handler (Task 11) is the only boundary that touches the filesystem + request.
### Phase C — CMS API Routes (server, test-first at the boundary)

> ⚠️ **Pitfall alert (§9.2):** `src/middleware.ts` **skips `/api`**. Every route *must* verify the session itself via `getSession()` (from `src/lib/auth.ts`) and return `401` when absent. Do not rely on the middleware.

#### Task 9: `GET /api/pages`
- **Files:** `src/app/api/pages/route.ts`, `src/app/api/pages/route.test.ts` (or unit-test the handler)
- Return `[{ slug, menuOrder, en: { title, isPublished }, zh: { title, isPublished } }, …]` from `listPagesWithContent()`.
- Unauthenticated → `401`.
- **TDD:** unauth → 401; auth → 10 items with per-locale status.

#### Task 10: `GET/PUT /api/pages/[slug]`
- **Files:** `src/app/api/pages/[slug]/route.ts`, `…/route.test.ts`
- `GET` returns both-locale content (or `?locale=en|zh` for one); `PUT` conforms shape to `PageContent` (`title`, `metaTitle`, `metaDescription`, `heroImage`, `contentHtml`, `breadcrumbLabel`, `isPublished`) and **upserts only the target locale** (parallel rows per locale, never cross-overwrite — pitfall §9.11).
- Ship `validatePageContentBody()` (returns typed or error list) — test this pure function directly.
- **TDD:** unauth → 401; PUT creates new locale row; PUT updates existing without touching the other locale; GET returns saved content.
- **Acceptance:** editor can load and save both locales.

#### Task 11: `POST /api/upload/image`
- **Files:** `src/app/api/upload/image/route.ts`, `…/route.test.ts`
- `getSession()` guard; read `FormData` file; call `assertAllowedImage`/`sanitizeFilename`; write to `uploadsDir()/images/<slug-or-rand>/<name>`; return `{ url: getUploadUrl(relativePath) }`.
- Enforce `MAX_FILE_SIZE` **server-side** (pitfall §9.12) — never trust client-only.
- **TDD:** rejects wrong type / oversize / traversal; writes & returns a usable URL; unauth → 401.

#### Task 12: `GET/PUT /api/settings`
- **Files:** `src/app/api/settings/route.ts`, `…/route.test.ts`
- Guard with `getSession()`; read/write `site_name` + `ga4_tracking_id` via `site-settings.ts`.
- **TDD:** unauth → 401; GET returns saved; PUT persists and GET reflects it (global, `locale=NULL`).

#### Task 13: `POST /api/auth/change-password`
- **Files:** `src/app/api/auth/change-password/route.ts`, `…/route.test.ts`
- `getSession()`; call `changePassword(userId, current, new)`. Return `{ success: true }` on success; invalid current → 4xx.
- **TDD:** unauth → 401; wrong current → 400/401; success → verify old hash no longer matches.

---

### Phase D — Admin UI (client components + server pages)

#### Task 14: Extend `AdminNav.tsx` menu
- **Files:** `src/app/[locale]/admin/AdminNav.tsx`, `messages/en.json` + `messages/zh.json`
- Add **Pages**, **Settings**, **Change Password** menu links. i18n keys `admin.pages`, `admin.settings`, `admin.changePassword` already exist; confirm.
- **TDD:** renders dashboard link + new links; logout still works.

#### Task 15: `TipTapEditor.tsx` (limited WYSIWYG)
- **Files:** `src/components/admin/TipTapEditor.tsx`, `…/TipTapEditor.test.tsx`
- `"use client"` (TipTap is interactive). StarterKit with **bold, italic, paragraph, heading** only; add `Link` extension; external links get `rel="noopener noreferrer"` + `target="_blank"` (checklist §7.3).
- **TDD:** toolbar shows only bold/italic/paragraph/heading/link buttons; entering text persists via controlled `onChange`.
- **nextjs-developer note:** keep the editor a leaf component — no server fetch inside; content flows in/out via props, so tests stay at the render seam.

#### Task 16: `LocaleTabs.tsx` + `ImageUploader.tsx`
- **Files:** `src/components/admin/LocaleTabs.tsx`, `src/components/admin/ImageUploader.tsx`, both `…test.tsx`
- LocaleTabs reads `?tab=en|zh` (TD-15), resets active locale via `useSearchParams`, emits "unsaved changes" signal.
- ImageUploader: client-side validate (type/size) before upload, show preview + errors (TD-14).
- **TDD:** tab state from URL; switching preserves edits; uploader blocks bad files locally and shows preview on success.

#### Task 17: `/admin/pages` listing
- **Files:** `src/app/[locale]/admin/pages/page.tsx`, `…/page.test.tsx`
- Server component: fetch `listPagesWithContent()`; render a table (slug, EN/ZH titles, published badges per locale, Edit link to `/${locale}/admin/pages/[slug]`).
- **TDD:** renders a row per seeded page; shows published status per locale; edit links are correct.

#### Task 18: `/admin/pages/[slug]` editor
- **Files:** `src/app/[locale]/admin/pages/[slug]/page.tsx`, `…/page.test.tsx`
- Server page reads `getPageContent` per active tab; client form binds `TipTapEditor`, `LocaleTabs`, `ImageUploader`, SEO fields (`metaTitle`, `metaDescription`), title, and **two publish toggles** (EN/ZH) — enforced per-locale (D8). Manual **Save** button + "Unsaved changes" indicator; confirmation if both locales would be unpublished (TD-16, pitfall #13).
- **TDD:** renders for known slug; unknown slug → not found; toggles EN only; saving calls the API with the right locale; dirty guard fires.

#### Task 19: `/admin/settings` + logo upload
- **Files:** `src/app/[locale]/admin/settings/page.tsx`, `…/page.test.tsx`
- Form for `site_name` + `ga4_tracking_id` (via `/api/settings`); logo uploader replaces `public/logo.svg` (2B.7). Provide an `ImageUploader` variant that writes to the logo path (or a dedicated `/api/upload/logo`).
- **TDD:** settings round-trip; logo upload selection triggers an upload call.

#### Task 20: `/admin/change-password` (UI page)
- **Files:** `src/app/[locale]/admin/change-password/page.tsx`, `…/page.test.tsx`
- Form: current password + new + confirm → `POST /api/auth/change-password` (2B.8). Validate new ≥ 8 chars, new === confirm; on success show confirmation (optionally prompt to re-login). Follow the existing login page's client-flow pattern.
- **TDD:** renders 3 fields; mismatch/short new → inline error; success calls the API.

Phase D note: keep all admin pages under `[locale]/admin` so the existing `admin/layout.tsx` auth + `AdminNav` apply automatically.

---

### Phase E — Public-Site DB Wiring (cross-cutting — do last)

#### Task 21: DB-aware `getPageData` (async, published-aware)
- **Files:** `src/lib/pages.ts`, `src/lib/page-content.ts`, all 10 × `src/app/[locale]/<slug>/page.tsx`, `ContentWithSidebar.tsx`, `src/lib/pages.test.ts`
- Change `getPageData(slug, locale)` to **async**: query `pages` + `page_contents` via `page-content.ts`; return the same `PagePlaceholder` shape as Phase 2A (so templates don't change structure).
- **Published rule (D8 / pitfall #9.6):** if the current locale's `PageContent` is missing or `isPublished === false` → `null` (page calls `notFound()`). If it exists and is published → return the DB row. If no DB content yet, **fall back to `placeholders.ts`** so the site keeps rendering until Phase 2.5 content migration (checklist §3.3).
- **nextjs-developer note:** make the seam `async` so DB reads stay server-only, and `await` it in `generateMetadata` and every template. **This touches all 10 pages — one committed vertical slice, pitfall §9.1.**
- **TDD:** known slug+published → DB content; known slug+unpublished → null; unknown slug → null; seeded-but-empty → placeholder fallback.

#### Task 22: Wire hero image + SEO metadata from DB
- **Files:** `ContentWithSidebar.tsx`, `TemplateShell.tsx` (hero render), `src/app/[locale]/<slug>/page.tsx` (`generateMetadata`)
- When `pageData.heroImage` exists, render it in the hero/banner area; else keep the current gradient block. `generateMetadata` uses `metaTitle`/`metaDescription` (SEO task already matches this — verify DB-backed values flow).
- **TDD:** hero image present when URL present; metadata uses DB meta title/description.

#### Task 23: `/admin` dashboard (recent activity)
- **Files:** `src/app/[locale]/admin/page.tsx` (replace placeholder), `…/page.test.tsx`
- Overview: counts (pages, published per locale) + recent `pages.updatedAt`-driven list via a new lightweight `getRecentPageActivity(n)` in `page-content.ts`.
- **TDD:** renders recent activity; empty DB → graceful empty state.

---

### Phase F — i18n & Non-Technical-Admin Polish

#### Task 24: Complete i18n scope
- **Files:** `messages/en.json`, `messages/zh.json`
- Add a coherent `admin.editor.*` / `admin.settings.*` namespace: Save, Unsaved changes, published/unpublished labels, "Both locales unpublished" warning, upload labels, success/error text — in both EN and traditional Chinese.
- **TDD:** editor renders translated strings in both locales via `renderWithLocale`.

#### Task 25: Admin UX guardrails
- **Files:** editor components (Task 18), TipTap/typography-related CSS if needed
- Tab-switch confirm dialog when dirty; "unpublish both locales" confirm (D8); clear success/error flash after save/upload; inline help text on TipTap.
- **Acceptance:** manual pass (checklist §8.3).

---

### Phase G — Verification & Close-Out

#### Task 26: Full acceptance run
- **Commands:** `npm test` (all 93+ new passing), `npm run lint` (only pre-existing Phase-1 warnings: `admin/setup` useEffect deps, `Logo` `<img>`), `npm run build` (all 10 public routes + admin routes build).
- **Manual pass** of checklist §8.3 (15 items) at 320 / 768 / 1920 px, including: `/admin/pages` lists 10, editor tabs EN/ZH, TipTap toolbar limited, header image upload + preview, SEO fields, per-locale publish with 404 on public, in-app password change, settings GA4 round-trip, logo replaces header.
- **CLI reset (2B.9):** `npm run reset-password` updates a real `AdminUser`; then log in with the new password and change it again in-app to confirm both flows write compatible bcrypt hashes.
- **Definition of done:** everything in §8.4 of the checklist is checked; existing 93 Phase 2A tests still green; no Phase 3 (`reports`/`announcements`) scope leaked in.
---

## 5. Build Order (vertical slices, commit per completed task)

```
Phase A (infra/seed)
 ├── Task 1 (TipTap + typography) ‹- PREREQUISITE for Task 15
 ├── Task 2 (env) ─ Task 3 (uploads dir) ─ Task 4 (pages seed)  [any order]
Phase B (data layer, pure logic — all test-first)
 └── Task 5 (page-content) -> Task 6 (site-settings)
                   └── Task 7 (auth changePassword) -> Task 8 (uploads helper)
Phase C (API routes — depend on Phase B)
 ├── Task 9 (GET /api/pages) ─ Task 12 (settings) ─ Task 13 (change-password)
 ├── Task 10 (/api/pages/[slug])  -> Task 11 (upload image — uses Task 8)
Phase D (admin UI — depends on Phase C)
 ├── Task 14 (AdminNav) -> Task 17 (pages listing)
 ├── Task 15 (TipTapEditor) -> Task 18 (page editor)   [Task 15 needs Task 1]
 ├── Task 16 (LocaleTabs + ImageUploader) -> Task 18   [needs Task 11]
 ├── Task 19 (settings + logo) -> Task 20 (change-password UI)
Phase E (public wiring — do after admin UI proves saves work)
 └── Task 21 (async getPageData) -> Task 22 (hero/SEO) -> Task 23 (dashboard)
Phase F (polish — parallel safety, after main flows work)
 └── Task 24 (i18n) ── Task 25 (guardrails)
Phase G (verification)
 └── Task 26 (full acceptance run)
```

**Suggested sequencing rule:** never start a phase B/block before its dependencies are green. In particular, **do Phase E (public-site DB reads)** only after the editor can successfully write to `page_contents` — otherwise you risk a public site reading from a DB the editor can't yet populate.

### 5.1 Definition of Done (from checklist §8.4)
- `npm test` — all 93 existing Phase 2A tests + new 2B seam tests pass.
- `npm run lint` — clean apart from the 2 pre-existing Phase-1 warnings.
- `npm run build` — succeeds; all 10 public routes + admin routes compile.
- Acceptance checklist §8.3 fully satisfied (manual pass, 320/768/1920 px).
- CLI reset (`npm run reset-password`) verified to interoperate with in-app password change.
- No Phase 3 (`reports` / `announcements`) scope introduced.

---

### 5.2 Deliverable → task cross-check
| Checklist deliverable | Task |
|-----------------------|------|
| 2B.1 listing | 14, 17 |
| 2B.2 editor | 15, 16, 18 |
| 2B.3 TipTap | 1, 15 |
| 2B.4 header image upload + logo | 8, 11, 16, 18, 19 |
| 2B.5 SEO fields | 18, 22 |
| 2B.6 publish toggles | 18, 21 |
| 2B.7 logo | 8, 19 |
| 2B.8 in-app password | 7, 13, 20 |
| 2B.9 CLI reset | 26 |
| 2B.10 settings | 6, 12, 19 |
| 2B.11 dashboard | 23 |
| 2B.12 public DB read | 21, 22 |

---

### 6. Acceptance Tracker (fill out as tasks land)

| Phase | Tasks | Status | Notes |
|-------|-------|--------|-------|
| A | 1–4 | ✅ done | environment + seed (`637626c`, `a4577b0`, `fa8f7ad`, Task 4 commit) |
| B | 5–8 | ✅ done | data/helper libs |
| C | 9–13 | ✅ done | CMS APIs |
| D | 14–20 | ✅ done | admin UI |
| E | 21–23 | ✅ done | public DB wiring |
| F | 24–25 | ✅ done | i18n / polish |
| G | 26 | ✅ done | verification — **239 tests**, lint clean, build exit 0 (manual browser pass pending human QA, see checklist §8.4) |
| — | 27–30 (follow-up) | ✅ done | key-value editor, unpublished→placeholder, admin.settings i18n fix, shared report editor + PDF upload — see `docs/phase-2b-tasklist.md` for files/commits |

---

*End of Phase 2B Implementation Plan — built from `docs/phase-2b-checklist.md` with the `.github/skills/tdd` and `.github/skills/nextjs-developer` skill guidance. Does not replace or modify the checklist or the phase plan.*