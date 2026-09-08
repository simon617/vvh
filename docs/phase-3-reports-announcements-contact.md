# Phase 3: Reports, Announcements & Contact

**Duration:** 1-2 weeks  
**Complexity:** Medium  
**Dependencies:** Phase 2B (Admin CMS Editor) must be complete

---

## 1. Scope & Goals

Build the remaining admin features for managing Financial Reports, ESG Reports, and HKEX Announcements. Also build the Contact Us page with SMTP-based email sending (no database storage). At the end of this phase, all major functionality is in place — only SEO polish and deployment configuration remain.

---

## 2. Specific Deliverables

> **Note on Phase 2B groundwork (already delivered):** Phase 2B Tasks 27–30 already built a
> **shared report editor** (`src/components/admin/ReportsEditor.tsx`) with:
> - Date + Document title fields per locale,
> - PDF upload via **`POST /api/upload/pdf?locale=en|zh`** → files stored under **`uploads/reports/<locale>/`**,
> - a **sortable + paginated `ReportsTable`** on the public pages,
> - rows persisted as a JSON envelope in `page_contents.contentHtml` (`src/lib/report-rows.ts`).
>
> **DECIDED (2026, TD-30 Option A):** Phase 3 keeps the JSON-in-`contentHtml` approach and does **not**
> migrate reports to the `reports` table. Phase 3 builds a **management dashboard** that reads/edits the
> same envelope (reuse `ReportsEditor` / `getReportRows`; add a listing UI + `/api/reports*` routes over
> the envelope). Announcements stay on the **Datalink iframe** (3rd-party content); the `announcements`
> table is likewise **not** used. The `Report`/`Announcement` tables remain **reserved/unused**.

| # | Deliverable | Description |
|---|-------------|-------------|
| 3.1 | Report management UI (Financial) | `/en/admin/reports/financial` — listing + edit of the **JSON envelope** (date, document title, PDF upload, reorder, delete) — **no `reports` table** |
| 3.2 | Report management UI (ESG) | `/en/admin/reports/esg` — same as Financial but separate dashboard |
| 3.3 | Announcements management UI | *Not built in Phase 3* — announcements stay on the Datalink iframe (3rd-party). *(Dropped under TD-30 Option A.)* |
| 3.4 | Financial Reports public page | Sortable, paginated table with Date + Document (PDF download) columns (already wired to `ReportsTable`; reads `getReportRows` from DB or placeholder envelope) |
| 3.5 | ESG Reports public page | Sortable, paginated table with Date + Document columns (already wired to `ReportsTable`) |
| 3.6 | Announcements public page | **Datalink iframe** (already implemented) — keep as-is. *(No HKEX table DB migration.)* |
| 3.7 | Contact form (public) | Form with Name, Subject, Email, Message fields; client-side validation (EN + ZH messages); Submit + Reset buttons |
| 3.8 | Contact form email sending | Nodemailer integration: send email via company SMTP (IP-based auth), success/failure notification to user |
| 3.9 | SMTP configuration | Configured via `.env` variables (SMTP_HOST, SMTP_PORT, SMTP_RECIPIENT) |
| 3.10 | Local PDF migration (governance & communications) | Download governance/communications policy PDFs from the old server, serve locally under `public/pdf/…`, and update WYSIWYG links (ref PRD §2.2.4, §2.2.9) |

---

## 3. Complexity: Medium

**Justification:**
- Report management and announcements are standard CRUD UIs — straightforward to build
- Auto-fetching HKEX metadata is the most technically challenging part: requires fetching the HKEX page and parsing its HTML/schema for title and date
- Contact form is simple but SMTP integration needs careful error handling (network issues, server timeout)
- No database storage for contact form simplifies the data layer
- Admin UIs follow the same pattern as the page editor from Phase 2B

---

## 4. Dependencies

- **Phase 2B**: Admin UI patterns, API route conventions, file upload handling, authentication middleware
- **Phase 2A**: Public page templates for Reports, Announcements, and Contact pages already exist (currently with placeholder content)
- `.env` must have SMTP variables configured for contact form testing

---

