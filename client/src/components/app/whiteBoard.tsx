'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Slider } from "@/components/ui/slider"
import { cn } from '@/lib/utils'
import { ChevronDown, Eraser, VideoIcon } from 'lucide-react'
import { Button } from '../ui/button'
import { useWS } from '@/providers/wsProvider'
import { CanvasStroke, IncomingEvents, OutgoingEvents } from '@/types/whiteboard';
import { useRecoilState } from 'recoil';
import { WhiteBoarsInitialState } from '@/store/recoil'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
const colors = ['black', 'red', 'green', 'blue', 'yellow', "white"]
export default function Whiteboard({ meetingId }: { meetingId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();
    const [color, setColor] = useState('black');
    const [size, setSize] = useState(5);
    const [eraserSize, setEraserSize] = useState(5);
    const [openTool, setOpenTool] = useState<boolean>(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [paths, setPaths] = useState<CanvasStroke[]>([]);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [gWhiteBoard, setGWhiteBoard] = useRecoilState(WhiteBoarsInitialState);
    const ws = useWS();
    const divRef = useRef<HTMLDivElement | null>(null)


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
                    case IncomingEvents.STROKE_INPUT: {
                        restoreCanvasStroke(parsed.stroke);
                        break;
                    }
                    case IncomingEvents.RECORDING_STARTED: {
                        toast.info(`Meeting is being recorded by the organiser.`, { id: "recording" });
                        setIsRecording(true);
                        break;
                    }
                    case IncomingEvents.RECORDING_STOPPED: {
                        toast.info(`Recording has been stopped by the organiser.`, { id: "recording" });
                        setIsRecording(false);
                        break;
                    }
                    case IncomingEvents.USER_LEFT: {
                        router.push(`/meeting?meetingId=${meetingId}`);
                        break;
                    }

                    default:
                        break;
                }

            }
        }
    }, [ws, restoreCanvasStroke, meetingId, router])

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



    useEffect(() => {

        if (ws && ws.socket) {
            ws.socket.onopen = () => {
                ws.socket!.send(JSON.stringify({
                    type: 'ping-check',
                    data: {
                        meetingId
                    }
                }))
            }
        }
    }, [ws, ws?.socket, meetingId]);

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

    useEffect(() => {
        if (!divRef.current) {
            return;
        }
        const dimensions = divRef.current?.getBoundingClientRect();
        console.log(divRef.current?.clientHeight)
        console.log(divRef.current?.clientWidth)
        console.log(dimensions?.height)
        console.log(dimensions?.width)
    }, [divRef.current])


    const startRecording = () => {

        if (ws && ws.socket) {
            ws.socket.send(JSON.stringify({
                type: OutgoingEvents.START_RECORDING,
                data: {
                    initialStrokes: paths
                }
            }))
        }
    }
    const stopRecording = () => {
        if (ws && ws.socket) {
            ws.socket.send(JSON.stringify({
                type: OutgoingEvents.STOP_RECORDING,
            }))
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

    // const printPaths = () => {
    //     console.log(paths);
    // }

    // const showMeetings = () => {
    //     ws?.socket?.send(JSON.stringify({
    //         type: 'show-meetings'
    //     }))
    // }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    return (
        <div className="flex flex-col h-full w-full relative overflow-auto border border-black/35" ref={divRef}>
            <div className={cn("flex justify-between h-[50px] absolute transition-all duration-500 w-full items-center p-4 border-b border-b-black/15 bg-white",
                openTool ? "top-0" : "top-[-50px]"
            )}>

                <div className={cn("h-10 w-10 cursor-pointer rounded-full bg-white border border-black/15 opacity-70 transition-all hover:opacity-100 duration-300 flex items-center justify-center absolute -bottom-12 left-[50%]", openTool ? "rotate-0" : "rotate-180")}
                    onClick={() => { setOpenTool(!openTool) }}
                >
                    <ChevronDown />
                </div>

                <Button variant={"outline"} className='flex items-center justify-center gap-x-2'
                    onClick={() => {
                        if (!isRecording) {
                            startRecording();
                        } else {
                            stopRecording();
                        }
                        setIsRecording(!isRecording)
                    }}
                >
                    {isRecording ? <>
                        <div className='h-3 w-3 bg-red-500 rounded-full'></div>
                        <p className='text-xs'>Recording...
                        </p>
                    </> : <>
                        <VideoIcon />
                        <p className='text-xs'>Record</p>
                    </>}
                </Button>

                <div className="flex space-x-2">
                    {colors.map((c) => (
                        <Button
                            key={c}
                            variant={"outline"}
                            size={"icon"}
                            className={`w-6 h-6 border border-black/25 rounded-full ${color === c ? 'ring-1 ring-offset-1 ring-gray-400' : ''}`}
                            style={{ backgroundColor: c }}
                            onClick={() => {
                                setIsErasing(false);
                                setColor(c);
                            }}
                        />
                    ))}
                    <Button
                        variant={"outline"}
                        size={"icon"}
                        className={`w-6 h-6 rounded-full border border-black/25  bg-white flex items-center justify-center ${isErasing ? 'ring-1 ring-offset-1 ring-gray-400' : ''}`}
                        onClick={() => setIsErasing(true)}
                    >
                        <Eraser strokeWidth={1} className="w-5 h-5 text-gray-600" />
                    </Button>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col gap-y-2 items-center space-x-2">
                        <span className="text-xs font-medium">{isErasing ? 'Eraser' : 'Brush'} Size:</span>
                        {
                            isErasing ? <Slider
                                min={1}
                                max={100}
                                step={1}
                                value={[eraserSize]}
                                onValueChange={(value) => setEraserSize(value[0])}
                                className="w-32"
                            /> : <Slider
                                min={1}
                                max={20}
                                step={1}
                                value={[size]}
                                onValueChange={(value) => setSize(value[0])}
                                className="w-32"
                            />
                        }
                    </div>

                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="flex-grow cursor-crosshair"
                style={{
                    backgroundImage: "url(https://wallpapercave.com/w/wp9969379.jpg)",
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

