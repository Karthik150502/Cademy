"use server"
import { cookies } from "next/headers"
import { JwtPayload, sign } from "jsonwebtoken";
import { Env } from "@/lib/config";
export async function setAccessToken(payload: JwtPayload) {
    const accessToken = sign(payload, Env.AuthSecret, {
        expiresIn: 60 * 60 * 2,
    });
    cookies().set("access_token", accessToken, {
        httpOnly: true
    });
}