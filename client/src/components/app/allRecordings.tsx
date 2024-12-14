'use client'
import React from 'react'
import { Room, User } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { Loader, Info, Play } from 'lucide-react'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MeetingRecording } from '@prisma/client'
import { getRecordings } from '@/actions/getAllRecordings'
import moment from 'moment'
type RecordingType = MeetingRecording & {
    room: Room & {
        user: User
    },
};

export default function AllRecordings() {


    const { data: session } = useSession();
    const { data, isPending } = useQuery({
        queryKey: [`recordings-${session?.user?.id}`],
        queryFn: async () => await getRecordings()
    })

    return (
        <div className={cn("rounded-xl w-[90%] h-[calc(100vh-165px)] shadow-inner relative")}>
            {isPending ? <div className='w-full absolute top-10 flex flex-col items-center justify-center gap-y-1 '>
                <Loader className="animate-spin" />
                <p>Fetching the Recordings, kinldy wait....</p>
            </div> : (data && data.recordings) ? <div className='w-full h-full grid lg:grid-cols-2 sm:grid-cols-1 gap-3 place-content-start place-items-center relative overflow-auto no-scrollbar px-4 pb-4 pt-20 lg:pt-4'>
                {
                    data.recordings.map((recoding: RecordingType, idx: number) => {
                        return <RecordingCard key={idx} recording={recoding} />
                    })
                }
            </div> : <div className='w-full absolute top-10 flex flex-col items-center justify-center gap-y-1 '>

                <Info />
                <p>No Recordings found.</p>
            </div>
            }
        </div>
    )
}

export function RecordingCard({ recording }: {
    recording: RecordingType
}) {

    const router = useRouter();
    return (
        <div className='h-auto w-full rounded-md shadow-xl flex flex-col items-center justify-between gap-y-4 p-4'>
            <div className='w-full flex items-center justify-between'>
                <div className='flex flex-col items-start justify-center'>
                    <p className='text-lg font-bold'>{recording.room.title}_{new Date(recording.createdAt).getTime()}</p>
                    <p className='text-sm'>Host - {recording.room.user.name} | {recording.room.user.email}</p>
                </div>
                <p className='text-xs'>{moment(recording.createdAt).fromNow()}</p>
            </div>
            <div className='flex items-center justify-center'>
                <Button variant={"outline"} size={"icon"} className='rounded-full'
                    onClick={() => {
                        router.push(`/recording?recordingId=${recording.id}`)
                    }}
                >
                    <Play strokeWidth={1} />
                </Button>
            </div>
            {/* <pre className='text-black text-xs'>{JSON.stringify(recording, null, 4)}</pre> */}
        </div>
    )
}