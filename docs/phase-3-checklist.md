# Phase 3 — Reports, Announcements & Contact · Context Checklist (Handoff)

> **Project:** Vision Values Holdings Limited (HKEX: 862) — corporate website revamp
> **Phase:** 3 — Reports, Announcements & Contact
> **Branch:** `main` (latest: `9eaa040` — ReportsEditor reorder + row-delete removes PDF)
> **Baseline:** 53 test files / **233 tests passing** · `npm run lint` clean (2 pre-existing warnings) · `npm run build` exit 0
> **Companion docs:** `docs/phase-3-reports-announcements-contact.md` (the plan — **do not modify**) · `docs/developerGuide/developer-guide.md` (living guide) · `docs/phase-2b-tasklist.md` (work log, tasks 1–35) · `docs/PRD-visionvalues-revamp-v2.md` (requirements)
> **Status:** 🟡 **IN PROGRESS** — contact deliverables **9.6–9.8 complete** (`0e73811`, `ea9a5e6`, `38e81b3`). **§9.1–9.3 (report management API + dashboards) are EXPLICITLY DROPPED** (2026-09-15) — the Phase 2B `ReportsEditor` already satisfies the PRD's dashboards, so **§9.3b** (move rows up/down + row-delete removes the PDF) was delivered instead (`9eaa040`). **Announcements was removed from the CMS** (no placeholder, no admin page — public Datalink iframe unchanged). Suite: **55 files / 258 tests green** · `npm run lint` clean (2 pre-existing warnings).

---

## 1. Purpose & how to use this document

This is a **handoff document**. It tells the developer *everything they need to know* before writing Phase 3
code: what already exists (and is reusable), what is explicitly **out of scope** under the decided architecture,
which files to create, which tests must stay green, and the pitfalls to avoid.

Work through it in this order:

1. **§2–§5** — read the current-system snapshot, scope, and the non-negotiable decisions (especially
   **TD-30 Option A**, which changed this phase significantly vs. the original PRD).
2. **§6–§7** — inventory of existing reusable files/endpoints + the new files to create.
3. **§8** — setup.
4. **§9–§10** — the deliverable checklist and suggested TDD task order.
5. **§11–§12** — test requirements, pitfalls, definition of done.

> **IMPORTANT — read first:** This phase deviates from the original PRD. The `reports` and `announcements`
> tables are **reserved and unused** (decision **TD-30 Option A**, recorded 2026). Reports stay in a JSON
> envelope in `page_contents.contentHtml`; announcements stay on the **Datalink iframe**. Build **against the
> envelope and the iframe**, not against those tables.

---

## 2. Snapshot of the current system (verified)

### 2.1 Tooling & commands

| Command | Result (verified) |
|---------|-------------------|
| `npm test` (vitest) | 55 files / **258 tests** passing |
| `npm run lint` | clean — only 2 **pre-existing** Phase-1 warnings (`admin/setup` useEffect deps; `Logo <img>`) |
| `npm run build` | exit 0 (all public routes + admin routes + API routes) |
| `npm run dev` | dev server on `http://localhost:3000` |
| `npm run seed` | `prisma db seed` (upserts the **9 CMS pages** + EN/ZH content rows; **prunes** pages no longer CMS-managed — e.g. `announcements`; `PageContent` rows cascade) |
| `npm run import:content` | `tsx scripts/import-report-rows.ts` — imports report PDFs from `uploads/reports/<locale>/` into the envelope (idempotent) |
| `npm run backup` / `reset-password` | ops scripts |

### 2.2 Current data state (live SQLite `prisma/data/vvh.db`)

| Page (`page_contents`) | EN rows | ZH rows | Note |
|------------------------|---------|---------|------|
| `financial-reports` | 38 | 38 | fully imported (`npm run import:content`) |
| `esg-reports` | 9 | 9 | EN **and** ZH imported |
| `corporate-communications` | 1 | 1 | still the default placeholder row — **no PDFs migrated yet** (deliverable 3.10 open) |
| all other pages | published placeholder content | | DB rows exist via seed |

