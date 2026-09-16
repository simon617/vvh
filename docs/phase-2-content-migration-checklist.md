# Phase 2.5 — Content Migration Context Checklist

> **Purpose:** A traceable, per-task checklist for manually migrating the live site
> (`https://www.visionvalues.com.hk/`) content into the CMS. This builds on **Phase 2B** (already
> complete) which seeded the baseline and provided the editors.
> **How to use:** tick each item as completed; each row maps to a page in `/en/admin/pages/<slug>`
> (EN + ZH tabs) and to a PRD §2.2 content section. It is a **data-entry** task (business user/admin),
> not a development task.

---

## 0. What Phase 2B already did (do NOT redo)

- [x] Seeded all `page_contents` rows (**9 CMS pages** × EN/ZH = 18 rows), all **published** — `npm run seed` (or `content:migrate`). `announcements` is **NOT** CMS-managed (Datalink iframe page — no placeholder/row/editor, removed 2026-09-15; `/en/admin/pages/announcements` 404s).
- [x] CMS editors wired: WYSIWYG (most pages), **Key-value** (`corporate-details`), **Reports** (`financial-reports` / `esg-reports` / `corporate-communications`).
- [x] PDF upload available: `POST /api/upload/pdf` → `uploads/reports/<locale>/` (used by Reports editor).
- [x] Corporate-Governance PDFs **uploaded** + linked: all 12 policy PDFs under `uploads/reports/{en,zh}/`.
- [x] Board Role&Function PDF **uploaded** + linked (`uploads/reports/<locale>/RoleAndFunction.pdf`).
- [x] Unpublished → placeholder fallback (no 404), so an unedited page still renders seeded content.

**Remaining real work** = replace seed placeholders with TRUE text copy, migrate header images, and
supply the remaining missing PDFs (Corporate-Communications) — itemized below.

> **Report-PDF import tooling added:** `scripts/report-catalog.ts` (catalog of all Financial/ESG PDFs
> from the four `tools/*.ps1` download scripts) + `scripts/import-report-rows.ts` (`npm run
> import:content`) which matches the catalog against `uploads/reports/{en,zh}/` and writes the report
> JSON envelope into `page_contents.contentHtml` for `financial-reports` / `esg-reports`. It only
> creates rows for PDFs actually on disk (no broken links) and is safe to re-run.

---

## 1. Prerequisites
- [ ] Admin account exists (first run: `/en/admin/setup`; else log in at `/en/admin/login`).
- [ ] Live site `https://www.visionvalues.com.hk/` accessible for copy-reference.
- [ ] Old-server / local files for the PDFs not yet in `uploads/reports/` (Financial, ESG, Communications).
- [ ] Header banner image assets per page (best quality available; brand color tones).
---

## 2. Per-page content migration (9 CMS pages × EN/ZH — `announcements` is iframe-only, no CMS)

### 2.1 Home (`/en/admin/pages/home`, PRD §2.2.1)
- [ ] EN intro text matches live site exactly (`contentHtml`).
- [ ] ZH intro text matches live site exactly.
- [ ] Meta title / meta description reviewed (EN + ZH).
- [ ] Header image uploaded (EN/ZH) — *currently none*.

### 2.2 Board of Directors (`/en/admin/pages/board-of-directors`, PRD §2.2.2)
- [ ] Replace all 10 **placeholder bios** with real bios — EN tab.
- [ ] Replace all 10 Chinese bios — ZH tab.
- [ ] Each director = one paragraph: **Bold** name, **Italic** title, bio body (card grid format — see §5.1 of the main migration doc).
- [ ] Categories correct: Executive Directors (6) / Independent Non-Executive Directors (4).
- [ ] Role&Function PDF link present + opens (EN/ZH) ✓ pre-seeded — verify.
- [ ] Header image uploaded (optional; D14 lets you add director photos in content instead).

### 2.3 Corporate Details (`/en/admin/pages/corporate-details`, PRD §2.2.3)
- [ ] Key-value editor: every field verified against live site (Place of Incorporation, Board, Secretary, Auditor, Share Registrar HK & Cayman, Registered Office, Principal Place of Business, Stock Code, Website) — EN.
- [ ] Same fields verified in Chinese — ZH.
- [ ] Header image uploaded.

### 2.4 Corporate Governance (`/en/admin/pages/corporate-governance`, PRD §2.2.4)
- [ ] Policy text refined (EN) — replace placeholder intro with live text.
- [ ] Policy text refined (ZH).
- [ ] All 12 PDF links point to `uploads/reports/{en,zh}/` and open — pre-seeded ✓ (verify each).
- [ ] Header image uploaded.

### 2.5 Lost Share Certificates (`/en/admin/pages/lost-share-certificates`, PRD §2.2.8)
- [ ] EN instructions replaced with full live-site text.
- [ ] ZH instructions replaced with full Chinese live-site text.
- [ ] Header image uploaded.

### 2.6 Corporate Communications (`/en/admin/pages/corporate-communications`, PRD §2.2.9)
- [ ] Row for "Arrangements Regarding Dissemination of Corporate Communications" (Jan 2024) present — EN.
- [ ] ZH row present (有關發佈公司通訊之安排, 2024年1月).
- [ ] **Upload the actual communication PDFs** (currently `public/pdf/communication/...` does not exist) → re-link or place under `uploads/reports/<locale>/`.
- [ ] Add any additional communications rows as needed.
- [ ] Header image uploaded.

