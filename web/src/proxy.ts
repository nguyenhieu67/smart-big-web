import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/register"];
const SESSION_COOKIES = ["accessToken", "refreshToken"];

// Chỉ kiểm tra "có cookie phiên hay không" để chuyển trang sớm.
// Token hết hạn thật sự do axios interceptor xử lý (refresh hoặc đẩy về /login).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has("accessToken") || request.cookies.has("refreshToken");
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Phiên đã hết hạn/không hợp lệ (client đẩy về /login?expired=1): xoá cookie cũ
  // và cho vào trang đăng nhập, nếu không sẽ bị đá ngược /dashboard -> /login mãi.
  if (isAuthPage && request.nextUrl.searchParams.has("expired")) {
    const res = NextResponse.next();
    SESSION_COOKIES.forEach((name) => res.cookies.delete(name));
    return res;
  }

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Chặn mọi trang trừ api, file tĩnh và asset của Next; trang mới thêm tự được bảo vệ
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
