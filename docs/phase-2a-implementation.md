# Phase 2A — Implementation Progress

> **Project:** Vision Values Holdings Limited — Website Revamp
> **Phase:** 2A — Page Templates & Public Site — IMPLEMENTATION
> **Status:** ✅ **Complete** (all Tasks 1–18 done)
> **Reference:** `docs/phase-2a-tasklist.md` (task breakdown)

---

## Progress Tracker

| Task | Description | Status | Files Modified |
|------|-------------|--------|----------------|
| 1 | Set up vitest + Testing Library | ✅ Done | `vitest.config.ts`, `src/test/setup.ts`, `src/test/smoke.test.tsx`, `package.json`, `package-lock.json` |
| 2 | `src/lib/navigation.ts` | ✅ Done | `src/lib/navigation.ts`, `src/lib/navigation.test.ts` |
| 3 | `src/lib/placeholders.ts` | ✅ Done | `src/lib/placeholders.ts`, `src/lib/placeholders.test.ts` |
| 4 | `src/lib/breadcrumbs.ts` + `Breadcrumb.tsx` | ✅ Done | `src/lib/breadcrumbs.ts`, `src/lib/breadcrumbs.test.ts`, `src/components/layout/Breadcrumb.tsx`, `src/components/layout/Breadcrumb.test.tsx` |
| 5 | `src/lib/pages.ts` | ✅ Done | `src/lib/pages.ts`, `src/lib/pages.test.ts` |
| 6 | `ContentWithSidebar.tsx` | ✅ Done | `src/components/layout/ContentWithSidebar.tsx`, `ContentWithSidebar.test.tsx` |
| 7 | `DirectorCards.tsx` | ✅ Done | `src/components/layout/DirectorCards.tsx`, `DirectorCards.test.tsx`, `src/lib/directors.ts` |
| 8 | `ReportsTable.tsx` | ✅ Done | `src/components/layout/ReportsTable.tsx`, `ReportsTable.test.tsx`, `src/lib/reports.ts` |
| 9 | i18n hardcoded string fixes | ✅ Done | `src/components/layout/Footer.tsx` (copyright + Contact link), `MobileMenu.tsx`/`MobileMenuToggle.tsx` (menu + aria-labels), `Footer.test.tsx`, `MobileMenu.test.tsx`, `src/test/utils.tsx`, `messages/en.json`, `messages/zh.json` |
| 10 | Home page enhancement | ✅ Done | `src/app/[locale]/page.tsx`, `src/components/layout/HomeTemplate.tsx`, `HomeTemplate.test.tsx`, `src/app/[locale]/page.test.tsx` |
| 11 | Content-with-Sidebar pages | ✅ Done | `[locale]/corporate-governance` + `[locale]/lost-share-certificates` (rich text); `[locale]/corporate-communications` (Date/Document table + local PDF links) — `page.tsx` + `page.test.tsx` |
| 12 | Reports pages (×2) | ✅ Done | `[locale]/financial-reports`, `[locale]/esg-reports` (`page.tsx` + `page.test.tsx`), `src/lib/reports.ts` |
| 13 | Announcements page | ✅ Done | `[locale]/announcements/page.tsx` + test (embeds the Datalink announcements page in an `<iframe>`), `src/lib/announcements.ts` |
| 14 | Corporate Details page | ✅ Done | `[locale]/corporate-details/page.tsx` + test (data-table variant via ContentWithSidebar) |
| 15 | Board of Directors page | ✅ Done | `[locale]/board-of-directors/page.tsx` + test, `src/lib/directors.ts` |
| 16 | Contact page | ✅ Done | `[locale]/contact/page.tsx` + test, `src/components/layout/ContactForm.tsx` + test |
| 17 | Per-page metadata | ✅ Done | `generateMetadata` exported from every public page (localized title/description) + asserted in page tests |
| 18 | Full acceptance run | ✅ Done | `npm test` (93 pass), `npm run lint`, `npm run build` — see Verification below |

---

## TDD Approach

Per the `tdd` skill:
- **Red → Green loop:** one test → one minimal implementation per cycle
- **Seams under test:** navigation, placeholders, breadcrumbs, pages.ts, Breadcrumb, DirectorCards, ReportsTable, HomeTemplate, ContactForm, Footer, MobileMenu, and all page templates
- **Test only at seams** — never against internals
- **Vertical slices** — one task at a time, commit each completed task

---

## Verification

- `npm test` → **27 test files / 93 tests passing** (all Phase 2A seams + regression)
- `npm run lint` → clean (only 2 pre-existing Phase-1 warnings: `admin/setup` useEffect deps, `Logo` `<img>`)
- `npm run build` → succeeds; all 10 public page routes present:
  `/en/: home, board-of-directors, corporate-details, corporate-governance, announcements, financial-reports, esg-reports, lost-share-certificates, corporate-communications, contact` (served dynamically under `[locale]`)

