# Phase 4: SEO, Polish & Deployment

**Duration:** 1 week  
**Complexity:** Low-Medium  
**Dependencies:** Phase 3 (Reports, Announcements & Contact) must be complete. Also requires Phase 2.5 (Content Migration) for full content verification.

---

## 1. Scope & Goals

Polish the complete website with SEO features (301 redirects, sitemap, robots.txt, Open Graph tags, GA4 analytics), create a 404 page, perform Lighthouse and accessibility audits, and finalize Docker deployment configuration. By the end of this phase, the site is ready for production launch.

---

## 2. Specific Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 4.1 | 301 redirect middleware | Redirect all old ASP URLs (`/eng/corp_board.asp`, etc.) to new clean URLs (`/en/board-of-directors`) |
| 4.2 | Root `/` redirect | Redirect `https://www.visionvalues.com.hk/` to language-appropriate home page (browser language detection or default to EN) |
| 4.3 | GA4 analytics integration | Google Analytics 4 tracking script, tracking ID configurable via admin settings (`/admin/settings`) |
| 4.4 | Auto-generated sitemap.xml | Dynamic sitemap listing all published pages × both locales |
| 4.5 | robots.txt | Standard robots.txt allowing all crawlers, pointing to sitemap |
| 4.6 | Open Graph meta tags | `og:title`, `og:description`, `og:image` per page, populated from CMS fields |
| 4.7 | 404 page | Custom not-found page matching site design, with link back to Home |
| 4.8 | Lighthouse audit | Score ≥85 mobile, ≥95 desktop. Address any issues found. |
| 4.9 | WCAG 2.1 AA audit | Pass automated accessibility checks (axe-core or similar) |
| 4.10 | Final testing | Cross-browser testing, broken link check, final content review |
| 4.11 | Docker deployment verification | Confirm `docker-compose up -d` works end-to-end with all features |
| 4.12 | PDF migration cleanup | Ensure all old PDFs from old server are copied and linked correctly (Phase 2.5 follow-up) |

---

## 3. Complexity: Low-Medium

**Justification:**
- Most deliverables are configuration and middleware work
- 301 redirect middleware requires careful mapping but is well-defined (PRD Section 11)
- Lighthouse and WCAG audits may reveal issues that need fixing, but these are typically minor CSS/structure adjustments
- GA4, sitemap, robots.txt, and OG tags are all straightforward to implement
- No new UI components or database work needed

---

## 4. Dependencies

- **Phase 3**: All admin and public features functional
- **Phase 2.5** (preferred but not blocking): Content migrated so sitemap can list actual published pages
- Live site still accessible (for verifying 301 redirect mapping matches old URLs)

---

## 5. Key Technical Decisions Needed

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| TD-26 | 301 redirect implementation | Next.js middleware vs custom server vs `next.config.js` redirects | `next.config.js` `async redirects()` is simplest and works with static export; use this for all known old→new mappings |
| TD-27 | Sitemap generation | Static file vs dynamic API route | Dynamic API route at `/api/sitemap.xml` that queries published pages from DB; more accurate than static |
| TD-28 | Language detection for root `/` | Browser `Accept-Language` vs always EN | Always redirect to `/en/` (simplest, predictable). Browser language detection can be added later as enhancement |
| TD-29 | OG image fallback | Use hero image vs site logo vs none | Use hero image if set; fall back to site logo |
| TD-30 | Analytics loading strategy | Server-side include vs client-side script | Client-side via `<Script>` component with `strategy="afterInteractive"` (standard GA4 approach) |

---

## 6. Potential Risks & Challenges

| Risk | Impact | Mitigation |
|------|--------|------------|
| Search engines may have indexed old URLs | 404 errors from old links | Implement 301 redirects BEFORE launch; test all redirects with a crawler tool |
| Lighthouse score below targets | Poor performance rating | Run Lighthouse early in the phase, fix issues iteratively; common fixes: image optimization, lazy loading, font preloading |
| Accessibility issues found late | Delayed launch | Run axe-core checks early; fix issues during the phase, not at the end |
| Redirect mapping misses some URLs | Broken links from old site | Comprehensive mapping in PRD Section 11; also implement a catch-all redirect pattern for unmatched old URLs |

---

## 7. Context Checklist (Handoff Document)

### 7.1 Setup Instructions

```bash
# Ensure all previous phases are complete
cd vvh

# Build and test production mode
npm run build
npm start

# Docker production deployment
docker-compose up -d --build

# Verify redirects
curl -I https://www.visionvalues.com.hk/eng/corp_board.asp
# Should return 301 → /en/board-of-directors

# Verify sitemap
curl https://www.visionvalues.com.hk/sitemap.xml

# Run Lighthouse
npx lighthouse https://www.visionvalues.com.hk/en/ --view
```

