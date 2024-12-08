'use client'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSingleRecordingDetail } from '@/actions/getSingleRecording'
import { ArrowLeft, Info, Loader, UserCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { MeetingRecording, Room, User } from '@prisma/client'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
// import { useWS } from '@/providpers/wsProvider'
type SingleRecordingType = MeetingRecording & {
    room: Room & {
        user: User
    }
}

export default function RecordingDetailPage() {


    // const ws = useWS();


    const recordingId = useSearchParams().get("recordingId");
    const { data, isPending } = useQuery<SingleRecordingType>({
        queryKey: [`recording-${recordingId}`],
        queryFn: async () => await getSingleRecordingDetail(recordingId)
    })

    return (
        <div className='min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center'>
            {
                isPending ? <div className='flex flex-col items-center justify-center gap-y-2'>
                    <Loader className='animate-spin' />
                    <p>Loading Details</p>
                    <p>{recordingId}</p>
                </div> : data ? <div className='flex flex-col items-center justify-center gap-y-2 w-[375px] rounded-lg shadow-lg border border-black/25 p-4'>
                    <div className='w-full flex items-start justify-between'>
                        <div className='flex flex-col items-start justify-center'>
                            <p className='font-semibold text-lg'>
                                {data.room.title}
                            </p>
                            <p className="text-xs">
                                Started {moment(data.room.createdAt).fromNow()}
                            </p>
                        </div>
                        <p className='text-xs'>Recorded {moment(data.createdAt).fromNow()}</p>
                    </div>
                    <div className='w-full flex items-center justify-between'>
                        <div className='flex flex-col items-start justify-center'>
                            <p className='text-xs font-semibold'>Meeting organiser</p>
                            <p className='text-xs'>{data.room.user.name} | {data.room.user.email}</p>
                        </div>
                        {
                            data.room.user.image ? <Image src={data.room.user.image} height={35} width={35} alt={data.room.user.name || "Host Profile Picture"} className='h-[35px] w-[35px] rounded-full' /> : <UserCircle strokeWidth={1} className='w-[35px] h-[35px]' />
                        }
                    </div>
                    <div className="w-full flex items-center justify-center gap-x-2">
                        <Button variant={"outline"} size={"default"} asChild>
                            <Link href={`/dashboard/recordings`}>
                                <ArrowLeft strokeWidth={1} />
                            </Link>
                        </Button>
                        <Button variant={"outline"} size={"default"} asChild>
                            <Link href={`/recording/${recordingId}`}>
                                <Play strokeWidth={1} /> <p>Play recording</p>
                            </Link>
                        </Button>
                    </div>
                </div> : <div className='flex flex-col items-center justify-center gap-y-2'>
                    <Info />
                    <p>Error occured while loading details</p>
                </div>
            }
        </div >
    )
}
