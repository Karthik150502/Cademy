'use client'
import React, { useCallback } from 'react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader
} from '../ui/card'
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { useMutation } from '@tanstack/react-query'
import { SignInSchema, signInSchemaType } from '@/schema/signInSchema';
import Link from 'next/link'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { signInUser } from '@/actions/signInUser'
import { oAuthSignInUser } from '@/actions/oAuthSignIn'
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
export default function SigninComponent() {


    const form = useForm<signInSchemaType>({
        resolver: zodResolver(SignInSchema),
        defaultValues: {}
    });

    const { mutate, isPending } = useMutation({
        mutationFn: async (form: signInSchemaType) => {
            await signInUser({
                email: form.email,
                password: form.password,
            })
        },
        onSuccess: () => {
            toast.success("User Signed in.", { id: "user-signin" });
        },
        onError: (e) => {
            toast.error(`Failed to signin: ${e.message}`, { id: "user-signin" })
        }
    });

    const onSubmit = useCallback((values: signInSchemaType) => {
        toast.loading("Signing in....", { id: "user-signin" });
        mutate(values);
    }, [mutate])

    return (
        <Card className='min-w-[320px] w-[360px] shadow-xl'>
            <CardHeader className='w-full flex items-center justity-center'>
                Auth | Sign In
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col items-center justify-center gap-2'>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem
                                    className='w-full'
                                >
                                    <FormLabel className='flex gap-1 text-xs items-center'>
                                        Email
                                        <p className='text-xs font-extrabold text-black/70'>(required)</p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage className='text-xs w-full text-right' />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem
                                    className='w-full'
                                >
                                    <FormLabel className='flex gap-1 text-xs items-center'>
                                        Password
                                        <p className='text-xs font-extrabold text-black/70'>(required)</p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage className='text-xs w-full text-right' />
                                </FormItem>
                            )}
                        />
                        <Button type='submit' className='w-full' disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />}
                            {!isPending && "Submit"}
                        </Button>
                    </form>
                </Form>

            </CardContent>
            <CardFooter className='border-t border-t-black/15 w-full flex flex-col items-center justify-center gap-2 py-4'>
                <Button type='button' className='w-full' variant={"outline"}
                    onClick={async () => {
                        await oAuthSignInUser("google")
                    }}
                >
                    Sign In with Google
                </Button>
                <p>
                    Don&apos;t have an account? <Link href={'/auth/signup'} className='hover:underline text-teal-400'>&nbsp;Sign Up</Link>
                </p>
            </CardFooter>
        </Card >
    )
}
