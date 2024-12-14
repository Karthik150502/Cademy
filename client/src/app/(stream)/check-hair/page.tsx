'use client'
import { useWS } from '@/providers/wsProvider';
import { WhiteBoarsInitialState } from '@/store/recoil';
import { IncomingEvents, OutgoingEvents } from '@/types/whiteboard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil';
import { useQuery } from '@tanstack/react-query';
import { getSingleMeetingDetail } from '@/actions/getSingleMeeting';
import MeetingDetails from '@/components/app/meetingDetails';

interface PageProps {
    searchParams: {
        at: string | undefined;
        rt: string | undefined;
        type: string | undefined;
        roomId: string | undefined;
    };
}
export default function CheckHair({
    searchParams: { at, rt, type, roomId },
}: PageProps) {
    const router = useRouter();
    if (!type) {
        router.push("/");
    }
    const isHosting = type === "hosting" ? true : false;
    if (isHosting) {
        if (!at || !rt || !roomId) {
            router.push("/");
        }
    } else {
        if (!roomId) {
            router.push("/");
        }
    }


    const { data: session } = useSession();
    const setWhiteBoard = useSetRecoilState(WhiteBoarsInitialState);
    const ws = useWS();

    const { data, isPending } = useQuery({
        queryKey: [`meeting-${roomId}`],
        queryFn: async () => {
            return await getSingleMeetingDetail({
                meetingId: roomId!
            })
        }
    })
    const handleMeetingJoin = useCallback(() => {
        if (ws && ws.socket) {
            ws.socket.send(JSON.stringify({
                type: OutgoingEvents.JOIN_MEETING,
                data: {
                    userId: session?.user?.id,
                    meetingId: roomId
                }
            }));
        }
        return
    }, [ws, roomId, session?.user?.id]);

    useEffect(() => {
        if (ws && ws.socket) {
            ws.socket.onopen = () => {
                handleMeetingJoin();
            }
            ws.socket.onmessage = ({ data }) => {
                const parsed = JSON.parse(data.toString());
                switch (parsed.type) {
                    case IncomingEvents.USER_JOINED: {
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

    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        // Access the user's webcam
        const vidRef = videoRef.current;
        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true, // Request video input
                });

                if (vidRef) {
                    vidRef.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
            }
        };

        startVideo();

        // Cleanup: Stop the webcam stream when component unmounts
        return () => {
            if (vidRef) {
                const stream = vidRef.srcObject as MediaStream; // Type assertion
                if (stream) {
                    const tracks = stream.getTracks();
                    tracks.forEach((track: MediaStreamTrack) => track.stop());
                }
            }
        };
    }, []);

    return (
        <div className='min-h-screen max-h-screen overflow-auto py-4 no-scrollbar relative flex flex-col lg:flex-row lg:justify-center items-center justify-start  gap-4'>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "50%", borderRadius: "10px" }}
            />
            <MeetingDetails isPending={isPending} room={data && data.room} at={at} rt={rt} isHosting={isHosting} />

        </div>
    )
}