- All report rows live as `{"__type":"reports","rows":[...]}` in `page_contents.contentHtml`
  (module: `src/lib/report-rows.ts`).
- `announcements` is **NOT CMS-managed** (removed `c77dcee`): no `placeholders.ts` entry, no
  `page_contents` row, no `/admin/pages/announcements` page (404). The public page is a static
  Datalink iframe (`src/app/[locale]/announcements/page.tsx` + `src/lib/announcements.ts`).
- `corporate-governance` still links to **old-server absolute PDF URLs** (`https://www.visionvalues.com.hk/...`)
  and `corporate-communications` links to `/pdf/communication/...` paths that **do not exist yet**
  → deliverable **3.10** must fix both.

### 2.3 Git/workspace hygiene

- Recent commits: `c77dcee` (announcements removed from CMS + docs sync), `9eaa040` (ReportsEditor reorder + row-delete removes PDF), `0e73811`/`ea9a5e6`/`38e81b3` (contact), `f13b86b` (SMTP), `cc536d8` (docs sync), `dcc84af` (sub/superscript), `4c871f5` (data import), `1f033fd` (import tooling).
- `myNotes.docx` + a deleted `~WRL*.tmp` are unrelated user files — do not stage them.
- Docs discipline (developer-guide §3 convention 14): every code change updates `docs/phase-2b-tasklist.md`
  (Files Modified + commit) and keeps the phase docs in sync.
---

## 3. Phase 3 scope — what is IN and what is OUT

### 3.1 IN scope (final scope under TD-30 Option A)

| # | Deliverable | What to build |
|---|-------------|---------------|
| 3.1 | **Financial report management UI** | `/en/admin/reports/financial` — listing + edit of the **JSON envelope** (date, document title, PDF upload, reorder, delete). **No `reports` table.** |
| 3.2 | **ESG report management UI** | `/en/admin/reports/esg` — same, separate dashboard. |
| 3.4 | Financial Reports public page | Already wired to `ReportsTable` + `getReportRows` — **no change expected**; verify only. |
| 3.5 | ESG Reports public page | Already wired — **no change expected**; verify only. |
| 3.6 | Announcements public page | **Keep the Datalink iframe as-is** (already implemented; `src/lib/announcements.ts`). No HKEX table. |
| 3.7 | Contact form (public) | Form with Name/Subject/Email/Message already exists in `src/components/layout/ContactForm.tsx` with client-side validation. **Wire submit → `/api/contact/send`.** |
| 3.8 | Contact form **email sending** | Nodemailer via `src/lib/email.ts` + `POST /api/contact/send` — company SMTP (IP-based auth per D10). Success/failure notification to the user. |
| 3.9 | SMTP configuration | `.env` → `SMTP_HOST`, `SMTP_PORT`, `SMTP_RECIPIENT` (already stubbed in `.env.example` + `docker-compose.yml`). |
| 3.10 | **Local PDF migration** (governance & communications) | Download policy PDFs from the old server to `public/pdf/governance/` and `public/pdf/communication/`; update WYSIWYG links from absolute URLs to local paths. |

### 3.2 OUT of scope (explicitly — do NOT build)

| Item | Original PRD idea | Final decision |
|------|-------------------|----------------|
| 3.3 Announcements management UI | Admin CRUD for announcements | **Not built** (TD-30 Option A) — announcements are 3rd-party Datalink iframe content |
| `reports` table CRUD | Report rows in a relational table | **Not used** — reports stay in the JSON envelope |
| `announcements` table CRUD | HKEX-linked rows in a table | **Not used** |
| `/api/announcements*`, `/api/announcements/fetch-metadata` | HKEX URL metadata auto-fetch (TD-21, D1/D5) | **Dropped** (TD-30) — no HKEX fetching, no cheerio |
| Drag-and-drop reordering (REP-05 P1) | P1 UX | Not required — numeric / ordered array suffices |

