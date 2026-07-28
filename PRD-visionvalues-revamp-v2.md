# PRD: Vision Values Holdings Limited — Website Revamp

> **Version**: 2.1 (Grill-Reviewed)  
> **Date**: 2026-07-28  
> **Status**: Final — Implementation Ready  
> **Based on**: Full audit of live website at `https://www.visionvalues.com.hk/` + Grilling session (16 decisions)

---

## 1. Executive Summary

Vision Values Holdings Limited (HKEX: 862) operates a corporate website at `visionvalues.com.hk` built on legacy ASP technology with a table-based, fixed-width layout (circa ~2005). The site is not mobile-responsive, uses image-based navigation, and requires developer intervention for any content update.

This PRD defines a complete revamp of the website into a modern, mobile-responsive, bilingual (English / Traditional Chinese) site with a built-in content management system (CMS) that allows non-technical administrators to update all page content, manage reports, and handle contact form submissions — all self-hosted locally with no cloud dependency.

---

## 2. Live Website Audit — Complete Sitemap & Content Inventory

The following pages and sections were discovered from the live site. **Every page and piece of content listed here must be preserved in the revamp.**

### 2.1 Page Inventory

| # | Page Name | URL Path (EN) | URL Path (ZH) | Content Type |
|---|-----------|--------------|--------------|--------------|
| 1 | Home | `/eng/index.asp` | `/chi/index.asp` | Company introduction text |
| 2 | Board of Directors | `/eng/corp_board.asp` | `/chi/corp_board.asp` | Executive bios, linked PDF |
| 3 | Corporate Details | `/eng/corp_details.asp` | `/chi/corp_details.asp` | Table of corporate data |
| 4 | Corporate Governance | `/eng/corp_governance.asp` | `/chi/corp_governance.asp` | Governance policies + PDF |
| 5 | Announcements & Circulars | `/eng/major.asp` | `/chi/major.asp` | HKEX-linked announcements |
| 6 | Financial Reports | `/eng/financial_report.asp` | `/chi/financial_report.asp` | PDF reports table |
| 7 | ESG Reports | `/eng/environment.asp` | `/chi/environment.asp` | ESG PDF reports table |
| 8 | Lost Share Certificates | `/eng/lost_share_cert.asp` | `/chi/lost_share_cert.asp` | Policy text + instructions |
| 9 | Corporate Communications | `/eng/communication.asp` | `/chi/communication.asp` | Communication policy text |
| 10 | Contact Us | `/eng/contact_us.php` | `/chi/contact_us.php` | Contact form + email handler |

### 2.2 Content Detail Per Page

#### 2.2.1 Home Page
- **English**: "Vision Values Holdings Limited (Hong Kong stock code: 862) is a public company listed in The Stock Exchange of Hong Kong Limited. The Group is principally engaged in the provision of property investment, logistics business, minerals exploration and private jet management services."
- **Chinese**: "遠見控股有限公司﹝香港股票編號：862﹞，是香港聯合交易所之上市公司。主要提供物業投資、物流業務、勘探礦藏業務及私人飛機管理服務。"

