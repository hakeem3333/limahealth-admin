// import { NextResponse } from "next/server";

// export const config = {
//   matcher: [
//     "/school-admin/:path*", // Protect all school-admin routes
//     "/super-admin/:path*", // Protect all super-admin routes
//   ],
// };

// /**
//  * RBAC Middleware for Next.js App Router
//  *
//  * Expects JWT stored in cookies: `token`
//  * Verifies role before allowing access.
//  */
// export async function middleware(req) {
//   const token = req.cookies.get("token")?.value;

//   if (!token) {
//     // No token → redirect to login
//     const loginUrl = new URL("/login", req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   try {
//     // Decode JWT (without signature verification)
//     const payload = JSON.parse(
//       Buffer.from(token.split(".")[1], "base64").toString("utf-8")
//     );

//     const role = payload.role; // e.g., "schoolAdmin" or "superAdmin"
//     const pathname = req.nextUrl.pathname;

//     if (pathname.startsWith("/school-admin") && role !== "schoolAdmin") {
//       return unauthorized(req);
//     }

//     if (pathname.startsWith("/super-admin") && role !== "superAdmin") {
//       return unauthorized(req);
//     }

//     // User allowed
//     return NextResponse.next();
//   } catch (err) {
//     console.error("RBAC Middleware Error:", err);
//     return unauthorized(req);
//   }
// }

// /* -----------------------------
//    Helpers
// ------------------------------ */

// function unauthorized(req) {
//   const url = req.nextUrl.clone();
//   url.pathname = "/403"; // Redirect to 403 page
//   return NextResponse.rewrite(url);
// }


import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/school-admin/:path*", 
    "/super-admin/:path*",
  ],
};

export async function middleware(req) {
  // 1. Get the access token
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // 2. Decode JWT payload
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString("utf-8")
    );

    const { role, schoolStatus } = payload;
    const { pathname } = req.nextUrl;

    // --- SUPER ADMIN GUARD ---
    if (pathname.startsWith("/super-admin")) {
      if (role !== "SUPER_ADMIN") return unauthorized(req);
      return NextResponse.next();
    }

    // --- SCHOOL ADMIN GUARD ---
    if (pathname.startsWith("/school-admin")) {
      if (role !== "SCHOOL_ADMIN") return unauthorized(req);

      // 🛑 Check School Lifecycle Status
      
      // A. If awaiting Super Admin approval
      if (schoolStatus === "PENDING_ACTIVATION") {
        // Allow them to see a "Waiting" page, but block the dashboard
        if (pathname !== "/school-admin/pending-approval") {
          return NextResponse.redirect(new URL("/school-admin/pending-approval", req.url));
        }
        return NextResponse.next();
      }

      // B. If Payment is needed (New signup approved or subscription expired)
      if (schoolStatus === "PAYMENT_REQUIRED") {
        // Allow access ONLY to the billing page
        if (pathname !== "/school-admin/billing") {
          return NextResponse.redirect(new URL("/school-admin/billing", req.url));
        }
        return NextResponse.next();
      }

      // C. If Suspended
      if (schoolStatus === "SUSPENDED") {
        return unauthorized(req, "Your account has been suspended. Please contact support.");
      }

      // D. Normal Active Path
      // If they try to go to billing/pending while ACTIVE, send them back to dashboard
      if (schoolStatus === "ACTIVE" && (pathname === "/school-admin/billing" || pathname === "/school-admin/pending-approval")) {
        return NextResponse.redirect(new URL("/school-admin/dashboard", req.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware Error:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

function unauthorized(req: NextRequest, message?: string) {
  const url = new URL("/403", req.url);
  if (message) url.searchParams.set("message", message);
  return NextResponse.rewrite(url);
}