> If anyone proposes reviving the `reports`/`announcements` tables, they must first revise
> `docs/phase-3-reports-announcements-contact.md` and the schema comment on those models
> (`prisma/schema.prisma` lines ~53–84) — both currently say "reserved / NOT USED".

---

## 4. Non-negotiable decisions & conventions (read before coding)

### 4.1 Architectural decisions

| Code | Decision |
|------|----------|
| **TD-30 Option A** | Reports = JSON envelope in `page_contents.contentHtml` (`src/lib/report-rows.ts`). Phase-3 report UIs CRUD **the same envelope**. Announcements = Datalink iframe. `Report`/`Announcement` tables reserved. |
| D10 | Company SMTP uses **IP-based auth (no credentials)**. Add `SMTP_USER`/`SMTP_PASS` only if needed later (fallback). |
| D7 | Contact form is **email-only** — no DB storage, no admin inbox. So `/api/contact/send` is a **public** endpoint (no `getSession()`). |
| D11 | Policy/static PDFs are pasted as WYSIWYG **links** (not uploaded reports). |
| D6 | Financial/ESG PDFs live under `uploads/reports/<locale>/`; HKEX-linked docs stay external. |
| TD-22 / TD-25 | PDF upload endpoint and sortable/paginated table **already exist** — reuse, don't rebuild. |

### 4.2 Developer-guide conventions that MUST be respected

1. **Auth:** middleware only checks the cookie for `/admin/*` and **skips `/api` entirely** — every API route
   calls `getSession()` and returns 401 when absent. **Exception:** `/api/contact/send` is intentionally
   **public** (D7) — do not protect it, but add the honeypot.
2. **i18n:** every new message key needs BOTH `messages/en.json` and `messages/zh.json`, and stays inside the
   right namespace (avoid `admin.*` collisions — see the `admin.settings` incident, phase-2b task 29).
3. **Uploads stay relative:** store `/uploads/...` paths; build absolute URLs at render via `getUploadUrl`.
   Runtime uploads are served by the `/uploads` route (NOT `public/`).
4. **Client vs server:** client components start `"use client"`; server components (async) default.
5. **No new tables/migrations** in this phase — the schema's only active tables stay as-is.
6. **Server-only libs:** DB access libs (`page-content`, `auth`, `prisma`) must never be imported into client
   components.
7. **Admin routes are locale-prefixed** (`/en/admin/...`), API routes are **not** locale-prefixed.
8. **Test discipline:** unit tests never hit the real SQLite DB (mock `@/lib/*` seams / Prisma);
   route tests use `next/server` `NextRequest`; new tests must keep the 233+ count green.

---

## 5. Data model — where report rows actually live

```
page_contents.contentHtml  (one row per {page_id, locale})
        │
        ▼
{"__type":"reports","rows":[ {id, date, title, url}, ... ]}
        │
        ├─ write  → buildReportContent(rows)     (src/lib/report-rows.ts)
        ├─ read   → getReportRows(contentHtml)   (src/lib/report-rows.ts)
        └─ render → ReportsTable (src/components/layout/ReportsTable.tsx)
```

- `id` is a stable string (`en-esg-e-ESG-Report-2025`, `row-…` from `makeRowId()`).
- `url` is a relative upload path (`/uploads/reports/en/…`) — served by the `/uploads` route.
- Default/fallback rows are built in `src/lib/placeholders.ts` via the same envelope functions, so
  **placeholder and DB content flow through the identical shape**.
- `seed.ts` writes the placeholder envelope for all 20 page×locale rows; `import-report-rows.ts` upserts
  real imported rows. Keep this "single source" approach — don't introduce a parallel store.
---

## 6. Existing files you will reuse (do not rebuild)

### 6.1 Reports (3.1, 3.2)

