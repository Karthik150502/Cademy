'use client'
import { useWS } from '@/providers/wsProvider';
import { WhiteBoarsInitialState } from '@/store/recoil';
import { IncomingEvents, OutgoingEvents } from '@/types/whiteboard';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef } from 'react'
import { useSetRecoilState } from 'recoil';

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
                const tracks = stream.getTracks();
                tracks.forEach((track: MediaStreamTrack) => track.stop());
            }
        };
    }, []);

    return (
        <div className='min-h-screen overflow-hidden relative flex flex-col items-center
        justify-center gap-y-3'>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: "80%", borderRadius: "10px" }}
            />
            <Button asChild>
                <Link href={isHosting ? `/host?&at=${at}&rt=${rt}&roomId=${roomId}` : `/watch/${roomId}`}>
                    Join Meeting
                </Link>
            </Button>
        </div>
    )
}
