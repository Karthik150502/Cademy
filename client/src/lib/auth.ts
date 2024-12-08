import { CredentialsSignin, NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Env } from "./config";
import prisma from "@/packages/prisma";
import { compare } from "bcryptjs";
import { sign, JwtPayload } from 'jsonwebtoken'
import { AdapterUser } from "next-auth/adapters";
import { setAccessToken } from "@/actions/setAccessToken";
import { signOutUser } from "@/actions/signOut";


export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: Env.GoogleClientId,
            clientSecret: Env.GoogleSecret
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                console.log({ email: credentials.email, password: credentials.password });
                // This should be handled with client side validations.
                if (!credentials.email || !credentials.password) {
                    throw new CredentialsSignin("Kinldy provide the Credentials.")
                }

                const userExisting = await prisma.user.findUnique({
                    where: {
                        email: credentials.email as string
                    }
                })

                if (!userExisting) {
                    throw new CredentialsSignin("User not found, please check the email.")
                }
                if (!userExisting.password) {
                    throw new CredentialsSignin("User not found.")
                }



                const passwordOk = await compare(credentials.password as string, userExisting.password!);

                if (!passwordOk) {
                    throw new CredentialsSignin("Password incorrect, kindly check the password.")
                }

                return {
                    name: userExisting.name,
                    email: userExisting.email,
                    id: userExisting.id,
                    image: userExisting.image
                };
            }
        })
    ],
    events: {
        signOut: async () => {
            await signOutUser();
        }
    },
    callbacks: {

        signIn: async ({ user, account }) => {
            console.log("signin")
            console.log("=================================================")
            console.log({ user, account })
            console.log("=================================================");
            let newUser;
            let userAccount;
            try {
                userAccount = await prisma.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: account?.provider as string,
                            providerAccountId: account?.providerAccountId as string,
                        }
                    },
                    select: {
                        user: {
                            select: {
                                id: true
                            }
                        }
                    }
                });

                newUser = await prisma.user.findUnique({
                    where: {
                        email: user.email as string
                    }
                });

                if (!newUser) {
                    newUser = await prisma.user.create({
                        data: {
                            name: user.name,
                            email: user.email as string,
                            image: user.image
                        }
                    });

                }


                if (!userAccount) {
                    userAccount = await prisma.account.create({
                        data: {
                            provider: account?.provider as string,
                            providerAccountId: account?.providerAccountId as string,
                            userId: newUser?.id as string,
                            type: account?.provider === "credentials" ? "credentials" : "oauth"
                        },
                        select: {
                            user: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    })
                }

                return true;
            } catch (e) {
                console.log("Some error occured while ", e);
                return false;
            }
        },

        authorized: async ({ auth }) => {
            console.log("Auth = ", auth);
            return !!auth;
        },


        jwt: async ({ token, user }) => {
            console.log("=================jwt===================");
            const currentTimestamp = Math.floor(Date.now() / 1000);

            console.log({ token, user });
            // On initial sign-in
            if (user) {
                const userId = (await prisma.user.findUnique({
                    where: {
                        email: user.email!
                    },
                    select: {
                        id: true
                    }
                }))?.id as string;
                await setAccessToken({ ...user, id: userId } as JwtPayload);
                const refreshToken = sign({ ...user, id: userId }, Env.AuthSecret, {
                    expiresIn: 60 * 60 * 24 * 30,
                });
                await prisma.session.upsert({
                    where: {
                        userId: userId
                    },
                    create: {
                        token: refreshToken as string,
                        userId: userId,
                        expiresAt: new Date((new Date).getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    },
                    update: {
                        token: refreshToken as string,
                        expiresAt: new Date((new Date).getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    }
                });
                token.user = {
                    id: userId,
                    email: user.email!,
                    image: user.image!,
                    name: user.name!
                };
            } else {
                if (currentTimestamp > token.exp!) {
                    let session = await prisma.session.findUnique({
                        where: {
                            userId: token.user?.id
                        }
                    });

                    if (!session || session.expiresAt < new Date()) {
                        const refreshToken = sign({
                            ...token.user
                        }, Env.AuthSecret, {
                            expiresIn: 60 * 60 * 24 * 30,
                        });
                        session = await prisma.session.create({
                            data: {
                                token: refreshToken as string,
                                userId: token.user?.id as string,
                                expiresAt: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
                            }
                        })
                    }
                }
            }
            // TODO refresh token in the subsequent client refreshes.
            return token;
        },
        session: async ({ session, token }) => {
            if (token.user) {
                session.user = token.user as AdapterUser;
            }
            return session;
        }
    },
    session: {
        maxAge: 60 * 60 * 2, // 2 Hours
        strategy: "jwt"
    },
    pages: {
        signIn: '/auth/signin',
    }
} as NextAuthConfig;