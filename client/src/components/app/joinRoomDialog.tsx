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
import { JoinRoomSchema, JoinRoomSchemaType } from '@/schema/joinRoomSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { joinRoom } from '@/actions/joinMeeting';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { useRouter } from 'next/navigation';
export default function JoinRoomDialog() {

    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();

    const form = useForm<JoinRoomSchemaType>({
        resolver: zodResolver(JoinRoomSchema),
        defaultValues: {}
    })


    const { mutate, isPending } = useMutation({
        mutationFn: async (form: JoinRoomSchemaType) => {
            return await joinRoom({
                roomId: form.roomId,
            })
        },
        onSuccess: (data) => {
            toast.success("Joined the meeting", { id: "create-meeting" });
            router.push(`/meeting/?meetingId=${data.roomId}`)
        },
        onError: (e) => {
            toast.error(`Failed to join the Meeting: ${e.message}`, { id: "create-meeting" })
        }
    });

    const onSubmit = useCallback((values: JoinRoomSchemaType) => {
        toast.loading("Scheduling a meeting...", { id: "create-meeting" });
        mutate(values);
    }, [mutate])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <p className='cursor-pointer text-xs opacity-70 hover:opacity-100 transition-opacity duration-300'>
                    Join Meeting
                </p>
            </DialogTrigger>
            <DialogContent className='w-full'>
                <DialogHeader>
                    <DialogTitle>
                        Join a Meeting
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col items-center justify-center gap-4'>
                        <FormField
                            control={form.control}
                            name="roomId"
                            render={({ field }) => (
                                <FormItem
                                    className='w-full'
                                >
                                    <FormLabel className='flex gap-1 text-xs items-center'>
                                        Meeting Id
                                        <p className='text-xs font-extrabold text-black/70'>(required)</p>
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder='cmasdas.asda.asda.s..xyz' />
                                    </FormControl>
                                    <FormMessage className='text-xs w-full text-right' />
                                </FormItem>
                            )}
                        />

                        <Button type='submit' className='w-full' disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />}
                            {!isPending && "Join Meeting"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
