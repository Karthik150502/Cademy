'use server'
import prisma from "@/packages/prisma";
import { hash } from "bcryptjs";


import { signUpSchemaType } from "@/schema/signUpSchema";

export async function createUser(data: signUpSchemaType) {


    const user = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    })
    if (user) {
        throw new Error("User already exsists.")
    }

    const newUser = await prisma.user.create({
        data: {
            email: data.email,
            name: data.name,
            password: await hash(data.password, 5),
        }
    })

    await prisma.account.create({
        data: {
            userId: newUser.id,
            provider: "credentials",
            providerAccountId: newUser.id,
            type: "credentials"
        }
    })


    return {
        email: newUser.email,
        name: newUser.name
    }


}