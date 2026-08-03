import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle admin routes - check for JWT cookie
  if (pathname.includes("/admin")) {
    // Extract the locale prefix if present
    const adminPath = pathname.replace(/^\/(en|zh)/, "");
    
    // Allow access to login and setup pages without auth
    if (adminPath === "/admin/login" || adminPath === "/admin/setup") {
      return withPathname(intlMiddleware(request), pathname);
    }

    // Check for auth cookie
    const token = request.cookies.get("token")?.value;
    if (!token) {
      // Redirect to login
      const locale = locales.find((l) => pathname.startsWith(`/${l}`)) || defaultLocale;
      const loginUrl = new URL(`/${locale}/admin/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return withPathname(intlMiddleware(request), pathname);
}

// Expose the original pathname to server components (e.g. layouts) via a header
function withPathname(response: NextResponse, pathname: string): NextResponse {
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico).*)"],
};