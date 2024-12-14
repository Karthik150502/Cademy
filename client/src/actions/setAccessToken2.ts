'use server'
import { cookies } from "next/headers"
export async function setAccessTokenCookie(token: string) {
    cookies().set("access_token", token, {
        httpOnly: true
    });
}