#### 2.2.2 Board of Directors
- **Executive Directors** (6): 魯連城先生 (Chairman), 何厚鏘先生, 翁綺慧女士, 魯士奇先生, 魯士偉先生, 魯士中先生
- **Independent Non-Executive Directors** (4): 徐慶全先生 (JP), 劉偉彪先生, 李企偉先生, 魏啟寬先生
- Each director has a full bio paragraph in both languages
- Downloadable PDF: `pdf/RoleAndFunction.pdf` (董事名單與其角色和職能 / Directors' Roles and Functions)
- **Decision D14**: Director photos optional — can be embedded in WYSIWYG content. No separate photo field.

#### 2.2.3 Corporate Details
- Table with fields: Place of Incorporation, Board of Directors, Company Secretary, Auditor, Share Registrar and Transfer Office (Hong Kong & Cayman), Registered Office, Principal Place of Business, Stock Code, Website
- **Decision D12**: Decorative sub-photo removed. Replaced by CSS.

#### 2.2.4 Corporate Governance
- Governance policy text
- PDF download link(s) — admins paste links in WYSIWYG editor **(Decision D11)**

#### 2.2.5 Announcements & Circulars
- Table listing announcements with Date and Document columns
- Links to HKEX filings — **Decision D1/D5**: "Paste HKEX link, auto-fetch metadata" approach. Admin pastes HKEX URL; system fetches title/date automatically with manual fallback.

#### 2.2.6 Financial Reports
- Table: Date | Document (with PDF download links)
- PDFs will be copied from existing system during migration **(Decision D6)**

#### 2.2.7 ESG Reports
- Similar table structure: Date | Document
- PDFs will be copied from existing system during migration **(Decision D6)**

#### 2.2.8 Lost Share Certificates
- Instructions and policy text for lost certificate procedures

#### 2.2.9 Corporate Communications
- Corporate communication policy text

#### 2.2.10 Contact Us
- Form fields: Name (姓名), Subject (主旨), Email (電郵地址), Message (留言)
- Chinese validation messages: "請輸入姓名", "請輸入主旨", "請輸入電郵地址", "請輸入留言"
- English validation messages: "Please Enter your Name", "Please Enter your Subject", "Please Enter your Email Address", "Please Enter your Message"
- Submit (遞交) and Reset (重設) buttons
- **Decision D7**: Email-only contact form. No database storage. Success/failure notification shown to user immediately.

### 2.3 Navigation Structure

The left sidebar menu organizes pages into:

**Corporate Information**
  - Board of Directors
  - Corporate Details
  - Corporate Governance

**Investor Relations**
  - Announcements and Circulars
  - Financial Reports
  - Environmental, Social And Governance Reports
  - Lost Share Certificates
  - Corporate Communications

**Contact Us**

### 2.4 Existing Design Elements (for reference)
- Logo: `images/logo.jpg` (220×80) — **Decision D16**: Recreate as SVG
- Color scheme: Grey (#8E8E8E), Red (#990000), Gold (#FFCC00), Teal (#65B1B1)
- Fixed width: 773-778px table layout
- Language switcher via JavaScript path replacement

---

## 3. Problem Statement

- Current site is not mobile-responsive (fixed 778px width)
- Content updates require direct HTML/PHP/ASP edits
- Site cannot be maintained by business users
- Report uploads (Financial/ESG) require FTP + code changes
- Image-based rollover navigation is outdated
- No admin interface exists whatsoever
- Character encoding issues (Big5 vs ISO-8859-1)
- No SEO metadata management

---

## 4. Objectives

1. **Modern responsive design** — Mobile-first, clean corporate aesthetic
2. **Preserve all content** — Every page, every section, every document link migrated
3. **Built-in CMS** — Admin login on the same site; no external service
4. **Bilingual management** — English & Traditional Chinese content editable side-by-side
5. **Report management UI** — Upload, reorder, hide/show Financial and ESG PDF reports
6. **Contact form** — Working contact form with email notification via SMTP
7. **Self-hosted** — No cloud services; runs locally on Node.js, Docker-ready

---

## 5. Target Audience

- Institutional investors and shareholders (primary)
- Financial analysts and advisors
- ESG stakeholders and regulators
- Company employees and partners
- Hong Kong audience (Traditional Chinese + English readers)

---

## 6. Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | Node.js 18+ | LTS, self-hosted, no cloud dependency |
| Framework | Next.js 14 (App Router) | SSR/SSG, built-in i18n routing, static export option |
| Database | SQLite via Prisma ORM | Zero-config, file-based, supports migrations |
| Auth | JWT + bcrypt (password hash) | Simple, no external auth provider |
| CMS UI | React-based admin panel within same app | Route: `/admin/*` protected by login |
| File Storage | Local filesystem (`/uploads/reports/`, `/uploads/images/`) | Simple, no cloud dependency |
| Styling | Tailwind CSS | Responsive utility framework |
| WYSIWYG | TipTap (headless, limited toolbar) | Consistent editor across all content types |
| Email | Nodemailer (SMTP) | Contact form via company SMTP (IP-based auth) |
| Deployment | Docker + docker-compose | Self-contained, portable, cloud-ready |

---

## 7. Functional Requirements

### 7.1 Content Editing (CMS)

| ID | Requirement | Priority |
|----|------------|----------|
| CMS-01 | Admin login at `/admin` with username/password | P0 |
| CMS-02 | Single admin account created during deployment via CLI setup script | P0 |
| CMS-03 | Admin can edit all text content on every page | P0 |
| CMS-04 | Each content field supports both English and Traditional Chinese | P0 |
| CMS-05 | Consistent limited WYSIWYG editor (TipTap) for all body content — bold, italic, paragraphs, links only | P0 |
| CMS-06 | Image upload for page header banners and logo — editable per page | P0 |
| CMS-07 | Changes go live immediately after saving | P0 |
| CMS-08 | Independent "Published" toggle per language version per page | P0 |
| CMS-09 | In-app password change in admin settings | P0 |
| CMS-10 | CLI password reset command: `npm run reset-password` | P0 |
| CMS-11 | Preview mode before publishing | P2 |

### 7.2 Report Management

| ID | Requirement | Priority |
|----|------------|----------|
| REP-01 | Admin dashboard for Financial Reports at `/admin/reports/financial` | P0 |
| REP-02 | Admin dashboard for ESG Reports at `/admin/reports/esg` | P0 |
| REP-03 | Upload PDF files via browser | P0 |
| REP-04 | Each report entry has: Title (EN/ZH), Year/Period, Description (EN/ZH), Language tag, File upload, Visible/Hidden toggle | P0 |
| REP-05 | Reorder reports via drag-and-drop or numeric sort order | P1 |
| REP-06 | Delete existing reports | P0 |
| REP-07 | Reports display as sortable tables on public pages | P0 |

### 7.3 Announcements & Circulars

| ID | Requirement | Priority |
|----|------------|----------|
| ANN-01 | Admin can paste HKEX announcement URL | P0 |
| ANN-02 | System automatically fetches title and date from HKEX page metadata | P0 |
| ANN-03 | Manual fallback: admin can edit title/date if auto-fetch fails | P1 |
| ANN-04 | Announcements display as table with Date + title linking to HKEX | P0 |

### 7.4 Public Website

| ID | Requirement | Priority |
|----|------------|----------|
| WEB-01 | All 10 pages from Section 2.1 rendered with responsive layout | P0 |
| WEB-02 | Navigation collapses to hamburger menu on mobile | P0 |
| WEB-03 | Breadcrumb navigation on all inner pages | P1 |
| WEB-04 | Language switcher (EN ↔ ZH) prominent in header | P0 |
| WEB-05 | Contact form sends email via SMTP with success/failure notification to user (no DB storage) | P0 |
| WEB-06 | PDF download links open in new tab | P0 |
| WEB-07 | Page metadata (title, description) editable via CMS | P1 |
| WEB-08 | 404 page for broken links | P1 |
| WEB-09 | GA4 tracking ID configurable via admin settings | P1 |
| WEB-10 | Auto-generated sitemap.xml with all published pages | P1 |
| WEB-11 | Open Graph meta tags (og:title, og:description, og:image) | P1 |

### 7.5 URL Migration

| ID | Requirement | Priority |
|----|------------|----------|
| URL-01 | New URLs follow clean pattern: `/en/`, `/zh/` | P0 |
| URL-02 | Old ASP URLs (`/eng/corp_board.asp`) redirect to new equivalents (301) | P1 |
| URL-03 | Root `/` redirects to language-appropriate home page | P1 |

---

## 8. Page Templates & Wireframe Descriptions

### 8.1 Template Types

| Template | Used For | Layout Description |
|----------|---------|-------------------|
| Home | `/en/`, `/zh/` | Hero banner + company intro + key metrics + latest reports section |
| Content with Sidebar | Corporate pages, Investor pages | Header image + breadcrumb + left nav + main content area |
| Reports Table | Financial Reports, ESG Reports | Header image + breadcrumb + left nav + sortable/filterable table |
| Announcements | Announcements & Circulars | Header image + breadcrumb + left nav + HKEX-linked table |
| Contact | Contact Us | Header image + breadcrumb + left nav + contact form |
| Directors | Board of Directors | Header image + breadcrumb + left nav + director cards (name, title, bio) |
| Blank/Text | Lost Share Certificates, Corporate Communications, Corporate Governance | Header image + breadcrumb + left nav + rich text body |

### 8.2 Mobile Behavior

- **Header**: Logo left, hamburger menu right, language switcher in top bar
- **Navigation**: Full-screen slide-in overlay menu
- **Content**: Single-column layout, full-width images
- **Tables**: Horizontal scroll or card-ified on small screens
- **Touch targets**: Minimum 44×44px for all interactive elements
- **Directors**: Card grid (2-col on tablet, 1-col on mobile) with expandable bios

### 8.3 Color Palette (Modern Corporate, Heritage-Inspired)

| Role | Color | Hex Code |
|------|-------|----------|
| Primary | Deep Navy | `#1B2A4A` |
| Secondary | Warm Red (heritage, matching existing site) | `#9B1B30` |
| Accent | Gold | `#C9A94E` |
| Background | White / Light Grey | `#FFFFFF` / `#F5F6F8` |
| Text | Dark Charcoal | `#2D2D2D` |
| Borders | Mid Grey | `#D1D5DB` |

### 8.4 Images

| Image Type | Editable? | Notes |
|------------|-----------|-------|
| Logo | Yes — CMS upload | Recreated as SVG. CMS-editable. **(D16)** |
| Header banner | Yes — CMS upload | One per page. CMS-editable. **(D2)** |
| Sub-photos | Removed | Decorative images removed. **(D12)** |
| Layout images (sidebar, top bar) | Removed | Replaced by CSS. **(D12)** |
| Director photos | Optional | Can be embedded in WYSIWYG content. **(D14)** |

---

## 9. Data Model

### 9.1 `admin_users`
```
id          INTEGER PRIMARY KEY
username    TEXT UNIQUE NOT NULL
password    TEXT NOT NULL (bcrypt hash)
role        TEXT DEFAULT 'admin'             (reserved for future multi-admin)
created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
```

### 9.2 `pages`
```
id              INTEGER PRIMARY KEY
slug            TEXT UNIQUE NOT NULL       (e.g., 'board-of-directors', 'home')
menu_order      INTEGER DEFAULT 0
parent_slug     TEXT NULL                  (for sub-pages)
is_visible      BOOLEAN DEFAULT 1
created_at      DATETIME
updated_at      DATETIME
```

### 9.3 `page_contents`
```
id              INTEGER PRIMARY KEY
page_id         INTEGER REFERENCES pages(id)
locale          TEXT NOT NULL              ('en' or 'zh')
is_published    BOOLEAN DEFAULT 1          (independent publish per locale — D8)
title           TEXT NOT NULL              (H1 heading)
meta_title      TEXT
meta_description TEXT
hero_image      TEXT                       (file path)
content_html    TEXT                       (WYSIWYG HTML content — D4)
breadcrumb_label TEXT
updated_at      DATETIME
UNIQUE(page_id, locale)
```

### 9.4 `reports`
```
id              INTEGER PRIMARY KEY
category        TEXT NOT NULL              ('financial' or 'esg')
locale          TEXT NOT NULL              ('en' or 'zh')
title           TEXT NOT NULL
year_period     TEXT                        (e.g., '2025', '2025 Interim')
description     TEXT
file_path       TEXT NOT NULL              (path to uploaded PDF)
file_size       INTEGER                    (bytes)
is_visible      BOOLEAN DEFAULT 1
sort_order      INTEGER DEFAULT 0
created_at      DATETIME
updated_at      DATETIME
```

### 9.5 `announcements`
```
id              INTEGER PRIMARY KEY
locale          TEXT NOT NULL              ('en' or 'zh')
title           TEXT NOT NULL              (auto-fetched, editable fallback)
external_url    TEXT NOT NULL              (HKEX link)
announcement_date DATE                     (auto-fetched, editable fallback)
is_visible      BOOLEAN DEFAULT 1
sort_order      INTEGER DEFAULT 0
created_at      DATETIME
updated_at      DATETIME
```

### 9.6 `site_settings`
```
id              INTEGER PRIMARY KEY
key             TEXT UNIQUE NOT NULL
value           TEXT
locale          TEXT NULL                  (NULL = applies to both)
```

---

## 10. Admin Interface Specification

### 10.1 Routes

| Route | Description |
|-------|-------------|
| `/admin/login` | Login page |
| `/admin/setup` | First-run admin account creation |
| `/admin` | Dashboard overview (recent activity) |
| `/admin/pages` | List all pages with published status per locale |
| `/admin/pages/[slug]` | Edit page content (EN+ZH tabs, WYSIWYG editor, header image, SEO meta) |
| `/admin/reports/financial` | Manage Financial Reports (upload, reorder, toggle visibility) |
| `/admin/reports/esg` | Manage ESG Reports |
| `/admin/announcements` | Manage Announcements (paste HKEX URL, edit metadata) |
| `/admin/settings` | Site-wide settings (GA4 tracking ID, contact email, SMTP config info) |
| `/admin/change-password` | Change admin password |

### 10.2 Admin Setup Flow (First Run)

1. Application starts for the first time
2. If no admin user exists, redirect to `/admin/setup`
3. Setup form: Username + Password + Confirm Password
4. On submit, hash password (bcrypt) and create admin user
5. Redirect to `/admin/login`
6. After login, redirect to `/admin`

### 10.3 Password Reset (CLI)
- Command: `npm run reset-password`
- Prompts for new username and password
- Updates the admin_users table

### 10.4 Session Management
- JWT stored in HTTP-only cookie
- Session expiry: 24 hours
- Logout clears cookie

### 10.5 SMTP Configuration
- SMTP host, port, and destination email stored in `.env` file (not in DB for security)
- **Decision D10**: Company SMTP server uses IP-based authentication — no credentials needed
- Contact form sends email via Nodemailer; no database storage
- SMTP host, port, and recipient email configured in `.env`
- Success/failure notification shown to user immediately after form submission

---

## 11. Public Page URL Structure

### New URL Scheme
```
/en/                    → Home (English)
/zh/                    → Home (Chinese)
/en/board-of-directors  → Board of Directors
/zh/board-of-directors  → Board of Directors
/en/corporate-details   → Corporate Details
/en/corporate-governance → Corporate Governance
/en/announcements       → Announcements & Circulars
/en/financial-reports   → Financial Reports
/en/esg-reports         → ESG Reports
/en/lost-share-certificates → Lost Share Certificates
/en/corporate-communications → Corporate Communications
/en/contact             → Contact Us
```

### 301 Redirect Mapping (Old → New)
```
/eng/corp_board.asp          → /en/board-of-directors
/eng/corp_details.asp        → /en/corporate-details
/eng/corp_governance.asp     → /en/corporate-governance
/eng/major.asp               → /en/announcements
/eng/financial_report.asp    → /en/financial-reports
/eng/environment.asp         → /en/esg-reports
/eng/lost_share_cert.asp     → /en/lost-share-certificates
/eng/communication.asp       → /en/corporate-communications
/eng/contact_us.php          → /en/contact
/chi/*                       → /zh/* (corresponding pages)
/                            → /en/ (default)
```

---

## 12. Non-Functional Requirements

| Category | Requirement | Target |
|----------|------------|--------|
| Performance | Lighthouse Performance score | ≥ 85 mobile, ≥ 95 desktop |
| Accessibility | WCAG 2.1 AA compliance | Pass automated checks |
| SEO | Meta tags, sitemap.xml, robots.txt, OG tags | Generate automatically |
| Security | JWT auth, bcrypt passwords, HTTP-only cookies, XSS/CSRF protection | OWASP top 10 mitigated |
| Backup | SQLite database + uploads backup | `npm run backup` script |
| Database Migrations | Prisma migration files for schema changes | CI/CD deployment ready **(D15)** |
| Deployment | Docker restart policy `unless-stopped` | Single `docker-compose up -d` **(D9)** |
| Analytics | GA4 tracking ID configurable in admin settings **(D13)** | Optional opt-in |

---

## 13. Design Principles

1. **Mobile-first responsive** — Design for smallest screen first
2. **Corporate clarity** — Clean typography, generous whitespace, clear hierarchy
3. **Bilingual parity** — Both languages must have identical layout quality
4. **Admin simplicity** — CMS should be intuitive for non-technical users
5. **Content first** — Design emphasizes readability and document access
6. **Performance** — Minimal dependencies, optimized images, preloaded fonts

---

## 14. Grilling Decisions Log

| # | Issue | Decision |
|---|-------|----------|
| D1 | Announcements data source | Paste HKEX link, auto-fetch metadata |
| D2 | Header images editable | Yes, P0 — redesign matching existing style/color tones |
| D3 | Admin password management | CLI `npm run reset-password` + in-app change password (P0) |
| D4 | WYSIWYG editor scope | One consistent limited editor for all content types (TipTap) |
| D5 | Announcements implementation | Paste HKEX link → auto-fetch title/date |
| D6 | Existing PDF migration | Financial/ESG PDFs copied from old server; HKEX-linked kept external |
| D7 | Contact form storage | Email-only via SMTP. No database storage. Success/failure notification shown to user immediately. |
| D8 | Language publishing | Independent publish toggle per locale |
| D9 | Deployment target | Docker compose on own server; portable to cloud |
| D10 | SMTP configuration | Company SMTP (IP-based auth), settings in `.env` |
| D11 | Policy/static PDFs | Pasted as links in WYSIWYG editor (no separate document manager) |
| D12 | Image types | Logo + header banners only; decorative sub-photos and layout images removed |
| D13 | SEO/Analytics | GA4 ID in admin settings; auto sitemap.xml + OG tags |
| D14 | Director photos | Optional via WYSIWYG, no separate photo field |
| D15 | Backup & migrations | Manual `npm run backup`; Prisma migrations for CI/CD |
| D16 | Logo | Recreate as SVG during implementation |

---

## 15. Implementation Phases

### Phase 1 — Foundation & Infrastructure (Week 1-2)
- [ ] Initialize Next.js 14 project with App Router + TypeScript
- [ ] Set up SQLite database with Prisma ORM + initial migration (all 6 data models)
- [ ] Implement admin auth (login page, setup flow, JWT session, logout)
- [ ] Create base responsive layout shell (header, footer, sidebar nav, language switcher)
- [ ] Recreate logo as SVG (Decision D16)
- [ ] Docker configuration (Dockerfile + docker-compose.yml)
- [ ] Backup script (`npm run backup`)

### Phase 2A — Page Templates & Public Site (Week 3)
- [ ] Implement all 10 page templates with responsive design (7 template types)
- [ ] Implement breadcrumb navigation on all inner pages
- [ ] Implement mobile hamburger menu (full-screen slide-in overlay)
- [ ] Static/placeholder content for all pages — site fully navigable but CMS not yet connected

### Phase 2B — Admin CMS Editor (Week 4)
- [ ] Build admin pages listing at `/admin/pages`
- [ ] Build page editor at `/admin/pages/[slug]`:
  - EN/ZH tabbed editing
  - TipTap WYSIWYG (bold, italic, paragraphs, links only)
  - Header image upload per page
  - SEO meta fields (title, description)
  - Independent publish toggle per locale (Decision D8)
- [ ] Logo upload in admin settings
- [ ] In-app password change
- [ ] CLI password reset command: `npm run reset-password`
- [ ] Admin settings page (GA4 tracking ID, site name)

### Phase 2.5 — Content Migration (Separate Task, ~1 Week)
- [ ] Manually copy all existing content from live site into CMS for all 10 pages × 2 languages
- [ ] Download existing header images from old site and upload to CMS
- [ ] Verify PDF links and re-add via WYSIWYG where needed
- [ ] Cross-check against content inventory (PRD Section 2)

### Phase 3 — Reports, Announcements & Contact (Week 5-6)
- [ ] Build report management admin UI (`/admin/reports/financial`, `/admin/reports/esg`):
  - Upload PDF files via browser
  - Title (EN/ZH), Year/Period, Description (EN/ZH), Language tag
  - Visible/Hidden toggle
  - Sort order (numeric)
  - Delete reports
- [ ] Build announcements admin UI (`/admin/announcements`):
  - Paste HKEX URL, auto-fetch title/date metadata
  - Manual edit fallback if auto-fetch fails
  - Visible/Hidden toggle
- [ ] Build Financial Reports and ESG Reports public pages (sortable tables with PDF links)
- [ ] Build Announcements public page (table with Date + HKEX-linked title)
- [ ] Build contact form page:
  - Client-side validation (EN + ZH messages)
  - SMTP email via Nodemailer (IP-based auth, no credentials)
  - Success/failure notification to user
  - No database storage
  - No admin inbox

### Phase 4 — SEO, Migration & Polish (Week 7)
- [ ] 301 redirect middleware (old ASP URLs → new clean URLs)
- [ ] GA4 analytics integration (tracking ID configurable in admin settings)
- [ ] Auto-generated sitemap.xml + robots.txt
- [ ] Open Graph meta tags (og:title, og:description, og:image)
- [ ] 404 page
- [ ] Old PDF download and migration from existing server
- [ ] Lighthouse performance audit (target ≥85 mobile, ≥95 desktop)
- [ ] WCAG 2.1 AA accessibility checks
- [ ] Final testing and bug fixes
- [ ] Docker deployment verification

---

## 16. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content migration errors | Missing or inaccurate content | Content inventory checklist (Section 2); cross-check each page after migration |
| Loss of PDF links during migration | Broken downloads | Map all PDF URLs from old site before redesign; copy Financial/ESG PDFs **(D6)** |
| Admin complexity for non-tech users | User resistance | Simple WYSIWYG form-based UI; no code or markdown required |
| Language inconsistency | Poor bilingual experience | Independent publish toggles per locale **(D8)**; admin sees both languages side-by-side |
| Local deployment complexity | Difficult to set up | Docker compose with single `docker-compose up -d` command **(D9)** |
| HKEX site layout change | Announcement auto-fetch breaks | Manual fallback for title/date entry **(D5)** |

---

## 17. Appendix: Current Site Technical Details

- **Server**: Apache/ASP on Windows hosting
- **Backend Language**: ASP Classic + PHP (contact form)
- **JavaScript**: Image rollover swaps, GA tracking (commented out)
- **Character Encoding**: Big5 (Chinese) / ISO-8859-1 (English)
- **CSS**: Single `style.css` with inline font families
- **Navigation**: JS-generated `<td>` menu via `document.write()`
- **Language Switching**: JavaScript string replacement of `/eng/` ↔ `/chi/` in URL

---

*End of PRD v2.1 — Implementation Ready*