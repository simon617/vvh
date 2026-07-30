# Phase 1 — Implementation Plan

**Project:** Vision Values Holdings Limited — Website Revamp  
**Phase:** 1 — Foundation & Infrastructure  
**Duration:** 1-2 weeks  
**Dependencies:** None (starting point)

---

## Task Breakdown (8 Tasks)

### Task 1: Initialize Next.js 14 Project + Tailwind + TypeScript
**Files to create/modify:**
- `package.json` — Dependencies: next@14, react@18, typescript, tailwindcss, prisma, @prisma/client, next-intl, jsonwebtoken, bcryptjs, nodemailer, archiver, tsx
- `tsconfig.json` — Strict mode enabled, path aliases (`@/*` → `src/*`)
- `tailwind.config.ts` — Custom theme with brand colors
- `postcss.config.js` — Tailwind + autoprefixer
- `next.config.js` — App Router, output standalone for Docker
- `.env.example` — All env vars documented
- `.env` — Initial env vars for development
- `.gitignore` — Node modules, `.env`, `prisma/data/`, `uploads/`, `.next/`
- `src/app/globals.css` — Tailwind directives + base styles

### Task 2: Prisma Schema + Initial Migration
**Files to create/modify:**
- `prisma/schema.prisma` — All 6 models
- `src/lib/prisma.ts` — Prisma client singleton

### Task 3: i18n Routing with next-intl
**Files to create/modify:**
- `src/i18n.ts` — next-intl configuration
- `src/middleware.ts` — i18n routing + auth middleware
- `src/app/[locale]/layout.tsx` — Locale-specific layout
- `src/app/[locale]/page.tsx` — Home page placeholder
- `messages/en.json` — English UI strings
- `messages/zh.json` — Chinese UI strings

### Task 4: Admin Auth System (JWT + bcrypt)
**Files to create/modify:**
- `src/lib/auth.ts` — JWT sign/verify, bcrypt helpers
- `src/app/[locale]/admin/login/page.tsx` — Login form
- `src/app/[locale]/admin/setup/page.tsx` — First-run setup
- `src/app/[locale]/admin/layout.tsx` — Admin layout with auth guard
- `src/app/[locale]/admin/page.tsx` — Admin dashboard placeholder
- `src/app/api/auth/login/route.ts` — Login API route
- `src/app/api/auth/setup/route.ts` — Setup API route
- `src/app/api/auth/logout/route.ts` — Logout API route
- `src/app/api/auth/me/route.ts` — Check session API route

### Task 5: Base Responsive Layout Shell
**Files to create/modify:**
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/MobileMenu.tsx`
- `src/components/layout/LanguageSwitcher.tsx`
- `src/app/[locale]/layout.tsx` — Updated with Header, Footer, Sidebar
- `src/app/not-found.tsx` — 404 page

### Task 6: Logo Integration
**Files to create/modify:**
- `src/components/layout/Logo.tsx` — Logo component using existing `public/images/logo.jpg`
- `public/images/logo.jpg` — Existing brand logo (preserved from original)
- Note: D16 requested an SVG recreation, but the existing logo.jpg was used directly for faithful brand reproduction. If an SVG version is needed later, it can be added to `public/logo.svg`.

### Task 7: Docker Configuration
**Files to create/modify:**
- `Dockerfile` — Multi-stage build
- `docker-compose.yml` — App + SQLite volume + uploads volume
- `.dockerignore`

### Task 8: CLI Scripts (Backup + Password Reset)
**Files to create/modify:**
- `scripts/backup.ts`
- `scripts/reset-password.ts`
- `package.json` — Add scripts

---

## Task Dependencies

```
Task 1 (Init Project)
  ├──► Task 2 (Prisma Schema)
  ├──► Task 3 (i18n Routing)
  │     ├──► Task 4 (Admin Auth)
  │     └──► Task 5 (Base Layout)
  │           └──► Task 6 (Logo Integration)
  ├──► Task 7 (Docker) — parallel
  └──► Task 8 (CLI Scripts) — depends on Task 2
```

---

## Execution Summary

All 8 tasks completed successfully. The following notes capture deviations from the original plan:

1. **Logo (D16)**: Used `public/images/logo.jpg` directly instead of recreating as SVG. The SVG can be added later without code changes.
2. **Admin routes**: Located under `src/app/[locale]/admin/` (with locale prefix) instead of `src/app/admin/`. This is intentional to support bilingual admin URLs (`/en/admin/login`, `/zh/admin/login`).
3. **i18n**: Updated to use `requestLocale` pattern (next-intl v3.22+ compatible) instead of deprecated `locale` parameter.
4. **Colors**: Added Steel Blue (`#4B6CB7`) as `sidebar` color in Tailwind config for sidebar section headers, complementing the Deep Navy primary.
5. **Layout fixes**: Header full-width with proper padding; language switcher text forced white in header/footer; sidebar section headers use Steel Blue for clear hierarchy.

---

## Testing Checklist

- [x] Admin setup flow creates user and redirects to login
- [ ] Login with valid credentials returns JWT cookie
- [ ] Login with invalid credentials shows error
- [ ] Protected admin routes redirect to login when unauthenticated
- [ ] JWT cookie cleared on logout
- [ ] Language switcher toggles between EN and ZH
- [x] Base layout renders correctly on mobile (320px) and desktop (1920px)
- [ ] `npm run reset-password` updates password in DB
- [ ] `npm run backup` creates valid archive
- [ ] `docker-compose up -d` starts app and persists data across restarts
- [x] logo.jpg renders correctly in header