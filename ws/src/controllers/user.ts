import { WebSocket } from "ws";
import { MeetingManager, WsHandler } from "./index";
import prisma from "../lib/prisma";
export class User {

    public id: string;
    public meetingId: string | null = null;
    private wsHandler: WsHandler | null;
    constructor(private ws: WebSocket, userId: string) {
        this.id = userId;
        this.wsHandler = new WsHandler(this, ws);
    }
    public setMeetingId(meetingId: string | null) {
        this.meetingId = meetingId
    }
    public setUserId(userId: string) {
        this.id = userId;
    }
    public sendMessage(jsonString: string) {
        this.wsHandler?.sendMessage(jsonString);
    }


    public async getRecordingStartingTime(recordingId: string) {
        return (await prisma.meetingRecording.findUnique({
            where: {
                id: recordingId
            }
        }))
    }

    public async destroy() {
        // Deleting the in-memory meetings data if the organiser leaves the meeting. 
        if (MeetingManager.getMeeting(this.meetingId!)?.organiserId === this.id) {
            MeetingManager.removeMeetingsData(this.meetingId!);
        }
        await this.wsHandler?.closeWs();
        MeetingManager.removeUser(this.meetingId!, this)
    }

}