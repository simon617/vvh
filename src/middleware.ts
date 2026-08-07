import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./i18n";

const intlMiddleware = createMiddleware({
  locales,                // ['en', 'zh'] - supported languages
  defaultLocale,          // 'en' - fallback language
  localePrefix: "always", // Always include locale in URLs (e.g., /en/about)
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. ONLY check admin routes
  if (pathname.includes("/admin")) {
    //  Remove locale prefix to get the actual admin path
    const adminPath = pathname.replace(/^\/(en|zh)/, "");
    
    // Allow login/setup withou auth
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
  
  // This runs for :
  //  ✅ Non-admin routes (e.g., /about, /contact, /products)
  //  ✅ Admin routes with valid token
  return withPathname(intlMiddleware(request), pathname);
}

// Expose the original pathname to server components (e.g. layouts) via a header
// by adding x-pathname as a header, server components can still access the original URL   
function withPathname(response: NextResponse, pathname: string): NextResponse {
  response.headers.set("x-pathname", pathname);
  return response;
}

// Tells Next.js which paths should trigger this middleware. 
// It uses a negative lookahead regex to exclude.
export const config = {
  matcher: ["/((?!_next|api|images|favicon.ico).*)"],
};