### 2.7 Financial Reports (`/en/admin/pages/financial-reports`, PRD §2.2.6)
- [x] **PDFs downloaded** into `uploads/reports/{en,zh}/` (scripts in `./tools`).
- [x] **Rows imported into DB** — `npm run import:content` → *EN 38 rows / ZH 38 rows* (all downloaded PDFs, Annual + Interim, from `ar_2007_eng/chi` through 2025 + interim 2025/26). To refresh after adding more PDFs, re-run the import (idempotent).
- [ ] Verify a sample of links open in the CMS (Reports editor → each row's PDF).
- [ ] Header image uploaded.

### 2.8 ESG Reports (`/en/admin/pages/esg-reports`, PRD §2.2.7)
- [x] **English ESG PDFs downloaded + rows imported** — `npm run import:content` → *EN 9 rows* (ESG 2017–2025).
- [x] **Chinese ESG PDFs sourced → ZH rows imported** — ✅ **DONE 2026-09-16**: the CHI ESG PDFs are now under `uploads/reports/zh/` and `npm run import:content` created **ZH 9 rows** (ESG 2017–2025). Originally "blocked" (all CHI ESG PDFs returned 404 on the live site); unblocked once the files were placed on disk. Note: the files were uploaded via the CMS and carry a `<epochMs>-` prefix + underscore separators — the importer's **tolerant filename matching** (`canonicalName`) imports them anyway.
- [ ] Any new catalog PDFs (e.g. `ar_2026_eng/chi.pdf` Annual Report 2026) — place under `uploads/reports/<locale>/` and re-run `npm run import:content` (idempotent).
- [ ] Header image uploaded.

### 2.9 Announcements & Circulars (public page only — Datalink iframe, PRD §2.2.5)
- [x] Announcements are **not CMS-managed** — the public page embeds the 3rd-party Datalink iframe (`src/lib/announcements.ts`); there is **no `/admin/pages/announcements`** (removed 2026-09-15).
- [ ] Confirm the Datalink **iframe** approach is acceptable for launch (table/HKEX CRUD = dropped, TD-30 Option A).
- [ ] Verify it loads EN + ZH.
- [ ] Header image uploaded.

### 2.10 Contact Us (`/en/admin/pages/contact`, PRD §2.2.10)
- [ ] Form fields + EN/ZH labels correct (already built in the component — verify).
- [ ] Note: email sending (SMTP) = Phase 3; confirm "email only / no storage" acceptable for launch.
- [ ] Header image uploaded.

---

## 3. PDF asset checklist (links must resolve)
- [x] Financial reports PDFs present in `uploads/reports/{en,zh}/` (downloaded by `tools/*frdownload.ps1`).
- [x] Financial report rows **in DB** (EN 38 / ZH 38) — `npm run import:content`.
- [x] English ESG report PDFs present + rows imported (EN 9).
- [x] **Chinese ESG report PDFs — sourced + rows imported (ZH 9)** — added 2026-09-16 (importer tolerant of CMS-uploaded names).
- [ ] Corporate-communications PDFs uploaded (`uploads/reports/{en,zh}/`) OR `public/pdf/communication/`.
- [x] Governance + Role&Function PDFs already present — spot-verify each link opens.
- [ ] No broken PDF links on the site (click every link).

---

## 4. Header images
- [ ] At least one header image per page (EN/ZH share).
- [ ] Verify on public pages at desktop (1920) and mobile (320).
- [ ] Do NOT migrate decorative sub-photos (Decision D12).
---

## 5. SEO & publish
- [ ] Meta title + meta description reviewed per locale per page (CMS fields).
- [ ] Breadcrumb labels correct EN/ZH.
- [ ] Each locale toggled **Published = ON** after editing.

## 6. Final verification (§7.8 of the migration doc)
- [ ] All 20 URLs (`/en/*` + `/zh/*`) return 200 with real content.
- [ ] Language switcher works on every page.
- [ ] Every PDF link opens in a new tab.
- [ ] Header images show across breakpoints.
- [ ] Cross-check against PRD §2.2 content inventory.

## 7. Known constraints / decisions
- **D6:** Financial/ESG PDFs copied from old server; HKEX-linked PDFs kept external.
- **D11:** Policy/static PDFs pasted as links in WYSIWYG (not uploaded as reports) — but our Reports editor uploads PDFs to `uploads/reports/`, which is fine for Financial/ESG/Comms.
- **D14:** Director photos optional — can be embedded in content (no separate field).
- **D12:** No decorative sub-photos.
- **BLOCKER (data source):** Chinese ESG PDFs (`c_ESG Report 2019–2025.pdf`, `C-ESG Report 2018-v4.pdf`, `LTN20171127266_C.pdf`) return **HTTP 404** at their published URLs on 2026‑09‑09. The CHI-ESG download script (`tools/vvhchi-esgdownload.ps1`) therefore downloads nothing; ENG ESG reports (9) are unaffected. Rows for ZH ESG cannot be created until the files are sourced/provided.
- Old site uses **Big5** for Chinese — if pasted text garbles, re-copy from the rendered page, not the HTML source.
