'use server'
import { signIn } from "@/auth"
import { CredentialsSignin } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect"


export async function signInUser({
    email, password
}: {
    email: string, password: string
}) {
    try {
        await signIn("credentials", {
            email,
            password,
            redirect: true,
            redirectTo: "/"
        })
    } catch (e) {
        if (isRedirectError(e)) {
            throw e;
        }
        throw new Error((e as CredentialsSignin).message)
    }
}