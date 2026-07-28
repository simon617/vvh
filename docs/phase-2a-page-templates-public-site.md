# Phase 2A: Page Templates & Public Site

**Duration:** 1 week  
**Complexity:** High  
**Dependencies:** Phase 1 (Foundation & Infrastructure) must be complete

---

## 1. Scope & Goals

Build all 10 public-facing page templates with responsive design, breadcrumb navigation, and mobile hamburger menu. At the end of this phase, the public site should be fully navigable with all routes working, but content will be static/placeholder (CMS connection comes in Phase 2B).

---

## 2. Specific Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 2A.1 | Home page template | Hero banner + company intro + key metrics + latest reports section |
| 2A.2 | Board of Directors template | Header image + breadcrumb + left nav + director cards (name, title, bio) |
| 2A.3 | Corporate Details template | Header image + breadcrumb + left nav + structured data table |
| 2A.4 | Corporate Governance template | Header image + breadcrumb + left nav + rich text body |
| 2A.5 | Announcements template | Header image + breadcrumb + left nav + HKEX-linked table |
| 2A.6 | Financial Reports template | Header image + breadcrumb + left nav + sortable/filterable table |
| 2A.7 | ESG Reports template | Header image + breadcrumb + left nav + sortable/filterable table |
| 2A.8 | Lost Share Certificates template | Header image + breadcrumb + left nav + rich text body |
| 2A.9 | Corporate Communications template | Header image + breadcrumb + left nav + rich text body |
| 2A.10 | Contact Us template | Header image + breadcrumb + left nav + contact form (static for now; backend in Phase 3) |
| 2A.11 | Breadcrumb navigation | Auto-generated breadcrumbs on all inner pages (PRD WEB-03) |
| 2A.12 | Mobile hamburger menu | Full-screen slide-in overlay menu, collapse sidebar on mobile (PRD WEB-02) |
| 2A.13 | Sidebar navigation | Left sidebar with grouped links: Corporate Information, Investor Relations, Contact Us |

---

## 3. Complexity: High

**Justification:**
- 7 distinct template types need to be implemented across 10 pages
- Each template must be fully responsive (mobile-first) with correct layout for header image, breadcrumb, sidebar, and content area
- Director cards require expandable bios on mobile (2-col tablet, 1-col mobile)
- Report tables need to be horizontal-scrollable on small screens
- The "Content with Sidebar" template is shared across multiple page types and must handle variable content
- Bilingual layout parity must be maintained (Chinese text can be longer/shorter than English)

---

## 4. Dependencies

- **Phase 1** must be complete: responsive layout shell (header, footer, language switcher), Prisma schema, Next.js project running
- Page routes and locale structure must be in place (from Phase 1 i18n setup)

---

## 5. Key Technical Decisions Needed

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| TD-7 | Template architecture | Shared components vs per-page components | Shared layout components (`<ContentWithSidebar>`, `<ReportsTable>`, `<DirectorCards>`) with per-page data fetching |
| TD-8 | Sidebar navigation data source | Hardcoded array vs DB-driven | Hardcoded array initially; DB-driven after CMS in Phase 2B (use `menu_order` from `pages` table) |
| TD-9 | Breadcrumb generation | Static array vs dynamic from page slug | Dynamic from page slug using a mapping file |
| TD-10 | Table horizontal scroll | CSS `overflow-x: auto` vs card-ified mobile view | CSS `overflow-x: auto` for simpler implementation; card-ified view can be added later |
| TD-11 | Placeholder content | Lorem ipsum vs real content samples | Use real content from PRD Section 2.2 where available (company intro text, director names, etc.) |

---

## 6. Potential Risks & Challenges

| Risk | Impact | Mitigation |
|------|--------|------------|
| Template inconsistencies | Uneven user experience across pages | Create a style guide component library within the project (reusable heading, table, card, button components) |
| Chinese text overflow | Layout breakage on small screens | Test all templates with both EN and ZH placeholder text; use appropriate font sizes for CJK characters |
| Mobile navigation usability | Difficult to navigate on small screens | Implement slide-in overlay with clear touch targets (minimum 44×44px per PRD 8.2) |
| Sidebar active state | Hard to tell which page is active | Highlight current page in sidebar based on route; ensure it works for both EN and ZH |

---

## 7. Context Checklist (Handoff Document)

### 7.1 Setup Instructions

```bash
# Ensure Phase 1 is complete and running
cd vvh
npm run dev

# Navigate to:
# - /en/ (English home)
# - /zh/ (Chinese home)
# - /en/board-of-directors
# - /en/corporate-details
# etc.
```

