# Phase 1: Foundation & Infrastructure

**Duration:** 1-2 weeks  
**Complexity:** Medium  
**Dependencies:** None (starting point)

---

## 1. Scope & Goals

Set up the entire project foundation: Next.js project scaffolding, database schema and migrations, admin authentication system, base responsive layout shell, Docker configuration, and backup scripts. By the end of this phase, the project should be runnable with `docker-compose up -d` and present a basic responsive layout with language switcher, but no content or CMS functionality yet.

---

## 2. Specific Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1.1 | Next.js 14 project | App Router + TypeScript, initialized with Tailwind CSS |
| 1.2 | Prisma schema + migration | All 6 data models: `admin_users`, `pages`, `page_contents`, `reports`, `announcements`, `site_settings` |
| 1.3 | Admin auth system | Login page (`/admin/login`), setup flow (`/admin/setup`), JWT session (HTTP-only cookie, 24h expiry), logout |
| 1.4 | Base responsive layout | Header (logo + language switcher), footer, sidebar navigation shell, language switcher (EN/ZH) |
| 1.5 | SVG logo | Recreated from existing `images/logo.jpg` (Decision D16) |
| 1.6 | Docker setup | `Dockerfile` (Node.js 18+), `docker-compose.yml` (app + SQLite volume), restart policy `unless-stopped` |
| 1.7 | Backup script | `npm run backup` — dumps SQLite DB + archives `/uploads/` |
| 1.8 | CLI password reset | `npm run reset-password` — prompts for new username/password, updates `admin_users` table |

---

## 3. Complexity: Medium

**Justification:**
- Auth system (JWT + bcrypt + HTTP-only cookies) requires careful security implementation
- Docker configuration with persistent volumes for SQLite and uploads needs correct setup
- Prisma schema must be designed correctly from the start as it underpins all future phases
- Base layout must be responsive and bilingual-ready
- However, the scope is well-defined with no unknowns

---

## 4. Dependencies

None. This is the starting point for all subsequent phases.

---

## 5. Key Technical Decisions Needed

| # | Decision | Options | Recommendation |
|---|----------|---------|----------------|
| TD-1 | Next.js rendering strategy | SSR vs SSG vs ISR | SSR for admin pages (need session); SSG or ISR for public pages (content from DB) |
| TD-2 | i18n approach | next-intl vs next-i18next vs custom | next-intl is lightweight and works well with App Router |
| TD-3 | JWT secret management | Hardcoded in `.env` vs generated at runtime | Generate during first-run setup, stored in `.env` |
| TD-4 | SQLite file location | Inside container vs mounted volume | Mounted volume at `/data/` for persistence across restarts |
| TD-5 | Upload directory structure | `/uploads/images/`, `/uploads/reports/` | As specified in PRD Section 6 |
| TD-6 | Tailwind configuration | Custom theme with brand colors | Define colors from PRD Section 8.3 in `tailwind.config.ts` |

---

## 6. Potential Risks & Challenges

| Risk | Impact | Mitigation |
|------|--------|------------|
| Docker volume permissions on Windows | SQLite write failures | Use named volumes with correct user mapping; test on Windows Docker Desktop |
| JWT secret not properly secured | Session forgery | Generate strong random secret during setup; document in `.env.example` |
| Prisma schema changes later | Painful migrations | Design schema carefully upfront; use Prisma migrations (not `db push`) |
| i18n routing complexity | Broken language switching | Use next-intl with App Router middleware pattern; test EN/ZH switching early |

---

## 7. Context Checklist (Handoff Document)

### 7.1 Setup Instructions

```bash
# Clone and install
git clone <repo-url>
cd vvh
npm install

# Environment setup
cp .env.example .env
# Edit .env with JWT_SECRET (generate via: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Database setup
npx prisma migrate dev --name init

# Development
npm run dev

# Docker (production-like)
docker-compose up -d --build
```

### 7.2 Key Files & Their Purpose

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | All 6 data models (see PRD Section 9) |
| `src/app/layout.tsx` | Root layout with header, footer, language switcher |
| `src/app/[locale]/layout.tsx` | Locale-specific layout wrapper |
| `src/app/admin/login/page.tsx` | Admin login page |
| `src/app/admin/setup/page.tsx` | First-run admin account creation |
| `src/middleware.ts` | i18n routing + auth middleware |
| `src/lib/auth.ts` | JWT sign/verify, bcrypt hash/compare, session helpers |
| `src/lib/prisma.ts` | Prisma client singleton |
| `Dockerfile` | Multi-stage Node.js 18+ build |
| `docker-compose.yml` | App service + SQLite volume + uploads volume |
| `scripts/backup.ts` | `npm run backup` script |
| `scripts/reset-password.ts` | `npm run reset-password` script |
| `public/logo.svg` | Recreated SVG logo |