## 5. Key Technical Decisions Needed

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| TD-21 | HKEX metadata fetching | Server-side fetch vs client-side proxy | Server-side API route at `/api/announcements/fetch-metadata` that fetches the HKEX URL and extracts title/date from HTML `<title>` tag or Open Graph meta tags |
| TD-22 | Report PDF storage | Same as image uploads (`/uploads/reports/`) | ✅ **Already implemented in Phase 2B** — `POST /api/upload/pdf` writes to `uploads/reports/<locale>/`; reuse it as-is. |
| TD-23 | Contact form email format | Plain text vs HTML email | Plain text is simpler and sufficient: include name, subject, email, message in email body |
| TD-24 | Contact form spam prevention | Honeypot field vs CAPTCHA vs rate limiting | Honeypot field (hidden field that bots fill in) is simplest; rate limiting by IP if needed later |
| TD-25 | Report table sorting | Client-side JS vs server-side query | ✅ **Already implemented in Phase 2B** — `ReportsTable` (src/components/layout/ReportsTable.tsx) is sortable + paginated client-side; no new work needed. |
| TD-30 | Report data source (DECIDED) | Keep JSON envelope in `page_contents.contentHtml` vs migrate to `reports` table | ✅ **DECIDED — Option A**: keep the JSON envelope (`src/lib/report-rows.ts`) for reports, and build the Phase-3 reports admin UI to CRUD the same envelope (reuse `ReportsEditor`, add a listing dashboard over `/api/reports*`). **No** migration to the `reports` table. Announcements stay on the Datalink iframe (no `announcements` table). Both tables remain **reserved/unused**. |

---

## 6. Potential Risks & Challenges

| Risk | Impact | Mitigation |
|------|--------|------------|
| HKEX site layout change | Auto-fetch breaks (returns wrong title/date) | Manual fallback (Decision D5): admin can edit title/date manually if auto-fetch fails |
| SMTP server not reachable | Contact form email fails | Show clear error message to user: "Message could not be sent. Please try again later." Log error server-side |
| Large PDF uploads | Slow upload, server storage issues | Limit PDF size to 20MB (configurable); show upload progress |
| IP-based SMTP auth fails | Cannot send emails from non-whitelisted IP | Document the SMTP server IP whitelist requirement; test from production Docker host |

---

## 7. Context Checklist (Handoff Document)

### 7.1 Setup Instructions

```bash
# Ensure SMTP configuration in .env
SMTP_HOST=192.168.x.x    # Company SMTP server IP
SMTP_PORT=25             # SMTP port
SMTP_RECIPIENT=investor@visionvalues.com.hk  # Where contact form emails go

# Ensure Phase 1, 2A and 2B are complete
cd vvh
npm run dev

# Login at /en/admin/login (create the first admin at /en/admin/setup on a fresh DB)
# Navigate to /en/admin/reports/financial to add Financial Reports
# Navigate to /en/admin/announcements to add Announcements
```

> **Note:** all admin routes are **locale-prefixed** (`/en/admin/...`, `/zh/admin/...`) because the whole
> app lives under `[locale]`. The `/api/*` routes are NOT locale-prefixed.

### 7.2 Key Files & Their Purpose

> Legend: 🟦 **already exists** (Phase 1/2A/2B) — reuse/extend · 🟩 **new in Phase 3**

| File | Purpose |
|------|---------|
| 🟦 `src/components/admin/ReportsEditor.tsx` | Shared report row editor (date + document + PDF upload) built in Phase 2B — reuse as the Phase-3 Excel/edit form, or extend into a dedicated reports dashboard that CRUDs the same JSON envelope. |
| 🟦 `src/app/api/upload/pdf/route.ts` | PDF upload → `uploads/reports/<locale>/` (Phase 2B) — reuse for report PDFs. |
| 🟦 `src/components/layout/ReportsTable.tsx` | Sortable + paginated Date/Document table (Phase 2A/2B) — used by the 3 report public pages. |
| 🟦 `src/lib/report-rows.ts` | JSON-envelope parse/serialize for report rows (Phase 2B). |
| 🟩 `src/app/[locale]/admin/reports/financial/page.tsx` | Financial Reports management UI |
| 🟩 `src/app/[locale]/admin/reports/esg/page.tsx` | ESG Reports management UI |
| 🟩 `src/app/[locale]/admin/announcements/page.tsx` | Announcements management UI |
| 🟦 `src/app/[locale]/financial-reports/page.tsx` | Financial Reports public page (already `ReportsTable`-wired) |
| 🟦 `src/app/[locale]/esg-reports/page.tsx` | ESG Reports public page (already `ReportsTable`-wired) |
| 🟦 `src/app/[locale]/announcements/page.tsx` | Announcements public page (currently Datalink iframe → switch to table in Phase 3) |
| 🟦 `src/app/[locale]/contact/page.tsx` | Contact page (renders `ContactForm`) |
| 🟦 `src/components/layout/ContactForm.tsx` | **Existing** contact form component with validation (place at `src/components/layout/`, not `src/components/contact/`) |
| 🟩 `src/lib/email.ts` | Nodemailer transport + send function |
| 🟩 `src/lib/hkex-metadata.ts` | HKEX URL metadata fetcher |
| 🟩 `src/app/api/reports/route.ts` | Reports CRUD API (GET, POST) |
| 🟩 `src/app/api/reports/[id]/route.ts` | Reports CRUD API (PUT, DELETE) |
| 🟩 `src/app/api/announcements/route.ts` | Announcements CRUD API (GET, POST) |
| 🟩 `src/app/api/announcements/[id]/route.ts` | Announcements CRUD API (PUT, DELETE) |
| 🟩 `src/app/api/announcements/fetch-metadata/route.ts` | HKEX metadata fetch proxy |
| 🟩 `src/app/api/contact/send/route.ts` | Contact form email sending API |
| 🟦 `src/app/api/upload/pdf/route.ts` | Report PDF upload already exists — no new `upload/report` route needed (TD-22) |

