import { WebSocket } from "ws";
import { IncomingData, IncomingEvents, IncomingMessageType } from "../types";
import { MeetingManager } from "./meetingManager";
import { WsHandler } from "./wsHandler";
export class User {

    public id: string;
    public meetingId: string | null = null;
    private wsHandler: WsHandler | null;
    constructor(private ws: WebSocket, userId: string) {
        this.id = userId;
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
                    MeetingManager.updateWhiteboard(parsed.data.stroke, this.meetingId!);
                    break;
                }
                case IncomingEvents.START_RECORDING: {
                    await MeetingManager.startRecording(this.meetingId!, parsed.data.initialStrokes);
                    this.wsHandler?.broadcast(this.meetingId!, JSON.stringify({
                        type: "recording-started",
                        data: {
                            startedBy: this.id
                        }
                    }))
                    break;
                }
                case IncomingEvents.STOP_RECORDING: {
                    console.log("Recording stopped");
                    await MeetingManager.stopRecording(this.meetingId!);
                    this.wsHandler?.broadcast(this.meetingId!, JSON.stringify({
                        type: "recording-stopped",
                        data: {
                            startedBy: this.id
                        }
                    }))
                    break;
                }
                case IncomingEvents.PING_CHECK: {
                    const meetingId = parsed.data.meetingId;
                    console.log("Check user")
                    if (!MeetingManager.checkUserPresentInMeeting(meetingId)) {
                        this.wsHandler?.sendMessage(JSON.stringify({
                            type: "user-left",
                            data: {
                                meetingId: meetingId
                            }
                        }))
                    }
                    break;
                }

                default: {

                    break;
                }
            }
        }
    }


    destroy() {
        // Deleting the in-memory meetings data if the organiser leaves the meeting. 
        if (MeetingManager.getMeeting(this.meetingId!)?.organiserId === this.id) {
            MeetingManager.removeMeetingsData(this.meetingId!);
        }
        this.ws.close();
        this.wsHandler?.closeWs();
        MeetingManager.removeUser(this.getMeetingId()!, this)
    }



}