'use client'
import React from 'react'
import { Room, User } from '@prisma/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { getMeetings } from '@/actions/getAllMeetings'
import { Loader, UserCircleIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import moment from 'moment';
import { createStream } from '@/actions/livekit/create_stream_only'
import { toast } from 'sonner'

type Meeting = Room & {
    user: Omit<User, 'password'>,
    _count: {
        RoomMember: number
    }
};

export default function AllRooms() {


    const { data: session } = useSession();
    const { data, isPending } = useQuery({
        queryKey: [`rooms-${session?.user?.id}`],
        queryFn: async () => await getMeetings()
    })

    return (
        <div className={cn("rounded-xl w-[90%] h-[calc(100vh-165px)] shadow-inner relative")}>
            {isPending ? <div className='w-full absolute top-10 flex flex-col items-center justify-center gap-y-1 '>
                <Loader className="animate-spin" />
                <p>Fetching user rooms, kinldy wait....</p>
            </div> : <div className='w-full h-full grid lg:grid-cols-2 sm:grid-cols-1 gap-3 place-content-start place-items-start  relative overflow-auto no-scrollbar px-4 py-4'>
                {
                    (data && data.rooms) && data.rooms.map(({ room }: { room: Meeting }) => {
                        return <RoomCard key={room.id} room={room} />
                    })
                }
            </div>
            }
        </div>
    )
}

export function RoomCard({ room }: {
    room: Meeting,
}) {
    const router = useRouter();
    const { data: session } = useSession();
    const { mutate } = useMutation({
        mutationFn: async ({
            roomId, name
        }: {
            roomId: string, name: string
        }) => {
            return await createStream({
                roomId: roomId,
                name: name
            })
        },
        onSuccess: (data) => {
            const { auth_token, token, roomId } = data;
            toast.success("Joined a Meeting", { id: "create-meeting" });
            router.push(`/check-hair?&at=${auth_token}&rt=${token}&roomId=${roomId}&type=hosting`);
        },
        onError: (e) => {
            toast.error(`Failed to join the Meeting: ${e.message}`, { id: "create-meeting" });
        }
    });

    return (
        <div className='h-auto w-full rounded-md shadow-xl flex flex-col items-center justify-between p-4'>
            <div className='w-full flex flex-col items-start justify-center P-4'>
                <p className='text-lg font-bold'>
                    {room.title}
                </p>
                <div className='flex items-start justify-start gap-x-2 w-full'>
                    {
                        room.user.image ? <Image src={room.user.image} height={25} width={25} alt={room.user.name || ""} className={"rounded-full h-[35px] w-[35px]"} /> : <UserCircleIcon size={38} strokeWidth={1} />
                    }
                    <div className='flex flex-col justify-center items-start'>
                        <p className='text-xs'>Organised by {room.user.name} | {room.user.email}</p>
                        <p className='text-[11px] text-muted-foreground'>Attendees: {room._count.RoomMember}</p>
                    </div>
                </div>
                <div className='flex items-center justify-end gap-x-2 w-full'>
                    <p className='text-xs text-muted-foreground'>
                        {moment(room.createdAt).fromNow()}
                    </p>
                </div>
            </div>
            <Button
                size={"sm"}
                onClick={() => {
                    if (session?.user?.id === room.user.id) {
                        mutate({
                            roomId: room.id,
                            name: room.user.name!
                        });
                    } else {
                        router.push(`/check-hair?roomId=${room.id}&type=watch`);
                    }
                }}
            >
                Join
            </Button>
        </div>
    )
}