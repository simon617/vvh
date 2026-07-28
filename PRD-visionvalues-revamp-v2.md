# PRD: Vision Values Holdings Limited — Website Revamp

> **Version**: 2.0  
> **Date**: 2026-07-28  
> **Status**: Final Draft  
> **Based on**: Full audit of live website at `https://www.visionvalues.com.hk/`

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
| 2 | Board of Directors | `/eng/corp_board.asp` | `/chi/corp_board.asp` | Executive bios, photos, linked PDF |
| 3 | Corporate Details | `/eng/corp_details.asp` | `/chi/corp_details.asp` | Table of corporate data |
| 4 | Corporate Governance | `/eng/corp_governance.asp` | `/chi/corp_governance.asp` | Governance policies + PDF download |
| 5 | Announcements & Circulars | `/eng/major.asp` | `/chi/major.asp` | Listed announcements table |
| 6 | Financial Reports | `/eng/financial_report.asp` | `/chi/financial_report.asp` | PDF reports table (Date/Document) |
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

#### 2.2.3 Corporate Details
- Table with fields: Place of Incorporation, Board of Directors, Company Secretary, Auditor, Share Registrar and Transfer Office (Hong Kong & Cayman), Registered Office, Principal Place of Business, Stock Code, Website
- Side sub-photo image

#### 2.2.4 Corporate Governance
- Governance policy text
- PDF download link(s)

#### 2.2.5 Announcements & Circulars
- Table listing announcements with Date and Document columns
- Links to HKEX filings or PDFs

#### 2.2.6 Financial Reports
- Table: Date | Document (with PDF download links)
- Yellow/gold header banner with "Investor Relations" and "Financial Reports" sub-headers

#### 2.2.7 ESG Reports
- Similar table structure: Date | Document
- ESG-specific reports in PDF format

#### 2.2.8 Lost Share Certificates
- Instructions and policy text for lost certificate procedures

#### 2.2.9 Corporate Communications
- Corporate communication policy text

#### 2.2.10 Contact Us
- Form fields: Name (姓名), Subject (主旨), Email (電郵地址), Message (留言)
- Chinese validation messages: "請輸入姓名", "請輸入主旨", "請輸入電郵地址", "請輸入留言"
- English validation messages: "Please Enter your Name", "Please Enter your Subject", "Please Enter your Email Address", "Please Enter your Message"
- Submit (遞交) and Reset (重設) buttons

### 2.3 Navigation Structure