### 7.3 Database / Data Models

Active tables for this phase (TD-30 Option A — **no new tables used**):
- **`page_contents.contentHtml`** — report rows live here as a JSON envelope
  (`{"__type":"reports","rows":[...]}` via `src/lib/report-rows.ts`). The Phase-3 report
  management dashboard reads/edits the **same envelope** (per page + locale).
- **`reports`** — **NOT USED** under the decided architecture. Reserved; do not build CRUD against it
  without revising this doc first.
- **`announcements`** — **NOT USED** — announcements page renders the **Datalink iframe**
  (3rd-party). Reserved for a possible future pivot.
- **`site_settings`** — already used (SMTP/site name live here if needed for the contact form).

### 7.4 API Endpoints

> Legend: 🟦 **already exists (Phase 2B)** · 🟩 **new in Phase 3**

| Endpoint | Method | Description |
|----------|--------|-------------|
| 🟩 `/api/reports` | GET | List report rows for a page/locale (read the envelope) |
| 🟩 `/api/reports` | POST | Save report rows (write the envelope) |
| 🟩 `/api/reports/[id]` | PUT | Update one report row (within the envelope) |
| 🟩 `/api/reports/[id]` | DELETE | Delete one report row + its PDF file (within the envelope) |
| 🟦 `/api/upload/pdf` | POST | Report PDF upload (Phase 2B, `?locale=en` or `zh`) — reuse as-is |
| ~~`/api/announcements*`~~ | — | **Dropped** (TD-30 Option A) — announcements stay on the Datalink iframe |
| ~~`/api/announcements/fetch-metadata`~~ | — | **Dropped** (TD-30 Option A) |
| 🟩 `/api/contact/send` | POST | Accept form data, send email via SMTP, return success/failure |
| `/api/contact/send` | POST | Accept form data, send email via SMTP, return success/failure |

### 7.5 Environment Variables / Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SMTP_HOST` | Yes (for contact form) | Company SMTP server IP address |
| `SMTP_PORT` | Yes | SMTP port (typically 25, 465, or 587) |
| `SMTP_RECIPIENT` | Yes | Email address where contact form submissions are sent |
| `SMTP_USER` | No | SMTP username (only if authentication required) |
| `SMTP_PASS` | No | SMTP password (only if authentication required) |
| `MAX_PDF_SIZE` | No | Maximum PDF upload size in bytes (default: 20971520 = 20MB) |

**Note:** Per Decision D10, company SMTP uses IP-based authentication. If credentials are needed later, add `SMTP_USER` and `SMTP_PASS` to `.env`. The system should try IP-based auth first, then fall back to credentials if configured.

### 7.6 Third-Party Services / Tools

| Service | Purpose |
|---------|---------|
| **Nodemailer** | SMTP email sending for contact form |
| **cheerio** (optional) | HTML parsing for HKEX metadata extraction if simple `<title>` tag parsing is insufficient |

### 7.7 Authentication / Security Considerations

- All `/admin/*` routes protected by JWT middleware
- Report PDF uploads: only accept `.pdf` files, validate MIME type
- Contact form: implement honeypot field for spam prevention
- HKEX fetch: validate URL is a valid HKEX URL before fetching
- File paths stored in DB should be sanitized (no `../` path traversal)
- SMTP credentials (if used) stored in `.env`, never in DB

