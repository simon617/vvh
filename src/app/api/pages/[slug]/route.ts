import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getPageBySlug,
  getPageContent,
  upsertPageContent,
} from "@/lib/page-content";

const LOCALES = ["en", "zh"] as const;
type Locale = (typeof LOCALES)[number];

interface PageContentBody {
  locale: string;
  isPublished?: boolean;
  title?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroImage?: string | null;
  contentHtml?: string | null;
  breadcrumbLabel?: string | null;
}

type Validation =
  | { ok: true; data: PageContentBody }
  | { ok: false; errors: string[] };

/** Validate a PUT body for page content. Pure — easy to unit-test. */
export function validatePageContentBody(input: unknown): Validation {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: ["body must be a JSON object"] };
  }

  const body = input as Record<string, unknown>;

  if (
    typeof body.locale !== "string" ||
    !LOCALES.includes(body.locale as Locale)
  ) {
    errors.push("locale must be 'en' or 'zh'");
  }

  if (
    body.title !== undefined &&
    typeof body.title !== "string"
  ) {
    errors.push("title must be a string");
  }

  const booleanFields = ["isPublished"] as const;
  for (const field of booleanFields) {
    if (body[field] !== undefined && typeof body[field] !== "boolean") {
      errors.push(`${field} must be a boolean`);
    }
  }

  const nullableStringFields = [
    "metaTitle",
    "metaDescription",
    "heroImage",
    "contentHtml",
    "breadcrumbLabel",
  ] as const;
  for (const field of nullableStringFields) {
    if (
      body[field] !== undefined &&
      body[field] !== null &&
      typeof body[field] !== "string"
    ) {
      errors.push(`${field} must be a string or null`);
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, data: body as unknown as PageContentBody };
}

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

  if (localeParam !== null && !LOCALES.includes(localeParam as Locale)) {
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