The left sidebar menu (from `/eng/js/menu.js`) organizes pages into:

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
- Logo: `images/logo.jpg` (220×80)
- Sidebar background: `images/sidebar.jpg` (grey)
- Top bar: `images/topbar.jpg` (556×59)
- Color scheme: Grey (#8E8E8E), Red (#990000), Gold (#FFCC00), Teal (#65B1B1)
- Font family: Verdana, Arial, Helvetica, sans-serif
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
6. **Contact form** — Working contact form with email notification
7. **Self-hosted** — No cloud services; runs locally on Node.js

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
| Database | SQLite via `better-sqlite3` or `prisma` | Zero-config, file-based, perfect for local hosting |
| Auth | JWT + bcrypt (password hash) | Simple, no external auth provider |
| CMS UI | React-based admin panel within same app | Route: `/admin/*` protected by login |
| File Storage | Local filesystem (`/uploads/reports/`) | Simple, no S3/cloud dependency |
| Styling | Tailwind CSS | Responsive utility framework |
| Email | Nodemailer (SMTP) | Contact form to company email |
| Deployment | Docker + docker-compose _OR_ PM2 | Self-contained, portable |

---

## 7. Functional Requirements

### 7.1 Content Editing (CMS)

| ID | Requirement | Priority |
|----|------------|----------|
| CMS-01 | Admin login at `/admin` with username/password | P0 |
| CMS-02 | Single admin account created during deployment via CLI setup script | P0 |
| CMS-03 | Admin can edit all text content on every page | P0 |
| CMS-04 | Each content field supports both English and Traditional Chinese | P0 |
| CMS-05 | Rich text editor (e.g., TipTap or Quill) for body content | P1 |
| CMS-06 | Image upload/management for page header images and banners | P1 |
| CMS-07 | Changes go live immediately after saving | P0 |
| CMS-08 | Preview mode before publishing | P2 |

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

### 7.3 Public Website

| ID | Requirement | Priority |
|----|------------|----------|
| WEB-01 | All 10 pages from Section 2.1 rendered with responsive layout | P0 |
| WEB-02 | Navigation collapses to hamburger menu on mobile | P0 |
| WEB-03 | Breadcrumb navigation on all inner pages | P1 |
| WEB-04 | Language switcher (EN ↔ ZH) prominent in header | P0 |
| WEB-05 | Contact form submits and sends email notification | P0 |
| WEB-06 | PDF download links open in new tab | P0 |
| WEB-07 | Page metadata (title, description) editable via CMS | P1 |
| WEB-08 | 404 page for broken links | P1 |

### 7.4 URL Migration

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
| Content with Sidebar | Corporate pages, Investor pages | Header image + breadcrumb + left nav + main content area + sub-photo |
| Reports Table | Financial Reports, ESG Reports, Announcements | Header image + breadcrumb + left nav + sortable/filterable table |
| Contact | Contact Us | Header image + breadcrumb + left nav + contact form |
| Directors | Board of Directors | Header image + breadcrumb + left nav + director cards (name, title, bio, photo) |
| Blank/Text | Lost Share Certificates, Corporate Communications, Corporate Governance | Header image + breadcrumb + left nav + rich text body |

### 8.2 Mobile Behavior

- **Header**: Logo left, hamburger menu right, language switcher in top bar
- **Navigation**: Full-screen slide-in overlay menu
- **Content**: Single-column layout, full-width images
- **Tables**: Horizontal scroll or card-ified on small screens
- **Touch targets**: Minimum 44×44px for all interactive elements
- **Directors**: Card grid (2-col on tablet, 1-col on mobile) with expandable bios

### 8.3 Color Palette (Modern Corporate)

| Role | Color | Hex Code |
|------|-------|----------|
| Primary | Deep Navy | `#1B2A4A` |
| Secondary | Warm Red (heritage) | `#9B1B30` |
| Accent | Gold | `#C9A94E` |
| Background | White / Light Grey | `#FFFFFF` / `#F5F6F8` |
| Text | Dark Charcoal | `#2D2D2D` |
| Borders | Mid Grey | `#D1D5DB` |

---

## 9. Data Model

### 9.1 `admin_users`
```
id          INTEGER PRIMARY KEY
username    TEXT UNIQUE NOT NULL
password    TEXT NOT NULL (bcrypt hash)
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
title           TEXT NOT NULL              (H1 heading)
meta_title      TEXT
meta_description TEXT
hero_image      TEXT                       (file path)
content_json    TEXT                       (JSON blocks: text, rich text, images)
breadcrumb_label TEXT
updated_at      DATETIME
UNIQUE(page_id, locale)
```

### 9.4 `directors`
```
id              INTEGER PRIMARY KEY
page_id         INTEGER REFERENCES pages(id) (references the board page)
locale          TEXT NOT NULL
name            TEXT NOT NULL
title_role      TEXT                        (e.g., "Chairman and Executive Director")
bio             TEXT
photo           TEXT                        (file path)
sort_order      INTEGER DEFAULT 0
category        TEXT                        ('executive' or 'independent')
updated_at      DATETIME
```

### 9.5 `reports`
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

### 9.6 `contact_messages`
```
id              INTEGER PRIMARY KEY
locale          TEXT NOT NULL DEFAULT 'en'
name            TEXT NOT NULL
subject         TEXT NOT NULL
email           TEXT NOT NULL
message         TEXT NOT NULL
is_read         BOOLEAN DEFAULT 0
created_at      DATETIME
```

### 9.7 `corporate_details`
```
id              INTEGER PRIMARY KEY
locale          TEXT NOT NULL              ('en' or 'zh')
field_label     TEXT NOT NULL              (e.g., 'Place of Incorporation')
field_value     TEXT NOT NULL
sort_order      INTEGER DEFAULT 0
UNIQUE(locale, field_label)
```

### 9.8 `site_settings`
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
| `/admin` | Dashboard overview |
| `/admin/pages` | List all pages |
| `/admin/pages/[slug]` | Edit page content (EN+ZH tabs) |
| `/admin/reports/financial` | Manage Financial Reports |
| `/admin/reports/esg` | Manage ESG Reports |
| `/admin/contact-messages` | View submitted messages |
| `/admin/settings` | Site-wide settings |
| `/admin/directors` | Manage board of directors |
| `/admin/corporate-details` | Manage corporate details table |

### 10.2 Admin Setup Flow (First Run)

1. Application starts for the first time
2. If no admin user exists, redirect to `/admin/setup`
3. Setup form: Username + Password + Confirm Password
4. On submit, hash password and create admin user
5. Redirect to `/admin/login`
6. After login, redirect to `/admin`

### 10.3 Session Management
- JWT stored in HTTP-only cookie
- Session expiry: 24 hours
- Logout clears cookie

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
| SEO | Meta tags, sitemap.xml, robots.txt | Generate automatically |
| Security | XSS, CSRF, SQL injection protection | OWASP top 10 mitigated |
| Backup | SQLite database + uploads backup | Single script to dump all data |
| Maintenance | Docker restart policy | `unless-stopped` |

---

## 13. Design Principles

1. **Mobile-first responsive** — Design for smallest screen first
2. **Corporate clarity** — Clean typography, generous whitespace, clear hierarchy
3. **Bilingual parity** — Both languages must have identical layout quality
4. **Admin simplicity** — CMS should be intuitive for non-technical users
5. **Content first** — Design emphasizes readability and document access
6. **Performance** — Minimal dependencies, optimized images, preloaded fonts

---

## 14. Implementation Phases

### Phase 1 — Foundation (Week 1-2)
- [ ] Initialize Next.js project with App Router
- [ ] Set up SQLite database with Prisma ORM
- [ ] Implement admin auth (login/setup/session)
- [ ] Create base responsive layout (header, footer, nav, language switcher)
- [ ] Deploy Docker setup

### Phase 2 — Core Pages (Week 3-4)
- [ ] Build page editor admin UI
- [ ] Implement all 10 page templates
- [ ] Migrate all existing content into database
- [ ] Implement breadcrumb navigation
- [ ] Implement mobile hamburger menu

### Phase 3 — Reports & Contact (Week 5)
- [ ] Build report management admin UI (upload/reorder/hide)
- [ ] Build Financial Reports and ESG Reports public pages
- [ ] Build contact form with email sending
- [ ] Implement admin contact messages inbox

### Phase 4 — Directory & Polish (Week 6)
- [ ] Build Board of Directors editor + public display
- [ ] Build Corporate Details editor + table display
- [ ] 301 redirect middleware
- [ ] SEO metadata editor
- [ ] Sitemap generation
- [ ] Final testing and bug fixes

---

## 15. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Content migration errors | Missing or inaccurate content | Content inventory checklist; cross-check each page after migration |
| Loss of PDF links during migration | Broken downloads | Map all PDF URLs from old site before redesign |
| Admin complexity for non-tech users | User resistance | Simple form-based UI; no code or markdown required |
| Language inconsistency | Poor bilingual experience | Require both language fields before publishing; side-by-side editor |
| Local deployment complexity | Difficult to set up | Docker compose with single `docker-compose up` command |

---

## 16. Design Artifacts Needed (Next Steps)

Before implementation begins, the following should be produced:
1. [ ] High-fidelity Figma mockups for each page template (desktop + mobile)
2. [ ] Logo refresh (optional — keep existing or modernize)
3. [ ] Content migration spreadsheet mapping old page data → new data model
4. [ ] PDF inventory list (all existing Financial Reports + ESG Reports with years)

---

## 17. Appendix: Current Site Technical Details

- **Server**: Apache/ASP on Windows hosting
- **Backend Language**: ASP Classic + PHP (contact form)
- **Database**: Not publicly detectable (likely flat files or simple DB)
- **JavaScript**: Image rollover swaps, GA tracking (commented out)
- **Character Encoding**: Big5 (Chinese) / ISO-8859-1 (English)
- **CSS**: Single `style.css` with inline font families
- **Navigation**: JS-generated `<td>` menu via `document.write()`
- **Language Switching**: JavaScript string replacement of `/eng/` ↔ `/chi/` in URL

---

*End of PRD v2.0*