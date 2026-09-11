# Phase 2B — Task List & Work Log

> **Project:** Vision Values Holdings Limited — Website Revamp
> **Phase:** 2B — Admin CMS Editor
> **Status:** ✅ **COMPLETE** — all 26 tasks executed from `docs/phase-2b-implementation.md` + follow-up enhancements; suite at **233 tests passing**.
> **Baseline:** 27 test files / **93 tests passing** (Phase 2A) · branch `phase-2b` at `1ab1763`.
> **Companion docs:** `docs/phase-2b-checklist.md` (handoff) · `docs/phase-2b-implementation.md` (plan)

---

## Progress Tracker

| Task | Description | Status | Files Modified |
|------|-------------|--------|----------------|
| 1 | Install TipTap + typography, register Tailwind plugin | ✅ `637626c` | `package.json`, `package-lock.json`, `tailwind.config.ts` |
| 2 | Upload env configuration | ✅ `a4577b0` | `.env.example`, `docker-compose.yml` |
| 3 | Create `uploads` directory + public serving path | ✅ `fa8f7ad` | `src/app/uploads/[...path]/route.ts`, `src/app/uploads/[...path]/route.test.ts` |
| 4 | Seed the 10 `pages` rows | ✅ `(in Task 4 commit)` | `prisma/seed.ts`, `package.json` (seed script + prisma.seed) |
| 5 | `src/lib/page-content.ts` | ✅ `(in Task 5 commit)` | `src/lib/page-content.ts`, `src/lib/page-content.test.ts` |
| 6 | `src/lib/site-settings.ts` | ✅ `(in Task 6 commit)` | `src/lib/site-settings.ts`, `src/lib/site-settings.test.ts` |
| 7 | `src/lib/auth.ts` — add `changePassword` | ✅ `(in Task 7 commit)` | `src/lib/auth.ts`, `src/lib/auth.test.ts` |
| 8 | `src/lib/uploads.ts` | ✅ `(in Task 8 commit)` | `src/lib/uploads.ts`, `src/lib/uploads.test.ts`, `src/app/uploads/[...path]/route.ts` (reuse) |
| 9 | `GET /api/pages` | ✅ `(in Task 9 commit)` | `src/app/api/pages/route.ts`, `src/app/api/pages/route.test.ts` |
| 10 | `GET/PUT /api/pages/[slug]` | ✅ `(in Task 10 commit)` | `src/app/api/pages/[slug]/route.ts` + test, `src/lib/page-content.ts` (+`getPageBySlug`) |
| 11 | `POST /api/upload/image` | ✅ `(in Task 11 commit)` | `src/app/api/upload/image/route.ts` + test |
| 12 | `GET/PUT /api/settings` | ✅ `(in Task 12 commit)` | `src/app/api/settings/route.ts` + test |
| 13 | `POST /api/auth/change-password` | ✅ `(in Task 13 commit)` | `src/app/api/auth/change-password/route.ts` + test |
| 14 | Extend `AdminNav.tsx` menu | ✅ `1b709d1` | `src/app/[locale]/admin/AdminNav.tsx`, `AdminNav.test.tsx` |
| 15 | `TipTapEditor.tsx` (limited WYSIWYG) | ✅ `4310d60` | `src/components/admin/TipTapEditor.tsx`, `TipTapEditor.test.tsx` |
| 16 | `LocaleTabs.tsx` + `ImageUploader.tsx` | ✅ `(in Task 16 commit)` | `src/components/admin/LocaleTabs.tsx` + test, `ImageUploader.tsx` + test |
| 17 | `/admin/pages` listing | ✅ `(in Task 17 commit)` | `src/app/[locale]/admin/pages/page.tsx` + test |
| 18 | `/admin/pages/[slug]` editor | ✅ `(in Task 18 commit)` | `src/components/admin/PageEditor.tsx` + test, `src/app/[locale]/admin/pages/[slug]/page.tsx` + test |
| 19 | `/admin/settings` + logo upload | ✅ `(in Task 19 commit)` | `src/app/api/logo/route.ts` + test, `src/components/admin/SettingsForm.tsx` + test, `src/app/[locale]/admin/settings/page.tsx` + test |
| 20 | `/admin/change-password` (UI page) | ✅ `106279d` (+i18n `206eaa7`) | `src/app/[locale]/admin/change-password/page.tsx` + `page.test.tsx` (created) |
| 21 | DB-aware `getPageData` (async, published-aware) | ✅ `106279d` | `src/lib/pages.ts`, `src/lib/pages.test.ts`, all 10 `src/app/[locale]/<slug>/page.tsx`, `ContentWithSidebar.tsx` |
| 22 | Wire hero image + SEO metadata from DB | ✅ `106279d` | `ContentWithSidebar.tsx`, `TemplateShell.tsx` (+test), `HomeTemplate.tsx` (+test), `generateMetadata` in all pages |
| 23 | `/admin` dashboard (recent activity) | ✅ `b45d96b` | `src/app/[locale]/admin/page.tsx` (+test) |
| 24 | Complete i18n scope | ✅ `206eaa7` | `messages/en.json`, `messages/zh.json`, `PageEditor.tsx`, `SettingsForm.tsx`, `change-password/page.tsx` |
| 25 | Admin UX guardrails | ✅ `206eaa7` | `PageEditor.tsx` (unpublish-both-locales confirm, flash auto-clear) |
| 26 | Full acceptance run | ✅ `d131284` | `npm test` (206 pass), `npm run lint` (2 pre-existing warnings only), `npm run build` (exit 0); smoke-tests | 
| 27 | Key/value editor for `corporate-details` (structured table in CMS instead of WYSIWYG) | ✅ `3bae0c6` | `src/lib/key-value.ts` (+ test), `src/components/admin/KeyValueEditor.tsx` (+ test), `src/components/admin/PageEditor.tsx` (+ test), `messages/en.json`, `messages/zh.json` |
| 28 | Unpublished → placeholder fallback (was 404) on public routes | ✅ `3bae0c6` | `src/lib/pages.ts`, `src/lib/pages.test.ts`, `src/components/layout/ContentWithSidebar.test.tsx` | 
| 29 | Fix `admin.settings` i18n key collision (nav label vs settings form object) | ✅ `cd2afe6` | `messages/en.json`, `messages/zh.json`, `src/components/admin/SettingsForm.tsx` (namespace renamed to `admin.settingsForm`), `src/app/[locale]/admin/AdminNav.test.tsx` (regression test: no literal `admin.` keys leak) |
| 30 | Shared paginated report editor for `financial-reports` / `esg-reports` / `corporate-communications` (date + document title + PDF upload) | ✅ `cd2afe6`, `dbf4913` | `src/lib/report-rows.ts` (+`report-rows.test.ts`), `src/app/api/upload/pdf/route.ts` (+`route.test.ts`), `src/components/admin/ReportsEditor.tsx` (+`ReportsEditor.test.tsx`), `src/components/admin/PageEditor.tsx` (+`PageEditor.test.tsx`), public `page.tsx` + `page.test.tsx` for all 3 report pages, `src/lib/uploads.ts` (document validation), `prisma/seed.ts` (seed report rows) |
| 31 | Developer guide — folder map, per-file purposes & linkages, conventions, env vars, testing | ✅ `01dc033` | `docs/developerGuide/developer-guide.md` (+`README.md`) |
| 32 | Pre-Phase-3 doc alignment — PRD status/checklists, Phase 3 plan updated to build on Phase 2B report editor/PDF upload, locale-prefixed admin paths | ✅ `ffccc09` | `docs/PRD-visionvalues-revamp-v2.md`, `docs/phase-3-reports-announcements-contact.md`, `docs/phase-2a-implementation.md` (director-bio CMS note) |
| 33 | Consolidate static content — report rows moved into `placeholders.ts` as the single source; deleted `reports.ts` + `corporateCommunications.ts`; public report pages read rows via `getReportRows` (no separate fallback module) | ✅ `301c7fe` | `src/lib/placeholders.ts`, `src/lib/report-rows.ts`, 3 report `page.tsx`, `prisma/seed.ts`, deleted `src/lib/reports.ts`(+test), `src/lib/corporateCommunications.ts`(+test); docs updated (`developerGuide`, `phase-2b-checklist`, `phase-2a-implementation`, `phase-2a-page-templates-public-site`) |
| 34 | Report-PDF import tooling — catalog (`scripts/report-catalog.ts`) + `scripts/import-report-rows.ts` (`npm run import:content`). Imports downloaded Financial/ESG PDFs from `uploads/reports/{en,zh}/` into report rows in `page_contents.contentHtml` (EN FR 38 / ZH FR 38 / EN ESG 9; **ZH ESG blocked** — all CHI ESG PDFs 404 on live site). Idempotent; skips missing files & reports them | ✅ `1f033fd` | `scripts/report-catalog.ts` (created), `scripts/import-report-rows.ts` (created), `package.json` (`import:content`), `docs/phase-2-content-migration-checklist.md`, `docs/phase-2-content-migration.md`, `docs/developerGuide/developer-guide.md` |
| 35 | TipTap WYSIWYG — add subscript / superscript inline-mark buttons (select any word(s) → `X₂` / `X²`); both stored as `<sub>`/`<sup>` and rendered natively by `.prose` on the public site | ✅ *(this commit)* | `package.json` + `package-lock.json` (`@tiptap/extension-subscript` + `@tiptap/extension-superscript` `^3.30.2`), `src/components/admin/TipTapEditor.tsx` (extensions + 2 buttons + active states), `src/components/admin/TipTapEditor.test.tsx` (toolbar count 5→7, sub/sup round-trip), `docs/developerGuide/developer-guide.md` (TipTapEditor row) |

