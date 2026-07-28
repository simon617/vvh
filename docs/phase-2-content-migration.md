# Phase 2.5: Content Migration (Separate Follow-Up Task)

**Duration:** ~1 week (manual copy-paste task)  
**Complexity:** Low (tedious but straightforward)  
**Dependencies:** Phase 2B (Admin CMS Editor) must be complete

---

## 1. Scope & Goals

Manually copy all existing content from the live website at `https://www.visionvalues.com.hk/` into the new CMS. This includes all text content for all 10 pages × 2 languages, header images, and PDF document links. After this phase, the site will have real content and be ready for final features and launch.

This is a **data entry task**, not a development task. It can be performed by a business user or administrator.

---

## 2. Specific Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 2.5.1 | Home page content (EN) | Copy company intro text from old site |
| 2.5.2 | Home page content (ZH) | Copy Chinese intro text |
| 2.5.3 | Board of Directors (EN) | Copy all 10 director bios + paste PDF link for RoleAndFunction.pdf |
| 2.5.4 | Board of Directors (ZH) | Copy all 10 Chinese director bios |
| 2.5.5 | Corporate Details (EN) | Copy corporate data table (Place of Incorporation, Board, Secretary, Auditor, etc.) |
| 2.5.6 | Corporate Details (ZH) | Copy Chinese version of corporate data |
| 2.5.7 | Corporate Governance (EN) | Copy governance policy text + paste PDF link(s) |
| 2.5.8 | Corporate Governance (ZH) | Copy Chinese governance text + PDF links |
| 2.5.9 | Announcements (EN) | Copy announcement table data (may be handled in Phase 3 via HKEX links) |
| 2.5.10 | Announcements (ZH) | Copy Chinese announcements |
| 2.5.11 | Financial Reports (EN) | Copy report table data; upload PDFs (see Section 2.2.6) |
| 2.5.12 | Financial Reports (ZH) | Copy Chinese report data; upload PDFs |
| 2.5.13 | ESG Reports (EN) | Copy ESG report table data; upload PDFs |
| 2.5.14 | ESG Reports (ZH) | Copy Chinese ESG report data; upload PDFs |
| 2.5.15 | Lost Share Certificates (EN) | Copy policy text + instructions |
| 2.5.16 | Lost Share Certificates (ZH) | Copy Chinese policy text |
| 2.5.17 | Corporate Communications (EN) | Copy communication policy text |
| 2.5.18 | Corporate Communications (ZH) | Copy Chinese policy text |
| 2.5.19 | Header images | Download existing header images from old site and upload to CMS for each page |
| 2.5.20 | PDF documents | Copy Financial/ESG PDFs from old server to `/uploads/reports/` |
| 2.5.21 | Verification | Cross-check all content against PRD Section 2 inventory |

---

## 3. Complexity: Low

**Justification:**
- No coding involved — purely data entry via the CMS editor
- The work is well-defined with clear source (live site) and destination (CMS)
- Main challenge is the volume of content (10 pages × 2 languages = 20 content entries)
- Requires careful attention to avoid copy-paste errors

---

## 4. Dependencies

- **Phase 2B** must be complete: The CMS editor must be functional with all 10 pages created in the `pages` table and the editor working at `/admin/pages/[slug]`
- Admin account credentials must be available (from Phase 1 setup)
- Access to the live site at `https://www.visionvalues.com.hk/` for reference
- Access to the old server's PDF files for download (Decision D6)

---

## 5. Key Technical Decisions Needed

| # | Decision | Details |
|---|----------|---------|
| TD-18 | PDF handling approach | Financial/ESG PDFs: download from old server, upload via admin UI. HKEX-linked PDFs: keep as external links. Policy PDFs: paste URL in WYSIWYG as link. |
| TD-19 | Header image sources | Download existing header images from old site; create new ones if old ones are low quality (matching color tones from PRD Section 8.3) |
| TD-20 | Content format in WYSIWYG | Use paragraphs and headings only; avoid tables in WYSIWYG (tables should be native HTML in the page template, not in the editor content) |

---

## 6. Potential Risks & Challenges

| Risk | Impact | Mitigation |
|------|--------|------------|
| Old site goes down during migration | Cannot access source content | Take screenshots or save HTML of each page before starting migration |
| PDF files missing on old server | Broken download links | Note missing files and report to project lead; use archived copies if available |
| Copy-paste formatting issues | Inconsistent styling on new site | Paste as plain text into TipTap, then re-format using the limited toolbar options |
| Chinese character encoding issues | Garbled text | Verify Chinese text renders correctly after pasting; old site uses Big5 encoding which may not convert cleanly |
| Missing content (pages not captured in audit) | Incomplete migration | Cross-check against PRD Section 2 inventory after migration |

