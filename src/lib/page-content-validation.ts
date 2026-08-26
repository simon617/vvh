export const VALID_LOCALES = ["en", "zh"] as const;
export type Locale = (typeof VALID_LOCALES)[number];

export interface PageContentBody {
  locale: string;
  isPublished?: boolean;
  title?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  heroImage?: string | null;
  contentHtml?: string | null;
  breadcrumbLabel?: string | null;
}

export type PageContentValidation =
  | { ok: true; data: PageContentBody }
  | { ok: false; errors: string[] };

/**
 * Validate a PUT /api/pages/[slug] body. Pure & dependency-free so it can be
 * unit-tested in isolation; kept OUT of the route module because Next.js
 * type-checks every export of a route module (rejecting free functions).
 */
export function validatePageContentBody(
  input: unknown
): PageContentValidation {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { ok: false, errors: ["body must be a JSON object"] };
  }

  const body = input as Record<string, unknown>;

  if (
    typeof body.locale !== "string" ||
    !VALID_LOCALES.includes(body.locale as Locale)
  ) {
    errors.push("locale must be 'en' or 'zh'");
  }

  if (body.title !== undefined && typeof body.title !== "string") {
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
