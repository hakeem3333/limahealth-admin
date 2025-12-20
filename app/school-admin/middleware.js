import { NextResponse } from "next/server";

export const config = {
  matcher: [
    "/school-admin/:path*", // Protect all school-admin routes
    "/super-admin/:path*", // Protect all super-admin routes
  ],
};

/**
 * RBAC Middleware for Next.js App Router
 *
 * Expects JWT stored in cookies: `token`
 * Verifies role before allowing access.
 */
export async function middleware(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    // No token → redirect to login
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Decode JWT (without signature verification)
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );

    const role = payload.role; // e.g., "schoolAdmin" or "superAdmin"
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/school-admin") && role !== "schoolAdmin") {
      return unauthorized(req);
    }

    if (pathname.startsWith("/super-admin") && role !== "superAdmin") {
      return unauthorized(req);
    }

    // User allowed
    return NextResponse.next();
  } catch (err) {
    console.error("RBAC Middleware Error:", err);
    return unauthorized(req);
  }
}

/* -----------------------------
   Helpers
------------------------------ */

function unauthorized(req) {
  const url = req.nextUrl.clone();
  url.pathname = "/403"; // Redirect to 403 page
  return NextResponse.rewrite(url);
}
