# Phase 2B: Admin CMS Editor

**Duration:** 1 week  
**Complexity:** High  
**Dependencies:** Phase 2A (Page Templates & Public Site) must be complete

---

## 1. Scope & Goals

Build the admin content management interface that allows non-technical administrators to edit all page content. This includes the page listing, bilingual WYSIWYG editor with image upload, SEO fields, independent publish toggles per locale, logo upload, in-app password change, and admin settings page.

After this phase, the CMS is functional but all pages will still have placeholder content (content migration is Phase 2.5).

---

## 2. Specific Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 2B.1 | Admin pages listing | `/admin/pages` — table of all pages showing published status per locale, links to edit |
| 2B.2 | Page editor | `/admin/pages/[slug]` — EN/ZH tabbed editing form |
| 2B.3 | TipTap WYSIWYG | Limited toolbar: bold, italic, paragraphs, links only (consistent across all content types) |
| 2B.4 | Header image upload | File upload per page, stored in `/uploads/images/`, shown on public page |
| 2B.5 | SEO fields | Meta title and meta description fields per locale per page |
| 2B.6 | Publish toggles | Independent published/unpublished toggle for EN and ZH versions of each page |
| 2B.7 | Logo upload | Logo upload in admin settings, replaces `public/logo.svg` |
| 2B.8 | In-app password change | `/admin/change-password` — current password + new password + confirm |
| 2B.9 | CLI password reset | Already exists from Phase 1, verify it works with the CMS admin flow |
| 2B.10 | Admin settings page | `/admin/settings` — GA4 tracking ID, site name |
| 2B.11 | Admin dashboard | `/admin` — overview with recent activity |
| 2B.12 | Public site data connection | Wire up all 10 page templates to read from `page_contents` table instead of hardcoded placeholders |

---

## 3. Complexity: High

**Justification:**
- TipTap integration requires careful configuration to limit toolbar options (bold, italic, paragraphs, links only)
- Bilingual tabbed interface (EN/ZH) requires state management for unsaved changes across tabs
- Image upload requires file handling, validation (type, size), and storage
- Admin must be intuitive for non-technical users — no technical jargon, clear labels
- Wiring all 10 page templates from static to DB-driven content requires touching every page
- Independent publish toggles per locale (Decision D8) adds conditional rendering logic
- Must handle edge cases: unpublished pages redirect or show 404; missing locale falls back to other locale

---

## 4. Dependencies

- **Phase 1**: Admin auth, Prisma schema (`pages`, `page_contents`, `site_settings` tables), layout shell
- **Phase 2A**: All 10 page templates exist and are rendering correctly; they just need to be wired to DB data

---

## 5. Key Technical Decisions Needed

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| TD-12 | TipTap setup | @tiptap/react with custom extension config | Use `StarterKit` with only bold, italic, paragraph, heading; remove bulletList, blockquote, code |
| TD-13 | Image upload handling | Next.js API route vs direct file write | API route at `/api/upload/image` that writes to `/uploads/images/` and returns URL |
| TD-14 | File upload validation | Client-side only vs client + server | Both: validate file type (jpg/png/svg) and size (< 5MB) on client; re-validate on server |
| TD-15 | Tab state management | URL params vs component state | Use URL search params (`?tab=en` or `?tab=zh`) so browser back/forward works and links are shareable |
| TD-16 | Auto-save vs manual save | Manual save button only | Manual save with "Save" button; show "Unsaved changes" indicator if form is dirty |
| TD-17 | Unpublished page behavior | Show 404 vs redirect to parent vs show "coming soon" | 404 is simplest and most standard; implement as Next.js `notFound()` |

---

## 6. Potential Risks & Challenges

| Risk | Impact | Mitigation |
|------|--------|------------|
| TipTap HTML output inconsistent with page styles | Broken layouts on public site | Sanitize TipTap output and wrap in a well-defined `.prose` class using Tailwind Typography |
| Admin finds WYSIWYG confusing | Content editing errors | Keep toolbar minimal; use clear Chinese/English labels on buttons; add inline help text |
| Image upload fails silently | Broken images on public pages | Show clear success/error messages after upload; validate file type and size before upload |
| Admin accidentally unpublishes both locales | Page goes 404 with no way to recover | Add confirmation dialog; show warning if both locales would be unpublished |
| Large uploads slow down the admin | Poor admin experience | Limit file size to 5MB; show upload progress indicator |

---

## 7. Context Checklist (Handoff Document)

### 7.1 Setup Instructions

```bash
# Ensure Phase 1 and 2A are complete
cd vvh
npm run dev

# Login at /admin/login (use credentials from Phase 1 setup)
# Navigate to /admin/pages to see page listing
# Click any page to edit content
```

### 7.2 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `src/app/admin/pages/page.tsx` | Admin pages listing (table with published status) |
| `src/app/admin/pages/[slug]/page.tsx` | Page editor (EN/ZH tabs, WYSIWYG, image upload, SEO) |
| `src/components/admin/TipTapEditor.tsx` | Limited WYSIWYG editor component |
| `src/components/admin/LocaleTabs.tsx` | EN/ZH tab switcher for bilingual editing |
| `src/components/admin/ImageUploader.tsx` | File upload component with preview |
| `src/app/admin/change-password/page.tsx` | Password change form |
| `src/app/admin/settings/page.tsx` | Site settings (GA4 ID, site name) |
| `src/app/api/upload/image/route.ts` | Image upload API endpoint |
| `src/app/api/pages/[slug]/route.ts` | Page content API (GET/PUT) |
| `src/lib/page-content.ts` | Server-side helpers to fetch page content from DB |

