import { WebSocket } from "ws";
import { IncomingData, IncomingEvents, IncomingMessageType } from "../types";
import { MeetingManager } from "./meetingManager";
import { WsHandler } from "./wsHandler";
export class User {

    public id: string | null = null;
    public meetingId: string | null = null;
    private wsHandler: WsHandler | null;
    constructor(private ws: WebSocket) {
        // this.ws = ws;
        // this.initialize();
        this.wsHandler = new WsHandler(this, ws);
    }


    public getMeetingId() {
        return this.meetingId
    }
    public setMeetingId(meetingId: string | null) {
        this.meetingId = meetingId
    }
    public setUserId(userId: string) {
        this.id = userId;
    }

    public sendMessage(jsonString: string) {
        // this.ws.send(jsonString);
        this.wsHandler?.sendMessage(jsonString);
    }




    initialize() {
        this.ws.onmessage = async (message) => {
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
                    // TODO: End the meeting for other users if the organisers leaves the meeting.
                    this.destroy();
                    break;
                }
                case IncomingEvents.SHOW_MEETINGS: {
                    MeetingManager.getMeetingDetails();
                    break;
                }
                case IncomingEvents.STROKE_INPUT: {
                    MeetingManager.updateWhiteboard(this.id!, parsed.data.stroke, this.meetingId!);
                    break;
                }
                case IncomingEvents.START_RECORDING: {
                    await MeetingManager.startRecording(this.meetingId!, parsed.data.initialStrokes);
                    MeetingManager.broadcast(this.id!, this.meetingId!, JSON.stringify({
                        type: "recording-started",
                        data: {
                            startedBy: this.id
                        }
                    }));
                    break;
                }
                case IncomingEvents.STOP_RECORDING: {
                    console.log("Recording stopped");
                    await MeetingManager.stopRecording(this.meetingId!);
                    MeetingManager.broadcast(this.id!, this.meetingId!, JSON.stringify({
                        type: "recording-stopped",
                        data: {
                            startedBy: this.id
                        }
                    }));
                    break;
                }

                default: {

                    break;
                }
            }
        }
    }


    destroy() {
        // Deleting the in-memory meetings data if the orgniaser leaves the meeting. 
        if (MeetingManager.getMeeting(this.meetingId!)?.organiserId === this.id) {
            MeetingManager.removeMeetingsData(this.meetingId!);
        }
        // this.ws.close();
        this.wsHandler?.closeWs();
        MeetingManager.removeUser(this.getMeetingId()!, this)
        // TODO: remove from the meetings data
    }



}