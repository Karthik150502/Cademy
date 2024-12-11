'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Loader } from 'lucide-react'
// import { Pause, Play } from 'lucide-react'
import { CanvasStroke, ReplayIncomingEvents } from '@/types/whiteboard';
import { useWSWhiteboardReplay } from '@/providers/wsWhiteBoardReplay'
import { MeetingRecording, Room } from '@prisma/client'
import { User } from 'next-auth'
import moment from 'moment'
// import { Button } from '../ui/button';

type SingleRecordingType = MeetingRecording & {
    room: Room & {
        user: User
    }
}

export default function WhiteboardReplay({ recordingId, recordingData }: { recordingId: string, recordingData: SingleRecordingType | undefined }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [openTool, setOpenTool] = useState<boolean>(true);
    const [paths, setPaths] = useState<CanvasStroke[]>([]);
    const [paused, setPaused] = useState<boolean>(false);
    // const [offSet, setOffset] = useState<string>('0');

    const ws = useWSWhiteboardReplay();

    useEffect(() => {
        if (ws && ws.socket) {
            ws.socket.send(JSON.stringify({
                type: 'start-replay',
                data: {
                    recordingId
                }
            }))
        }
    }, [ws, ws?.socket, recordingId])


    const draw = useCallback((ctx: CanvasRenderingContext2D | null | undefined, path: CanvasStroke, i: number) => {
        if (ctx) {
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            if (path.color === "eraser") {
                ctx.globalCompositeOperation = 'destination-out'
                ctx.lineWidth = path.size
            } else {
                ctx.globalCompositeOperation = 'source-over'
                ctx.strokeStyle = path.color
                ctx.lineWidth = path.size
            }
            ctx.globalAlpha = 1
            if (i === 0 || path.isNewStroke) {
                ctx.beginPath();
                ctx.moveTo(path.x, path.y);
            } else {
                const prevPath = paths[i - 1];
                if (prevPath) {
                    ctx.beginPath();
                    ctx.moveTo(prevPath.x, prevPath.y);
                    ctx.lineTo(path.x, path.y);
                    ctx.stroke();
                }
            }
        }
    }, [paths])


    // const seekToPoint = useCallback((seekIndex: number) => {
    //     const canvas = canvasRef.current;
    //     if (canvas) {
    //         const ctx = canvas.getContext('2d');
    //         if (ctx) {
    //             // Clear the canvas
    //             ctx.clearRect(0, 0, canvas.width, canvas.height);

    //             // Redraw up to the specified index
    //             for (let i = 0; i <= seekIndex; i++) {
    //                 const path = paths[i];
    //                 if (path) {
    //                     draw(ctx, path, i);
    //                 }
    //             }
    //         }
    //     }
    // }, [paths, draw]);

    const restoreCanvasStroke = useCallback((path: CanvasStroke) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        draw(ctx, path, paths.length);
        setPaths((prev) => [...prev, path]);
    }, [paths, draw]);

    const restoreCanvas = useCallback((strokePaths: CanvasStroke[]) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        setPaths(strokePaths);
        strokePaths.forEach((path: CanvasStroke, i: number) => {
            if (ctx) {
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                if (path.color === "eraser") {
                    ctx.globalCompositeOperation = 'destination-out'
                    ctx.lineWidth = path.size
                } else {
                    ctx.globalCompositeOperation = 'source-over'
                    ctx.strokeStyle = path.color
                    ctx.lineWidth = path.size
                }
                ctx.globalAlpha = 1
                if (i === 0 || path.isNewStroke) {
                    ctx.beginPath();
                    ctx.moveTo(path.x, path.y);
                } else {
                    const prevPath = strokePaths[i - 1];
                    if (prevPath) {
                        ctx.beginPath();
                        ctx.moveTo(prevPath.x, prevPath.y);
                        ctx.lineTo(path.x, path.y);
                        ctx.stroke();
                    }
                }
            }
        })
    }, []);



    // const pauseOrPlay = useCallback(() => {
    //     if (paused) {
    //         ws?.socket?.send(JSON.stringify({
    //             type: "play",
    //             data: {
    //                 offSet
    //             }
    //         }))
    //         setPaused(false);
    //     } else {
    //         ws?.socket?.send(JSON.stringify({
    //             type: "pause",
    //             data: {
    //                 offSet
    //             }
    //         }))
    //         setPaused(true);
    //     }
    // }, [offSet, paused, ws?.socket])

    useEffect(() => {
        if (ws?.socket) {
            ws.socket.onmessage = ({ data }) => {
                const parsed = JSON.parse(data.toString());
                switch (parsed.type) {
                    case ReplayIncomingEvents.STROKE_REPLAY: {
                        if (!paused) {
                            restoreCanvasStroke(JSON.parse(parsed.payload) as CanvasStroke);
                            // setOffset(parsed.offSet);
                        }
                        break;
                    }
                    case ReplayIncomingEvents.REPLAY_INITIALSTATE: {
                        const initialState = JSON.parse(parsed.payload.initialState) as CanvasStroke[];
                        restoreCanvas(initialState);
                        break;
                    }
                    case ReplayIncomingEvents.STARTING_REPLAY: {
                        setIsLoading(false);
                        break;
                    }

                    case "pause": {
                        setPaused(true);
                        break;
                    }
                    case "play": {
                        setPaused(false);
                        break;
                    }
                    default:
                        break;
                }

            }
        }
    }, [ws, restoreCanvasStroke, restoreCanvas, paused])

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [])

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current
            if (canvas) {
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    canvas.width = window.innerWidth
                    canvas.height = window.innerHeight
                    ctx.putImageData(imageData, 0, 0);
                    restoreCanvas(paths);
                }
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [paths, restoreCanvas])


    return (
        <div className="flex flex-col h-full w-full relative overflow-auto border border-black/35">
            <div className={cn("flex justify-start gap-x-2 h-[50px] absolute transition-all duration-500 w-full items-center p-4 border-b border-b-black/15 bg-white",
                openTool ? "top-0" : "top-[-50px]"
            )}>
                <div className='flex items-center justify-center gap-x-2 h-full'>
                    <p>{recordingData?.room.title} | </p>
                    <p className='text-xs'>{moment(recordingData?.createdAt).fromNow()}</p>
                </div>


                {/* <Button className='flex items-center justify-center gap-x-1' variant={"outline"} disabled={isLoading}
                    onClick={() => {
                        pauseOrPlay();
                    }}
                >
                    {
                        paused ? <>
                            <p className='text-xs'>Play</p>
                            <Play />
                        </> : <>
                            <p className='"text-xs'>Pause</p>
                            <Pause />
                        </>
                    }

                </Button> */}
                <div className={cn("h-10 w-10 cursor-pointer rounded-full bg-white border border-black/15 opacity-70 transition-all hover:opacity-100 duration-300 flex items-center justify-center absolute -bottom-12 left-[50%]", openTool ? "rotate-0" : "rotate-180")}
                    onClick={() => { setOpenTool(!openTool) }}
                >
                    <ChevronDown />
                </div>

            </div>
            {
                isLoading && <>
                    <div className='w-screen absolute z-10 min-h-screen flex items-center justify-center gap-1 backdrop-blur-sm'>
                        <Loader className='animate-spin' />
                        <p className='text-muted-foreground text-xs'>Loading...</p>
                    </div>
                </>
            }



            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="flex-grow cursor-progress"
                style={{
                    backgroundImage: "",
                    objectFit: "contain"
                }}
            />
        </div >
    )
}

