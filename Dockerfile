# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Bootstrap the initial SQLite database (schema + seeded baseline content) into
# the image, so `docker compose up` works on a FRESH volume. `db push` matches
# the current schema (same as the dev `npm run db:push` flow) and `npm run seed`
# upserts the 9 CMS pages + their EN/ZH content rows.
ENV DATABASE_URL=file:./data/vvh.db
RUN npx prisma db push --skip-generate \
  && npm run seed

# Stage 2: Production
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output from builder
# COPY --from=builder  /app/dist   ./dist
#        ↑               ↑           ↑
# Which stage?   What to copy?  Where to put it?
COPY --from=builder /app/public ./public  
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Bake the seeded SQLite DB (schema + baseline content) into the image. Docker
# initializes an EMPTY named volume with the files present at the mount path in
# the image, so the first `docker compose up -d` boots with schema + seed
# already applied (no manual migrate step needed).
COPY --from=builder /app/prisma/data ./prisma/data

# Runtime uploads directory (persisted in a named volume).
RUN mkdir -p /app/uploads
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]