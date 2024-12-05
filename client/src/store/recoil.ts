import { atom } from "recoil";
import { CanvasStroke } from "@/types/whiteboard";

export const WhiteBoarsInitialState = atom<CanvasStroke[]>({
    key: 'WhiteBoarsInitialState',
    default: []
})


