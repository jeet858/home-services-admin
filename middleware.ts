import { NextResponse, type NextRequest } from "next/server";

// Keep in sync with TOKEN_COOKIE in lib/auth.ts (not imported to keep the edge bundle tiny).
const TOKEN_COOKIE = "subidha_admin_token";
const PUBLIC_PATHS = ["/login", "/offline"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!hasToken && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (hasToken && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets, PWA files and Next internals.
  matcher: ["/((?!_next/|icons/|brand/|sw.js|manifest.webmanifest|icon.png|apple-icon.png|favicon.ico).*)"],
};
