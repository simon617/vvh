# Phase 2.5 — Content Migration Context Checklist

> **Purpose:** A traceable, per-task checklist for manually migrating the live site
> (`https://www.visionvalues.com.hk/`) content into the CMS. This builds on **Phase 2B** (already
> complete) which seeded the baseline and provided the editors.
> **How to use:** tick each item as completed; each row maps to a page in `/en/admin/pages/<slug>`
> (EN + ZH tabs) and to a PRD §2.2 content section. It is a **data-entry** task (business user/admin),
> not a development task.

---

## 0. What Phase 2B already did (do NOT redo)

- [x] Seeded all 20 `page_contents` rows (10 pages × EN/ZH), all **published** — `npm run seed` (or `content:migrate`).
- [x] CMS editors wired: WYSIWYG (most pages), **Key-value** (`corporate-details`), **Reports** (`financial-reports` / `esg-reports` / `corporate-communications`).
- [x] PDF upload available: `POST /api/upload/pdf` → `uploads/reports/<locale>/` (used by Reports editor).
- [x] Corporate-Governance PDFs **uploaded** + linked: all 12 policy PDFs under `uploads/reports/{en,zh}/`.
- [x] Board Role&Function PDF **uploaded** + linked (`uploads/reports/<locale>/RoleAndFunction.pdf`).
- [x] Unpublished → placeholder fallback (no 404), so an unedited page still renders seeded content.

**Remaining real work** = replace seed placeholders with TRUE content, migrate header images, and
supply the missing PDFs (Financial/ESG/Comms) — itemized below.

---

## 1. Prerequisites
- [ ] Admin account exists (first run: `/en/admin/setup`; else log in at `/en/admin/login`).
- [ ] Live site `https://www.visionvalues.com.hk/` accessible for copy-reference.
- [ ] Old-server / local files for the PDFs not yet in `uploads/reports/` (Financial, ESG, Communications).
- [ ] Header banner image assets per page (best quality available; brand color tones).
---

## 2. Per-page content migration (10 pages × EN/ZH)

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
- [ ] **Upload Annual Report PDF(s)** (the `/pdf/AnnualReport2025.pdf` link is a placeholder) → Reports editor, EN.
- [ ] Upload Interim Report PDF(s) → EN.
- [ ] Chinese rows uploaded/updated → ZH tab.
- [ ] A date + title per report row; links open.
- [ ] Header image uploaded.

### 2.8 ESG Reports (`/en/admin/pages/esg-reports`, PRD §2.2.7)
- [ ] **Upload ESG report PDF** (currently `/pdf/ESGReport2025.pdf` placeholder) → EN.
- [ ] Chinese ESG report → ZH.
- [ ] Links open; date + title correct.
- [ ] Header image uploaded.

### 2.9 Announcements & Circulars (`/en/admin/pages/announcements`, PRD §2.2.5)
- [ ] Confirm the Datalink **iframe** approach is acceptable for launch (table/HKEX CRUD = Phase 3).
- [ ] If keeping iframe, verify it loads EN + ZH.
- [ ] Header image uploaded.

### 2.10 Contact Us (`/en/admin/pages/contact`, PRD §2.2.10)
- [ ] Form fields + EN/ZH labels correct (already built in the component — verify).
- [ ] Note: email sending (SMTP) = Phase 3; confirm "email only / no storage" acceptable for launch.
- [ ] Header image uploaded.

---

## 3. PDF asset checklist (links must resolve)
- [ ] Financial reports PDFs uploaded (`uploads/reports/{en,zh}/`).
- [ ] ESG report PDFs uploaded (`uploads/reports/{en,zh}/`).
- [ ] Corporate-communications PDFs uploaded (`uploads/reports/{en,zh}/`) OR `public/pdf/communication/`.
- [ ] Governance + Role&Function PDFs already present — spot-verify each link opens.
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
- Old site uses **Big5** for Chinese — if pasted text garbles, re-copy from the rendered page, not the HTML source.
