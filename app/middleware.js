import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check for Super Admin routes
  if (pathname.startsWith('/super-admin') && !pathname.includes('/login')) {
    const superToken = request.cookies.get('super_access_token');
    if (!superToken) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
  }

  // 2. Check for School Admin routes
  if (pathname.startsWith('/school-admin')) {
    const schoolToken = request.cookies.get('access_token');
    if (!schoolToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/school-admin/:path*', '/super-admin/:path*'],
};