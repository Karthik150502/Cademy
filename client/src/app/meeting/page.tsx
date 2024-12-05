'use client'
import React, { useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getSingleMeetingDetail } from '@/actions/getSingleMeeting';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useWS } from '@/providers/wsProvider';
import { useSetRecoilState } from 'recoil';
import { WhiteBoarsInitialState } from '@/store/recoil';
export default function MeetingsStartPage() {


    const router = useRouter();
    const { data: session } = useSession();
    const setWhiteBoard = useSetRecoilState(WhiteBoarsInitialState);
    const ws = useWS();
    const meetingId = useSearchParams().get("meetingId");
    const { data, isPending } = useQuery({
        queryKey: [`meeting-${meetingId}`],
        queryFn: async () => {
            return await getSingleMeetingDetail({
                meetingId: meetingId
            })
        }
    })

    const handleMeetingJoin = useCallback(() => {
        if (ws && ws.socket) {
            ws.socket.send(JSON.stringify({
                type: 'join-meeting',
                data: {
                    userId: session?.user?.id,
                    meetingId: meetingId
                }
            }));
        }
        return
    }, [ws, meetingId, session?.user?.id]);

    useEffect(() => {
        if (ws && ws.socket) {
            ws.socket.onopen = () => {
                handleMeetingJoin();
            }
            ws.socket.onmessage = ({ data }) => {
                const parsed = JSON.parse(data.toString());
                switch (parsed.type) {
                    case "user-joined": {
                        setWhiteBoard(parsed.strokes);
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        }
    }, [ws, ws?.socket, handleMeetingJoin, setWhiteBoard])





    return (
        <div className='min-h-screen overflow-hidden relative flex items-center flex-col justify-center'>
            {
                isPending ? <div className='flex flex-col items-center justify-center gap-2'>
                    <Loader2 className='animate-spin' />
                    <p>Loading Meeting Details</p>
                </div> : <pre>{JSON.stringify(data.room, null, 4)}</pre>
            }
            {(!isPending && data.room) && <Button
                onClick={() => {
                    router.push(`/meeting/${meetingId}`);
                }}
            >Join Meeting</Button>}
        </div>
    )
}