### 7.8 Testing Requirements for This Phase

- [ ] Admin can upload a PDF report; file appears in `/uploads/reports/`
- [ ] Admin can set title, year, description, language, visibility, sort order for a report
- [ ] Admin can reorder reports by changing sort order
- [ ] Admin can delete a report (removes DB entry + PDF file)
- [ ] Public Financial Reports page shows all visible reports sorted by sort order
- [ ] Public ESG Reports page shows all visible reports sorted by sort order
- [ ] Report tables are sortable by clicking column headers
- [ ] Report tables paginate (configurable rows-per-page; Previous/Next and page-number navigation; resets to page 1 on sort change)
- [ ] Admin can paste HKEX URL; system attempts to fetch title/date
- [ ] If HKEX fetch succeeds, title and date fields are auto-populated
- [ ] If HKEX fetch fails, admin can manually enter title and date
- [ ] Public Announcements page shows all visible announcements with Date + HKEX-linked title
- [ ] HKEX links open in new tab (`target="_blank"`)
- [ ] Contact form shows all fields: Name, Subject, Email, Message
- [ ] Client-side validation shows correct messages (EN/ZH based on page locale)
- [ ] Contact form sends email via SMTP on submit
- [ ] Success notification shown when email sent successfully
- [ ] Error notification shown when email fails
- [ ] Honeypot field catches bot submissions (hidden field filled = reject silently)

### 7.9 Known Constraints / Decisions Already Made

- **D7**: Email-only contact form. No database storage. No admin inbox.
- **D1/D5**: Announcements: paste HKEX URL, auto-fetch metadata with manual fallback
- **D6**: Financial/ESG PDFs copied from old server during migration (Phase 2.5); HKEX-linked kept external
- **D10**: Company SMTP server uses IP-based authentication (no credentials)
- **D11**: Policy/static PDFs handled in WYSIWYG editor (not report management)
- **Governance & Corporate Communications PDFs served locally**: The `corporate-governance` and `corporate-communications` pages link to static policy PDFs. The governance PDFs currently point to old-server absolute URLs (`https://www.visionvalues.com.hk/eng|chi/pdf/governance/…`), and corporate-communications links to `/pdf/communication/e_Communications202401.pdf` (EN) and `/pdf/communication/c_Communications202401.pdf` (ZH). In this phase, download these PDFs from the old server, place them under `public/pdf/governance/…` and `public/pdf/communication/…` (so they resolve at the site root), and update the WYSIWYG links from absolute URLs to local paths (`/pdf/governance/…`, `/pdf/communication/…`). See PRD §2.2.4 and §2.2.9.
- **D4**: All editors use consistent TipTap (note: report title/description are text inputs, not WYSIWYG)
- **REP-05**: Report reordering uses numeric sort order (drag-and-drop is P1, not required now)

### 7.10 Common Pitfalls to Avoid

1. **HKEX fetch failing silently** — Always show the admin what was fetched (or why it failed) so they can decide to use it or override
2. **Contact form sending to wrong recipient** — Verify SMTP_RECIPIENT in `.env` is correct; send a test email
3. **PDF upload not persisting in Docker** — Ensure `/uploads/reports/` is in a mounted Docker volume
4. **Report visibility not reflected on public page** — Only query reports where `is_visible = true` on public pages
5. **Locale filtering for reports** — Reports are locale-specific. An EN report should only show on EN pages
6. **SMTP error logging** — Log SMTP errors server-side but don't expose SMTP details to the user
7. **Announcement date format** — Ensure consistent date formatting across EN and ZH (e.g., "2025-03-15" vs "15 March 2025" vs "2025年3月15日")

### 7.11 Links to Relevant PRD Sections

| Section | Content |
|---------|---------|
| Section 7.2 | Report Management Requirements (REP-01 to REP-07) |
| Section 7.3 | Announcements & Circulars Requirements (ANN-01 to ANN-04) |
| Section 7.4 | Public Website Requirements (WEB-05: contact form) |
| Section 2.2.10 | Contact Us (form fields, validation messages) |
| Section 9.4-9.5 | Data Model: `reports` and `announcements` tables |
| Section 10.1 | Admin Routes (`/admin/reports/financial`, `/admin/reports/esg`, `/admin/announcements`) |
| Section 10.5 | SMTP Configuration |
| Section 14 | Grilling Decisions (D1, D5, D6, D7, D10) |