import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always allow billing pages
  if (pathname === "/billing/success" || pathname === "/billing") {
    return NextResponse.next();
  }

  // Super Admin protection
  if (pathname.startsWith("/super-admin") && !pathname.includes("/login")) {
    const token = request.cookies.get("super_access_token");
    if (!token) {
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

    if (!token) {
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
