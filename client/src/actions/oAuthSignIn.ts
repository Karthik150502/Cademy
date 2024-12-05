'use server'
import { signIn } from "@/auth"
import { CredentialsSignin } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect"


export async function oAuthSignInUser(provider: string) {
    try {
        await signIn(provider, {
            redirect: true,
            redirectTo: "/"
        })
    } catch (e) {
        if (isRedirectError(e)) {
            throw e;
        }
        return (e as CredentialsSignin).message
    }
}