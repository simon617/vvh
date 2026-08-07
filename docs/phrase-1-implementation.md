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

### Task 6: SVG Logo Recreation
**Files created/modified:**
- `public/logo.svg` — Custom SVG logo with:
  - "VISION VALUES" (bold, 24px, white) on first line
  - "Holdings Limited" (regular, 16px, white) on second line
  - Both right-justified
  - Warm Red (#9B1B30) vertical bar on the left (30px wide, 56px tall)
  - Designed to match the Deep Navy (#1B2A4A) header background
- `src/components/layout/Logo.tsx` — Updated to use `public/logo.svg` instead of `public/images/logo.jpg`

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
  │           └──► Task 6 (SVG Logo)
  ├──► Task 7 (Docker) — parallel
  └──► Task 8 (CLI Scripts) — depends on Task 2
```

---

## Execution Summary

All 8 tasks completed successfully. The following notes capture deviations from the original plan:

1. **Logo (D16)**: Recreated as SVG at `public/logo.svg`. Features a Warm Red vertical bar with right-justified "VISION VALUES" and "Holdings Limited" text in white. Replaces the original `logo.jpg`.
2. **Admin routes**: Located under `src/app/[locale]/admin/` (with locale prefix) instead of `src/app/admin/`. This is intentional to support bilingual admin URLs (`/en/admin/login`, `/zh/admin/login`).
3. **i18n**: Updated to use `requestLocale` pattern (next-intl v3.22+ compatible) instead of deprecated `locale` parameter.
4. **Colors**: Added Steel Blue (`#4B6CB7`) as `sidebar` color in Tailwind config for sidebar section headers, complementing the Deep Navy primary.
5. **Layout fixes**: Header uses `pl-1 sm:pl-2` left padding; language switcher text forced white in header/footer; sidebar section headers use Steel Blue for clear hierarchy.

---

## Testing Checklist

- [x] Admin setup flow creates user and redirects to login
- [x] Login with valid credentials returns JWT cookie
- [x] Login with invalid credentials shows error
- [x] Protected admin routes redirect to login when unauthenticated
- [x] JWT cookie cleared on logout
- [o] Language switcher toggles between EN and ZH - Manual verification recommended in a real terminal
- [x] Base layout renders correctly on mobile (320px) and desktop (1920px)
- [o] `npm run reset-password` updates password in DB — Core logic verified (bcrypt hash + upsert + password compare PASS via automated test script simulating the script's exact logic). Interactive prompt could not be driven reliably via piped stdin in this terminal/Windows environment, so the full interactive run was not exercised end-to-end. Manual verification recommended in a real terminal.
- [x] `npm run backup` creates valid archive — Verified `backups/vvh-backup-20260802_1517.zip` contains `data/vvh.db` + `.env`. Note: `uploads/` folder not present yet (no uploads in Phase 1), so it was correctly skipped.
- [o] `docker-compose up -d` **Verify once Docker Desktop is available.**
- [x] SVG logo renders correctly in header
