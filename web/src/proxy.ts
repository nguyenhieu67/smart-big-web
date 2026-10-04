import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register"];

// Chỉ kiểm tra "có cookie phiên hay không" để chuyển trang sớm.
// Token hết hạn thật sự do axios interceptor xử lý (refresh hoặc đẩy về /login).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has("accessToken") || request.cookies.has("refreshToken");
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
