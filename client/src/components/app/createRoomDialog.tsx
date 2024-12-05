'use client'

import React, { useCallback, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { CreateRoomSchema, CreateRoomSchemaType } from '@/schema/createRoomSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createRoom } from '@/actions/createMeeting';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
export default function CreateRoomDialog() {

    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();

    const form = useForm<CreateRoomSchemaType>({
        resolver: zodResolver(CreateRoomSchema),
        defaultValues: {}
    })


    const { mutate, isPending } = useMutation({
        mutationFn: async (form: CreateRoomSchemaType) => {
            await createRoom({
                title: form.title,
            })
        },
        onSuccess: () => {
            toast.success("Created a Meeting", { id: "create-meeting" });
            setOpen(false);
        },
        onError: (e) => {
            toast.error(`Failed to create a Meeting: ${e.message}`, { id: "create-meeting" })
        }
    });

    const onSubmit = useCallback((values: CreateRoomSchemaType) => {
        toast.loading("Scheduling a meeting...", { id: "create-meeting" });
        mutate(values);
    }, [mutate])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <p className='cursor-pointer  text-xs opacity-70 hover:opacity-100 transition-opacity duration-300'>
                    Create Meeting
                </p>
            </DialogTrigger>
            <DialogContent className='w-full'>
                <DialogHeader>
                    <DialogTitle>
                        Create a Meeting
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col items-center justify-center gap-4'>
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem
                                    className='w-full'
                                >
                                    <FormLabel className='flex gap-1 text-xs items-center'>
                                        Title for the Meeting
                                        <p className='text-xs font-extrabold text-black/70'>(required)</p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='daily standup...' />
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
            </DialogContent>
        </Dialog>
    )
}
