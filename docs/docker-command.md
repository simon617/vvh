# Docker Commands — VVH (compose-based deployment)

> Stack: Next.js 14 (`output: "standalone"`) · Prisma + SQLite · Docker Compose v2.
> Compose file: `docker-compose.yml` · Image: `Dockerfile`.
> Named volumes: `vvh_sqlite-data` (DB at `/app/prisma/data/vvh.db`) and
> `vvh_uploads` (runtime uploads at `/app/uploads`) — both survive restarts.
> First boot is **ready out of the box**: the image contains a seeded SQLite DB
> (schema + 9 CMS pages with EN/ZH content), and Docker copies it into an empty
> `sqlite-data` volume automatically.

---

## 0. Before you start (Docker Desktop must be RUNNING)

```powershell
# Engine reachable? (prints e.g. 28.4.0) — if this errors, start Docker Desktop first.
docker version --format "{{.Server.version}}"
docker compose version
```

- Docker Desktop is a **GUI app**: launch it from the Start menu/tray and wait
  until the tray shows "Engine started". The CLI alone is not enough.
- Make sure port **3000** is free (a local `npm run dev` would block it):
  ```powershell
  netstat -ano | findstr :3000
  ```

---

## 1. First-time start

```powershell
cd c:\myProject\vvh

# 1) Create .env (required: JWT_SECRET, NEXT_PUBLIC_SITE_URL)
Copy-Item .env.example .env
#    edit .env and set JWT_SECRET (see env docs)

# 2) Validate the compose file (should exit 0, list service "app")
docker compose config --quiet
docker compose config --services

# 3) Build the image (first build downloads base images + npm ci — ~10-25 min)
docker compose build

# 4) Start detached (auto-restart policy: unless-stopped)
docker compose up -d

# 5) Check it is healthy
docker compose ps
docker compose logs --tail=50 app

# 6) Verify from the host
curl.exe -I http://localhost:3000/robots.txt        # 200 text/plain
curl.exe http://localhost:3000/sitemap.xml          # XML <urlset>…
curl.exe -I http://localhost:3000/en/               # 200
curl.exe -I http://localhost:3000/en/admin/login    # 200 (login page)
```

---

## 2. Most common daily commands

```powershell
docker compose ps                  # container state
docker compose logs --tail=200 app # last 200 log lines
docker compose logs -f app         # follow logs live (Ctrl+C to stop)
docker compose restart app         # restart just the app
docker compose stop                # stop all services (state preserved)
docker compose start               # start again (same containers)
docker compose top                 # live CPU/mem per container
```

---

## 3. Deploy a code change / rebuild

```powershell
git pull                      # or edit locally
docker compose build          # rebuild the image (runs npm ci + build + DB seed)
docker compose up -d          # recreate the container with the new image
docker compose logs --tail=50 app
```

> The seed runs during `docker compose build` (`prisma db push` + `npm run seed`),
> so a rebuild also refreshes the baked baseline database.

---

## 4. Inspect inside the container

```powershell
docker compose exec app sh -c "ls -la /app"
docker compose exec app sh -c "ls -l /app/prisma/data"   # vvh.db present?
docker compose exec app sh -c "ls /app/uploads"          # runtime uploads (volume)
# interactive shell:
docker compose exec app sh
```

---

## 5. Database (SQLite) — backup / restore / reset

The DB is a single file: `/app/prisma/data/vvh.db` (named volume `vvh_sqlite-data`).

```powershell
# Backup the live DB out of the container
docker compose cp app:/app/prisma/data/vvh.db .\backups\vvh.db
# (compose ≥ 2.25; alternatively: docker cp vvh-app-1:/app/prisma/data/vvh.db .\backups\vvh.db)

# Restore a backup (stop first, overwrite, start)
docker compose stop
docker compose cp .\backups\vvh.db app:/app/prisma/data/vvh.db
docker compose start

# List / inspect volumes
docker volume ls
docker volume inspect vvh_sqlite-data

# Reset to the baked baseline (WIPES CMS edits in that volume!)
docker compose down
docker volume rm vvh_sqlite-data
docker compose up -d        # empty volume ⇐ re-copied from the image’s seeded DB
```

---

## 6. Uploads — backup / reset

```powershell
# Backup the uploads volume into a tarball
docker run --rm -v vvh_uploads:/data -v %CD%\backups:/backup ^
  alpine tar czf /backup/uploads.tar.gz -C /data .

# Reset uploads (removes uploaded images/PDFs)
docker compose down
docker volume rm vvh_uploads
docker compose up -d
```

---

## 7. Nuke / full clean rebuild (dev box)

```powershell
docker compose down -v     # stop + remove containers AND both volumes (DB + uploads!)
docker compose build
docker compose up -d
```

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `error during connect ... dockerDesktopLinuxEngine` | Docker Desktop **not running** (engine stopped) | Start Docker Desktop, wait for "Engine started", re-run. |
| `Cannot connect to the Docker daemon` | Engine still booting / crashed | Restart Docker Desktop; `docker version` should print a server version. |
| `port is already allocated` / 3000 in use | Local `npm run dev` or another app on 3000 | Stop the local server, or map another port: change `"3000:3000"` → `"3001:3000"` in compose and browse :3001. |
| App returns **500 / “no such table”** on `/en` or admin | Volume had an EMPTY/old DB (pre-fix image) | `docker compose down` → `docker volume rm vvh_sqlite-data` → `docker compose up -d`. If still stale, `docker compose build` first. |
| Uploads not persisting across `up` | `uploads` volume removed, or host-mounted dir with wrong owner | Keep the named volume `vvh_uploads`; for host dirs: `chown -R 1001:1001` (container user `nextjs`). |
| `Cannot find module for page` / server exits at start | Old/incomplete build | `docker compose build` (ensure `.next/standalone/server.js` exists in the image). |
| Site reachable from host only intermittently | Container still starting | `docker compose logs -f app`; watch for the `Ready in …ms` line. |
| No logs / wrong volumes | Compose project name differs (folder renamed) | `docker compose ps`; check names with `docker volume ls`. |
| Need a shell inside the container | — | `docker compose exec app sh` |
| Verify what the app serves from inside | — | `docker compose exec app sh -c "wget -qO- http://localhost:3000/en/ \| head -5"` |

---

## 9. Reference: what the image does (Dockerfile)

1. `node:18-alpine` builder: `npm ci` → `prisma generate` → `next build`
   (`output: "standalone"`).
2. Builder also boots the SQLite DB: `prisma db push` (schema) + `npm run seed`
   (9 CMS pages + EN/ZH content) → baked into the image.
3. Slim runner: standalone `server.js` + `public/` + `_next/static` + Prisma
   engine + the seeded `prisma/data` DB; runs as non-root user `nextjs`.
4. Compose mounts two named volumes (DB + uploads) and maps `3000:3000`;
   restart policy `unless-stopped`.