'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Button } from '../ui/button'
import { CanvasStroke, IncomingEvents, OutgoingEvents } from '@/types/whiteboard';
import { useRecoilState } from 'recoil';
import { WhiteBoarsInitialState } from '@/store/recoil'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useWSWhiteboardReplay } from '@/providers/wsWhiteBoardReplay'
import { MeetingRecording, Room } from '@prisma/client'
import { User } from 'next-auth'
import moment from 'moment'
const colors = ['black', 'red', 'green', 'blue', 'yellow', "white"];


type SingleRecordingType = MeetingRecording & {
    room: Room & {
        user: User
    }
}

export default function WhiteboardReplay({ recordingId, recordingData }: { recordingId: string, recordingData: SingleRecordingType | undefined }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [color, setColor] = useState('black');
    const [size, setSize] = useState(5);
    const [eraserSize, setEraserSize] = useState(5);
    const [openTool, setOpenTool] = useState<boolean>(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [paths, setPaths] = useState<CanvasStroke[]>([]);
    const [gWhiteBoard, setGWhiteBoard] = useRecoilState(WhiteBoarsInitialState);
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

    const restoreCanvasStroke = useCallback((path: CanvasStroke) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            if (path.color === "eraser") {
                ctx.globalCompositeOperation = 'destination-out'
                ctx.lineWidth = path.size
            } else {
                ctx.globalCompositeOperation = 'source-over'
                ctx.strokeStyle = path.color
                ctx.lineWidth = path.size
            }
            if (paths.length === 0 || path.isNewStroke) {
                ctx.beginPath();
                ctx.moveTo(path.x, path.y);
            } else {
                const prevPath = paths[paths.length - 1];
                if (prevPath) {
                    ctx.beginPath();
                    ctx.moveTo(prevPath.x, prevPath.y);
                    ctx.lineTo(path.x, path.y);
                    ctx.stroke();
                }
            }
        };
        setPaths((prev) => [...prev, path]);
    }, [paths]);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.beginPath()
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                drawAndUpdate({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                    color: isErasing ? "eraser" : color,
                    size: isErasing ? eraserSize : size,
                    timeStamp: (new Date()).getTime(),
                    isNewStroke: true,
                })
                ctx.stroke();
                setIsDrawing(true)
            }
        }
    };

    const restoreCanvas = useCallback((paths: CanvasStroke[]) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        setPaths(paths);
        paths.forEach((path: CanvasStroke, index: number) => {
            if (ctx) {
                if (path.color === "eraser") {
                    ctx.globalCompositeOperation = 'destination-out'
                    ctx.lineWidth = path.size
                } else {
                    ctx.globalCompositeOperation = 'source-over'
                    ctx.strokeStyle = path.color
                    ctx.lineWidth = path.size
                }
                ctx.globalAlpha = 1
                if (index === 0 || path.isNewStroke) {
                    ctx.beginPath();
                    ctx.moveTo(path.x, path.y);
                } else {
                    const prevPath = paths[index - 1];
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
        const pathString = window.localStorage.getItem("stroke_paths");
        if (!pathString) { return }
        const paths = JSON.parse(pathString);
        if (paths) {
            restoreCanvas(paths);
        }
    }, [restoreCanvas]);

    useEffect(() => {
        if (gWhiteBoard.length > 0) {
            restoreCanvas(gWhiteBoard);
            setGWhiteBoard([]);
        }
    }, [gWhiteBoard, restoreCanvas, setGWhiteBoard]);

    useEffect(() => {
        if (ws?.socket) {
            ws.socket.onmessage = ({ data }) => {
                const parsed = JSON.parse(data.toString());
                switch (parsed.type) {
                    case IncomingEvents.STROKE_REPLAY: {
                        restoreCanvasStroke(parsed.stroke);
                        break;
                    }

                    default:
                        break;
                }

            }
        }
    }, [ws, restoreCanvasStroke])

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
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

                    ctx.putImageData(imageData, 0, 0)
                }
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])



    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) { return; }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                if (isErasing) {
                    ctx.globalCompositeOperation = 'destination-out'
                    ctx.lineWidth = eraserSize
                } else {
                    ctx.globalCompositeOperation = 'source-over'
                    ctx.strokeStyle = color
                    ctx.lineWidth = size
                }
                ctx.globalAlpha = 1
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
                ctx.stroke();
                drawAndUpdate({
                    x: e.nativeEvent.offsetX,
                    y: e.nativeEvent.offsetY,
                    color: isErasing ? "eraser" : color,
                    size: isErasing ? eraserSize : size,
                    timeStamp: (new Date()).getTime(),
                    isNewStroke: false
                })
            }
        }
    }





    const drawAndUpdate = useCallback((data: CanvasStroke) => {
        setPaths((prev) => [...prev, data]);
        if (ws && ws.socket) {
            ws?.socket?.send(JSON.stringify({
                type: OutgoingEvents.STROKE_INPUT,
                data: {
                    stroke: { ...data }
                }
            }));
        }
    }, [ws])


    const stopDrawing = () => {
        setIsDrawing(false)
    }

    return (
        <div className="flex flex-col h-full w-full relative overflow-auto border border-black/35">
            <div className={cn("flex justify-start gap-x-2 h-[50px] absolute transition-all duration-500 w-full items-center p-4 border-b border-b-black/15 bg-white",
                openTool ? "top-0" : "top-[-50px]"
            )}>
                <p>{recordingData?.room.title} | </p>
                <p className='text-xs'>{moment(recordingData?.createdAt).fromNow()}</p>
                <div className={cn("h-10 w-10 cursor-pointer rounded-full bg-white border border-black/15 opacity-70 transition-all hover:opacity-100 duration-300 flex items-center justify-center absolute -bottom-12 left-[50%]", openTool ? "rotate-0" : "rotate-180")}
                    onClick={() => { setOpenTool(!openTool) }}
                >
                    <ChevronDown />
                </div>

            </div>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="flex-grow cursor-crosshair"
                style={{
                    backgroundImage: "",
                    objectFit: "contain"
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
        </div>
    )
}