| File | What it does | How Phase 3 uses it |
|------|--------------|---------------------|
| `src/lib/report-rows.ts` (+ `.test.ts`) | Envelope parse/serialize + `makeRowId()` | Reuse for ALL report CRUD |
| `src/components/admin/ReportsEditor.tsx` (+ `.test.tsx`) | Row editor: date/title + PDF upload (locale-aware), add/remove, **move up/down (reorder)**, row-delete also removes the PDF server-side | Reused as-is — this IS the Phase-3 report management surface (`9eaa040`) |
| `src/app/api/upload/pdf/route.ts` (+ `route.test.ts`) | `POST /api/upload/pdf?locale=en|zh` → writes `uploads/reports/<locale>/<timestamp>-<sanitized>` | Reuse as-is (TD-22) |
| `src/components/layout/ReportsTable.tsx` (+ `.test.tsx`) | Sortable + paginated Date/Document table | Already rendered by `financial-reports`, `esg-reports`, `corporate-communications` public pages |
| `src/lib/uploads.ts` | `assertAllowedDocument` (pdf/doc/docx/xls/xlsx, max `MAX_DOC_SIZE` default **50 MB**), `sanitizeFilename`, `uploadsDir()` | Reuse for any new upload/delete logic |
| `src/lib/pages.ts` / `page-content.ts` | `getPageData`, `getPageContent`, `upsertPageContent` | The envelope is in `page_contents` — read via these helpers |
| `src/components/admin/PageEditor.tsx` | `PAGE_EDITOR_TYPES` (`reports` for the 3 report slugs) | The report dashboards are a *separate* admin surface — they may call the same libs, but they are **not** the `pages/[slug]` editor |

> **Design note:** the Phase-3 doc (§2) says: *"add a listing UI + `/api/reports*` routes over the envelope"*.
> Because rows have no integer `id` in a table, the natural API is **page-scoped**:
> `GET/PUT /api/reports?page=financial-reports&locale=en` returning the parsed rows array
> (and per-row PUT/DELETE keyed by the string row `id` if you want granular endpoints).
> Keep the JSON shape EXACTLY compatible with `ReportRowItem` so `ReportsTable`/`ReportsEditor` keep working.

### 6.2 Announcements (3.6 — public only, NOT CMS-editable)

| File | What it does |
|------|--------------|
| `src/lib/announcements.ts` | Per-locale Datalink iframe URLs (`en`/`zh`) |
| `src/app/[locale]/announcements/page.tsx` (+ test) | Renders the iframe inside `TemplateShell` — **static** page (no `getPageData`, no placeholder) |

**Announcements was removed from the CMS (`c77dcee`):** no `placeholders.ts` entry, no `page_contents` row,
no `/admin/pages/announcements` page (404s). The public page keeps the same localised title/meta and renders
the Datalink iframe via `getAnnouncementsUrl`. Verify `/en/announcements` and `/zh/announcements` still
render the iframe.

### 6.3 Contact (3.7–3.9)

| File | What it does | Gap for Phase 3 |
|------|--------------|------------------|
| `src/components/layout/ContactForm.tsx` (+ test) | Name/Subject/Email/Message + client validation + `accepted` state; **no submit wiring yet** | Replace the fake `accepted` success with a real async POST to `/api/contact/send`; render success **or** error; add honeypot field |
| `src/app/[locale]/contact/page.tsx` (+ test) | Renders `ContactForm` in `TemplateShell` | Unchanged |
| `messages/*.json` → `contact.*` | Labels + `errName/errSubject/errEmail/errMessage` + `info` (dev note) | Add `sending`, `success`, `error` keys (EN + ZH) |

### 6.4 Admin shell (for the new dashboards)

| File | Notes |
|------|-------|
| `src/app/[locale]/admin/layout.tsx` | Wraps all admin pages with `AdminNav` — new report pages appear automatically once created under `admin/reports/*` |
| `src/app/[locale]/admin/AdminNav.tsx` (+ test) | Nav links array — **add** `Reports` (label `admin.reports` already in i18n!) linking to `/reports/financial` (or a small reports landing) |
| `src/app/[locale]/admin/pages/page.tsx` | Listing-page pattern (table + status badges + links) — copy its style for the reports dashboard |
| `src/middleware.ts` | Already guards any `/admin/*` path — new `/admin/reports/*` routes are protected for free |
---

