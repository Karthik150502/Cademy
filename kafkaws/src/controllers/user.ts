import { WebSocket } from "ws";
import { WsHandler } from ".";
import prisma from "../lib/prisma";
export class User {

    private wsHandler: WsHandler;
    public id: string;
    constructor(private ws: WebSocket, userId: string) {
        this.id = userId;
        this.wsHandler = new WsHandler(this, ws);
    }

    public async close() {
        await this.wsHandler.destroy();
    }

    static async getWhiteboardDetails(recordingId: string): Promise<{ startedAt: Date, initialState: string, subStates: string } | undefined> {
        let result = await prisma.meetingRecording.findUnique({
            where: {
                id: recordingId
            }
        })
        if (!result) {
            return;
        }
        return { startedAt: result.createdAt, initialState: result.initialState, subStates: result.subsequentStates };
    }

}