### 7.3 Database / Data Models

All 6 models defined in PRD Section 9:
- `admin_users` — Single admin account (reserved for future multi-admin)
- `pages` — Page slugs, menu order, visibility
- `page_contents` — Bilingual content per page (EN/ZH), WYSIWYG HTML, SEO fields
- `reports` — Financial/ESG report PDFs with metadata
- `announcements` — HKEX-linked announcements with auto-fetched metadata
- `site_settings` — Key-value store for site-wide settings

**Note:** `contact_messages` table has been removed per Decision D7 (email-only contact form).

### 7.4 API Endpoints

None in this phase. API routes will be added in later phases for CMS operations.

### 7.5 Environment Variables / Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `file:./data/vvh.db` (SQLite path) |
| `JWT_SECRET` | Yes | Random 64-char hex string |
| `SMTP_HOST` | No | Company SMTP server IP (Phase 3) |
| `SMTP_PORT` | No | SMTP port (default 25) |
| `SMTP_RECIPIENT` | No | Destination email for contact form |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://www.visionvalues.com.hk` |

### 7.6 Third-Party Services / Tools

| Service | Purpose | Phase |
|---------|---------|-------|
| None | All self-hosted | — |

### 7.7 Authentication / Security Considerations

- JWT stored in HTTP-only cookie (not accessible via JavaScript)
- Session expiry: 24 hours
- Passwords hashed with bcrypt (cost factor: 12)
- Admin routes protected by middleware checking JWT validity
- First-run setup redirects to `/admin/setup` if no admin user exists
- CLI password reset as fallback if admin loses access
- CSRF protection via Next.js built-in measures
- XSS protection via TipTap sanitization (Phase 2B)

### 7.8 Testing Requirements for This Phase

- [ ] Admin setup flow creates user and redirects to login
- [ ] Login with valid credentials returns JWT cookie
- [ ] Login with invalid credentials shows error
- [ ] Protected admin routes redirect to login when unauthenticated
- [ ] JWT cookie cleared on logout
- [ ] Language switcher toggles between EN and ZH
- [ ] Base layout renders correctly on mobile (320px) and desktop (1920px)
- [ ] `npm run reset-password` updates password in DB
- [ ] `npm run backup` creates valid archive
- [ ] `docker-compose up -d` starts app and persists data across restarts
- [ ] SVG logo renders correctly in both light and dark contexts

### 7.9 Known Constraints / Decisions Already Made

- **D16**: Logo recreated as SVG (not uploaded from old site)
- **D9**: Docker compose on own server; portable to cloud
- **D10**: Company SMTP uses IP-based auth (no credentials)
- **D15**: Manual `npm run backup`; Prisma migrations for CI/CD
- **D12**: Only logo + header banners as images; decorative sub-photos removed
- **D8**: Independent publish toggle per locale (implemented in Phase 2B, but schema must support it)

### 7.10 Common Pitfalls to Avoid

1. **Forgetting to set up `.env` before first run** — The app should detect missing JWT_SECRET and show a clear error message
2. **SQLite file permissions in Docker** — Ensure the `node` user has write access to the mounted volume
3. **Prisma client not generated** — Always run `npx prisma generate` after schema changes; add to `postinstall` script
4. **JWT secret committed to git** — Add `.env` to `.gitignore` immediately; use `.env.example` for documentation
5. **Hardcoding locale paths** — Use next-intl's routing; don't hardcode `/en/` or `/zh/` in strings

### 7.11 Links to Relevant PRD Sections

| Section | Content |
|---------|---------|
| Section 6 | Tech Stack (Next.js 14, SQLite/Prisma, JWT/bcrypt, Tailwind, Docker) |
| Section 9 | Data Model (all 6 tables) |
| Section 10.1-10.4 | Admin Routes, Setup Flow, Password Reset, Session Management |
| Section 8.2 | Mobile Behavior (base layout must support) |
| Section 8.3 | Color Palette (for Tailwind config) |
| Section 8.4 | Images (logo as SVG) |
| Section 12 | Non-Functional Requirements (Docker, backup) |
| Section 14 | Grilling Decisions (D8, D9, D10, D12, D15, D16) |