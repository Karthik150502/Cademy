// import NextAuth from "next-auth";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
// Use only one of the two middleware options below
// 1. Use middleware directly
// export const { auth: middleware } = NextAuth(authConfig)

// 2. Wrapped middleware option
export default auth(async function middleware(req) {
    // Your custom middleware logic goes here


    if (!req.auth && !req.nextUrl.pathname.startsWith("/auth")) {
        if (checkPath(req.nextUrl.pathname)) {
            const newUrl = new URL("/auth/signin", req.nextUrl.origin);
            return NextResponse.redirect(newUrl)
        }
    }
    return NextResponse.next();
})



function checkPath(path: string) {
    const regex = /^\/(about||)/; //Protects the home page also /
    return regex.test(path)
}



export const config = {
    matcher: [
        "/about/:path*", //Protectted routes
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
}

