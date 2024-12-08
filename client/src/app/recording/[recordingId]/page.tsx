'use client'
import { getSingleRecordingDetail } from '@/actions/getSingleRecording'
import WhiteboardReplay from '@/components/app/whiteBoardReplay'
import { useWS } from '@/providers/wsProvider'
import { MeetingRecording, Room } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { User } from 'next-auth'
import React, { useEffect, useState } from 'react'
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


    const ws = useWS();
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (ws && ws.socket) {
            console.log("onmessage....");
            ws.socket.onmessage = ({ data }) => {
                if (!isLoading) { return; }
                const parsed = JSON.parse(data.toString());
                console.log(parsed);
                if (parsed.type === 'starting-replay') {
                    setIsLoading(false);
                }
            }
        }
    }, [ws, ws?.socket, isLoading])

    const { data } = useQuery<SingleRecordingType>({
        queryKey: [`recording-${recordingId}`],
        queryFn: async () => await getSingleRecordingDetail(recordingId)
    })

    return (
        <div className='min-h-screen overflow-hidden relative flex flex-col items-center justify-center'>
            {/* {
                isLoading ? <>
                    <div className='flex items-center justify-center gap-1'>
                        <Loader className='animate-spin' />
                        <p className='text-muted-foreground text-xs'>Loading...</p>
                    </div>
                </> : <>
                </>
            } */}
            <WhiteboardReplay recordingId={recordingId} recordingData={data} />
        </div>
    )
}