### 7.2 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `next.config.js` | 301 redirect mappings (`async redirects()`) |
| `src/app/sitemap.xml/route.ts` | Dynamic sitemap generation API route |
| `src/app/robots.txt/route.ts` | Robots.txt generation API route |
| `src/app/not-found.tsx` | Custom 404 page |
| `src/components/layout/GAScript.tsx` | GA4 analytics script component |
| `src/lib/metadata.ts` | Open Graph tag generation helpers |
| `src/middleware.ts` | Root `/` → `/en/` redirect (if not handled in `next.config.js`) |
| `src/app/[locale]/layout.tsx` | Updated to include OG tags and GA4 script |

### 7.3 Database / Data Models

- **`page_contents`**: `meta_title` and `meta_description` used for OG tags and SEO
- **`page_contents`**: `hero_image` used for `og:image` fallback
- **`site_settings`**: `ga_tracking_id` key stores the GA4 measurement ID

### 7.4 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sitemap.xml` | GET | Auto-generated sitemap of all published pages × locales |
| `/robots.txt` | GET | Standard robots.txt |

### 7.5 Environment Variables / Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL (e.g., `https://www.visionvalues.com.hk`) — used for sitemap URLs and OG tags |
| `NEXT_PUBLIC_GA_ID` | No | Can be set as default GA4 ID (overridable in admin settings) |

### 7.6 Third-Party Services / Tools

| Service | Purpose |
|---------|---------|
| **Google Analytics 4** | Website analytics (optional, configurable) |
| **axe-core** / **Lighthouse** | Accessibility and performance auditing |

### 7.7 Authentication / Security Considerations

- No authentication for public pages (sitemap, robots.txt, redirects)
- 301 redirects should not expose internal paths or query parameters
- Ensure `sitemap.xml` only lists published pages (not draft/unpublished content)
- GA4 tracking should respect user privacy (no PII in tracking)

### 7.8 Testing Requirements for This Phase

- [ ] All old ASP URLs return 301 to correct new URLs
- [ ] Root `/` redirects to `/en/`
- [ ] Unknown old URLs return a reasonable fallback (redirect to home or 404)
- [ ] `/sitemap.xml` lists all published EN and ZH pages
- [ ] `/sitemap.xml` does NOT list unpublished pages
- [ ] `/robots.txt` is valid and points to sitemap
- [ ] 404 page renders with site header/footer and navigation back to Home
- [ ] 404 page returns HTTP status 404
- [ ] GA4 script loads on all pages (when tracking ID is configured)
- [ ] Each page has correct og:title, og:description, og:image meta tags
- [ ] Lighthouse Performance ≥ 85 mobile, ≥ 95 desktop
- [ ] Lighthouse Accessibility ≥ 90 (WCAG 2.1 AA)
- [ ] No broken links on any page (use link checker tool)
- [ ] Site renders correctly in Chrome, Firefox, Safari, Edge
- [ ] Docker build and deployment works end-to-end
- [ ] All PDF downloads work from public pages

### 7.9 Known Constraints / Decisions Already Made

- **D13**: GA4 ID configurable in admin settings; auto sitemap.xml + OG tags
- **URL-02**: Old ASP URLs redirect to new equivalents (301)
- **URL-03**: Root `/` redirects to language-appropriate home page
- **WEB-08**: 404 page for broken links
- **WEB-10**: Auto-generated sitemap.xml with all published pages
- **WEB-11**: Open Graph meta tags (og:title, og:description, og:image)
- **WEB-09**: GA4 tracking ID configurable via admin settings

### 7.10 Common Pitfalls to Avoid

1. **301 redirects blocking new page routes** — Make sure redirect rules in `next.config.js` don't accidentally catch new URL patterns. Test that `/en/board-of-directors` still works after adding the redirect for `/eng/corp_board.asp`
2. **Sitemap including unpublished pages** — Always filter by `is_published = true` in the sitemap query
3. **OG tags missing for social sharing** — Test sharing a page on Facebook/Twitter/LinkedIn debugger tools
4. **Lighthouse images not optimized** — Use Next.js `<Image>` component with proper `width`, `height`, and `loading="lazy"` for below-fold images
5. **Accessibility contrast issues** — Verify color contrast ratios for all text/background combinations using the color palette in PRD Section 8.3
6. **Forgetting to update sitemap when content changes** — Since sitemap is dynamic (API-based), it always reflects current published state. No action needed.
7. **GA4 not loading in production** — Verify the GA4 measurement ID is set in admin settings after deployment
8. **CORS issues with sitemap/robots.txt** — These should be accessible without CORS configuration; test with browser directly

### 7.11 Links to Relevant PRD Sections

| Section | Content |
|---------|---------|
| Section 7.5 | URL Migration Requirements (URL-01 to URL-03) |
| Section 11 | Public Page URL Structure + 301 Redirect Mapping |
| Section 12 | Non-Functional Requirements (Performance, Accessibility, SEO, Security) |
| Section 7.4 | Public Website Requirements (WEB-07 to WEB-11) |
| Section 14 | Grilling Decisions (D13: SEO/Analytics) |