## 7. Files/endpoints to CREATE in Phase 3

| File | Purpose | Notes |
|------|---------|-------|
| `src/app/[locale]/admin/reports/financial/page.tsx` (+ test) | Financial reports management dashboard | Reads/writes the envelope for slug `financial-reports` (both locales) |
| `src/app/[locale]/admin/reports/esg/page.tsx` (+ test) | ESG reports management dashboard | Same for `esg-reports` |
| `src/app/api/reports/route.ts` (+ test) | `GET` list / `POST` save report rows (page+locale scoped) | `getSession()`-protected |
| `src/app/api/reports/[id]/route.ts` (+ test) | `PUT` update / `DELETE` one row + its PDF file | String-id keyed; `getSession()`-protected |
| `src/lib/email.ts` (+ test) | Nodemailer transport + `sendContactEmail()` | `SMTP_*` env; IP-auth first, `SMTP_USER/PASS` fallback (D10) |
| `src/app/api/contact/send/route.ts` (+ test) | **Public** `POST`; honeypot check; validates fields; sends email; returns `{ok}` / `{error}` | No `getSession()`, no DB writes |
| `src/app/[locale]/admin/reports/page.tsx` *(optional)* | Reports landing (Financial / ESG links) | Only if AdminNav points to a landing instead of directly to financial |
| `public/pdf/governance/*`, `public/pdf/communication/*` | Migrated policy PDFs (3.10) | **Files**, not code — see §9.10 |

> **Wait** — `nodemailer` is **already** in `package.json` (`^6.9.13`). No install needed.
> `cheerio` is NOT installed — and is **not needed** (HKEX fetch dropped).

---

## 8. Setup instructions

```bash
cd vvh
git checkout main            # current HEAD dcc84af
npm install                   # ensures deps present (incl. nodemailer + @tiptap/*)
npm run build                 # sanity: exit 0

# .env — copy from .env.example and fill:
#   SMTP_HOST=192.168.x.x     # company SMTP server IP (D10: IP-based auth)
#   SMTP_PORT=25
#   SMTP_RECIPIENT=investor@visionvalues.com.hk
#   SMTP_USER= / SMTP_PASS=   # ONLY if creds are needed (fallback)
#   MAX_DOC_SIZE=52428800     # optional; default 50 MB for document uploads

npm run dev                   # dev server
# Login:  /en/admin/login     (fresh DB: create first admin at /en/admin/setup)
# Public: /en/financial-reports, /en/esg-reports, /en/announcements, /en/contact
```

> **Env-var clarity:** the Phase-3 plan mentions `MAX_PDF_SIZE` (20 MB) but the **actual code** reads
> `MAX_DOC_SIZE` (default 50 MB, `src/lib/uploads.ts:27–33`). Follow the code — use `MAX_DOC_SIZE`.
> `docker-compose.yml` already maps `SMTP_HOST`/`SMTP_PORT`/`SMTP_RECIPIENT` → container env.
---

## 9. Deliverable checklist (work in this order)

### 9.1 Report management API (3.1) — ❌ **EXPLICITLY DROPPED** (2026-09-14)

**Decision:** the Phase 2B `ReportsEditor` (reachable at `/admin/pages/financial-reports` and
`/admin/pages/esg-reports` via `PAGE_EDITOR_TYPES`) already manages the same JSON envelope (date/document/PDF
upload/add/remove/save). The dedicated `/api/reports*` API and `/admin/reports/*` dashboards are **not built**;
the PRD's REP-01/REP-02 "dashboards" are considered **satisfied by the Phase 2B editor**. The `Report` table
stays reserved/unused. This is the same treatment as the announcements UI (3.3).

- [x] ~~`GET /api/reports?page=<slug>&locale=en|zh`~~ → dropped
- [x] ~~`POST /api/reports`~~ → dropped
- [x] ~~`PUT/DELETE /api/reports/[id]` incl. PDF deletion~~ → dropped (PDF deletion moved into the editor via a small file-DELETE endpoint — see 9.3b)
- [x] ~~401/400 handling~~ → dropped
- [x] ~~TDD envelope round-trip API~~ → dropped

