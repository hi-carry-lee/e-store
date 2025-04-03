// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // 处理sessionCartId逻辑
  if (!request.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();
    const response = NextResponse.next();
    response.cookies.set("sessionCartId", sessionCartId);
    return response;
  }

  // JWT验证逻辑，不使用Prisma
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  // 路由保护逻辑
  if (!token && request.nextUrl.pathname.startsWith("/protected")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
