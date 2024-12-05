"use server"
import prisma from "@/packages/prisma";
import { cookies } from "next/headers"
import { signOut } from "@/auth";
import { decode, JwtPayload } from "jsonwebtoken";
export async function signOutUser() {
    const access = cookies().get("access_token")
    if (access) {
        const payload = decode(access.value) as JwtPayload;
        await prisma.session.delete({
            where: {
                userId: payload.id
            }
        });
        cookies().delete("access_token")
    }
    await signOut({
        redirect: true,
        redirectTo: "/"
    })
}