### 9.2 Financial report management UI (3.1) — ❌ **EXPLICITLY DROPPED**

- [x] ~~`/en/admin/reports/financial`~~ → dropped; **use the existing Phase 2B editor** (`/admin/pages/financial-reports`)
- [x] ~~reuse `ReportsEditor`/list/save/reorder/delete~~ → superseded by 9.3b (editor enhancements)

### 9.3 ESG report management UI (3.2) — ❌ **EXPLICITLY DROPPED**

- [x] ~~`/en/admin/reports/esg`~~ → dropped; **use the existing Phase 2B editor** (`/admin/pages/esg-reports`)
- [x] ~~separate dashboard/tests~~ → superseded by 9.3b

### 9.3b ReportsEditor enhancements (adopted in place of 9.1–9.3) — ✅ DONE `9eaa040`

- [x] **Reorder** rows in the editor — move up/down buttons on each row (REP-05 numeric/array order preserved; no drag-drop P1). `moveRow()` swaps in-place and commits the new order; buttons disabled at the ends. — `9eaa040`
- [x] **Row delete also deletes its PDF** from `uploads/reports/<locale>/` on the server — the client calls the authed `DELETE /api/upload/pdf?path=<row.url>` (path-traversal safe via `resolveUploadPath` in `src/app/api/upload/pdf/route.ts`; idempotent on a missing file; **best-effort** — never blocks the editor). Only `/uploads/reports/...` URLs are ever deleted. — `9eaa040`
- [x] **TDD** for both — `ReportsEditor.test.tsx` (reorder up/down, disabled ends, DELETE fetch on remove, no fetch when no upload) mocking `fetch`; `route.test.ts` covers the DELETE endpoint (401, invalid path, ENOENT idempotent). — `9eaa040`

### 9.4 Public Financial/ESG pages (3.4, 3.5) — VERIFY ONLY

- [ ] `/en|zh/financial-reports` renders 38 rows in the sortable/paginated `ReportsTable` (published=true).
- [ ] `/en|zh/esg-reports` renders 9 rows EN / 9 rows ZH.
- [ ] All PDF links open (`/uploads/reports/...`).
- [ ] No code change expected — if anything breaks, treat as a regression.

### 9.5 Announcements public page (3.6) — VERIFY ONLY

- [ ] `/en|zh/announcements` renders the Datalink iframe (`getAnnouncementsUrl`).
- [ ] No code change expected.

### 9.6 Contact form — public submit wiring (3.7)