---

## 7. Context Checklist (Handoff Document)

### 7.1 Setup Instructions

```bash
# 1. Ensure the application is running (Phase 2B complete)
cd vvh
npm run dev
# OR
docker-compose up -d

# 2. Open browser and navigate to /admin/login
# 3. Log in with admin credentials
# 4. Navigate to /admin/pages to see all 10 pages
# 5. Click each page to edit content
```

### 7.2 Key Files & Their Purpose

| File / URL | Purpose |
|------------|---------|
| `https://www.visionvalues.com.hk/eng/` | Source content (English) |
| `https://www.visionvalues.com.hk/chi/` | Source content (Chinese) |
| `/admin/pages` | CMS page listing |
| `/admin/pages/[slug]` | Page content editor |
| PRD Section 2.2 | Content inventory checklist (what to migrate) |

### 7.3 Database / Data Models

Content is stored in:
- **`page_contents`** — One row per page per locale (EN/ZH). Fields: `title`, `meta_title`, `meta_description`, `hero_image`, `content_html`, `breadcrumb_label`
- **`reports`** — Financial and ESG report PDFs with metadata (if migrating via report management UI)
- **`announcements`** — HKEX-linked announcements (typically added in Phase 3 via admin UI)

### 7.4 API Endpoints

No API work needed. All data entry is via the CMS admin UI.

### 7.5 Environment Variables / Configuration

No changes needed. Use existing configuration.

### 7.6 Third-Party Services / Tools

None needed. A web browser is sufficient.

### 7.7 Authentication / Security Considerations

- Admin credentials must be kept secure
- Do not share login credentials via unsecured channels
- Log out after each migration session

### 7.8 Testing Requirements for This Phase

- [ ] Home page (EN): text matches old site exactly
- [ ] Home page (ZH): text matches old site exactly
- [ ] Board of Directors (EN): all 10 director bios present
- [ ] Board of Directors (ZH): all 10 Chinese bios present
- [ ] RoleAndFunction.pdf link works on Board page
- [ ] Corporate Details (EN): all data fields populated correctly
- [ ] Corporate Details (ZH): all Chinese data fields populated correctly
- [ ] Corporate Governance (EN): policy text + PDF link(s) correct
- [ ] Corporate Governance (ZH): Chinese text + PDF links correct
- [ ] Lost Share Certificates (EN/ZH): policy text and instructions match
- [ ] Corporate Communications (EN/ZH): policy text matches
- [ ] Announcements: table entries migrated (or ready for HKEX linking in Phase 3)
- [ ] Financial Reports: PDFs uploaded and downloadable
- [ ] ESG Reports: PDFs uploaded and downloadable
- [ ] All pages have appropriate header images
- [ ] No broken links on any page
- [ ] Language switcher works correctly on all pages
- [ ] Breadcrumb labels set correctly for both locales

### 7.9 Known Constraints / Decisions Already Made

- **D6**: Financial/ESG PDFs copied from old server; HKEX-linked PDFs kept external
- **D11**: Policy/static PDFs pasted as links in WYSIWYG editor (not uploaded as reports)
- **D14**: Director photos optional — can be embedded in WYSIWYG content
- **D12**: Decorative sub-photos and layout images removed — do not migrate them
- Old site uses Big5 encoding for Chinese — if pasted text appears garbled, re-copy from browser-rendered text (not HTML source)

### 7.10 Common Pitfalls to Avoid

1. **Pasting with formatting** — Always paste as plain text (Ctrl+Shift+V or Cmd+Shift+V) to avoid bringing over old CSS styles
2. **Forgetting to set publish toggle** — After entering content, ensure the locale's "Published" toggle is ON
3. **Missing Chinese content** — Both EN and ZH tabs must be filled. Don't forget to switch tabs and enter Chinese content
4. **Uploading low-resolution header images** — Use the best quality images available. Old site may have small images; consider recreating if needed
5. **Not testing links** — Every PDF link should be clicked to verify it opens correctly
6. **Character encoding problems** — If Chinese text shows as garbage characters, delete and re-type, or copy from the rendered page (not the HTML source)
7. **Skipping meta descriptions** — Meta title and description are important for SEO; fill them in for each page

### 7.11 Links to Relevant PRD Sections

| Section | Content |
|---------|---------|
| Section 2.1 | Page Inventory (complete list of pages) |
| Section 2.2 | Content Detail Per Page (exact text for each page) |
| Section 2.2.5-2.2.7 | Announcements, Financial Reports, ESG Reports (PDF handling) |
| Section 14 | Grilling Decisions (D6, D11, D12, D14) |
| Section 7.4 | Public Website Requirements (WEB-06: PDF download links) |