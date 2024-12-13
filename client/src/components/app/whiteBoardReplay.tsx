'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Loader } from 'lucide-react'
import { CanvasStroke } from '@/types/whiteboard';
import { MeetingRecording, Room } from '@prisma/client'
import { User } from 'next-auth'
import moment from 'moment'
import { Button } from '@/components/ui/button';
import { Pause, Play } from "lucide-react";


type SingleRecordingType = MeetingRecording & {
    room: Room & {
        user: User
    }
}

export default function WhiteboardReplay({ recordingData }: { recordingData: SingleRecordingType | undefined }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [openTool, setOpenTool] = useState<boolean>(true);
    const pathsRef = useRef<CanvasStroke[]>([]);
    const timerRefs = useRef<NodeJS.Timeout[]>([]);
    const previousTime = useRef<number>(0);
    const strokeTimer = useRef<NodeJS.Timeout>();
    const [paused, setPaused] = useState<boolean>(false);




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
                const prevPath = pathsRef.current[i - 1];
                if (prevPath) {
                    ctx.beginPath();
                    ctx.moveTo(prevPath.x, prevPath.y);
                    ctx.lineTo(path.x, path.y);
                    ctx.stroke();
                }
            }
        }
    }, [])


    const seekToPoint = useCallback((seekIndex: number) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Redraw up to the specified index
                for (let i = 0; i <= seekIndex; i++) {
                    const path = pathsRef.current[i];
                    if (path) {
                        draw(ctx, path, i);
                    }
                }
            }
        }
    }, [draw]);

    const restoreCanvasStroke = useCallback((path: CanvasStroke) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        draw(ctx, path, pathsRef.current.length);
        pathsRef.current = [...pathsRef.current, path]
    }, [draw]);

    const startReplaying = useCallback((strokes: CanvasStroke[]) => {
        strokes.forEach((stroke) => {
            strokeTimer.current = setTimeout(() => {
                previousTime.current = stroke.timeStamp;
                restoreCanvasStroke(stroke);
                clearTimeout(strokeTimer.current);
            }, stroke.timeStamp - previousTime.current);
        })
    }, [restoreCanvasStroke]);

    const restoreCanvas = useCallback((strokePaths: CanvasStroke[]) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        pathsRef.current = [...strokePaths]
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
                    restoreCanvas(pathsRef.current);
                }
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [restoreCanvas])


    useEffect(() => {
        if (recordingData) {
            restoreCanvas(JSON.parse(recordingData.initialState) as CanvasStroke[]);
            setIsLoading(false);
            previousTime.current = new Date(recordingData.createdAt).getTime();
            startReplaying(JSON.parse(recordingData.subsequentStates) as CanvasStroke[])
        }
    }, [recordingData, restoreCanvas, startReplaying])

    return (
        <div className="flex flex-col h-full w-full relative overflow-auto border border-black/35">
            <div className={cn("flex justify-start gap-x-2 h-[50px] absolute transition-all duration-500 w-full items-center p-4 border-b border-b-black/15 bg-white",
                openTool ? "top-0" : "top-[-50px]"
            )}>
                <div className='flex items-center justify-center gap-x-2 h-full'>
                    <p>{recordingData?.room.title} | </p>
                    <p className='text-xs'>{moment(recordingData?.createdAt).fromNow()}</p>
                </div>


                <Button className='flex items-center justify-center gap-x-1' variant={"outline"} disabled={isLoading}
                    onClick={() => {
                        setPaused(!paused);
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

                </Button>
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

