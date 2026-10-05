import { NextResponse } from "next/server";

/**
 * GET /api/health — liveness probe.
 *
 * Used by the container HEALTHCHECK (docker-compose.prod.yml), the post-deploy
 * validation in deploy.sh, and external uptime monitors (Uptime Kuma /
 * UptimeRobot). Force-dynamic so a stale prerender can never mask a restart.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { ok: true, service: "vvh", time: new Date().toISOString() },
    { status: 200 }
  );
}