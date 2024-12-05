'use client'
import { CanvasStroke } from "@/types/whiteboard";
import React from "react";

export function restoreCanvas(strokes: CanvasStroke[], canvas: HTMLCanvasElement | null, setPaths: React.Dispatch<React.SetStateAction<CanvasStroke[]>>, opacity: number) {
    const ctx = canvas?.getContext('2d');
    setPaths(strokes);
    strokes.forEach((path: CanvasStroke, index: number) => {
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
                const prevPath = strokes[index - 1];
                if (prevPath) {
                    ctx.beginPath();
                    ctx.moveTo(prevPath.x, prevPath.y);
                    ctx.lineTo(path.x, path.y);
                    ctx.stroke();
                }
            }
        }
    })
}