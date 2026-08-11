# Phase 2A — Task List

> **Project:** Vision Values Holdings Limited — Website Revamp  
> **Phase:** 2A — Page Templates & Public Site  
> **Status:** ✅ **COMPLETE** — all 18 tasks delivered. See `docs/phase-2a-implementation.md` for the progress tracker and verification.
> **Companion docs:** `docs/phrase-2a-checklists.md` (handoff checklist), `docs/phase-2a-page-templates-public-site.md` (planning)

---

## Confirmed Decisions (from review)

| # | Decision | Value |
|---|----------|-------|
| 1 | Test seams | As proposed: navigation, placeholders, breadcrumbs, pages.ts, Breadcrumb, DirectorCards, ReportsTable, page templates |
| 2 | Test framework | **vitest + @testing-library/react + jsdom** |
| 3 | Sidebar on Home | ✅ **KEEP sidebar on Home** (no hiding) |
| 4 | Placeholder content | Use **real PRD Section 2.2 text** |

---

## Phase 0 — Test Infrastructure

### Task 1: Set up vitest + Testing Library
- **Files:** `vitest.config.ts`, `src/test/setup.ts`, `src/test/utils.tsx` (renderWithLocale wrapper), `package.json` (add `test` script + deps: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `vitest-tsconfig-paths`)
- **TDD note:** infrastructure — verify with a trivial smoke test
- **Acceptance:** `npm test` runs and passes

## Phase 1 — Data Layer (pure logic, test-first)

### Task 2: `src/lib/navigation.ts`
- Extract nav structure from `Sidebar.tsx`/`MobileMenu.tsx` into one source of truth (4 groups, 10 items, locale-prefixed hrefs)
- **TDD:** red → green on navigation seam

### Task 3: `src/lib/placeholders.ts`
- Placeholder content per `{slug, locale}` × 10 pages × 2 locales, using **real PRD Section 2.2 text**
- **TDD:** every slug×locale combo has title + body; strict types

### Task 4: `src/lib/breadcrumbs.ts` + `Breadcrumb.tsx`
- Pure `getBreadcrumbs(pathname, locale)` → `{label, href}[]` (Home → group → page)
- **TDD:** breadcrumb generation seam, then render test for `<Breadcrumb />`

## Phase 2 — Shared Layout Components

### Task 5: `src/lib/pages.ts` — data-fetching layer
- `getPageData(slug, locale)` returns page props (title, hero, breadcrumb label, content) — initially from `placeholders.ts`, designed for Phase 2B DB swap
- **TDD:** known slug returns data; unknown slug → null

### Task 6: `ContentWithSidebar.tsx`
- Server component: hero placeholder + breadcrumb + sidebar slot + content area
- **TDD:** renders heading, breadcrumb, children

### Task 7: `DirectorCards.tsx` (client component)
- Card grid (1-col mobile / 2-col tablet / 3+ desktop) with expandable bios
- **TDD:** renders names/titles; bio expand/collapse; touch targets ≥ 44px

### Task 8: `ReportsTable.tsx` (client component)
- Sortable table (Date / Document), `overflow-x-auto` wrapper
- **TDD:** renders rows; click header sorts (date desc default); wrapper class present

### Task 9: Fix existing i18n hardcoded strings
- `MobileMenu.tsx` ("Menu" + close aria-label) → `useTranslations`
- `Footer.tsx` copyright → `t("footer.copyright")`
- Add missing keys to `messages/en.json` + `messages/zh.json`
- **TDD:** MobileMenu open state asserts translated label; Footer asserts localized ©

## Phase 3 — Page Templates (7 types × 10 pages, server components)

### Task 10: Home page enhancement (`page.tsx`)
- Full PRD 8.1 layout (hero + intro + metrics + latest reports), **sidebar stays visible**
- **TDD:** renders hero, metrics, reports section

### Task 11: Rich-text pages (Content with Sidebar template)
- `corporate-governance`, `lost-share-certificates`, `corporate-communications`
- **TDD:** each renders localized heading + body

### Task 12: Reports pages (Reports Table template)
- `financial-reports`, `esg-reports` using `<ReportsTable>` with placeholder rows
- **TDD:** renders table with placeholder data

### Task 13: Announcements page (Announcements template)
- Date + HKEX-linked title table (static placeholders, `target="_blank"`)
- **TDD:** renders rows; links have `target="_blank"` + locale-prefixed page

### Task 14: Corporate Details page (data table variant)
- Structured table (place of incorporation, board, secretary, auditor, registrar, stock code, etc.)
- **TDD:** renders all field labels + values

### Task 15: Board of Directors page (Directors template)
- Uses `<DirectorCards>` with real director names/titles from PRD 2.2.2
- **TDD:** renders all 4 categories + 10 names; bios expandable

### Task 16: Contact page (Contact template)
- Static form UI with EN+ZH labels + client-side validation (no backend)
- **TDD:** renders 4 fields + submit/reset; validation messages on empty submit

## Phase 4 — Cross-Cutting & Verification

### Task 17: Per-page metadata
- `generateMetadata` per template from `getPageData` (localized title/description)
- **TDD:** `metadata` returned for known slug

### Task 18: Full acceptance run
- Run all Phase 2A acceptance tests from checklist §8.1 (15 items) at 320/768/1920px
- Run `npm run lint` + `npm run build` + `npm test`
- Fix any failures

---

## Build Order (vertical slices)

```
Task 1 (test infra)
 └── Task 2 (navigation) → Task 3 (placeholders) → Task 5 (pages.ts)
       └── Task 4 (breadcrumbs) → Task 6 (ContentWithSidebar)
             ├── Task 11 (rich text ×3)
             ├── Task 14 (corporate details)
             ├── Task 12 (reports ×2) → uses Task 8
             ├── Task 13 (announcements)
             ├── Task 16 (contact)
             ├── Task 15 (directors) → uses Task 7
             └── Task 10 (home)
Task 9 (i18n fixes) — parallel anytime
Task 17 (metadata) — applied per page as built
Task 18 (verification)
```

---

## Checklist Doc Updates (applied to `docs/phrase-2a-checklists.md`)
- **§7.3 / §9.2 pitfall #7** — remove the "Sidebar renders on Home" concern; note decision: **sidebar stays on Home**
- **§8.1** — update test item to reflect sidebar present on Home
- **§2.2** — add `src/lib/breadcrumbs.ts` and `src/lib/pages.ts` to "To Be Created" list
- **§6.2** — add vitest + @testing-library/react + jsdom to dev tooling
- **§8.3** — note test framework decision

---

*End of Phase 2A Task List — awaiting review before execution.*