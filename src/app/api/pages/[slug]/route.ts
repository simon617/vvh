import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getPageBySlug,
  getPageContent,
  upsertPageContent,
} from "@/lib/page-content";
import { validatePageContentBody, VALID_LOCALES } from "@/lib/page-content-validation";
import type { Locale } from "@/lib/page-content-validation";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = params;
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");

  if (localeParam !== null && !VALID_LOCALES.includes(localeParam as Locale)) {
    return NextResponse.json(
      { error: "locale must be 'en' or 'zh'" },
      { status: 400 }
    );
  }

  if (localeParam) {
    const content = await getPageContent(slug, localeParam);
    return NextResponse.json({ slug, locale: localeParam, content });
  }

  const [en, zh] = await Promise.all([
    getPageContent(slug, "en"),
    getPageContent(slug, "zh"),
  ]);
  return NextResponse.json({ slug, en, zh });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = params;

  const body = (await request.json().catch(() => null)) as unknown;
  const validation = validatePageContentBody(body);
  if (!validation.ok) {
    return NextResponse.json({ errors: validation.errors }, { status: 400 });
  }

  const page = await getPageBySlug(slug);
  if (!page) {
    return NextResponse.json(
      { error: `Page not found for slug: ${slug}` },
      { status: 404 }
    );
  }

  const { locale, ...data } = validation.data;
  const content = await upsertPageContent(slug, locale, data);
  return NextResponse.json({ content }, { status: 200 });
}