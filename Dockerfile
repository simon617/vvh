# syntax=docker/dockerfile:1

############################
# Stage 1: Builder          #
############################
# Node 22 LTS. NOTE: the dependency tree requires node >=22 (jest-dom v7) and
# Node 20 is past EOL (2026-04); your dev machine runs Node 24.
FROM node:22-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* variables are inlined by Next.js at BUILD time. Supply via
# build arg (deploy.yml) or use the default below.
ARG NEXT_PUBLIC_SITE_URL=https://www.visionvalues.com.hk
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# OpenSSL is required by Prisma at build time.
RUN apk add --no-cache openssl

# Install dependencies first for better layer caching. `npm ci` runs the
# `postinstall` hook which executes `prisma generate` (schema copied first).
# npm 10 has a known bug with the Tiptap optional-peer set
# ("Cannot read properties of null (reading 'edgesOut')"), so we pin npm 11.
# Keep in sync with ci.yml/security.yml and package-lock.json generation.
COPY package.json package-lock.json* ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm install -g --no-audit --no-fund npm@11 \
  && npm ci

# Copy the rest of the source and build the standalone output.
COPY . .
RUN npm run build

# Bootstrap the initial SQLite database (schema + seeded baseline content) into
# the image, so `docker compose up` works on a FRESH volume. `db push` matches
# the schema (same as the dev `npm run db:push` flow) and `npm run seed` upserts
# the CMS pages + their EN/ZH content rows.
ENV DATABASE_URL=file:./data/vvh.db
RUN npx prisma db push --skip-generate \
  && npm run seed

############################
# Stage 2: Runtime          #
# Single multi-layer image   #
############################
FROM node:22-alpine AS runner
WORKDIR /app

# OpenSSL for Prisma at runtime.
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root runtime user.
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Bake the seeded SQLite DB (schema + baseline content) into the image. Docker
# initialises an EMPTY named volume with the files present at the mount path in
# the image, so the first boot applies schema + seed without a manual migrate.
COPY --from=builder /app/prisma/data ./prisma/data

# Runtime uploads directory (persisted in a named volume).
RUN mkdir -p /app/uploads \
  && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]