---

## Decisions & Notes

- **Director categories:** The task list referenced “4 categories” for the Board page. The PRD (§2.2.2) defines exactly **2** director categories — **Executive Directors** (6) and **Independent Non-Executive Directors** (4) — totalling 10 directors. We follow the PRD as the source of truth, so the Board page renders 2 category sections via `<DirectorCards>` (which groups by `category`). All 10 real names/roles from PRD §2.2.2 are included; bios are placeholder text. *(In Phase 2B/2.5 the bios became CMS-editable: the seed writes director-card HTML into `page_contents` and the Board page renders it as a card grid when present.)*
- **`ReportsTable` localization & pagination:** extended the optional `labels` prop with a `ReportsTableLabels` interface (`date`, `document` + localized `rowsPerPage`, `previous`, `next`, `pageInfo` with `%start%/%end%/%total%` placeholders, `noRows`), and added pagination (rows-per-page selector 5/10/20, Prev/Next + page-number navigation, resets to page 1 on sort) so reports handle many rows on desktop/tablet/mobile.
- **`.eslintrc.json`:** created (extends `next/core-web-vitals`) so `npm run lint` runs non-interactively (previously `next lint` prompted because no ESLint config existed).
- **Sidebar on Home:** kept per confirmed decision (no hiding logic).
- **i18n messages:** added `footer.contactUs`, `tables.*`, `home.*`, and `contact.*` namespaces in both `messages/en.json` and `messages/zh.json`.

---

## Post-2A Refinements

Refinements applied after the initial Phase 2A completion review (kept here so the handoff reflects current state):

- **Announcements page → iframe** — Instead of rendering individual HKEX-linked rows (which change dynamically), `[locale]/announcements` embeds the Talesis **Datalink** announcements page in an `<iframe>` (EN: `.../document/c00640/Announcement_new`, ZH: `.../Chinese/Announcement_2D_Chineselist_new`). `src/lib/announcements.ts` now exposes per-locale iframe URLs; `AnnouncementsTable.tsx` was removed.
- **Corporate Communications → document table** — `[locale]/corporate-communications` was converted from rich text (`ContentWithSidebar`) to the **Reports Table** template (`TemplateShell` + `ReportsTable`) with a Date/Document table linking to **local PDFs** (`/pdf/communication/e_Communications202401.pdf` / `c_Communications202401.pdf`). Added data layer `src/lib/corporateCommunications.ts` (swaps to the `reports` DB table in Phase 3).
- **ReportsTable → pagination** — Added a rows-per-page selector (5/10/20), Prev/Next + page-number navigation, a localized page-info summary, and reset-to-page-1 on sort, so Financial/ESG/corporate-communications report lists handle many rows on desktop/tablet/mobile. Pagination labels added to `messages/en.json` + `messages/zh.json` (`tables.*`).
- **Report placeholders** — Updated Financial Reports placeholders to user-defined wording (Date "October 2025" / "March 2025"; Document "Annual Report 2025" / "Interim Report 2024/2025" — the same fields are user-editable in the Phase 3 CMS via the `reports` table).

---

## Commits

| Commit | Task | Message |
|--------|------|---------|
| `b5350ab` | 1 | Set up vitest + testing-library test infrastructure |
| `32c8123` | 2 | Add navigation data layer with locale-prefixed nav items |
| `8cfc07c` | 3 | Add placeholder content for all pages in both locales |
| `fc7c9e1` | 4 | Add breadcrumb navigation component and data layer |
| `194fec3` | 5 | Add page data-fetching layer for templates |
| `121ecd8` | 6 | Add ContentWithSidebar shared layout component |
| `d89a12f` | 7 | Add DirectorCards component with expandable bios |
| `6286341` | 8 | Add ReportsTable sortable table component |
| `1274fa6` | 9–17 | Complete Phase 2A templates, i18n, metadata, data layers & tests |

---

---

> **Phase 2B follow-up note (2026-09):** the standalone report data layers `src/lib/reports.ts` and
> `src/lib/corporateCommunications.ts` (referenced above) have since been **consolidated into
> `src/lib/placeholders.ts`**, which is now the single static-content source for report rows
> (stored as a JSON report envelope via `buildReportContent`). The public report pages read rows
> through `getReportRows()` (`src/lib/report-rows.ts`) from DB content or the placeholder envelope —
> no separate `reports.ts`/`corporateCommunications.ts` fallback remains. See the developer guide.
*End of Phase 2A Implementation Progress — all tasks complete.*
