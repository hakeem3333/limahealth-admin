import { NextResponse } from "next/server";

// Reads the `role` claim out of a JWT without verifying its signature —
// this is only used to route mismatched roles away immediately instead of
// letting them load a page shell that 403s on every API call. It is NOT
// the security boundary: every backend route independently re-checks the
// verified, signed token via authenticate + authorizeRole regardless of
// what this decode says, so a tampered/forged token still gets rejected
// server-side even if it fools this check.
function decodeJwtRole(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded))?.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always allow billing pages
  if (pathname === "/billing/success" || pathname === "/billing") {
    return NextResponse.next();
  }

  // Super Admin protection
  // super_access_token expires after 15 min, and super_refresh_token is scoped to
  // the refresh endpoint so it never reaches here. super_session (lives as long as
  // the refresh session) lets the page load anyway — its first API call 401s and
  // the axios interceptor refreshes, or redirects to login if the session is dead.
  if (pathname.startsWith("/super-admin") && !pathname.includes("/login")) {
    const token = request.cookies.get("super_access_token");
    const hasAccess = token && decodeJwtRole(token.value) === "SUPER_ADMIN";
    const hasSession = request.cookies.get("super_session")?.value === "1";
    if (!hasAccess && !hasSession) {
      return NextResponse.redirect(new URL("/super-admin/login", request.url));
    }
  }

  // Org Admin + billing protection
  const isOrgAdmin  = pathname.startsWith("/org-admin");
  const isBilling   = pathname.startsWith("/billing");

  // Legacy redirect: /school-admin/* → /org-admin/*
  if (pathname.startsWith("/school-admin")) {
    const newPath = pathname.replace("/school-admin", "/org-admin");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  // Legacy redirect: /super-admin/schools/* → /super-admin/organisations/*
  if (pathname.startsWith("/super-admin/schools")) {
    const newPath = pathname.replace("/super-admin/schools", "/super-admin/organisations");
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  if (isOrgAdmin || isBilling) {
    const token     = request.cookies.get("access_token");
    const orgStatus = request.cookies.get("org_status")?.value;
    // Same as super-admin: admin_session outlives the 15-min access_token so the
    // page can load and let the axios interceptor refresh (or bounce to /login).
    const hasAccess  = token && decodeJwtRole(token.value) === "ORG_ADMIN";
    const hasSession = request.cookies.get("admin_session")?.value === "1";

    if (!hasAccess && !hasSession) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Pending states — send to pending-approval page
    if (orgStatus === "PENDING_EMAIL_VERIFICATION" || orgStatus === "PENDING_ACTIVATION") {
      if (!pathname.includes("/pending-approval")) {
        return NextResponse.redirect(new URL("/org-admin/pending-approval", request.url));
      }
    }

    // Needs payment
    if ((orgStatus === "PAYMENT_REQUIRED" || orgStatus === "EXPIRED") && !isBilling) {
      return NextResponse.redirect(new URL("/billing", request.url));
    }

    // Active user on billing page — redirect to dashboard
    if (orgStatus === "ACTIVE" && isBilling) {
      return NextResponse.redirect(new URL("/org-admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/org-admin/:path*", "/school-admin/:path*", "/super-admin/:path*", "/billing/:path*"],
};