### 7.3 Database / Data Models

Active tables for this phase:
- **`pages`** — Seeded with all 10 page slugs during migration (home, board-of-directors, corporate-details, corporate-governance, announcements, financial-reports, esg-reports, lost-share-certificates, corporate-communications, contact)
- **`page_contents`** — Created/updated via the editor. EN and ZH are separate rows linked by `page_id`
- **`site_settings`** — GA4 tracking ID, site name

**Seed data required:** When applying the initial migration, insert 10 rows into `pages` table with correct slugs and menu_orders.

### 7.4 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pages` | GET | List all pages with published status per locale |
| `/api/pages/[slug]` | GET | Get page content for both locales (or single locale with ?locale parameter) |
| `/api/pages/[slug]` | PUT | Update page content for a specific locale |
| `/api/upload/image` | POST | Upload header image (returns file path) |
| `/api/settings` | GET | Get site settings |
| `/api/settings` | PUT | Update site settings |
| `/api/auth/change-password` | POST | Change admin password |

### 7.5 Environment Variables / Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `UPLOAD_DIR` | No | Override upload directory (default: `./uploads`) |
| `MAX_FILE_SIZE` | No | Maximum upload size in bytes (default: 5242880 = 5MB) |

### 7.6 Third-Party Services / Tools

| Service | Purpose |
|---------|---------|
| **@tiptap/react** | WYSIWYG editor |
| **@tiptap/starter-kit** | Base extensions for TipTap |
| **@tiptap/extension-link** | Link support in WYSIWYG |
| **tailwindcss/typography** | `.prose` class for rendering WYSIWYG HTML on public pages |

### 7.7 Authentication / Security Considerations

- All `/admin/*` routes protected by JWT middleware (from Phase 1)
- API routes for CMS operations must verify JWT
- Image upload only accepts: jpg, jpeg, png, svg, webp
- Image upload size limited to 5MB
- TipTap output should be sanitized to prevent XSS (TipTap does this by default, but verify)
- WYSIWYG links should use `rel="noopener noreferrer"` and `target="_blank"` for external URLs

### 7.8 Testing Requirements for This Phase

- [ ] Admin can see all 10 pages in `/admin/pages` listing
- [ ] Admin can click a page to open the editor
- [ ] Editor shows two tabs: EN and ZH
- [ ] Switching tabs preserves unsaved content (client-side state)
- [ ] TipTap toolbar only shows: bold, italic, link, paragraph, heading
- [ ] Can upload header image; preview shown after upload
- [ ] Can set meta title and meta description
- [ ] Can toggle published/unpublished independently for EN and ZH
- [ ] Saving updates the page_contents table
- [ ] Public page shows published content (not placeholder)
- [ ] Unpublished locale shows 404
- [ ] Admin can change password in-app
- [ ] Admin settings page saves and retrieves GA4 tracking ID
- [ ] Logo upload replaces the header logo

### 7.9 Known Constraints / Decisions Already Made

- **D4**: One consistent limited WYSIWYG editor for all content types (TipTap)
- **D8**: Independent publish toggle per locale (enforced in the editor UI)
- **D2**: Header images are editable per page (implemented as file upload)
- **D14**: Director photos handled via WYSIWYG content (no separate field)
- **D11**: Policy/static PDFs pasted as links in WYSIWYG (no separate document manager)
- **D13**: GA4 ID configurable in admin settings (implemented in this phase)
- **D3**: In-app password change (P0) + CLI reset (implemented in this phase)

### 7.10 Common Pitfalls to Avoid

1. **TipTap toolbar too complex** — Limit to only what's needed: bold, italic, paragraph, heading, link. Remove bullet lists, blockquotes, code blocks
2. **Not sanitizing HTML output** — TipTap outputs HTML that will be rendered on public pages. Ensure it's safe
3. **Locale tab losing unsaved work** — Warn user before switching tabs if there are unsaved changes
4. **Forgetting to seed the pages table** — The `pages` table must have all 10 slugs inserted before the editor can work
5. **Image URL not persisting** — Store relative path in DB, construct full URL at render time based on site URL
6. **Published status not checked in middleware** — Public page routes must check both the page exists AND the current locale is published
7. **Admin settings affecting all locales** — GA4 ID and site name are global (locale=NULL in site_settings)

### 7.11 Links to Relevant PRD Sections

| Section | Content |
|---------|---------|
| Section 7.1 | Content Editing (CMS) Requirements (CMS-01 to CMS-11) |
| Section 9.2-9.3 | Data Model: `pages` and `page_contents` tables |
| Section 10.1 | Admin Routes (`/admin/pages`, `/admin/pages/[slug]`, `/admin/settings`, `/admin/change-password`) |
| Section 8.4 | Images (header banners editable per page) |
| Section 14 | Grilling Decisions (D2, D3, D4, D8, D11, D13, D14) |