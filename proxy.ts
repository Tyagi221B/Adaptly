import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token to check authentication and role
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/" ||
    pathname.startsWith("/api/auth");

  // If user is logged in and trying to access auth pages, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/signup")) {
    if (token.role === "instructor") {
      return NextResponse.redirect(new URL("/instructor/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  // If route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If user is not authenticated, redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based route protection
  if (pathname.startsWith("/instructor")) {
    if (token.role !== "instructor") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/student")) {
    if (token.role !== "student") {
      return NextResponse.redirect(new URL("/instructor/dashboard", request.url));
    }
  }

  // Default /dashboard redirect based on role
  if (pathname === "/dashboard") {
    if (token.role === "instructor") {
      return NextResponse.redirect(new URL("/instructor/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/student/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