### 7.2 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `src/app/[locale]/page.tsx` | Home page |
| `src/app/[locale]/board-of-directors/page.tsx` | Board of Directors page |
| `src/app/[locale]/corporate-details/page.tsx` | Corporate Details page |
| `src/app/[locale]/corporate-governance/page.tsx` | Corporate Governance page |
| `src/app/[locale]/announcements/page.tsx` | Announcements page |
| `src/app/[locale]/financial-reports/page.tsx` | Financial Reports page |
| `src/app/[locale]/esg-reports/page.tsx` | ESG Reports page |
| `src/app/[locale]/lost-share-certificates/page.tsx` | Lost Share Certificates page |
| `src/app/[locale]/corporate-communications/page.tsx` | Corporate Communications page |
| `src/app/[locale]/contact/page.tsx` | Contact Us page |
| `src/components/layout/ContentWithSidebar.tsx` | Shared layout: header image + breadcrumb + sidebar + content |
| `src/components/layout/DirectorCards.tsx` | Director card grid component |
| `src/components/layout/ReportsTable.tsx` | Sortable reports table component |
| `src/components/layout/HamburgerMenu.tsx` | Mobile slide-in overlay menu |
| `src/components/layout/Breadcrumb.tsx` | Breadcrumb navigation component |
| `src/components/layout/SidebarNav.tsx` | Left sidebar navigation |
| `src/lib/navigation.ts` | Navigation structure (menu items, slugs, labels) |
| `src/lib/placeholders.ts` | Placeholder content for each page × locale |

### 7.3 Database / Data Models

This phase uses **hardcoded/static data**. The `pages` and `page_contents` tables exist in the schema but are not yet populated or queried by the frontend. That comes in Phase 2B when the CMS is connected.

Key schema references:
- `pages.slug` — Must match URL slugs (e.g., `board-of-directors`, `financial-reports`)
- `pages.menu_order` — Determines sidebar ordering
- `pages.parent_slug` — For hierarchical navigation (e.g., Announcements under Investor Relations)
- `page_contents.breadcrumb_label` — Used for breadcrumb display text

### 7.4 API Endpoints

None in this phase. Page data is hardcoded.

### 7.5 Environment Variables / Configuration

No new environment variables. Uses Phase 1 configuration.

### 7.6 Third-Party Services / Tools

None.

### 7.7 Authentication / Security Considerations

- No authentication needed for public pages
- All public routes should render without requiring login
- Admin routes from Phase 1 remain protected

### 7.8 Testing Requirements for This Phase

- [ ] All 10 pages render at `/en/*` and `/zh/*` URLs
- [ ] Each page has correct header image area, breadcrumb, sidebar, and content
- [ ] Breadcrumb navigation shows correct hierarchy on each page
- [ ] Sidebar navigation shows all pages grouped by category
- [ ] Current page is highlighted in sidebar
- [ ] Hamburger menu appears on mobile (< 768px)
- [ ] Hamburger menu slides in/out on tap
- [ ] Language switcher toggles between EN and ZH, preserving the page
- [ ] All pages render correctly at 320px, 768px, and 1920px widths
- [ ] Tables horizontally scroll on mobile (no overflow cutoff)
- [ ] Director cards display correctly in grid (2-col tablet, 1-col mobile)
- [ ] Director bios are expandable/collapsible on mobile
- [ ] All touch targets are minimum 44×44px

### 7.9 Known Constraints / Decisions Already Made

- **D12**: Decorative sub-photos removed. Layout is CSS-only.
- **D14**: Director photos are optional — handled via WYSIWYG, no separate photo component in template
- **D11**: Policy/static PDFs — pasted as links in WYSIWYG; no special PDF component needed in templates
- **D2**: Header images are editable (placeholder images used now, CMS upload in Phase 2B)
- **Color Palette**: PRD Section 8.3 (Deep Navy `#1B2A4A`, Warm Red `#9B1B30`, Gold `#C9A94E`)
- **Logo**: SVG format from Phase 1

### 7.10 Common Pitfalls to Avoid

1. **Building templates in isolation without testing on mobile** — Always test each template at 320px width immediately
2. **Forgetting Chinese text length differences** — Chinese text is often more compact, but can also be longer in certain cases. Test both languages
3. **Hardcoding navigation URLs** — Use the locale prefix from the route, don't hardcode `/en/`
4. **Sidebar not reflecting current route** — Ensure the sidebar highlights the correct page based on the current pathname
5. **Breadcrumb showing wrong locale labels** — Breadcrumb labels must come from the current locale's data
6. **Not handling 404 for missing locale pages** — All pages should exist for both locales; if a page slug is missing for one locale, redirect to the other

### 7.11 Links to Relevant PRD Sections

| Section | Content |
|---------|---------|
| Section 2.1 | Page Inventory (all 10 pages) |
| Section 2.2 | Content Detail Per Page (text for placeholder content) |
| Section 2.3 | Navigation Structure (sidebar grouping) |
| Section 8.1 | Template Types (7 template descriptions) |
| Section 8.2 | Mobile Behavior (hamburger, single-column, touch targets) |
| Section 8.3 | Color Palette (Tailwind theme colors) |
| Section 11 | Public Page URL Structure (route mapping) |
| Section 7.4 | Public Website Requirements (WEB-01, WEB-02, WEB-03, WEB-04) |