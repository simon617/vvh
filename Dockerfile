# syntax=docker/dockerfile:1

############################
# Stage 1: Builder          #
############################
# Node 24 LTS (matches .nvmrc / .node-version / package.json engines / CI
# workflows). The dependency tree requires node >=22 (jest-dom v7); Node 20 is
# past EOL (2026-04) and we standardise on the same major as the dev machine.
FROM node:24-alpine AS builder
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
# Keep in sync with .github/actions/node-setup/action.yml and package-lock.json generation.
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
# > ENV DATABASE_URL=file:./data/vvh.db
# > RUN npx prisma db push --skip-generate \
# >  && npm run seed

############################
# Stage 2: Runtime          #
# Single multi-layer image   #
############################
FROM node:24-alpine AS runner
WORKDIR /app

# OpenSSL for Prisma at runtime. `zlib` is upgraded deliberately: the base image
# ships zlib 1.3.2-r1, which Trivy reports as CVE-2026-4738 (fixed in 1.4-r0).
# Targeted upgrade (not a blanket `apk upgrade`) to keep the image reproducible.
RUN apk add --no-cache openssl \
  && apk upgrade --no-cache zlib

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root runtime user.
#RUN addgroup --system --gid 1001 nodejs \
#  && adduser --system --uid 1001 nextjs

# In runner stage, replace the user creation:
ARG UID=1001
ARG GID=1001
RUN addgroup --system --gid ${GID} nodejs \
  && adduser --system --uid ${UID} nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src

# Runtime deps:
#   bcryptjs — used by the app
#   prisma   — CLI needed for `prisma db push` in the entrypoint
#   tsx      — TypeScript runtime, needed because the seed is `prisma/seed.ts`
RUN npm install --no-save --omit=dev bcryptjs prisma tsx @prisma/client

# Remove the package manager from the runtime image — the app never needs npm at
# runtime (the entrypoint calls ./node_modules/.bin/* directly). The npm/corepack
# trees bundled in the base image carry their own copies of undici, glob,
# minimatch, brace-expansion, ip-address and postcss-selector-parser, which Trivy
# reports as vulnerable CVE sources; upgrading npm does not help (npm 12 still
# bundles vulnerable versions), so the only real fix is to not ship it. This must
# stay AFTER the `npm install` above; npm remains available in the builder stage.
RUN rm -rf /usr/local/lib/node_modules/npm \
  /usr/local/lib/node_modules/corepack \
  /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack \
  /usr/local/bin/yarn /usr/local/bin/yarnpkg /usr/local/bin/pnpm /usr/local/bin/pnpx

# Entrypoint: initializes the SQLite DB on first boot if the bind mount is empty.
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Runtime uploads directory (persisted in a named volume).
RUN mkdir -p /app/prisma/data /app/uploads \
  && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]