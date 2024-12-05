import Redis from "ioredis";
import prisma from "../lib/prisma";
import { CanvasStroke } from "../types";
import { Prisma } from "@prisma/client";
export class RedisManager {

    private static redis: Redis = new Redis()

    private constructor() { }


    public static async pushStrokeToRedis(meetingId: string, stroke: CanvasStroke) {
        await this.redis.rpush(`strokes:${meetingId}`, JSON.stringify(stroke));
    }

    public static startStrokeFetchFromRedis(meetingId: string) {
        return setInterval(async () => {
            const strokes = await this.redis.lrange(`strokes:${meetingId}`, 0, -1);
            await this.redis.del(`strokes:${meetingId}`); // Clear the list after fetching
            strokes.map((stroke, index) => {
                console.log(`${index} Stroke: `, stroke);
            });
        }, 5000)
    }


    public static async initialLoadToDatabase(meetingId: string, payload: CanvasStroke[]) {
        // TODO: update to the database;    
        const res = await prisma.meetingRecording.create({
            data: {
                roomId: meetingId,
                initialState: payload
            }
        });
        return res.id;
    }
    public static async subsequentLoadToDatabase(recordingId: string, payload: CanvasStroke[]) {
        // TODO: update to the database;    
        let res = await prisma.meetingRecording.findUnique({
            where: {
                id: recordingId
            }
        });
        if (!res) {
            return;
        };
        res.subsequentStates
        res = await prisma.meetingRecording.update({
            where: {
                id: recordingId
            },
            data: {
                subsequentStates: [...res.subsequentStates as [], ...payload]
            }
        })

        return res.id;
    }

}