## Commits

| Commit | Task | Message |
|--------|------|---------|
| `106279d` | 20, 21, 22 | DB-aware `getPageData` + hero/SEO wiring; change-password tests |
| `b45d96b` | 23 | Admin dashboard with stats + recent activity |
| `206eaa7` | 24, 25 | Complete admin i18n + UX guardrails |
| `d131284` | 26 | Extract route helper exports so production build type-checks |
| `3bae0c6` | 27, 28 | Key-value editor for corporate-details + unpublished→placeholder fallback |
| `cd2afe6` | 29, 30 | Shared paginated report editor + PDF upload; fix admin.settings i18n key collision |
| `dbf4913` | 30 | DB-driven rows test coverage for esg-reports + corporate-communications |
| `01dc033` | 31 | Developer guide: folder/file map, linkages, conventions |
| `ffccc09` | 32 | Pre-Phase-3 doc alignment: PRD + Phase 3 plan updated |
| `301c7fe` | 33 | Consolidate static content into placeholders.ts (single source) — removed reports.ts / corporateCommunications.ts |
| `1f033fd` | 34 | Report-PDF import tooling (`import:content`) — catalog + import script, docs (`phase-2-content-migration*`, developer guide) |
| *(this commit)* | 35 | TipTap: subscript + superscript toolbar buttons (`X₂` / `X²`) + round-trip tests |

---

## Notes

- Fill in as tasks land. Each row updated after commit.