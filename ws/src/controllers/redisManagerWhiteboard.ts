import Redis from "ioredis";
import prisma from "../lib/prisma";
import { CanvasStroke } from "../types";
import { Prisma } from "@prisma/client";
export class RedisManager {

    private static redis: Redis = new Redis()

    private constructor() { }


    public static async pushStrokeToRedis(meetingId: string, payload: string) {
        await this.redis.rpush(`strokes:${meetingId}`, payload);
    }

    public static startStrokeFetchFromRedis(meetingId: string, recordingId: string) {
        return setInterval(async () => {
            const strokes = await this.getStrokesFromRedis(meetingId);
            const payload = this.parseStrokePaylod(strokes);
            console.log(payload);
            this.subsequentLoadToDatabase(recordingId, payload)
        }, 5000)
    };

    public static async stopStrokeFetchFromRedis(meetingId: string, recordingId: string) {
        const strokes = await this.getStrokesFromRedis(meetingId);
        const payload = this.parseStrokePaylod(strokes);
        console.log(payload);
        this.subsequentLoadToDatabase(recordingId, payload)
    }

    public static parseStrokePaylod(strokeString: string[]) {
        return JSON.parse(`[${strokeString.join(",")}]`) as CanvasStroke[];
    }


    public static async getStrokesFromRedis(meetingId: string) {
        const strokes = await this.redis.lrange(`strokes:${meetingId}`, 0, -1);
        await this.redis.del(`strokes:${meetingId}`);
        return strokes
    }




    public static async initialLoadToDatabase(meetingId: string, payload: CanvasStroke[]) {
        // TODO: update to the database;    
        const res = await prisma.meetingRecording.create({
            data: {
                roomId: meetingId,
                initialState: JSON.stringify(payload)
            }
        });
        return res.id;
    }
    public static async subsequentLoadToDatabase(recordingId: string, payload: CanvasStroke[]) {
        let res = await prisma.meetingRecording.findUnique({
            where: {
                id: recordingId
            }
        });
        if (!res) {
            return;
        };
        let updatedStrokeState = JSON.stringify([...JSON.parse(res.subsequentStates) as CanvasStroke[], ...payload]);


        res = await prisma.meetingRecording.update({
            where: {
                id: recordingId
            },
            data: {
                subsequentStates: updatedStrokeState
            }
        })

        return res.id;
    }

}