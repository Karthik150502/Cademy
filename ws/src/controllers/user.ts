import { randomUUID } from "crypto";
import { WebSocket } from "ws";
import { IncomingData, IncomingEvents, IncomingMessageType } from "../types";
import { MeetingManager } from "./meetingManager";
export class User {

    private id: string | null = null;
    private meetingId: string | null = null;

    constructor(private ws: WebSocket) {
        this.ws = ws;
        this.initialize();
    }


    public getMeetingId() {
        return this.meetingId
    }
    public setMeetingId(meetingId: string | null) {
        this.meetingId = meetingId
    }
    public getuserId() {
        return this.id
    }

    public sendMessage(jsonString: string) {
        this.ws.send(jsonString);
    }


    initialize() {
        this.ws.onmessage = (message) => {
            let parsed: IncomingMessageType<IncomingData>;
            try {
                parsed = JSON.parse(message.data.toString());
            } catch {
                console.log("Malformed JSON.")
                return;
            }
            switch (parsed.type) {
                case IncomingEvents.JOIN_MEETING: {
                    this.id = parsed.data.userId;
                    console.log("User joined... = ", this.id);
                    MeetingManager.addUser(parsed.data.meetingId, this);
                    const meeting = MeetingManager.getMeeting(this.meetingId!);
                    this.sendMessage(JSON.stringify({
                        type: "user-joined",
                        strokes: meeting?.whiteBoardState || []
                    }))
                    break;
                }
                case IncomingEvents.LEAVE_MEETING: {
                    this.destroy();
                    break;
                }
                case IncomingEvents.SHOW_MEETINGS: {
                    MeetingManager.getMeetingDetails();
                    break;
                }
                case IncomingEvents.STROKE_INPUT: {
                    MeetingManager.updateWhiteboard(parsed.data.stroke, this.meetingId!);
                    break;
                }

                default: {

                    break;
                }
            }
        }
    }


    destroy() {
        this.ws.close();
        MeetingManager.removeUser(this.getMeetingId()!, this)
        // TODO: remove from the meetings data
    }


}