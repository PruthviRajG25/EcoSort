import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check for valid authentication cookies
  const hasEcoCookie = request.cookies.get("ecosort_authenticated")?.value === "true";
  const hasToken = Boolean(request.cookies.get("token")?.value);
  const isAuthenticated = hasEcoCookie || hasToken;

  // Protected paths
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Auth pages (login, register) should not be visible to logged-in users
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if accessing a protected route without auth cookie
    const loginUrl = new URL("/login", request.url);
    // Remember where user was heading to
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect already authenticated users away from login/signup to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Limit the middleware to match only source paths we care about
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
