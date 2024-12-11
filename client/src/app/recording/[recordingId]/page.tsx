'use client'
import { getSingleRecordingDetail } from '@/actions/getSingleRecording'
import WhiteboardReplay from '@/components/app/whiteBoardReplay'
import { MeetingRecording, Room } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { User } from 'next-auth'
import React from 'react'
type Props = {
    params: {
        recordingId: string
    }
}


type SingleRecordingType = MeetingRecording & {
    room: Room & {
        user: User
    }
}
export default function ReplayRecordingPage({ params: { recordingId } }: Props) {




    const { data } = useQuery<SingleRecordingType>({
        queryKey: [`recording-${recordingId}`],
        queryFn: async () => await getSingleRecordingDetail(recordingId)
    })

    return (
        <div className='min-h-screen overflow-hidden relative flex flex-col items-center justify-center'>

            <WhiteboardReplay recordingId={recordingId} recordingData={data} />
        </div>
    )
}
