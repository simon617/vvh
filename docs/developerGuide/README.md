# Developer Guide — VVH Website Revamp

**Entry point:** read **[`developer-guide.md`](./developer-guide.md)** — the full orientation guide for anyone new to this codebase.

It covers:
1. What this document is & how to use it
2. High-level architecture + data flows (public render, admin edit)
3. Directory map — which folder to put each file/component in (the rules)
4. Routes, public pages, admin, API — file-by-file purpose + linkages
5. Database schema (Prisma/SQLite) + seed
6. `package.json` commands
7. Environment variables
8. Testing conventions
9. Conventions, rules & gotchas (server/client split, `route.ts` export rule, i18n, content formats per page, uploads, logo contract, admin security, docs discipline)

---

*Companion docs (project history & decisions):*
- `docs/phase-2b-tasklist.md` — task-by-task work log with files modified + commit hashes
- `docs/phase-2b-checklist.md` / `docs/phase-2b-implementation.md` — Phase 2B handoff & plan
- `docs/phase-2-content-migration.md` — CMS content how-to (directors cards, PDF links, report editor)
- `docs/PRD-visionvalues-revamp-v2.md` — product requirements & decisions (D1–D16)