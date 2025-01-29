import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/index.html", req.url));
  }
  return NextResponse.next();
}