- [x] `ContactForm` posts to `/api/contact/send` (JSON) on submit; disables button while `sending`. — `38e81b3`
- [x] Success path shows localized `contact.success`; error path shows localized `contact.error` (and does NOT lose the user's input). — `38e81b3`
- [x] Keep existing client-side validation; keep `noValidate`. — `38e81b3`
- [x] Add **honeypot**: hidden field (e.g. `company_website`), visually hidden via CSS; if filled → silently pretend success, send nothing. — `38e81b3`
- [x] **TDD:** mock `fetch` — success, failure, network error, honeypot-filled. — `38e81b3`
### 9.7 Contact email sending (3.8)

- [x] `src/lib/email.ts` builds a Nodemailer `transporter` from `SMTP_HOST/PORT` (+ `SMTP_USER/PASS` fallback). — `0e73811`
- [x] `sendContactEmail({name, subject, email, message})` — plain-text body (TD-23) containing all 4 fields; to `SMTP_RECIPIENT`. — `0e73811`
- [x] **TDD (unit):** mock `nodemailer` createTransport/sendMail — assert recipient, subject, body; assert throw on SMTP error. — `0e73811`

### 9.8 Contact send API (3.9)

- [x] `POST /api/contact/send` — **public**; validates name/subject/email/message (mirror `contact.err*` rules); honeypot check; `await sendContactEmail(...)`. — `ea9a5e6`
- [x] Success → `200 {ok:true}`; validation failure → `400 {error}`; SMTP failure → `502 {error: "Message could not be sent. Please try again later."}` (never leak SMTP details — pitfall §11.6). — `ea9a5e6`
- [x] **TDD:** route test with `NextRequest`, mocked `@/lib/email`. — `ea9a5e6`

### 9.9 AdminNav & i18n

- [x] ~~Add a Reports link to `AdminNav`~~ → **dropped** with §9.1–9.3 (no `/admin/reports/*` dashboards; report editing lives at `/admin/pages/<slug>`)
- [x] Add all new keys to **both** `messages/en.json` + `messages/zh.json`:
      `contact.sending`, `contact.success`, `contact.error`. — `38e81b3` (~~`admin.reportsFinancial`/`admin.reportsEsg`~~ not needed — dashboards dropped)
- [x] ~~Update `AdminNav.test.tsx` if it asserts the link set~~ → N/A (no new link; AdminNav test untouched and green)

### 9.10 Local PDF migration — governance & communications (3.10) ⚠️ manual/data task

- [ ] Download `corporate-governance` policy PDFs from
      `https://www.visionvalues.com.hk/eng|chi/pdf/governance/...` (listed in the seed/DB content) → `public/pdf/governance/`.
- [ ] `corporate-communications` PDFs
      (`e_Communications202401.pdf` / `c_Communications202401.pdf` and any siblings) → `public/pdf/communication/`.
- [ ] Update the WYSIWYG contentHtml (via the CMS at `/admin/pages/corporate-governance` and
      `/admin/pages/corporate-communications`, EN + ZH) to point at local `/pdf/...` paths.
- [ ] Verify all links return 200 on `/en` and `/zh` versions.

> ⚠️ **Convention clash to decide:** the developer guide says runtime files must stay under `/uploads`
> (served by the route, survives `output: "standalone"` + Docker volume), but the Phase-3 plan says
> `public/pdf/...`. `public/` files are bundled at build time and **do not** survive the Docker volume
> model. **Recommended:** store migrated PDFs under `uploads/pdf/governance/` + `uploads/pdf/communication/`
> (also auto-served by `/uploads`) and link `/uploads/pdf/...`. If you keep `public/pdf/...`, note it won't
> persist in Docker without a rebuild. This is worth confirming with the project lead (the plan doc §7.9
> currently says `public/pdf/...`).

---

## 10. Suggested TDD task order (each task = commit + tasklist row)

1. `src/lib/email.ts` (+ test) — pure transport wrapper.
2. `POST /api/contact/send` (+ route test) — includes honeypot + validation.
3. `ContactForm` submit wiring (+ test) — success/error/honeypot.
4. `GET/POST /api/reports` (+ tests) — envelope CRUD.
5. `admin/reports/financial` + `admin/reports/esg` pages (+ tests) reusing `ReportsEditor`.
6. `AdminNav` + i18n keys (en + zh) + nav test.
7. (Parallel/data) 3.10 PDF migration + CMS link updates.
8. Full acceptance run (§11.2) + update `docs/phase-2b-tasklist.md` (or a new phase-3 tasklist) + commit.

> Start a **new Phase-3 work log** (mirror `docs/phase-2b-tasklist.md` format) or append Phase-3 tasks to
> `docs/phase-2b-tasklist.md` per the docs convention used so far.

---

## 11. Testing requirements

### 11.1 Test conventions (from developer-guide §3 / phase-2b)

- Mock at module seams (`@/lib/pages`, `@/lib/page-content`, `@/lib/email`, Prisma) — never touch the real DB.
- Public page tests: `renderWithLocale(await Page({ params: { locale } }))` + `vi.mock("@/lib/pages")` (+ `next/headers` + `next/link` shims — copy `esg-reports/page.test.tsx`).
- Route tests: `NextRequest` from `next/server` (copy `src/app/api/pages/[slug]/route.test.ts`).
- New tests must keep the suite **≥ 233 passing** with `npm test`.

### 11.2 Definition-of-done acceptance run

- [x] `npm test` — all suites green (**55 files / 247 tests**, 2026-09-14). — verified
- [x] `npm run lint` — no NEW warnings beyond the 2 pre-existing ones. — verified
- [x] `npm run build` — exit 0. — verified
- [ ] Manual pass at 320 / 768 / 1920 px:
  - [ ] `/en/admin/pages/financial-reports` + `/zh/...` (via locale tabs) — add/edit/**move up/down**/delete a row, upload a PDF (**row delete also removes the PDF file**), save, reload.
  - [ ] `/en/admin/pages/esg-reports` — same.
  - [ ] `/en/admin/pages` listing shows **9 CMS pages** (no announcements row); `/en/admin/pages/announcements` → 404.
  - [ ] `/en|zh/financial-reports` + `/en|zh/esg-reports` — 38/38/9/9 rows, sort + pagination.
  - [ ] `/en|zh/announcements` — iframe renders (static page, no DB row).
  - [ ] `/en|zh/contact` — validation, submit → success; `SMTP_HOST` unreachable → error message; honeypot filled → silent success; contact page forwards a real test email to `SMTP_RECIPIENT`.
  - [ ] `/en|zh/corporate-governance` + `corporate-communications` — migrated PDFs open.

---

## 12. Common pitfalls (from the plan §7.10 + developer guide — heed these)

1. **Building against `reports`/`announcements` tables** → violates TD-30 Option A; schema explicitly marks them reserved. Build against the envelope + iframe.
2. **Contact form sending to wrong recipient** → verify `SMTP_RECIPIENT`; send a test email first (D10 IP whitelist!).
3. **PDFs not persisting in Docker** → keep writes under `/uploads` (mounted volume); see §9.10 for the `public/pdf` clash.
4. **Report visibility/locale mixups** → the envelope is per `{page, locale}`; an EN edit must not touch ZH (mirror the two-row `page_contents` model; reuse `upsertPageContent` exactly like `PUT /api/pages/[slug]`).
5. **Envelope corruption** → only write via `buildReportContent`; treat non-envelope `contentHtml` as "no rows" (`getReportRows` null) — never crash the dashboard on bad JSON.
6. **Leaking SMTP details to the client** → log server-side only; return a generic error (plan §7.10 #6).
7. **`/api/contact/send` accidentally protected (401)** → it is intentionally **public**; do not add `getSession()` (D7). Spam protection = honeypot.
8. **Forgetting i18n** → missing keys render literally; every new key goes in BOTH en.json and zh.json.
9. **Reordering semantics** → rows render in array order in `ReportsTable` (sorted client-side by date/title by default). "Reorder" in the CMS = adjust array position; keep the `id` stable.
10. **Deleting a row leaves its PDF orphaned** → DELETE API should remove the file from `uploads/reports/<locale>/` (path-traversal-safe via `resolveUploadPath`).

---

## 13. Sign-off checklist

- [x] **§9.1–9.3 explicitly dropped** (2026-09-15) — the Phase 2B `ReportsEditor` satisfies the PRD's report dashboards; the enhancements (reorder + PDF delete, §9.3b) are delivered in `9eaa040`.
- [ ] Deliverables 3.7, 3.8, 3.9 done; 3.4, 3.5, 3.6 verified; 3.10 clarified (`uploads` vs `public`) and executed.
- [x] No new tables/migrations; envelope + iframe architecture respected.
- [ ] All §11.2 acceptance checks pass.
- [x] This checklist is the **Phase-3 work log** — updated with files + commits (§2.3, §6, §9).
- [x] `docs/developerGuide/developer-guide.md` updated for new behavior (`DELETE /api/upload/pdf`, ReportsEditor reorder, announcements removed from CMS/placeholders/seed).
- [x] Announcements removed from the CMS admin (`c77dcee`) — no `pages` row, no placeholder, public static iframe page.
- [ ] This checklist's Status header flipped to ✅ COMPLETE. (not yet — 3.4/3.5/3.6 verification + 3.10 PDF migration remain)