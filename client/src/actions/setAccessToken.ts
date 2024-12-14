import "server-only";
import { Env } from "@/lib/config";
import { JWTPayload } from "jose";
import { sign } from "jsonwebtoken";
import { cookies } from "next/headers";
export async function setAccessToken(payload: JWTPayload) {
    // const accessToken = await new SignJWT({ ...payload })
    //     .setProtectedHeader({ alg: 'HS256' })
    //     .setExpirationTime('2h')
    //     .setIssuedAt()
    //     .sign(new TextEncoder().encode(Env.AuthSecret));
    const accessToken = sign({ ...payload }, Env.AuthSecret, {
        expiresIn: 60 * 60 * 2,
    })
    cookies().set("access_token", accessToken);
}