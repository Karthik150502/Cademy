import { Env } from "@/lib/config";
import { decode, JwtPayload, sign } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token');
    if (!token) {
        return NextResponse.json({
            message: "Token not found",
        })
    }
    let payload = decode(token) as JwtPayload;
    const accessToken = sign({
        id: payload.id,
        email: payload.email,
        name: payload.name,
        image: payload.image,
    }, Env.AuthSecret, {
        expiresIn: 60 * 60 * 2
    })

    cookies().set("access_token", accessToken, {
        httpOnly: true
    });
    return NextResponse.json({
        message: "Access token updated",
    })
}