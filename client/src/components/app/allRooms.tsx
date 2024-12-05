'use client'
import React from 'react'
import { Room } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { getMeetings } from '@/actions/getAllMeetings'
import { Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function AllRooms() {


    const { data: session } = useSession();
    const { data, isPending } = useQuery({
        queryKey: [`rooms-${session?.user?.id}`],
        queryFn: async () => await getMeetings()
    })

    return (
        <div className={cn("rounded-xl w-[90%] grid lg:grid-cols-2 sm:grid-cols-1  gap-3 p-4 shadow-inner place-content-start relative")}>
            {isPending ? <div className='w-full absolute top-10 flex flex-col items-center justify-center gap-y-2'>
                <Loader2 className="animate-spin" />
                <p>Fetching user rooms, kinldy wait....</p>
            </div> : <>
                {
                    data.rooms && data.rooms.map(({ room }: { room: Room }) => {
                        return <RoomCard key={room.id} room={room} />
                    })
                }
            </>
            }
        </div>
    )
}







export function RoomCard({ room }: {
    room: Room
}) {

    const router = useRouter();

    return (
        <div className='h-auto rounded-md shadow-xl flex flex-col items-center justify-between p-4'>
            <pre className='text-black'>{JSON.stringify(room, null, 4)}</pre>
            <Button
                onClick={() => {
                    router.push(`/meeting?meetingId=${room.id}`)
                }}
            >
                Join
            </Button>
        </div>
    )
}