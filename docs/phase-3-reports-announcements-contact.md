# Phase 3: Reports, Announcements & Contact

**Duration:** 1-2 weeks  
**Complexity:** Medium  
**Dependencies:** Phase 2B (Admin CMS Editor) must be complete

---

## 1. Scope & Goals

Build the remaining admin features for managing Financial Reports, ESG Reports, and HKEX Announcements. Also build the Contact Us page with SMTP-based email sending (no database storage). At the end of this phase, all major functionality is in place — only SEO polish and deployment configuration remain.

---

## 2. Specific Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 3.1 | Report management UI (Financial) | `/admin/reports/financial` — upload PDF, set title/description/year/locale, visible/hidden toggle, sort order, delete |
| 3.2 | Report management UI (ESG) | `/admin/reports/esg` — same as Financial but separate dashboard |
| 3.3 | Announcements management UI | `/admin/announcements` — paste HKEX URL, auto-fetch title/date, manual edit fallback, visible/hidden toggle |
| 3.4 | Financial Reports public page | Sortable table with Date + Document (PDF download) columns, fetched from `reports` table |
| 3.5 | ESG Reports public page | Sortable table with Date + Document columns, fetched from `reports` table |
| 3.6 | Announcements public page | Table with Date + title linking to HKEX, fetched from `announcements` table |
| 3.7 | Contact form (public) | Form with Name, Subject, Email, Message fields; client-side validation (EN + ZH messages); Submit + Reset buttons |
| 3.8 | Contact form email sending | Nodemailer integration: send email via company SMTP (IP-based auth), success/failure notification to user |
| 3.9 | SMTP configuration | Configured via `.env` variables (SMTP_HOST, SMTP_PORT, SMTP_RECIPIENT) |

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
| TD-22 | Report PDF storage | Same as image uploads (`/uploads/reports/`) | Use dedicated `/uploads/reports/` directory to separate from images |
| TD-23 | Contact form email format | Plain text vs HTML email | Plain text is simpler and sufficient: include name, subject, email, message in email body |
| TD-24 | Contact form spam prevention | Honeypot field vs CAPTCHA vs rate limiting | Honeypot field (hidden field that bots fill in) is simplest; rate limiting by IP if needed later |
| TD-25 | Report table sorting | Client-side JS vs server-side query | Client-side sorting with JavaScript (simple arrays); server-side sorting for large datasets (not needed here) |

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

# Ensure Phase 1 and 2 are complete
cd vvh
npm run dev

# Login at /admin/login
# Navigate to /admin/reports/financial to add Financial Reports
# Navigate to /admin/announcements to add Announcements
```

### 7.2 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `src/app/admin/reports/financial/page.tsx` | Financial Reports management UI |
| `src/app/admin/reports/esg/page.tsx` | ESG Reports management UI |
| `src/app/admin/announcements/page.tsx` | Announcements management UI |
| `src/app/[locale]/financial-reports/page.tsx` | Financial Reports public page (updated from Phase 2A placeholder) |
| `src/app/[locale]/esg-reports/page.tsx` | ESG Reports public page (updated from Phase 2A placeholder) |
| `src/app/[locale]/announcements/page.tsx` | Announcements public page (updated from Phase 2A placeholder) |
| `src/app/[locale]/contact/page.tsx` | Contact form page (updated from Phase 2A placeholder) |
| `src/components/contact/ContactForm.tsx` | Contact form component with validation |
| `src/lib/email.ts` | Nodemailer transport + send function |
| `src/lib/hkex-metadata.ts` | HKEX URL metadata fetcher |
| `src/app/api/reports/route.ts` | Reports CRUD API (GET, POST) |
| `src/app/api/reports/[id]/route.ts` | Reports CRUD API (PUT, DELETE) |
| `src/app/api/announcements/route.ts` | Announcements CRUD API (GET, POST) |
| `src/app/api/announcements/[id]/route.ts` | Announcements CRUD API (PUT, DELETE) |
| `src/app/api/announcements/fetch-metadata/route.ts` | HKEX metadata fetch proxy |
| `src/app/api/contact/send/route.ts` | Contact form email sending API |
| `src/app/api/upload/report/route.ts` | Report PDF upload API endpoint |

### 7.3 Database / Data Models

Active tables for this phase:
- **`reports`** — CRUD operations for Financial and ESG reports
  - Fields: `id`, `category` (financial/esg), `locale` (en/zh), `title`, `year_period`, `description`, `file_path`, `file_size`, `is_visible`, `sort_order`
  - PDF files stored at `/uploads/reports/`
- **`announcements`** — CRUD operations for HKEX-linked announcements
  - Fields: `id`, `locale` (en/zh), `title`, `external_url` (HKEX link), `announcement_date`, `is_visible`, `sort_order`
  - No file uploads — all announcements are external links

### 7.4 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports` | GET | List reports (supports `?category=financial` or `?category=esg`) |
| `/api/reports` | POST | Create new report entry |
| `/api/reports/[id]` | PUT | Update report |
| `/api/reports/[id]` | DELETE | Delete report (also deletes PDF file) |
| `/api/upload/report` | POST | Upload report PDF, returns file path |
| `/api/announcements` | GET | List announcements |
| `/api/announcements` | POST | Create new announcement |
| `/api/announcements/[id]` | PUT | Update announcement |
| `/api/announcements/[id]` | DELETE | Delete announcement |
| `/api/announcements/fetch-metadata` | POST | Accept HKEX URL, return `{ title, date }` or error |
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