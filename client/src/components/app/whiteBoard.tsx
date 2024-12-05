'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Slider } from "@/components/ui/slider"
import { cn } from '@/lib/utils'
import { ChevronDown, Eraser } from 'lucide-react'
import { Button } from '../ui/button'
import { useWS } from '@/providers/wsProvider'
import { CanvasStroke } from '@/types/whiteboard';
import { useRecoilState } from 'recoil';
import { WhiteBoarsInitialState } from '@/store/recoil'
// import { restoreCanvas } from '@/client-actions/whiteboard/restoreCanvas'
const colors = ['black', 'red', 'green', 'blue', 'yellow']

export default function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [color, setColor] = useState('black')
    const [size, setSize] = useState(5);
    const [eraserSize, setEraserSize] = useState(5);
    const [opacity, setOpacity] = useState(1)
    const [openTool, setOpenTool] = useState<boolean>(true)
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [paths, setPaths] = useState<CanvasStroke[]>([]);
    const [gWhiteBoard, setGWhiteBoard] = useRecoilState(WhiteBoarsInitialState);

    const ws = useWS();



    // export type CanvasStroke = {
    //     x: number,
    //     y: number,
    //     color: string,
    //     size: number,
    //     timeStamp: number;
    //     isNewStroke: boolean
    // } 



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
                ctx.globalAlpha = opacity
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
    }, [opacity]);

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
            console.log("recoil = ", gWhiteBoard)
            restoreCanvas(gWhiteBoard);
            setGWhiteBoard([]);
        }
    }, [gWhiteBoard, restoreCanvas, setGWhiteBoard]);

    useEffect(() => {
        if (ws?.socket) {
            ws.socket.onmessage = ({ data }) => {
                const parsed = JSON.parse(data.toString());
                if (parsed.type === 'stroke-input') {
                    console.log("From server = ", parsed);
                    restoreCanvasStroke(parsed.stroke);
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
                ctx.globalAlpha = opacity
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
        setPaths((prev) => [...prev, {
            ...data
        }]);
        if (ws && ws.socket) {
            ws?.socket?.send(JSON.stringify({
                type: "stroke-input",
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
        <div className="flex flex-col h-full w-full relative">
            <div className={cn("flex justify-between h-[50px] absolute transition-all duration-500 w-full items-center p-4 border-b border-b-black/15",
                openTool ? "top-0" : "top-[-50px]"
            )}>

                <div className={cn("h-10 w-10 cursor-pointer rounded-full bg-white border border-black/15 opacity-70 transition-all hover:opacity-100 duration-300 flex items-center justify-center absolute -bottom-12 left-[50%]", openTool ? "rotate-0" : "rotate-180")}
                    onClick={() => { setOpenTool(!openTool) }}
                >
                    <ChevronDown />
                </div>

                {/* <Button
                    onClick={() => {
                        printPaths()
                    }}
                >Get Paths</Button>
                <Button
                    onClick={() => {
                        showMeetings()
                    }}
                >Show Meetings</Button> */}
                <div className="flex space-x-2">
                    {colors.map((c) => (
                        <Button
                            key={c}
                            variant={"outline"}
                            size={"icon"}
                            className={`w-8 h-8 rounded-full ${color === c ? 'ring-1 ring-offset-1 ring-gray-400' : ''}`}
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
                        className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${isErasing ? 'ring-1 ring-offset-1 ring-gray-400' : ''}`}
                        onClick={() => setIsErasing(true)}
                    >
                        <Eraser className="w-5 h-5 text-gray-600" />
                    </Button>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{isErasing ? 'Eraser' : 'Brush'} Size:</span>
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
                    {!isErasing && (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Opacity:</span>
                            <Slider
                                min={0.1}
                                max={1}
                                step={0.1}
                                value={[opacity]}
                                onValueChange={(value) => setOpacity(value[0])}
                                className="w-32"
                            />
                        </div>
                    )}
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="flex-grow cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
        </div>
    )
}

